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
  magnet_above: MagnetTarget | null;
  magnet_below: MagnetTarget | null;
}

const TIMEFRAMES = ["5min", "30min", "1h", "4h", "1day", "1week"] as const;
type Timeframe = (typeof TIMEFRAMES)[number];
const TF_LABELS: Record<Timeframe, string> = {
  "5min": "5M", "30min": "30M", "1h": "1H", "4h": "4H", "1day": "1D", "1week": "1W",
};

const COLOR_BULL = "#10B981"; // bullish FVG / session low
const COLOR_BEAR = "#EF4444"; // bearish FVG / session high

function magnetColor(m: MagnetTarget): string {
  return m.structure_type === "fvg_bull" || m.structure_type === "session_low"
    ? COLOR_BULL
    : COLOR_BEAR;
}

function structureLabel(m: MagnetTarget): string {
  if (m.structure_type === "fvg_bull") return "Bull FVG";
  if (m.structure_type === "fvg_bear") return "Bear FVG";
  if (m.structure_type === "session_high") return "Sess High";
  return "Sess Low";
}

function isZone(m: MagnetTarget): boolean {
  return Math.abs(m.price_top - m.price_bottom) > 0.000001;
}

interface ZoneRect { topY: number; height: number; color: string; }

export default function CandlestickChart({ symbol, magnet_above, magnet_below }: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const priceLinesRef = useRef<IPriceLine[]>([]);

  // Stable refs so refreshZones can read latest props without being in deps
  const magnetAboveRef = useRef(magnet_above);
  const magnetBelowRef = useRef(magnet_below);
  useEffect(() => { magnetAboveRef.current = magnet_above; }, [magnet_above]);
  useEffect(() => { magnetBelowRef.current = magnet_below; }, [magnet_below]);

  const [timeframe, setTimeframe] = useState<Timeframe>("4h");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zones, setZones] = useState<ZoneRect[]>([]);

  // Recomputes zone overlay positions from current price scale — stable, reads refs
  const refreshZones = useCallback(() => {
    const s = seriesRef.current;
    if (!s) return;
    const result: ZoneRect[] = [];

    const push = (m: MagnetTarget, color: string) => {
      if (!isZone(m)) return;
      const topY = s.priceToCoordinate(m.price_top);
      const botY = s.priceToCoordinate(m.price_bottom);
      if (topY == null || botY == null) return;
      const minY = Math.min(topY, botY);
      const maxY = Math.max(topY, botY);
      if (maxY > minY) result.push({ topY: minY, height: maxY - minY, color });
    };

    if (magnetAboveRef.current) push(magnetAboveRef.current, magnetColor(magnetAboveRef.current));
    if (magnetBelowRef.current) push(magnetBelowRef.current, magnetColor(magnetBelowRef.current));
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
      priceLineColor: "#A78BFA",
      priceLineWidth: 1,
      priceLineStyle: LineStyle.Dashed,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    // Reposition zone shading whenever the user pans or zooms
    chart.timeScale().subscribeVisibleLogicalRangeChange(refreshZones);

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      setZones([]);
    };
  }, [refreshZones]);

  // Fetch candles + draw price lines when symbol/timeframe/magnets change
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
        series.setData(data.candles.map((c) => ({ ...c, time: c.time as UTCTimestamp })));

        // Remove old price lines, redraw with new colors
        for (const line of priceLinesRef.current) series.removePriceLine(line);
        priceLinesRef.current = [];

        const addLine = (opts: Parameters<typeof series.createPriceLine>[0]) =>
          priceLinesRef.current.push(series.createPriceLine(opts));

        for (const m of [magnet_above, magnet_below]) {
          if (!m) continue;
          const c = magnetColor(m);
          const style = { color: c, lineWidth: 1 as const, lineStyle: LineStyle.Dashed };
          if (isZone(m)) {
            addLine({ ...style, price: m.price_top, axisLabelVisible: true, title: structureLabel(m) });
            addLine({ ...style, price: m.price_bottom, axisLabelVisible: false, title: "" });
          } else {
            addLine({ ...style, price: m.price_top, axisLabelVisible: true, title: structureLabel(m) });
          }
        }

        chart.timeScale().fitContent();
        refreshZones(); // initial zone positions after data loads
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) { setError("Failed to load chart data"); setLoading(false); }
      });

    return () => { cancelled = true; };
  }, [symbol, timeframe, magnet_above, magnet_below, refreshZones]);

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

      {/* Chart + zone overlay wrapper */}
      <div className="flex-1 relative min-h-0">
        {/* Lightweight Charts canvas host */}
        <div ref={containerRef} className="absolute inset-0" />

        {/* FVG zone shading — pointer-events-none so chart stays interactive */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
          {zones.map((z, i) => (
            <div
              key={i}
              className="absolute left-0 right-0"
              style={{
                top: z.topY,
                height: z.height,
                background: z.color + "1A", // ~10% opacity fill
                borderTop: `1px dashed ${z.color}55`,
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

      {/* Legend */}
      {(magnet_above || magnet_below) && (
        <div className="flex items-center gap-4 px-3 py-1.5 border-t border-[#1E293B] shrink-0">
          {[magnet_above, magnet_below].filter(Boolean).map((m) => {
            const color = magnetColor(m!);
            return (
              <div key={m!.structure_type + m!.formed_at} className="flex items-center gap-1.5">
                <div className="w-4 h-px border-t-2 border-dashed" style={{ borderColor: color }} />
                <span className="text-[10px]" style={{ color }}>
                  {structureLabel(m!)} ({m!.atr_distance?.toFixed(1)} ATR)
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
