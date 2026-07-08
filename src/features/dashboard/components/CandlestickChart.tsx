"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  magnet_structures: MagnetTarget[];
}

const TIMEFRAMES = ["5min", "30min", "1h", "4h", "1day", "1week"] as const;
type Timeframe = (typeof TIMEFRAMES)[number];
const TF_LABELS: Record<Timeframe, string> = {
  "5min": "5M", "30min": "30M", "1h": "1H", "4h": "4H", "1day": "1D", "1week": "1W",
};

// Structures above/below are all drawn — cap per side to avoid a wall of lines
const MAX_PER_SIDE = 4;

const BULLISH_TYPES = new Set(["fvg_bull", "session_low", "week_low", "swing_low", "eql"]);

export function magnetColor(m: MagnetTarget): string {
  return BULLISH_TYPES.has(m.structure_type) ? "#10B981" : "#EF4444";
}

export function structureLabel(m: MagnetTarget): string {
  switch (m.structure_type) {
    case "fvg_bull":     return "Bull FVG";
    case "fvg_bear":     return "Bear FVG";
    case "session_high": return "Sess High";
    case "session_low":  return "Sess Low";
    case "week_high":    return "Week High";
    case "week_low":     return "Week Low";
    case "swing_high":   return "Swing High";
    case "swing_low":    return "Swing Low";
    case "eqh":          return "Equal Highs";
    case "eql":          return "Equal Lows";
    default:             return m.structure_type;
  }
}

function isZone(m: MagnetTarget): boolean {
  return Math.abs(m.price_top - m.price_bottom) > 0.000001;
}

interface ZoneRect { topY: number; height: number; color: string; }

export default function CandlestickChart({ symbol, magnet_structures }: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef     = useRef<IChartApi | null>(null);
  const seriesRef    = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const priceLinesRef = useRef<IPriceLine[]>([]);
  const magnetRef    = useRef(magnet_structures);
  useEffect(() => { magnetRef.current = magnet_structures; }, [magnet_structures]);

  const [timeframe, setTimeframe] = useState<Timeframe>("4h");
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [zones, setZones]       = useState<ZoneRect[]>([]);

  // Stable callback — reads magnets from ref, no closure over props
  const refreshZones = useCallback(() => {
    const s = seriesRef.current;
    if (!s) return;
    const result: ZoneRect[] = [];
    for (const m of magnetRef.current) {
      if (!isZone(m)) continue;
      const topY = s.priceToCoordinate(m.price_top);
      const botY = s.priceToCoordinate(m.price_bottom);
      if (topY == null || botY == null) continue;
      const minY = Math.min(topY, botY);
      const maxY = Math.max(topY, botY);
      if (maxY > minY) result.push({ topY: minY, height: maxY - minY, color: magnetColor(m) });
    }
    setZones(result);
  }, []);

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

    chart.timeScale().subscribeVisibleLogicalRangeChange(refreshZones);
    const ro = new ResizeObserver(refreshZones);
    ro.observe(container);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current  = null;
      seriesRef.current = null;
      setZones([]);
    };
  }, [refreshZones]);

  // Fetch candles + redraw price lines on symbol / timeframe / magnet change
  useEffect(() => {
    const series = seriesRef.current;
    const chart  = chartRef.current;
    if (!series || !chart) return;

    let cancelled = false;
    let rafId: number | undefined;
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

        // Remove old price lines
        for (const l of priceLinesRef.current) series.removePriceLine(l);
        priceLinesRef.current = [];

        const addLine = (opts: Parameters<typeof series.createPriceLine>[0]) =>
          priceLinesRef.current.push(series.createPriceLine(opts));

        // Split into above/below, cap per side so the chart stays readable
        const structs = magnet_structures;
        const sorted  = [...structs].sort((a, b) => (a.atr_distance ?? 999) - (b.atr_distance ?? 999));

        // We need current price to split above/below — use the last candle
        const lastCandle = data.candles[data.candles.length - 1];
        const currentPrice = lastCandle?.close ?? 0;

        const above = sorted.filter((m) => (m.price_top + m.price_bottom) / 2 > currentPrice).slice(0, MAX_PER_SIDE);
        const below = sorted.filter((m) => (m.price_top + m.price_bottom) / 2 <= currentPrice).slice(0, MAX_PER_SIDE);

        for (const m of [...above, ...below]) {
          const c     = magnetColor(m);
          const style = { color: c, lineWidth: 1 as const, lineStyle: LineStyle.Dashed };
          if (isZone(m)) {
            addLine({ ...style, price: m.price_top,    axisLabelVisible: true,  title: structureLabel(m) });
            addLine({ ...style, price: m.price_bottom, axisLabelVisible: false, title: "" });
          } else {
            addLine({ ...style, price: m.price_top, axisLabelVisible: true, title: structureLabel(m) });
          }
        }

        chart.timeScale().fitContent();
        rafId = requestAnimationFrame(refreshZones);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) { setError("Failed to load chart data"); setLoading(false); }
      });

    return () => {
      cancelled = true;
      if (rafId !== undefined) cancelAnimationFrame(rafId);
    };
  }, [symbol, timeframe, magnet_structures, refreshZones]);

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
                timeframe === tf ? "bg-[#00D4FF] text-black" : "text-[#64748B] hover:text-white hover:bg-[#1E293B]"
              }`}
            >
              {TF_LABELS[tf]}
            </button>
          ))}
        </div>
      </div>

      {/* Chart + zone overlay */}
      <div className="flex-1 relative min-h-0">
        <div ref={containerRef} className="absolute inset-0" />

        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
          {zones.map((z, i) => (
            <div
              key={i}
              className="absolute left-0 right-0"
              style={{
                top: z.topY,
                height: z.height,
                background: z.color + "1A",
                borderTop:    `1px dashed ${z.color}55`,
                borderBottom: `1px dashed ${z.color}55`,
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

      {/* Legend — show up to 4 structures per side */}
      {magnet_structures.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-1.5 border-t border-[#1E293B] shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#A78BFA]" />
            <span className="text-[10px] text-[#A78BFA]">Current Price</span>
          </div>
          {magnet_structures.slice(0, 6).map((m, i) => {
            const color = magnetColor(m);
            return (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-4 h-px border-t-2 border-dashed" style={{ borderColor: color }} />
                <span className="text-[10px]" style={{ color }}>
                  {structureLabel(m)} {m.atr_distance != null ? `(${m.atr_distance.toFixed(1)} ATR)` : ""}
                </span>
              </div>
            );
          })}
          {magnet_structures.length > 6 && (
            <span className="text-[10px] text-[#475569]">+{magnet_structures.length - 6} more</span>
          )}
        </div>
      )}
    </div>
  );
}
