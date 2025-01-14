import { toast } from 'sonner'

// Base toast styles that are consistent across all toasts
const baseToastStyle = {
  fontFamily: "monospace",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  duration: 4000,
}

// Theme-specific gradients and colors
export const toastThemes = {
  leftcurve: {
    background: "linear-gradient(to right, rgba(234, 179, 8, 0.1), rgba(234, 179, 8, 0.05))",
    border: "1px solid rgba(234, 179, 8, 0.15)",
    color: "#eab308",
    boxShadow: "0 4px 12px rgba(234, 179, 8, 0.15)"
  },
  rightcurve: {
    background: "linear-gradient(to right, rgba(168, 85, 247, 0.1), rgba(168, 85, 247, 0.05))",
    border: "1px solid rgba(168, 85, 247, 0.15)",
    color: "#a855f7",
    boxShadow: "0 4px 12px rgba(168, 85, 247, 0.15)"
  },
  error: {
    background: "linear-gradient(to right, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))",
    border: "1px solid rgba(239, 68, 68, 0.15)",
    color: "#ef4444",
    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.15)"
  }
}

// Helper function to create toast content
const createToastContent = (title: string, description: string) => (
  <div className="flex flex-col gap-1">
    <span className="font-bold tracking-tight">{title}</span>
    <span className="text-xs opacity-90 font-mono">{description}</span>
  </div>
)

// Toast functions with consistent styling
export const showToast = {
  leftcurve: (title: string, description: string) => 
    toast.success(createToastContent(title, description), {
      style: { ...baseToastStyle, ...toastThemes.leftcurve },
      className: "font-mono"
    }),
    
  rightcurve: (title: string, description: string) => 
    toast(createToastContent(title, description), {
      style: { ...baseToastStyle, ...toastThemes.rightcurve },
      className: "font-mono"
    }),
    
  error: (title: string, description: string) => 
    toast.error(createToastContent(title, description), {
      style: { ...baseToastStyle, ...toastThemes.error },
      className: "font-mono"
    })
} 