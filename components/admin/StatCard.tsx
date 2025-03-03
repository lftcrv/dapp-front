import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface StatCardProps {
  title: string;
  value?: number | string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

// Helper function to format numbers with commas
const formatNumber = (value: number | string | undefined): string => {
  if (value === undefined || value === null) {
    return '0';
  }
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  return value.toString();
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  className,
}) => {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatNumber(value)}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard; 