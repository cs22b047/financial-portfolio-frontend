import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AssetAllocation } from '@/types/portfolio';

interface AllocationChartProps {
  data: AssetAllocation[];
}

const COLORS = {
  STOCK: 'hsl(0, 0%, 9%)',
  ETF: 'hsl(0, 0%, 20%)',
  BOND: 'hsl(120, 100%, 25%)',
  CASH: 'hsl(38, 92%, 50%)',
  CRYPTO: 'hsl(0, 0%, 30%)',
  MUTUAL_FUND: 'hsl(0, 0%, 40%)',
};

const TYPE_LABELS = {
  STOCK: 'Stocks',
  ETF: 'ETFs',
  BOND: 'Bonds',
  CASH: 'Cash',
  CRYPTO: 'Crypto',
  MUTUAL_FUND: 'Mutual Funds',
};

export function AllocationChart({ data }: AllocationChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-lg bg-popover border border-border px-4 py-3 shadow-xl">
          <p className="text-sm font-semibold text-foreground">
            {TYPE_LABELS[item.type as keyof typeof TYPE_LABELS]}
          </p>
          <p className="text-xs text-muted-foreground">
            ${item.value.toLocaleString()} ({item.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-6 border border-border/50 hover-lift">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">Asset Allocation</h3>
        <p className="text-sm text-muted-foreground">By asset type</p>
      </div>
      <div className="flex items-center gap-6">
        <div className="h-[200px] w-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry) => (
                  <Cell 
                    key={`cell-${entry.type}`} 
                    fill={COLORS[entry.type]} 
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-3">
          {data.map((item) => (
            <div key={item.type} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="h-3 w-3 rounded-full" 
                  style={{ backgroundColor: COLORS[item.type] }}
                />
                <span className="text-sm text-muted-foreground">
                  {TYPE_LABELS[item.type as keyof typeof TYPE_LABELS]}
                </span>
              </div>
              <span className="text-sm font-medium text-foreground">
                {item.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
