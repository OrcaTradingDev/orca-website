"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createChart,
  ColorType,
  CrosshairMode,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
  type SeriesMarker,
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

type StructureCategory = "fvg" | "session" | "weekly" | "swing" | "equal_hl";

const CATEGORY_LABELS: Record<StructureCategory, string> = {
  fvg: "FVG",
  session: "Session",
  weekly: "Weekly",
  swing: "Swing",
  equal_hl: "Equal H/L",
};

const ALL_CATEGORIES: StructureCategory[] = ["fvg", "session", "weekly", "swing", "equal_hl"];

function getCategory(t: string): StructureCategory {
  if (t.startsWith("fvg")) return "fvg";
  if (t.startsWith("session")) return "session";
  if (t.startsWith("week")) return "weekly";
  if (t === "swing_high" || t === "swing_low") return "swing";
  if (t === "eqh" || t === "eql") return "equal_hl";
  return "fvg";
}

const BULLISH_TYPES = new Set(["fvg_bull", "session_low", "week_low", "swing_low", "eql"]);

// Rendered as native series markers (candle-anchored arrows), not lines
const MARKER_TYPES = new Set(["swing_high", "swing_low", "eqh", "eql"]);

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
    case "swing_high":   return "Swing H";
    case "swing_low":    return "Swing L";
    case "eqh":          return "EQH";
    case "eql":          return "EQL";
    default:             return m.structure_type;
  }
}

function isZone(m: MagnetTarget): boolean {
  return Math.abs(m.price_top - m.price_bottom) > 0.000001;
}

// Zone shading for FVGs
interface ZoneRect { topY: number; height: number; color: string; label: string; }
// Right-edge pill labels for session/weekly single-price levels
interface PriceLabel { y: number; color: string; text: string; }

