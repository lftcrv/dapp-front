import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ButtonSelectorProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/**
 * A reusable button selector component for toggling between options.
 * Used for time ranges, view modes, and other option selections.
 */
export function ButtonSelector<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: ButtonSelectorProps<T>) {
  return (
    <div className={`flex bg-[#232229] rounded-lg p-1 border border-gray-800 ${className}`}>
      {options.map((option) => (
        <Button
          key={option}
          size="sm"
          variant={value === option ? 'default' : 'ghost'}
          className={cn(
            'text-xs h-7 px-3',
            value === option
              ? 'bg-orange-500 text-white hover:bg-orange-600'
              : 'text-gray-400 hover:text-white hover:bg-gray-800',
          )}
          onClick={() => onChange(option)}
        >
          {option}
        </Button>
      ))}
    </div>
  );
}

export default ButtonSelector; 