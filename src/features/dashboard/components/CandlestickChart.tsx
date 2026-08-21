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
  paths?: number[][];  // 20 individual scenario paths for fan rendering
}


const TIMEFRAMES = ["5min", "30min", "1h", "4h", "1day", "1week"] as const;
type Timeframe = (typeof TIMEFRAMES)[number];
const TF_LABELS: Record<Timeframe, string> = {
  "5min": "5M", "30min": "30M", "1h": "1H", "4h": "4H", "1day": "1D", "1week": "1W",
};

const FORECAST_TIMEFRAMES: Set<Timeframe> = new Set(["4h", "1day"]);

// How many candles to fetch per timeframe
const TF_LIMIT: Record<Timeframe, number> = {
  "5min": 200, "30min": 200, "1h": 200, "4h": 2000, "1day": 1500, "1week": 200,
};

// How many recent candles to show in the initial viewport (rest scrollable)
const TF_VIEWPORT: Record<Timeframe, number> = {
  "5min": 100, "30min": 100, "1h": 100, "4h": 100, "1day": 120, "1week": 100,
};

const BAND_KEYS = ["p90", "p75", "p50", "p25", "p10"] as const;
const BAND_COLORS = [
  "rgba(0,212,255,0.35)",  // p10
  "rgba(0,212,255,0.55)",  // p25
  "#00D4FF",                // p50
  "rgba(0,212,255,0.55)",  // p75
  "rgba(0,212,255,0.35)",  // p90
];
// series order matches band arrays: p10, p25, p50, p75, p90
const SERIES_ORDER = ["p10", "p25", "p50", "p75", "p90"] as const;

const BAND_LABEL_COLORS: Record<string, string> = {
  p90: "rgba(0,212,255,0.60)",
  p75: "rgba(0,212,255,0.80)",
  p50: "#00D4FF",
  p25: "rgba(0,212,255,0.80)",
  p10: "rgba(0,212,255,0.60)",
};

export default function CandlestickChart({ symbol }: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef     = useRef<IChartApi | null>(null);
  const seriesRef    = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const bandRefs     = useRef<(ISeriesApi<"Line"> | null)[]>([null, null, null, null, null]);
  const pathRefs     = useRef<(ISeriesApi<"Line"> | null)[]>([]);

  const [timeframe, setTimeframe]       = useState<Timeframe>("4h");
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [showForecast, setShowForecast]     = useState(true);
  const [forecastData, setForecastData]   = useState<ForecastBands | null>(null);

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

    const bandWidths  = [1, 1, 2, 1, 1] as const;
    const bandStyles  = [LineStyle.Dashed, LineStyle.Dashed, LineStyle.Solid, LineStyle.Dashed, LineStyle.Dashed];

    // 20 individual scenario path series — hidden until they have data
    pathRefs.current = Array.from({ length: 20 }, () =>
      chart.addLineSeries({
        color: "rgba(0,212,255,0.12)",
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
        visible: false,
      })
    );

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
      pathRefs.current  = [];
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
    setForecastData(null);

    bandRefs.current.forEach(s => s?.setData([]));
    pathRefs.current.forEach(s => {
      s?.setData([]);
      s?.applyOptions({ visible: false });
    });

    const candlePromise = http.get<{
      candles: { time: number; open: number; high: number; low: number; close: number }[];
    }>(`/screener/candles/${symbol}`, { params: { timeframe, limit: TF_LIMIT[timeframe] } });

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

      // Deduplicate by interval bucket — handles rows with off-by-seconds timestamps
      // within the same candle period (e.g. 14:00:00 and 14:00:01 on a 4H chart).
      const tfInterval: Record<Timeframe, number> = {
        "5min": 300, "30min": 1800, "1h": 3600, "4h": 14400, "1day": 86400, "1week": 604800,
      };
      const interval = tfInterval[timeframe];
      const buckets = new Map<number, typeof data.candles[0]>();
      for (const c of data.candles) {
        const bucket = Math.floor(c.time / interval);
        if (!buckets.has(bucket)) buckets.set(bucket, c);
      }
      const uniqueCandles = Array.from(buckets.values()).sort((a, b) => a.time - b.time);
      series.setData(uniqueCandles.map(c => ({ ...c, time: c.time as UTCTimestamp })));

      if (forecast && showForecast) {
        const anchor     = { time: forecast.last_candle_time as UTCTimestamp, value: forecast.last_close };
        const bandArrays = [forecast.p10, forecast.p25, forecast.p50, forecast.p75, forecast.p90];
        bandArrays.forEach((band, i) => {
          bandRefs.current[i]?.setData([
            anchor,
            ...forecast.timestamps.map((ts, j) => ({ time: ts as UTCTimestamp, value: band[j] })),
          ]);
        });
        // Render individual scenario paths (fan behind the percentile bands)
        if (forecast.paths?.length) {
          forecast.paths.forEach((path, i) => {
            const ref = pathRefs.current[i];
            if (!ref) return;
            ref.applyOptions({ visible: true });
            ref.setData([
              anchor,
              ...forecast.timestamps.map((ts, j) => ({ time: ts as UTCTimestamp, value: path[j] })),
            ]);
          });
        }

        setForecastData(forecast);
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
      {/* Header row 1: symbol + controls */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1E293B] shrink-0 gap-2">
        <span className="text-[#64748B] text-xs font-medium">{symbol}</span>
        <div className="flex items-center gap-2">
          {hasForecastTf && (
            <button
              onClick={() => { setShowForecast(p => !p); if (showForecast) setForecastData(null); }}
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

      {/* Header row 2: forecast band labels (own row, always full width) */}
      {showForecast && forecastData && forecastData.timestamps.length > 0 && (() => {
        const base = forecastData.last_close;
        const dec  = base > 100 ? 2 : base > 1 ? 4 : 6;
        const last = forecastData.timestamps.length - 1;
        const vals: Record<string, number[]> = {
          p10: forecastData.p10, p25: forecastData.p25, p50: forecastData.p50,
          p75: forecastData.p75, p90: forecastData.p90,
        };
        return (
          <div className="flex items-center gap-3 px-3 py-1 border-b border-[#1E293B] shrink-0">
            {BAND_KEYS.map(key => {
              const delta = vals[key][last] - base;
              const sign  = delta >= 0 ? "+" : "";
              return (
                <span key={key} style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, whiteSpace: "nowrap" }}>
                  <span style={{ color: BAND_LABEL_COLORS[key] }}>{key} </span>
                  <span style={{ color: delta >= 0 ? "#10B981" : "#EF4444" }}>
                    {sign}{delta.toFixed(dec)}
                  </span>
                </span>
              );
            })}
          </div>
        );
      })()}

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
