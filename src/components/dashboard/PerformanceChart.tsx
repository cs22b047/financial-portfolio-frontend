import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine, BarChart, Bar, Cell } from 'recharts';
import { PerformanceDataPoint } from '@/types/portfolio';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, Activity, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface AssetTypeGainLoss {
  type: string;
  gainLoss: number;
  percentage: number;
  count: number;
}

interface PerformanceChartProps {
  data: PerformanceDataPoint[];
  assetTypeGainLoss?: AssetTypeGainLoss[];
}

const timeRanges = ['1D', '1W', '1M', '3M', '6M', '1Y', 'ALL'];

const assetTypeColors: Record<string, string> = {
  STOCK: 'hsl(var(--primary))',
  BOND: 'hsl(var(--success))',
  CRYPTO: 'hsl(0 0% 20%)',
  ETF: 'hsl(0 0% 30%)',
  MUTUAL_FUND: 'hsl(0 0% 40%)',
  COMMODITY: 'hsl(0 0% 50%)',
};

export function PerformanceChart({ data, assetTypeGainLoss = [] }: PerformanceChartProps) {
  const [selectedRange, setSelectedRange] = useState('6M');
  const [showVolume, setShowVolume] = useState(false);
  const [chartView, setChartView] = useState<'performance' | 'gainloss'>('performance');

  const formattedData = data.map(item => ({
    ...item,
    displayDate: format(new Date(item.date), 'MMM d'),
    volume: Math.random() * 1000000 + 500000, // Mock volume data
  }));

  const currentValue = formattedData[formattedData.length - 1]?.value || 0;
  const previousValue = formattedData[formattedData.length - 2]?.value || 0;
  const change = currentValue - previousValue;
  const changePercent = (change / previousValue) * 100;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      if (chartView === 'gainloss') {
        return (
          <div className="glass-card p-4 border border-border/50 shadow-xl">
            <p className="text-xs text-muted-foreground mb-2">{data.type}</p>
            <div className="space-y-1">
              <p className={cn(
                'text-sm font-semibold',
                data.gainLoss >= 0 ? 'text-success' : 'text-destructive'
              )}>
                {data.gainLoss >= 0 ? '+' : ''}${data.gainLoss.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {data.count} asset{data.count !== 1 ? 's' : ''}
              </p>
              <p className={cn(
                'text-xs font-medium',
                data.percentage >= 0 ? 'text-success' : 'text-destructive'
              )}>
                {data.percentage >= 0 ? '+' : ''}{data.percentage.toFixed(2)}%
              </p>
            </div>
          </div>
        );
      }
      
      return (
        <div className="glass-card p-4 border border-border/50 shadow-xl">
          <p className="text-xs text-muted-foreground mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              Portfolio Value: ${payload[0].value.toLocaleString()}
            </p>
            <p className={cn(
              'text-xs font-medium',
              data.gain_loss >= 0 ? 'text-success' : 'text-destructive'
            )}>
              {data.gain_loss >= 0 ? '+' : ''}${data.gain_loss.toLocaleString()} 
              ({((data.gain_loss / (payload[0].value - data.gain_loss)) * 100).toFixed(2)}%)
            </p>
            {showVolume && (
              <p className="text-xs text-muted-foreground">
                Volume: ${(data.volume / 1000000).toFixed(1)}M
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-6 border border-border/50 hover-lift">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold text-card-foreground flex items-center gap-2">
              {chartView === 'performance' ? (
                <Activity className="h-5 w-5 text-primary" />
              ) : (
                <BarChart3 className="h-5 w-5 text-primary" />
              )}
              {chartView === 'performance' ? 'Portfolio Performance' : 'Gain/Loss by Asset Type'}
            </h3>
            {chartView === 'performance' && (
              <Badge variant="outline" className={cn(
                'text-xs',
                change >= 0 ? 'bg-success/10 text-success border-success/30' : 'bg-destructive/10 text-destructive border-destructive/30'
              )}>
                <div className="flex items-center gap-1">
                  {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {change >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
                </div>
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {chartView === 'performance' ? 'Real-time portfolio tracking' : 'Performance breakdown by asset type'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Navigation arrows */}
          <div className="flex items-center gap-1 rounded-lg bg-secondary/50 p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setChartView(chartView === 'performance' ? 'gainloss' : 'performance')}
              className="h-7 w-7 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setChartView(chartView === 'performance' ? 'gainloss' : 'performance')}
              className="h-7 w-7 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {chartView === 'performance' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowVolume(!showVolume)}
                className={cn(
                  'text-xs',
                  showVolume ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                )}
              >
                Volume
              </Button>
              <div className="flex gap-1 rounded-lg bg-secondary/50 p-1">
                {timeRanges.map((range) => (
                  <Button
                    key={range}
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRange(range)}
                    className={cn(
                      'h-7 px-3 text-xs transition-all duration-200',
                      selectedRange === range
                        ? 'bg-primary text-primary-foreground hover:bg-primary shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    )}
                  >
                    {range}
                  </Button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[350px] relative">
        {chartView === 'performance' ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <defs>
                <linearGradient id="performanceGradientAdvanced" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                strokeOpacity={0.3}
                vertical={false} 
              />
              
              <XAxis
                dataKey="displayDate"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                dy={10}
              />
              
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                dx={-10}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              {/* Reference line for break-even */}
              <ReferenceLine 
                y={95250} 
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="5 5" 
                strokeOpacity={0.5}
              />
              
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                fill="url(#performanceGradientAdvanced)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={assetTypeGainLoss} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                strokeOpacity={0.3}
                vertical={false} 
              />
              
              <XAxis
                dataKey="type"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                dy={10}
              />
              
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                dx={-10}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              <ReferenceLine 
                y={0} 
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="5 5" 
                strokeOpacity={0.5}
              />
              
              <Bar dataKey="gainLoss" radius={[8, 8, 0, 0]}>
                {assetTypeGainLoss.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.gainLoss >= 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} 
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
        
        {/* Floating stats */}
        {chartView === 'performance' && (
          <div className="absolute top-4 right-4 glass rounded-lg p-3 space-y-1">
            <div className="text-xs text-muted-foreground">Current Value</div>
            <div className="text-lg font-bold text-foreground">${currentValue.toLocaleString()}</div>
            <div className={cn(
              'text-xs font-medium',
              change >= 0 ? 'text-success' : 'text-destructive'
            )}>
              {change >= 0 ? '+' : ''}${change.toLocaleString()}
            </div>
          </div>
        )}
        
        {chartView === 'gainloss' && assetTypeGainLoss.length > 0 && (
          <div className="absolute top-4 right-4 glass rounded-lg p-3 space-y-1">
            <div className="text-xs text-muted-foreground">Total Gain/Loss</div>
            <div className={cn(
              'text-lg font-bold',
              assetTypeGainLoss.reduce((sum, item) => sum + item.gainLoss, 0) >= 0 ? 'text-success' : 'text-destructive'
            )}>
              {assetTypeGainLoss.reduce((sum, item) => sum + item.gainLoss, 0) >= 0 ? '+' : ''}$
              {assetTypeGainLoss.reduce((sum, item) => sum + item.gainLoss, 0).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}