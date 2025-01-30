import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const loadingVariants = cva('relative flex items-center justify-center', {
  variants: {
    variant: {
      default: '',
      leftcurve: 'text-violet-500',
      rightcurve: 'text-yellow-500',
    },
    size: {
      sm: 'w-8 h-8 text-lg',
      md: 'w-12 h-12 text-xl',
      lg: 'w-16 h-16 text-2xl',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

interface LoadingProps extends VariantProps<typeof loadingVariants> {
  className?: string;
}

export function Loading({ variant, size, className }: LoadingProps) {
  const emoji =
    variant === 'leftcurve' ? '🦧' : variant === 'rightcurve' ? '🐙' : '😭';

  return (
    <div className={cn(loadingVariants({ variant, size }), className)}>
      {/* Curved path animation */}
      <div
        className={cn(
          'absolute w-full h-full rounded-full border-2 border-dashed animate-[spin_3s_linear_infinite]',
          variant === 'leftcurve'
            ? 'border-violet-500/50'
            : variant === 'rightcurve'
              ? 'border-yellow-500/50'
              : 'border-primary/50',
        )}
      />

      {/* Inner circle pulse */}
      <div
        className={cn(
          'absolute w-3/4 h-3/4 rounded-full animate-[ping_1s_cubic-bezier(0,0,0.2,1)_infinite]',
          variant === 'leftcurve'
            ? 'bg-violet-500/20'
            : variant === 'rightcurve'
              ? 'bg-yellow-500/20'
              : 'bg-primary/20',
        )}
      />

      {/* Bouncing emoji */}
      <div className="animate-[bounce_1s_infinite]">{emoji}</div>
    </div>
  );
}
