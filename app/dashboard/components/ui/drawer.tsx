"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X as XIcon } from "lucide-react";
import { cn } from "./utils";

/**
 * Drawer implemented on top of Radix Dialog so we don't need the `vaul` package.
 * Exports the same surface API commonly used in shadcn projects:
 *   <Drawer> <DrawerTrigger/> <DrawerContent> ... </DrawerContent> </Drawer>
 *   plus Header/Title/Description/Footer/Close helpers.
 */

export const Drawer = DialogPrimitive.Root;
export const DrawerTrigger = DialogPrimitive.Trigger;
export const DrawerClose = DialogPrimitive.Close;

export function DrawerPortal({ children }: { children: React.ReactNode }) {
  return <DialogPrimitive.Portal>{children}</DialogPrimitive.Portal>;
}

export const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out " +
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DrawerOverlay.displayName = "DrawerOverlay";

type DrawerContentProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> & {
  /** Side the panel should appear from. Defaults to "right". */
  side?: "right" | "left" | "bottom" | "top";
};

export const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DrawerContentProps
>(({ className, side = "right", children, ...props }, ref) => {
  // translate animation helpers for each side
  const sideClass =
    side === "right"
      ? "right-0 top-0 h-full w-80 translate-x-full data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right"
      : side === "left"
        ? "left-0 top-0 h-full w-80 -translate-x-full data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left"
        : side === "bottom"
          ? "bottom-0 left-0 w-full translate-y-full data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom"
          : "top-0 left-0 w-full -translate-y-full data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top";

  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed z-50 bg-background shadow-lg outline-none",
          "border",
          sideClass,
          className,
        )}
        {...props}
      >
        {/* close button */}
        <DrawerClose
          className={cn(
            "absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md",
            "text-muted-foreground transition hover:bg-muted",
          )}
          aria-label="Close"
        >
          <XIcon className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DrawerClose>

        {children}
      </DialogPrimitive.Content>
    </DrawerPortal>
  );
});
DrawerContent.displayName = "DrawerContent";

/* ---------- Convenience layout pieces to match common usage patterns ------- */

export function DrawerHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("grid gap-1.5 p-4", className)} {...props} />
  );
}

export function DrawerFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-2 border-t p-4",
        className,
      )}
      {...props}
    />
  );
}

export const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-base font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DrawerTitle.displayName = "DrawerTitle";

export const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DrawerDescription.displayName = "DrawerDescription";

