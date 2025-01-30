"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { THEME } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
}

export const GradientButton = forwardRef<
  HTMLButtonElement,
  GradientButtonProps
>(
  (
    { className, children, isLoading, loadingText = "Loading...", ...props },
    ref,
  ) => {
    const { from, to } = THEME.colors.primary.gradient;

    return (
      <Button
        ref={ref}
        className={cn(
          `bg-gradient-to-r from-[${from}] to-[${to}] text-white hover:opacity-90`,
          className,
        )}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? loadingText : children}
      </Button>
    );
  },
);

GradientButton.displayName = "GradientButton";
