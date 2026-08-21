"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  ColorType,
  CrosshairMode,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { http } from "@/lib/http";

interface CandlestickChartProps {
  symbol: string;
}

interface ForecastBands {
  last_candle_time: number;
  last_close: number;
  timestamps: number[];
  p10: number[];
  p25: number[];
  p50: number[];
  p75: number[];
  p90: number[];
}

const TIMEFRAMES = ["5min", "30min", "1h", "4h", "1day", "1week"] as const;
type Timeframe = (typeof TIMEFRAMES)[number];
const TF_LABELS: Record<Timeframe, string> = {
  "5min": "5M", "30min": "30M", "1h": "1H", "4h": "4H", "1day": "1D", "1week": "1W",
};

// Forecast is only available for these timeframes
const FORECAST_TIMEFRAMES: Set<Timeframe> = new Set(["4h", "1day"]);

export default function CandlestickChart({ symbol }: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef     = useRef<IChartApi | null>(null);
  const seriesRef    = useRef<ISeriesApi<"Candlestick"> | null>(null);
  // Band series refs: p10, p25, p50, p75, p90
  const bandRefs = useRef<(ISeriesApi<"Line"> | null)[]>([null, null, null, null, null]);

  const [timeframe, setTimeframe] = useState<Timeframe>("4h");
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [showForecast, setShowForecast] = useState(true);

  // Create chart once on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#94A3B8",
        fontSize: 11,
      },
      grid: { vertLines: { color: "#1E293B" }, horzLines: { color: "#1E293B" } },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: "#1E293B", scaleMargins: { top: 0.1, bottom: 0.1 } },
      timeScale: { borderColor: "#1E293B", timeVisible: true, secondsVisible: false },
      autoSize: true,
    });

    const series = chart.addCandlestickSeries({
      upColor: "#10B981", downColor: "#EF4444",
      borderUpColor: "#10B981", borderDownColor: "#EF4444",
      wickUpColor: "#10B981", wickDownColor: "#EF4444",
      priceLineColor: "#A78BFA",
      priceLineWidth: 1,
      priceLineStyle: LineStyle.Dashed,
    });

    // Create the 5 band line series (p10, p25, p50, p75, p90)
    const bandColors = [
      "rgba(0,212,255,0.18)",  // p10
      "rgba(0,212,255,0.40)",  // p25
      "#00D4FF",                // p50 — main forecast
      "rgba(0,212,255,0.40)",  // p75
      "rgba(0,212,255,0.18)",  // p90
    ];
    const bandWidths = [1, 1, 1.5, 1, 1];
    const bandStyles = [LineStyle.Dashed, LineStyle.Dashed, LineStyle.Solid, LineStyle.Dashed, LineStyle.Dashed];

    bandRefs.current = bandColors.map((color, i) =>
      chart.addLineSeries({
        color,
        lineWidth: bandWidths[i] as 1 | 2 | 3 | 4,
        lineStyle: bandStyles[i],
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      })
    );

    chartRef.current  = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current  = null;
      seriesRef.current = null;
      bandRefs.current  = [null, null, null, null, null];
    };
  }, []);

  // Fetch candles (and forecast if applicable) on symbol or timeframe change
  useEffect(() => {
    const series = seriesRef.current;
    const chart  = chartRef.current;
    if (!series || !chart) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    // Clear any existing band data
    bandRefs.current.forEach((s) => s?.setData([]));

    const candlePromise = http
      .get<{ candles: { time: number; open: number; high: number; low: number; close: number }[] }>(
        `/screener/candles/${symbol}`,
        { params: { timeframe, limit: 200 } }
      );

    const forecastPromise: Promise<ForecastBands | null> = FORECAST_TIMEFRAMES.has(timeframe) && showForecast
      ? http
          .get<{ bands: ForecastBands }>(`/screener/candles/${symbol}/forecast`, { params: { timeframe } })
          .then(({ data }) => data.bands)
          .catch(() => null)
      : Promise.resolve(null);

    Promise.all([candlePromise, forecastPromise]).then(([{ data }, forecast]) => {
      if (cancelled) return;

      series.setData(data.candles.map((c) => ({ ...c, time: c.time as UTCTimestamp })));

      if (forecast && showForecast) {
        const anchor = { time: forecast.last_candle_time as UTCTimestamp, value: forecast.last_close };
        const bands = [forecast.p10, forecast.p25, forecast.p50, forecast.p75, forecast.p90];
        bands.forEach((band, i) => {
          const pts = [
            anchor,
            ...forecast.timestamps.map((ts, j) => ({ time: ts as UTCTimestamp, value: band[j] })),
          ];
          bandRefs.current[i]?.setData(pts);
        });
      }

      chart.timeScale().fitContent();
      setLoading(false);
    }).catch(() => {
      if (!cancelled) { setError("Failed to load chart data"); setLoading(false); }
    });

    return () => { cancelled = true; };
  }, [symbol, timeframe, showForecast]);

  // Toggle forecast visibility without re-fetching
  const toggleForecast = () => {
    setShowForecast((prev) => !prev);
  };

  const hasForecastTf = FORECAST_TIMEFRAMES.has(timeframe);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#0A1628]">
      {/* Header: symbol + timeframe selector + forecast toggle */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1E293B] shrink-0">
        <span className="text-[#64748B] text-xs font-medium">{symbol}</span>
        <div className="flex items-center gap-2">
          {hasForecastTf && (
            <button
              onClick={toggleForecast}
              title="Toggle Kronos AI forecast"
              className={`px-2 py-1 text-[10px] rounded font-medium transition-colors border ${
                showForecast
                  ? "border-[#00D4FF] text-[#00D4FF] bg-[#00D4FF]/10"
                  : "border-[#1E293B] text-[#64748B] hover:text-white"
              }`}
            >
              AI Forecast
            </button>
          )}
          <div className="flex gap-1">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                  timeframe === tf
                    ? "bg-[#00D4FF] text-black"
                    : "text-[#64748B] hover:text-white hover:bg-[#1E293B]"
                }`}
              >
                {TF_LABELS[tf]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 relative min-h-0">
        <div ref={containerRef} className="absolute inset-0" />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0A1628]/80" style={{ zIndex: 2 }}>
            <span className="text-[#64748B] text-sm">Loading chart...</span>
          </div>
        )}
        {error && !loading && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 2 }}>
            <span className="text-[#EF4444] text-sm">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
