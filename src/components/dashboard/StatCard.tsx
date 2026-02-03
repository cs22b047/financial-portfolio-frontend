import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
  trend?: number[];
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon, 
  iconColor,
  trend,
  className 
}: StatCardProps) {
  const trendData = trend?.map((value, index) => ({ value, index })) || [];

  return (
    <div className={cn(
      'relative overflow-hidden rounded-2xl bg-card p-6 border border-border/50 transition-all duration-300 hover:border-border card-hover',
      className
    )}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-2/5 opacity-50" />
      
      <div className="relative flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-card-foreground tracking-tight">{value}</p>
            {change && (
              <div className="flex items-center gap-2">
                <p className={cn(
                  'text-sm font-semibold',
                  changeType === 'positive' && 'text-success',
                  changeType === 'negative' && 'text-destructive',
                  changeType === 'neutral' && 'text-muted-foreground'
                )}>
                  {changeType === 'positive' && '+'}
                  {change}
                </p>
                {trend && (
                  <div className="h-6 w-16">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={
                            changeType === 'positive' ? 'hsl(var(--success))' :
                            changeType === 'negative' ? 'hsl(var(--destructive))' :
                            'hsl(var(--muted-foreground))'
                          }
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className={cn(
          'flex h-14 w-14 items-center justify-center rounded-2xl backdrop-blur-sm',
          iconColor || 'bg-primary/10 border border-primary/20'
        )}>
          <Icon className={cn(
            'h-7 w-7 transition-transform duration-300 group-hover:scale-110',
            iconColor ? 'text-foreground' : 'text-primary'
          )} />
        </div>
      </div>

      {/* Trend visualization */}
      {trend && (
        <div className="mt-4 h-12">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                strokeOpacity={0.6}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
