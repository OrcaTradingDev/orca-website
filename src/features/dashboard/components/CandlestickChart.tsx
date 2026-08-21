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

interface BandLabel {
  key: string;
  delta: string;
  positive: boolean;
  color: string;
}

const TIMEFRAMES = ["5min", "30min", "1h", "4h", "1day", "1week"] as const;
type Timeframe = (typeof TIMEFRAMES)[number];
const TF_LABELS: Record<Timeframe, string> = {
  "5min": "5M", "30min": "30M", "1h": "1H", "4h": "4H", "1day": "1D", "1week": "1W",
};

const FORECAST_TIMEFRAMES: Set<Timeframe> = new Set(["4h", "1day"]);

const BAND_KEYS   = ["p90", "p75", "p50", "p25", "p10"] as const;
const BAND_COLORS = [
  "rgba(0,212,255,0.35)",  // p10
  "rgba(0,212,255,0.55)",  // p25
  "#00D4FF",                // p50
  "rgba(0,212,255,0.55)",  // p75
  "rgba(0,212,255,0.35)",  // p90
];
// series order matches band arrays: p10, p25, p50, p75, p90
const SERIES_ORDER = ["p10", "p25", "p50", "p75", "p90"] as const;

function formatDelta(delta: number, base: number): string {
  const sign = delta >= 0 ? "+" : "";
  const dec = base > 100 ? 2 : base > 1 ? 4 : 6;
  return `${sign}${delta.toFixed(dec)}`;
}

function buildLabels(forecast: ForecastBands): BandLabel[] {
  const last = forecast.timestamps.length - 1;
  const base  = forecast.last_close;
  const bands: Record<string, number[]> = {
    p10: forecast.p10, p25: forecast.p25, p50: forecast.p50,
    p75: forecast.p75, p90: forecast.p90,
  };
  const labelColors: Record<string, string> = {
    p90: "rgba(0,212,255,0.60)",
    p75: "rgba(0,212,255,0.80)",
    p50: "#00D4FF",
    p25: "rgba(0,212,255,0.80)",
    p10: "rgba(0,212,255,0.60)",
  };
  return BAND_KEYS.map((key) => {
    const price = bands[key][last];
    const delta = price - base;
    return {
      key,
      delta: formatDelta(delta, base),
      positive: delta >= 0,
      color: labelColors[key],
    };
  });
}

export default function CandlestickChart({ symbol }: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef     = useRef<IChartApi | null>(null);
  const seriesRef    = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const bandRefs     = useRef<(ISeriesApi<"Line"> | null)[]>([null, null, null, null, null]);

  const [timeframe, setTimeframe]       = useState<Timeframe>("4h");
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [showForecast, setShowForecast] = useState(true);
  const [labels, setLabels]             = useState<BandLabel[] | null>(null);

  // ── Chart creation (once) ─────────────────────────────────────────────────
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
      rightPriceScale: { borderColor: "#1E293B", scaleMargins: { top: 0.1, bottom: 0.15 } },
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

    const bandWidths  = [1, 1, 1.5, 1, 1] as const;
    const bandStyles  = [LineStyle.Dashed, LineStyle.Dashed, LineStyle.Solid, LineStyle.Dashed, LineStyle.Dashed];

    bandRefs.current = SERIES_ORDER.map((_, i) =>
      chart.addLineSeries({
        color: BAND_COLORS[i],
        lineWidth: bandWidths[i],
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

  // ── Data fetching ─────────────────────────────────────────────────────────
  useEffect(() => {
    const series = seriesRef.current;
    const chart  = chartRef.current;
    if (!series || !chart) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setLabels(null);

    bandRefs.current.forEach(s => s?.setData([]));

    const candlePromise = http.get<{
      candles: { time: number; open: number; high: number; low: number; close: number }[];
    }>(`/screener/candles/${symbol}`, { params: { timeframe, limit: 200 } });

    const forecastPromise: Promise<ForecastBands | null> =
      FORECAST_TIMEFRAMES.has(timeframe) && showForecast
        ? http
            .get<{ bands: ForecastBands }>(`/screener/candles/${symbol}/forecast`, {
              params: { timeframe },
            })
            .then(({ data }) => data.bands)
            .catch(() => null)
        : Promise.resolve(null);

    Promise.all([candlePromise, forecastPromise]).then(([{ data }, forecast]) => {
      if (cancelled) return;

      series.setData(data.candles.map(c => ({ ...c, time: c.time as UTCTimestamp })));

      if (forecast && showForecast) {
        const anchor     = { time: forecast.last_candle_time as UTCTimestamp, value: forecast.last_close };
        const bandArrays = [forecast.p10, forecast.p25, forecast.p50, forecast.p75, forecast.p90];
        bandArrays.forEach((band, i) => {
          bandRefs.current[i]?.setData([
            anchor,
            ...forecast.timestamps.map((ts, j) => ({ time: ts as UTCTimestamp, value: band[j] })),
          ]);
        });
        setLabels(buildLabels(forecast));
      }

      chart.timeScale().fitContent();
      setLoading(false);
    }).catch(() => {
      if (!cancelled) { setError("Failed to load chart data"); setLoading(false); }
    });

    return () => { cancelled = true; };
  }, [symbol, timeframe, showForecast]);

  const hasForecastTf = FORECAST_TIMEFRAMES.has(timeframe);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#0A1628]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1E293B] shrink-0 gap-2">
        {/* Left: symbol + forecast band deltas */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[#64748B] text-xs font-medium shrink-0">{symbol}</span>
          {showForecast && labels && (
            <div className="flex items-center gap-2 overflow-x-auto">
              {labels.map(({ key, delta, positive }) => (
                <span
                  key={key}
                  style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, whiteSpace: "nowrap" }}
                >
                  <span style={{ color: "#64748B" }}>{key} </span>
                  <span style={{ color: positive ? "#10B981" : "#EF4444" }}>{delta}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right: AI Forecast toggle + timeframe selector */}
        <div className="flex items-center gap-2 shrink-0">
          {hasForecastTf && (
            <button
              onClick={() => { setShowForecast(p => !p); if (showForecast) setLabels(null); }}
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
            {TIMEFRAMES.map(tf => (
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
