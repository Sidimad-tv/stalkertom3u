import * as React from "react";
import { cn } from "../../lib/utils";

/**
 * Scrollable container with a thin overlay scrollbar that only appears on hover.
 * No persistent scrollbar gutter — content uses full width.
 */
function ScrollArea({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <div className="h-full w-full scroll-area-inner">
        {children}
      </div>
    </div>
  );
}

/**
 * Inline style tag for scroll area — injected once.
 * Uses CSS-only overlay scrollbar: hidden by default, thin track on hover.
 * Works cross-browser (WebKit + Firefox).
 */
const scrollStyles = `
.scroll-area-inner {
  overflow-y: overlay;
  overflow-x: hidden;
  /* Firefox: always reserve thin scrollbar space so content never shifts */
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}
/* Fallback for browsers that don't support overflow:overlay */
@supports not (overflow-y: overlay) {
  .scroll-area-inner {
    overflow-y: auto;
  }
}
.scroll-area-inner::-webkit-scrollbar {
  width: 6px;
  background: transparent;
}
.scroll-area-inner::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 3px;
  transition: background 0.2s ease;
}
.scroll-area-inner:hover {
  scrollbar-color: rgba(128,128,128,0.3) transparent;
}
.scroll-area-inner:hover::-webkit-scrollbar-thumb {
  background: rgba(128,128,128,0.3);
}
`;

let stylesInjected = false;
if (typeof document !== "undefined" && !stylesInjected) {
  const style = document.createElement("style");
  style.textContent = scrollStyles;
  document.head.appendChild(style);
  stylesInjected = true;
}

export { ScrollArea };
