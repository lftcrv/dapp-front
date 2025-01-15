'use client';

import { toast } from "sonner";

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const icons = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  warning: '⚠️',
};

export function showToast(
  type: ToastType,
  title: string,
  options?: ToastOptions
) {
  const baseStyle = {
    style: {
      minWidth: '356px',
      minHeight: '60px',
      backgroundColor: 'hsl(var(--background))',
      border: '1px solid hsl(var(--border))',
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      color: 'hsl(var(--foreground))',
    },
  };

  const toastFn = type === 'error' 
    ? toast.error 
    : type === 'success'
    ? toast.success
    : type === 'warning'
    ? toast.warning
    : toast.info;

  toastFn(
    <div className="flex items-center gap-3">
      <span className="text-2xl">{icons[type]}</span>
      <div className="flex flex-col gap-1">
        <span className="font-semibold text-base text-foreground">{title}</span>
        {options?.description && (
          <span className="text-sm text-foreground/80">{options.description}</span>
        )}
      </div>
    </div>,
    {
      ...baseStyle,
      action: options?.action && {
        label: options.action.label,
        onClick: options.action.onClick,
      },
    }
  );
} 