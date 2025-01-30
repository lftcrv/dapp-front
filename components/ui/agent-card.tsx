import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Agent } from '@/lib/types';
import { LucideIcon } from 'lucide-react';
import { useAgentTheme } from '@/lib/agent-theme-context';

interface AgentCardProps {
  agent: Agent;
  title: string;
  icon: LucideIcon;
  badge?: string;
  children: React.ReactNode;
  className?: string;
}

export function AgentCard({
  title,
  icon: Icon,
  badge,
  children,
  className,
}: Omit<AgentCardProps, 'agent'>) {
  const theme = useAgentTheme();

  return (
    <Card className={cn('p-6 border-2', theme.cardStyle, className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className={cn('h-4 w-4', theme.textStyle)} />
          <h3 className="font-medium">{title}</h3>
        </div>
        {badge && (
          <Badge variant="outline" className="font-mono">
            {badge}
          </Badge>
        )}
      </div>
      {children}
    </Card>
  );
}
