import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";

type TooltipContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement>;
};

const TooltipContext = React.createContext<TooltipContextValue | null>(null);

function useTooltip() {
  const ctx = React.useContext(TooltipContext);
  if (!ctx)
    throw new Error(
      "Tooltip compound components must be used within <Tooltip>"
    );
  return ctx;
}

function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function Tooltip({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLElement>(null!);
  return (
    <TooltipContext.Provider value={{ open, onOpenChange: setOpen, triggerRef }}>
      {children}
    </TooltipContext.Provider>
  );
}

function TooltipTrigger({
  children,
  asChild,
  ...props
}: React.HTMLAttributes<HTMLElement> & { asChild?: boolean }) {
  const { onOpenChange, triggerRef } = useTooltip();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ref: triggerRef,
      onMouseEnter: () => onOpenChange(true),
      onMouseLeave: () => onOpenChange(false),
      onFocus: () => onOpenChange(true),
      onBlur: () => onOpenChange(false),
      ...props,
    });
  }

  return (
    <span
      ref={triggerRef as React.RefObject<HTMLSpanElement>}
      onMouseEnter={() => onOpenChange(true)}
      onMouseLeave={() => onOpenChange(false)}
      onFocus={() => onOpenChange(true)}
      onBlur={() => onOpenChange(false)}
      {...props}
    >
      {children}
    </span>
  );
}

function TooltipContent({
  className,
  sideOffset = 4,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { sideOffset?: number }) {
  const { open, triggerRef } = useTooltip();
  const [pos, setPos] = React.useState({ top: 0, left: 0 });

  React.useEffect(() => {
    if (!open) return;
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      setPos({
        top: rect.top - sideOffset,
        left: rect.left + rect.width / 2,
      });
    }
  }, [open, sideOffset, triggerRef]);

  if (!open) return null;

  return createPortal(
    <div
      role="tooltip"
      className={cn(
        "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95",
        className
      )}
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        transform: "translate(-50%, -100%)",
      }}
      {...props}
    >
      {children}
    </div>,
    document.body
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
