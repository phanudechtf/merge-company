"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary" | "success";
  size?: "default" | "sm" | "lg" | "icon";
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default: "bg-[#111111] text-white hover:bg-[#2a2a2a] shadow-sm",
  outline: "border border-[#e9e5df] bg-white text-[#111111] hover:bg-[#f6f7f9]",
  ghost: "text-[#111111] hover:bg-[#eceef1]",
  destructive: "bg-[#EF4444] text-white hover:bg-[#dc2626] shadow-sm",
  secondary: "bg-[#eceef1] text-[#111111] hover:bg-[#dde0e4]",
  success: "bg-[#22C55E] text-white hover:bg-[#16a34a] shadow-sm",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  default: "h-9 px-4 text-sm",
  sm: "h-7 px-3 text-xs",
  lg: "h-11 px-8 text-base",
  icon: "h-9 w-9",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[10px] font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b9097] focus-visible:ring-offset-1",
        "disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button };
