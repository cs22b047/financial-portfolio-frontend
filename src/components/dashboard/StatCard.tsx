import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon, 
  iconColor,
  className 
}: StatCardProps) {
  return (
    <div className={cn(
      'relative overflow-hidden rounded-xl bg-card p-4 border border-border/50 transition-all duration-300 hover:border-border card-hover',
      className
    )}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-2/5 opacity-50" />
      
      <div className="relative flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <div className="space-y-1">
            <p className="text-xl font-bold text-card-foreground tracking-tight">{value}</p>
            {change && (
              <p className={cn(
                'text-xs font-semibold',
                changeType === 'positive' && 'text-success',
                changeType === 'negative' && 'text-destructive',
                changeType === 'neutral' && 'text-muted-foreground'
              )}>
                {changeType === 'positive' && '+'}
                {change}
              </p>
            )}
          </div>
        </div>
        
        <div className={cn(
          'flex h-10 w-10 items-center justify-center rounded-xl backdrop-blur-sm',
          iconColor || 'bg-primary/10 border border-primary/20'
        )}>
          <Icon className={cn(
            'h-5 w-5 transition-transform duration-300 group-hover:scale-110',
            iconColor ? 'text-foreground' : 'text-primary'
          )} />
        </div>
      </div>
    </div>
  );
}
