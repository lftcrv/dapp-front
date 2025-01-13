import { toast } from 'sonner'
import * as React from 'react'
import { Rocket, Skull, Waves } from 'lucide-react'

// Base toast styles that are consistent across all toasts
const baseToastStyle = {
  fontFamily: "monospace",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  duration: 4000,
  padding: "12px 16px",
  minWidth: "320px",
  maxWidth: "380px",
  minHeight: "64px",
  display: "flex",
  alignItems: "center",
  backgroundColor: "rgba(0, 0, 0, 0.75)",
} as const

// Theme-specific gradients and colors
export const toastThemes = {
  leftcurve: {
    background: "linear-gradient(to right, rgba(234, 179, 8, 0.25), rgba(234, 179, 8, 0.15))",
    border: "1px solid rgba(234, 179, 8, 0.35)",
    color: "#fde047",
    boxShadow: "0 4px 12px rgba(234, 179, 8, 0.25)"
  },
  rightcurve: {
    background: "linear-gradient(to right, rgba(168, 85, 247, 0.25), rgba(168, 85, 247, 0.15))",
    border: "1px solid rgba(168, 85, 247, 0.35)",
    color: "#d8b4fe",
    boxShadow: "0 4px 12px rgba(168, 85, 247, 0.25)"
  },
  error: {
    background: "linear-gradient(to right, rgba(239, 68, 68, 0.25), rgba(239, 68, 68, 0.15))",
    border: "1px solid rgba(239, 68, 68, 0.35)",
    color: "#fecaca",
    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.25)"
  }
} as const

// Helper function to create toast content with icon
const createToastContent = (title: string, description: string, Icon: React.ComponentType<any>): React.ReactNode => {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 flex-shrink-0" />
      <div className="flex flex-col gap-1.5 py-0.5">
        <span className="font-bold tracking-tight text-sm">{title}</span>
        <span className="text-[11px] opacity-95 font-mono leading-tight">{description}</span>
      </div>
    </div>
  )
}

// Toast functions with consistent styling
export const showToast = {
  leftcurve: (title: string, description: string) => 
    toast.success(createToastContent(title, description, Rocket), {
      style: { ...baseToastStyle, ...toastThemes.leftcurve },
      className: "font-mono rounded-md"
    }),
    
  rightcurve: (title: string, description: string) => 
    toast(createToastContent(title, description, Waves), {
      style: { ...baseToastStyle, ...toastThemes.rightcurve },
      className: "font-mono rounded-md"
    }),
    
  error: (title: string, description: string) => 
    toast.error(createToastContent(title, description, Skull), {
      style: { ...baseToastStyle, ...toastThemes.error },
      className: "font-mono rounded-md"
    })
} 