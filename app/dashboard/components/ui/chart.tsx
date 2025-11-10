"use client";

import * as React from "react";
import type { CSSProperties, ReactNode } from "react";
import { Tooltip as RechartsTooltip } from "recharts";
import { cn } from "./utils";

/* ----------------------------- Light typings ------------------------------ */

type TooltipLike = {
  active?: boolean;
  payload?: any[];
  label?: any;
};

export type ChartIndicator = "dot" | "line" | "dashed";

export type ChartConfig = Record<
  string,
  {
    label?: string;
    color?: string;
  }
>;

export type ChartContainerProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  config?: ChartConfig;
};

export type ChartTooltipContentProps = Partial<TooltipLike> & {
  className?: string;
  indicator?: ChartIndicator;
  hideLabel?: boolean;
};

/* ----------------------------- Config context ----------------------------- */

const ChartConfigCtx = React.createContext<ChartConfig | undefined>(undefined);
const useChartConfig = () => React.useContext(ChartConfigCtx);

/* -------------------------------- Container ------------------------------- */

export function ChartContainer({
  children,
  className,
  style,
  config,
}: ChartContainerProps) {
  const cssVars: CSSProperties = { ...style };
  if (config) {
    for (const [key, value] of Object.entries(config)) {
      if (typeof value?.color === "string") {
        (cssVars as any)[`--color-${key}`] = value.color;
      }
    }
  }

  return (
    <ChartConfigCtx.Provider value={config}>
      <div className={cn("w-full overflow-hidden", className)} style={cssVars}>
        {children}
      </div>
    </ChartConfigCtx.Provider>
  );
}

/* -------------------------------- Tooltip -------------------------------- */

type AnyTooltipProps = Record<string, any>;

export function ChartTooltip(
  props: Omit<AnyTooltipProps, "content"> & {
    content?: AnyTooltipProps["content"];
  },
) {
  const content =
    props.content ?? ((p: TooltipLike) => <ChartTooltipContent {...p} />);

  return (
    <RechartsTooltip
      {...props}
      wrapperStyle={{ outline: "none" }}
      cursor={{ fill: "hsl(var(--muted, 210 20% 95%))", opacity: 0.35 }}
      content={content}
    />
  );
}

/* ---------------------------- Tooltip Content ----------------------------- */

export function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  indicator = "dot",
  hideLabel = false,
}: ChartTooltipContentProps) {
  const config = useChartConfig();

  if (!active || !payload || payload.length === 0) return null;

  const items = payload as Array<{
    color?: unknown;
    name?: unknown;
    value?: unknown;
    dataKey?: string | number;
  }>;

  return (
    <div
      className={cn(
        "min-w-[8rem] rounded-md border bg-popover p-2 text-popover-foreground shadow-md",
        className,
      )}
    >
      {!hideLabel && (
        <div className="mb-1 text-xs text-muted-foreground">
          {label != null ? String(label) : ""}
        </div>
      )}

      <div className="space-y-1">
        {items.map((it, idx) => {
          const dk = it.dataKey;
          const human =
            (typeof dk === "string" && config?.[dk]?.label) ??
            (typeof it.name === "string" ? it.name : undefined) ??
            (typeof dk === "string" ? dk : `Series ${idx + 1}`);

          // Force the color to be string|undefined only (avoid boolean/false creeping in)
          const cfgColor =
            typeof dk === "string" && typeof config?.[dk]?.color === "string"
              ? (config![dk]!.color as string)
              : undefined;
          const itemColor = typeof it.color === "string" ? it.color : undefined;
          const colorStr: string | undefined = cfgColor ?? itemColor;

          // Computed styles that never return `false`
          const background: string | undefined =
            indicator !== "dashed" ? colorStr ?? "currentColor" : undefined;

          const borderTop: string | undefined =
            indicator === "dashed"
              ? `1px dashed ${colorStr ?? "currentColor"}`
              : undefined;

          return (
            <div key={idx} className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex h-2 w-2 shrink-0 rounded-full",
                  indicator === "line" && "h-0.5 w-3 rounded-none",
                  indicator === "dashed" && "h-0.5 w-3 rounded-none",
                )}
                style={{
                  background, // string | undefined (never false)
                  borderTop, // string | undefined
                }}
              />
              <span className="text-xs font-medium">{human}</span>
              <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                {it.value != null ? String(it.value) : ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------ Legend (stub) ----------------------------- */

export function ChartLegendContent() {
  return null;
}

