"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  ColorType,
  CrosshairMode,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
  type IPriceLine,
  type UTCTimestamp,
} from "lightweight-charts";
import { http } from "@/lib/http";
import type { MagnetTarget } from "@/features/dashboard/types/screener";

interface CandlestickChartProps {
  symbol: string;
  magnet_above: MagnetTarget | null;
  magnet_below: MagnetTarget | null;
}

const TIMEFRAMES = ["5min", "30min", "1h", "4h", "1day", "1week"] as const;
type Timeframe = (typeof TIMEFRAMES)[number];
const TF_LABELS: Record<Timeframe, string> = {
  "5min": "5M", "30min": "30M", "1h": "1H", "4h": "4H", "1day": "1D", "1week": "1W",
};

function structureLabel(m: MagnetTarget): string {
  if (m.structure_type === "fvg_bull") return "Bull FVG";
  if (m.structure_type === "fvg_bear") return "Bear FVG";
  if (m.structure_type === "session_high") return "Sess High";
  return "Sess Low";
}

function isZone(m: MagnetTarget): boolean {
  return Math.abs(m.price_top - m.price_bottom) > 0.000001;
}

export default function CandlestickChart({ symbol, magnet_above, magnet_below }: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const priceLinesRef = useRef<IPriceLine[]>([]);
  const [timeframe, setTimeframe] = useState<Timeframe>("4h");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create/destroy chart when container mounts
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#94A3B8",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "#1E293B" },
        horzLines: { color: "#1E293B" },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: {
        borderColor: "#1E293B",
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: "#1E293B",
        timeVisible: true,
        secondsVisible: false,
      },
      autoSize: true,
    });

    const series = chart.addCandlestickSeries({
      upColor: "#10B981",
      downColor: "#EF4444",
      borderUpColor: "#10B981",
      borderDownColor: "#EF4444",
      wickUpColor: "#10B981",
      wickDownColor: "#EF4444",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // Fetch candles + draw magnet lines whenever symbol/timeframe/magnets change
  useEffect(() => {
    const series = seriesRef.current;
    const chart = chartRef.current;
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
        series.setData(
          data.candles.map((c) => ({ ...c, time: c.time as UTCTimestamp }))
        );

        // Remove any previously drawn price lines before adding new ones
        for (const line of priceLinesRef.current) {
          series.removePriceLine(line);
        }
        priceLinesRef.current = [];

        const addLine = (opts: Parameters<typeof series.createPriceLine>[0]) => {
          priceLinesRef.current.push(series.createPriceLine(opts));
        };

        if (magnet_above) {
          const color = "#10B981";
          if (isZone(magnet_above)) {
            addLine({ price: magnet_above.price_top, color, lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: structureLabel(magnet_above) });
            addLine({ price: magnet_above.price_bottom, color, lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: false, title: "" });
          } else {
            addLine({ price: magnet_above.price_top, color, lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: structureLabel(magnet_above) });
          }
        }

        if (magnet_below) {
          const color = "#EF4444";
          if (isZone(magnet_below)) {
            addLine({ price: magnet_below.price_top, color, lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: false, title: "" });
            addLine({ price: magnet_below.price_bottom, color, lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: structureLabel(magnet_below) });
          } else {
            addLine({ price: magnet_below.price_bottom, color, lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: structureLabel(magnet_below) });
          }
        }

        chart.timeScale().fitContent();
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Failed to load chart data");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [symbol, timeframe, magnet_above, magnet_below]);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#0A1628]">
      {/* Timeframe selector */}
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

      {/* Chart container */}
      <div ref={containerRef} className="flex-1 relative min-h-0">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0A1628]/80 z-10">
            <span className="text-[#64748B] text-sm">Loading chart...</span>
          </div>
        )}
        {error && !loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <span className="text-[#EF4444] text-sm">{error}</span>
          </div>
        )}
      </div>

      {/* Magnet legend */}
      {(magnet_above || magnet_below) && (
        <div className="flex items-center gap-4 px-3 py-1.5 border-t border-[#1E293B] shrink-0">
          {magnet_above && (
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-px border-t-2 border-dashed border-[#10B981]" />
              <span className="text-[10px] text-[#10B981]">
                {structureLabel(magnet_above)} ({magnet_above.atr_distance?.toFixed(1)} ATR)
              </span>
            </div>
          )}
          {magnet_below && (
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-px border-t-2 border-dashed border-[#EF4444]" />
              <span className="text-[10px] text-[#EF4444]">
                {structureLabel(magnet_below)} ({magnet_below.atr_distance?.toFixed(1)} ATR)
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
