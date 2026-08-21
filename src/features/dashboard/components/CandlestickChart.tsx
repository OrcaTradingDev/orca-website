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

const FORECAST_TIMEFRAMES: Set<Timeframe> = new Set(["4h", "1day"]);

const BAND_KEYS  = ["p10", "p25", "p50", "p75", "p90"] as const;
const BAND_COLORS = [
  "rgba(0,212,255,0.35)",
  "rgba(0,212,255,0.55)",
  "#00D4FF",
  "rgba(0,212,255,0.55)",
  "rgba(0,212,255,0.35)",
];
const BAND_LABEL_COLORS = [
  "rgba(0,212,255,0.65)",
  "rgba(0,212,255,0.80)",
  "#00D4FF",
  "rgba(0,212,255,0.80)",
  "rgba(0,212,255,0.65)",
];
const BAND_WIDTHS  = [1, 1, 1.5, 1, 1] as const;
const BAND_STYLES  = [
  LineStyle.Dashed, LineStyle.Dashed, LineStyle.Solid, LineStyle.Dashed, LineStyle.Dashed,
];

function formatDelta(delta: number, basePrice: number): string {
  const sign = delta >= 0 ? "+" : "";
  const decimals =
    basePrice > 100 ? 2
    : basePrice > 1  ? 4
    : 6;
  return `${sign}${delta.toFixed(decimals)}`;
}

export default function CandlestickChart({ symbol }: CandlestickChartProps) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const chartRef      = useRef<IChartApi | null>(null);
  const seriesRef     = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const bandRefs      = useRef<(ISeriesApi<"Line"> | null)[]>([null, null, null, null, null]);
  const labelDivs     = useRef<(HTMLDivElement | null)[]>([null, null, null, null, null]);

  // Use refs for values the label updater reads (avoids stale closure on subscriptions)
  const forecastRef     = useRef<ForecastBands | null>(null);
  const showForecastRef = useRef(true);

  const [timeframe, setTimeframe]     = useState<Timeframe>("4h");
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [showForecast, setShowForecast] = useState(true);

  // Keep ref in sync with state
  useEffect(() => { showForecastRef.current = showForecast; }, [showForecast]);

  // ── Label positioning ──────────────────────────────────────────────────────
  // Reads from refs so it can be subscribed once and always see fresh values.
  function positionLabels() {
    const chart    = chartRef.current;
    const forecast = forecastRef.current;

    if (!chart || !forecast || !showForecastRef.current) {
      labelDivs.current.forEach(el => { if (el) el.style.display = "none"; });
      return;
    }

    const lastTime = forecast.timestamps[forecast.timestamps.length - 1] as UTCTimestamp;
    const xCoord   = chart.timeScale().timeToCoordinate(lastTime);
    if (xCoord === null) {
      labelDivs.current.forEach(el => { if (el) el.style.display = "none"; });
      return;
    }

    const bandValues = [forecast.p10, forecast.p25, forecast.p50, forecast.p75, forecast.p90];

    BAND_KEYS.forEach((key, i) => {
      const el     = labelDivs.current[i];
      const series = bandRefs.current[i];
      if (!el || !series) return;

      const lastPrice = bandValues[i][bandValues[i].length - 1];
      const yCoord    = series.priceToCoordinate(lastPrice);
      if (yCoord === null) { el.style.display = "none"; return; }

      const delta    = lastPrice - forecast.last_close;
      const deltaStr = formatDelta(delta, forecast.last_close);

      el.style.display = "block";
      el.style.left    = `${Math.round(xCoord) + 6}px`;
      el.style.top     = `${Math.round(yCoord) - 9}px`;
      el.innerHTML     = `<span style="opacity:.65">${key}</span>&nbsp;<span>${deltaStr}</span>`;
    });
  }

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

    bandRefs.current = BAND_KEYS.map((_, i) =>
      chart.addLineSeries({
        color: BAND_COLORS[i],
        lineWidth: BAND_WIDTHS[i],
        lineStyle: BAND_STYLES[i],
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      })
    );

    // Re-position labels whenever time scale pans/zooms or price scale changes
    chart.timeScale().subscribeVisibleLogicalRangeChange(() => {
      requestAnimationFrame(positionLabels);
    });

    chartRef.current  = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current  = null;
      seriesRef.current = null;
      bandRefs.current  = [null, null, null, null, null];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-position labels whenever showForecast toggles (ref already updated above)
  useEffect(() => {
    requestAnimationFrame(positionLabels);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showForecast]);

  // ── Data fetching ─────────────────────────────────────────────────────────
  useEffect(() => {
    const series = seriesRef.current;
    const chart  = chartRef.current;
    if (!series || !chart) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    // Clear old forecast
    bandRefs.current.forEach(s => s?.setData([]));
    forecastRef.current = null;
    labelDivs.current.forEach(el => { if (el) el.style.display = "none"; });

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
        forecastRef.current = forecast;
        const anchor     = { time: forecast.last_candle_time as UTCTimestamp, value: forecast.last_close };
        const bandValues = [forecast.p10, forecast.p25, forecast.p50, forecast.p75, forecast.p90];
        bandValues.forEach((band, i) => {
          const pts = [
            anchor,
            ...forecast.timestamps.map((ts, j) => ({ time: ts as UTCTimestamp, value: band[j] })),
          ];
          bandRefs.current[i]?.setData(pts);
        });
      }

      chart.timeScale().fitContent();
      // Allow chart layout to settle before computing pixel coords
      setTimeout(() => {
        if (!cancelled) requestAnimationFrame(positionLabels);
      }, 120);

      setLoading(false);
    }).catch(() => {
      if (!cancelled) { setError("Failed to load chart data"); setLoading(false); }
    });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, timeframe, showForecast]);

  const hasForecastTf = FORECAST_TIMEFRAMES.has(timeframe);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#0A1628]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1E293B] shrink-0">
        <span className="text-[#64748B] text-xs font-medium">{symbol}</span>
        <div className="flex items-center gap-2">
          {hasForecastTf && (
            <button
              onClick={() => setShowForecast(p => !p)}
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

      {/* Chart + label overlay */}
      <div className="flex-1 relative min-h-0">
        <div ref={containerRef} className="absolute inset-0" />

        {/* Forecast end-of-line labels */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 3 }}>
          {BAND_KEYS.map((key, i) => (
            <div
              key={key}
              ref={el => { labelDivs.current[i] = el; }}
              style={{
                position: "absolute",
                display: "none",
                fontSize: "10px",
                fontFamily: "ui-monospace, monospace",
                color: BAND_LABEL_COLORS[i],
                whiteSpace: "nowrap",
                background: "rgba(10,22,40,0.85)",
                padding: "1px 5px",
                borderRadius: "3px",
                lineHeight: "18px",
              }}
            />
          ))}
        </div>

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
