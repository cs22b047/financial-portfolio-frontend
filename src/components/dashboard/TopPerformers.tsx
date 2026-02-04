import { TopPerformer } from '@/types/portfolio';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TopPerformersProps {
  data: TopPerformer[];
}

const TYPE_COLORS = {
  STOCK: 'bg-red-500/20 text-red-600',
  BOND: 'bg-success/20 text-success',
  CASH: 'bg-warning/20 text-warning',
  CRYPTO: 'bg-red-400/20 text-red-500',
};

export function TopPerformers({ data }: TopPerformersProps) {
  return (
    <div className="glass-card p-6 border border-border/50 hover-lift">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">Top Performers</h3>
        <p className="text-sm text-muted-foreground">Best performing assets</p>
      </div>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={item.symbol} className="flex items-center gap-4">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{item.symbol}</span>
                <span className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-medium uppercase',
                  TYPE_COLORS[item.asset_type]
                )}>
                  {item.asset_type}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{item.name}</p>
            </div>
            <div className="text-right">
              <div className={cn(
                'flex items-center gap-1 font-semibold',
                item.gain_loss_percent >= 0 ? 'text-success' : 'text-destructive'
              )}>
                {item.gain_loss_percent >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {item.gain_loss_percent >= 0 ? '+' : ''}{item.gain_loss_percent.toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground">
                ${item.gain_loss.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
