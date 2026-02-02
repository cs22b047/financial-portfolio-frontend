import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { performanceHistory, assetAllocation, mockAssets, assetTypes } from '@/data/mockData';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, Target, Calendar } from 'lucide-react';

const timeRanges = ['1W', '1M', '3M', '6M', '1Y', 'ALL'];

export default function Performance() {
  const [selectedRange, setSelectedRange] = useState('6M');

  // Calculate performance metrics
  const totalValue = mockAssets.reduce((sum, a) => sum + (a.total_value || 0), 0);
  const totalInvested = mockAssets.reduce((sum, a) => sum + (a.purchase_price * a.quantity), 0);
  const totalGainLoss = totalValue - totalInvested;
  const totalGainLossPercent = (totalGainLoss / totalInvested) * 100;

  // Calculate by asset type
  const performanceByType = assetTypes.map(type => {
    const assets = mockAssets.filter(a => a.asset_type_id === type.id);
    const value = assets.reduce((sum, a) => sum + (a.total_value || 0), 0);
    const invested = assets.reduce((sum, a) => sum + (a.purchase_price * a.quantity), 0);
    const gainLoss = value - invested;
    const gainLossPercent = invested > 0 ? (gainLoss / invested) * 100 : 0;

    return {
      name: type.name,
      code: type.code,
      value,
      invested,
      gainLoss,
      gainLossPercent,
    };
  });

  const formattedChartData = performanceHistory.map(item => ({
    ...item,
    displayDate: format(new Date(item.date), 'MMM d'),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg bg-popover border border-border px-4 py-3 shadow-xl">
          <p className="text-xs text-muted-foreground mb-1">{label}</p>
          <p className="text-sm font-semibold text-foreground">
            ${payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  const BarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg bg-popover border border-border px-4 py-3 shadow-xl">
          <p className="text-sm font-semibold text-foreground mb-1">{label}</p>
          <p className="text-xs text-muted-foreground">
            Return: <span className={payload[0].value >= 0 ? 'text-success' : 'text-destructive'}>
              {payload[0].value >= 0 ? '+' : ''}{payload[0].value.toFixed(2)}%
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Performance Analysis</h1>
          <p className="text-muted-foreground">Detailed breakdown of your portfolio performance</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-card p-5 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Return</p>
                <p className={cn(
                  'text-lg font-bold',
                  totalGainLoss >= 0 ? 'text-success' : 'text-destructive'
                )}>
                  {totalGainLoss >= 0 ? '+' : ''}${totalGainLoss.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-card p-5 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                {totalGainLossPercent >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-success" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-destructive" />
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Return %</p>
                <p className={cn(
                  'text-lg font-bold',
                  totalGainLossPercent >= 0 ? 'text-success' : 'text-destructive'
                )}>
                  {totalGainLossPercent >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-card p-5 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
                <Calendar className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Best Month</p>
                <p className="text-lg font-bold text-foreground">Dec 2023</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-card p-5 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
                <TrendingUp className="h-5 w-5 text-chart-3" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Best Performer</p>
                <p className="text-lg font-bold text-foreground">NVDA +118.84%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="rounded-xl bg-card p-6 border border-border/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">Portfolio Value Over Time</h3>
              <p className="text-sm text-muted-foreground">Track your portfolio growth</p>
            </div>
            <div className="flex gap-1 rounded-lg bg-secondary p-1">
              {timeRanges.map((range) => (
                <Button
                  key={range}
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRange(range)}
                  className={cn(
                    'h-7 px-3 text-xs',
                    selectedRange === range
                      ? 'bg-primary text-primary-foreground hover:bg-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedChartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="performanceGradientFull" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 22%)" vertical={false} />
                <XAxis
                  dataKey="displayDate"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 12 }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(160, 84%, 39%)"
                  strokeWidth={2}
                  fill="url(#performanceGradientFull)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance by Asset Type */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl bg-card p-6 border border-border/50">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-card-foreground">Return by Asset Type</h3>
              <p className="text-sm text-muted-foreground">Performance comparison</p>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={performanceByType}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 22%)" horizontal={false} />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 12 }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip content={<BarTooltip />} />
                  <Bar
                    dataKey="gainLossPercent"
                    radius={[0, 4, 4, 0]}
                    fill="hsl(160, 84%, 39%)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl bg-card p-6 border border-border/50">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-card-foreground">Detailed Breakdown</h3>
              <p className="text-sm text-muted-foreground">Performance by category</p>
            </div>
            <div className="space-y-4">
              {performanceByType.map((type) => (
                <div key={type.code} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div>
                    <p className="font-medium text-foreground">{type.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Invested: ${type.invested.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      'font-semibold',
                      type.gainLossPercent >= 0 ? 'text-success' : 'text-destructive'
                    )}>
                      {type.gainLossPercent >= 0 ? '+' : ''}{type.gainLossPercent.toFixed(2)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ${type.gainLoss >= 0 ? '+' : ''}{type.gainLoss.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
