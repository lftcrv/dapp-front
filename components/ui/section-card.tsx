import { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  icon: ReactNode;
  iconColor?: string;
  children: ReactNode;
  className?: string; // Adding optional className for additional customization
}

/**
 * A reusable section card component with a title and icon.
 * Used to create consistent section containers throughout the application.
 */
export function SectionCard({ 
  title, 
  icon, 
  iconColor = '', 
  children, 
  className = ''
}: SectionCardProps) {
  return (
    <div className={`bg-[#F6ECE7] rounded-xl p-6 shadow-sm ${className}`}>
      <h2 className="font-sketch text-2xl mb-4 flex items-center justify-center text-gray-800">
        <span className="mr-2">{title}</span>
        <span className={`${iconColor}`}>{icon}</span>
      </h2>
      {children}
    </div>
  );
}

export default SectionCard; 