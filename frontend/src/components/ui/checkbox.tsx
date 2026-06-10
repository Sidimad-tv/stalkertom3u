import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "../../lib/utils";

function Checkbox({
  className,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  id,
  ...props
}: Omit<React.HTMLAttributes<HTMLButtonElement>, "onChange"> & {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
}) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultChecked ?? false);
  const isChecked = checked ?? uncontrolled;
  const handleChange = onCheckedChange ?? setUncontrolled;

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={isChecked}
      id={id}
      disabled={disabled}
      onClick={() => handleChange(!isChecked)}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        isChecked && "bg-primary text-primary-foreground",
        className
      )}
      {...props}
    >
      {isChecked && (
        <Check className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

export { Checkbox };
