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

const TIMEFRAMES = ["5min", "30min", "1h", "4h", "1day", "1week"] as const;
type Timeframe = (typeof TIMEFRAMES)[number];
const TF_LABELS: Record<Timeframe, string> = {
  "5min": "5M", "30min": "30M", "1h": "1H", "4h": "4H", "1day": "1D", "1week": "1W",
};

export default function CandlestickChart({ symbol }: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef     = useRef<IChartApi | null>(null);
  const seriesRef    = useRef<ISeriesApi<"Candlestick"> | null>(null);

  const [timeframe, setTimeframe] = useState<Timeframe>("4h");
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

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

    chartRef.current  = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current  = null;
      seriesRef.current = null;
    };
  }, []);

  // Fetch candles on symbol or timeframe change
  useEffect(() => {
    const series = seriesRef.current;
    const chart  = chartRef.current;
    if (!series || !chart) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    http
      .get<{ candles: { time: number; open: number; high: number; low: number; close: number }[] }>(
        `/screener/candles/${symbol}`,
        { params: { timeframe, limit: 200 } }
      )
      .then(({ data }) => {
        if (cancelled) return;
        series.setData(data.candles.map((c) => ({ ...c, time: c.time as UTCTimestamp })));
        chart.timeScale().fitContent();
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) { setError("Failed to load chart data"); setLoading(false); }
      });

    return () => { cancelled = true; };
  }, [symbol, timeframe]);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#0A1628]">
      {/* Header: symbol + timeframe selector */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1E293B] shrink-0">
        <span className="text-[#64748B] text-xs font-medium">{symbol}</span>
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
