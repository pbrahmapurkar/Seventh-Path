import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "input file:text-foreground placeholder:text-muted-foreground selection:bg-sage selection:text-on-sage flex w-full min-w-0 text-base transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:outline-2 focus-visible:outline-sage focus-visible:outline-offset-2",
        "aria-invalid:border-gentle-warning aria-invalid:ring-gentle-warning/20",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
