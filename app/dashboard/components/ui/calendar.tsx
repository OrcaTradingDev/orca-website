"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import type { CustomComponents } from "react-day-picker";
import { cn } from "./utils"; // keep your local util

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        button_previous:
          "absolute left-1 top-1 inline-flex h-7 w-7 items-center justify-center rounded-md border border-transparent bg-transparent p-0 text-muted-foreground hover:bg-accent hover:text-foreground",
        button_next:
          "absolute right-1 top-1 inline-flex h-7 w-7 items-center justify-center rounded-md border border-transparent bg-transparent p-0 text-muted-foreground hover:bg-accent hover:text-foreground",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell:
          "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      // 👇 Cast fixes TS complaining that 'IconLeft' | 'IconRight' are not in Partial<CustomComponents>
      components={
        {
          IconLeft: (iconProps) => (
            <ChevronLeft className="h-4 w-4" {...iconProps} />
          ),
          IconRight: (iconProps) => (
            <ChevronRight className="h-4 w-4" {...iconProps} />
          ),
        } as Partial<CustomComponents>
      }
      {...props}
    />
  );
}

