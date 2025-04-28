import { ReactNode } from 'react';

interface DarkSectionCardProps {
  title: string;
  icon: ReactNode;
  iconColor?: string;
  children: ReactNode;
  className?: string;
}

/**
 * A reusable section card component with dark theme styling.
 * Used to create consistent dark-themed sections throughout the application.
 */
export function DarkSectionCard({ 
  title, 
  icon, 
  iconColor = '', 
  children, 
  className = '' 
}: DarkSectionCardProps) {
  return (
    <div className={`bg-[#232229] rounded-xl p-4 border border-gray-800 text-white ${className}`}>
      <h3 className={`text-sm font-medium mb-3 text-gray-300 flex items-center gap-2 ${iconColor}`}>
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}

export default DarkSectionCard; 