export default function CandlestickChart({ symbol, magnet_structures }: CandlestickChartProps) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const chartRef      = useRef<IChartApi | null>(null);
  const seriesRef     = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const magnetRef     = useRef(magnet_structures);
  const activeCatRef  = useRef<Set<StructureCategory>>(new Set(ALL_CATEGORIES));

  useEffect(() => { magnetRef.current = magnet_structures; }, [magnet_structures]);

  const [timeframe, setTimeframe]   = useState<Timeframe>("4h");
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [zones, setZones]           = useState<ZoneRect[]>([]);
  const [labels, setLabels]         = useState<PriceLabel[]>([]);
  const [lastClose, setLastClose]   = useState<number>(0);
  const [activeCategories, setActiveCategories] = useState<Set<StructureCategory>>(
    () => new Set(ALL_CATEGORIES)
  );

  useEffect(() => { activeCatRef.current = activeCategories; }, [activeCategories]);

  const toggleCategory = (cat: StructureCategory) => {
    setActiveCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  };

  // Stable callback — computes zone shading + right-edge labels from price coordinates.
  // No full-width lines: FVGs → shading + label, session/weekly → label only.
  const refreshZones = useCallback(() => {
    const s = seriesRef.current;
    if (!s) return;
    const activeCats = activeCatRef.current;

    const zoneResult:  ZoneRect[]   = [];
    const labelResult: PriceLabel[] = [];

    for (const m of magnetRef.current) {
      if (!activeCats.has(getCategory(m.structure_type))) continue;
      if (MARKER_TYPES.has(m.structure_type)) continue; // these use native series markers

      if (isZone(m)) {
        // FVG zone shading
        const topY = s.priceToCoordinate(m.price_top);
        const botY = s.priceToCoordinate(m.price_bottom);
        if (topY == null || botY == null) continue;
        const minY = Math.min(topY, botY);
        const maxY = Math.max(topY, botY);
        if (maxY > minY) {
          zoneResult.push({
            topY: minY, height: maxY - minY,
            color: magnetColor(m), label: structureLabel(m),
          });
        }
      } else {
        // Session / weekly single-price level → right-edge label only
        const y = s.priceToCoordinate(m.price_top);
        if (y == null) continue;
        labelResult.push({ y, color: magnetColor(m), text: structureLabel(m) });
      }
    }

    setZones(zoneResult);
    setLabels(labelResult);
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
      setLabels([]);
    };
  }, [refreshZones]);

  // Fetch candles on symbol or timeframe change
  useEffect(() => {
    const series = seriesRef.current;
    const chart  = chartRef.current;
    if (!series || !chart) return;

    let cancelled = false;
    let rafId: number | undefined;
    setLoading(true);
    setError(null);
    series.setMarkers([]);

    http
      .get<{ candles: { time: number; open: number; high: number; low: number; close: number }[] }>(
        `/screener/candles/${symbol}`,
        { params: { timeframe, limit: 200 } }
      )
      .then(({ data }) => {
        if (cancelled) return;
        series.setData(data.candles.map((c) => ({ ...c, time: c.time as UTCTimestamp })));
        const lastCandle = data.candles[data.candles.length - 1];
        setLastClose(lastCandle?.close ?? 0);
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
  }, [symbol, timeframe, refreshZones]);

  // Set markers when structures, categories, or lastClose change — no re-fetch, no price lines
  useEffect(() => {
    const series = seriesRef.current;
    if (!series || !lastClose) return;

    const markerStructures = magnet_structures.filter(
      m => MARKER_TYPES.has(m.structure_type) &&
           activeCategories.has(getCategory(m.structure_type)) &&
           (m.candle_time != null || m.formed_at !== "")
    );

    const markers: SeriesMarker<UTCTimestamp>[] = markerStructures
      .map(m => {
        const t = m.candle_time ?? Math.floor(new Date(m.formed_at).getTime() / 1000);
        const isHigh = m.structure_type === "swing_high" || m.structure_type === "eqh";
        return {
          time:     t as UTCTimestamp,
          position: isHigh ? "aboveBar" as const : "belowBar" as const,
          color:    magnetColor(m),
          shape:    isHigh ? "arrowDown" as const : "arrowUp" as const,
          text:     structureLabel(m),
          size:     1,
        };
      })
      .sort((a, b) => (a.time as number) - (b.time as number));

    series.setMarkers(markers);
    requestAnimationFrame(refreshZones);
  }, [magnet_structures, activeCategories, lastClose, refreshZones]);

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

      {/* Structure category toggles */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-[#1E293B] shrink-0">
        {ALL_CATEGORIES.map((cat) => {
          const on = activeCategories.has(cat);
          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-2 py-0.5 text-[10px] rounded font-medium transition-all border ${
                on
                  ? "border-[#334155] bg-[#1E293B] text-[#CBD5E1]"
                  : "border-[#1E293B] text-[#374151] bg-transparent"
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          );
        })}
      </div>

      {/* Chart + DOM overlay */}
      <div className="flex-1 relative min-h-0">
        <div ref={containerRef} className="absolute inset-0" />

        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
          {/* FVG zone shading */}
          {zones.map((z, i) => (
            <div key={i} className="absolute left-0 right-0" style={{ top: z.topY, height: z.height }}>
              <div
                className="absolute inset-0"
                style={{
                  background:   z.color + "18",
                  borderTop:    `1px solid ${z.color}40`,
                  borderBottom: `1px solid ${z.color}40`,
                }}
              />
              {/* Label pill at vertical center of zone */}
              <div
                className="absolute right-0 flex items-center"
                style={{
                  top: z.height / 2 - 9,
                  background: z.color,
                  color: "white",
                  fontSize: 9,
                  fontWeight: 600,
                  padding: "1px 5px",
                  borderRadius: "2px 0 0 2px",
                  whiteSpace: "nowrap",
                  lineHeight: "16px",
                }}
              >
                {z.label}
              </div>
            </div>
          ))}

          {/* Session / weekly right-edge labels (no line) */}
          {labels.map((l, i) => (
            <div
              key={`lbl${i}`}
              className="absolute right-0 flex items-center"
              style={{
                top: l.y - 9,
                background: l.color,
                color: "white",
                fontSize: 9,
                fontWeight: 600,
                padding: "1px 5px",
                borderRadius: "2px 0 0 2px",
                whiteSpace: "nowrap",
                lineHeight: "16px",
              }}
            >
              {l.text}
            </div>
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
