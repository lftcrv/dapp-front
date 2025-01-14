import { toast } from 'sonner'
import { ReactNode } from 'react'

const baseStyle = {
  background: "rgb(255, 255, 255)",
  color: "rgb(23, 23, 23)",
  border: "1px solid rgb(238, 238, 238)",
  borderRadius: "12px",
  padding: "12px",
  boxShadow: "rgba(0, 0, 0, 0.02) 0px 0px 0px 1px",
  fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif",
  fontSize: "14px",
  lineHeight: "1.5",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
}

type ToastOptions = Parameters<typeof toast>[1] & {
  description?: ReactNode
}

const ToastContent = ({ icon, title, description }: { icon: string; title: string; description: ReactNode }) => (
  <div className="flex items-start gap-3">
    <div className="text-xl flex-shrink-0">{icon}</div>
    <div className="flex-1 min-w-0">
      <div className="font-bold tracking-tight">{title}</div>
      <div className="text-sm text-gray-600">{description}</div>
    </div>
  </div>
)

export const showToast = {
  leftcurve: (title: string, description: ReactNode) => {
    toast(
      <ToastContent 
        icon="🚀" 
        title={title} 
        description={description}
      />,
      {
        style: baseStyle,
        className: "font-sans",
        duration: 5000,
      } as ToastOptions
    )
  },
  rightcurve: (title: string, description: ReactNode) => {
    toast(
      <ToastContent 
        icon="😴" 
        title={title} 
        description={description}
      />,
      {
        style: baseStyle,
        className: "font-sans",
        duration: 5000,
      } as ToastOptions
    )
  },
  error: (title: string, description: ReactNode) => {
    toast.error(
      <ToastContent 
        icon="💀" 
        title={title} 
        description={description}
      />,
      {
        style: {
          ...baseStyle,
          border: "1px solid rgb(254, 226, 226)",
          background: "rgb(254, 242, 242)",
        },
        className: "font-sans",
        duration: 5000,
      } as ToastOptions
    )
  }
} 