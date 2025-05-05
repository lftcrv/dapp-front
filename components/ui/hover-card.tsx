"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface HoverCardProps {
  children: React.ReactNode;
  className?: string;
}

const HoverCard: React.FC<HoverCardProps> = ({ 
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn("relative inline-block", className)} {...props}>
      {children}
    </div>
  );
};

interface HoverCardTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

const HoverCardTrigger: React.FC<HoverCardTriggerProps> = ({ 
  children,
  asChild = false,
  className,
  ...props
}) => {
  const Comp = asChild ? React.cloneElement(children as React.ReactElement, {
    className: cn("inline-block", (children as React.ReactElement).props.className),
    ...props
  }) : (
    <div className={cn("inline-block", className)} {...props}>
      {children}
    </div>
  );
  
  return Comp;
};

interface HoverCardContentProps {
  children: React.ReactNode;
  className?: string;
}

const HoverCardContent: React.FC<HoverCardContentProps> = ({ 
  children,
  className,
  ...props
}) => {
  return (
    <div 
      className={cn(
        "hidden group-hover:block absolute z-50 top-full left-0 mt-2 w-64 rounded-md border border-neutral-200 bg-white p-4 text-neutral-950 shadow-md",
        "dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};

export { HoverCard, HoverCardTrigger, HoverCardContent } 