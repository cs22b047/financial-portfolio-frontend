import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PriceHistory } from '@/types/portfolio';

interface PriceHistoryChartProps {
  data: PriceHistory[];
  symbol: string;
}

type ChartType = 'line' | 'area';
type TimeRange = 'all' | '1m' | '3m' | '6m' | '1y' | '5y';

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ data, symbol }) => {
  const [chartType, setChartType] = useState<ChartType>('area');
  const [timeRange, setTimeRange] = useState<TimeRange>('all');

  // Filter data based on time range
  const getFilteredData = () => {
    if (timeRange === 'all' || !data.length) return data;

    const now = new Date();
    const cutoffDate = new Date(now);

    switch (timeRange) {
      case '1m':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      case '5y':
        cutoffDate.setFullYear(now.getFullYear() - 5);
        break;
    }

    return data.filter(item => new Date(item.priceDate) >= cutoffDate);
  };

  const filteredData = getFilteredData();

  // Transform data for chart
  const chartData = filteredData.map(item => ({
    date: new Date(item.priceDate).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: filteredData.length > 365 ? 'numeric' : undefined 
    }),
    price: item.closePrice,
    high: item.highPrice,
    low: item.lowPrice,
    volume: item.volume
  }));

  // Calculate price change stats
  const getStats = () => {
    if (!chartData.length) return { change: 0, changePercent: 0, high: 0, low: 0 };
    
    const firstPrice = chartData[0].price;
    const lastPrice = chartData[chartData.length - 1].price;
    const change = lastPrice - firstPrice;
    const changePercent = (change / firstPrice) * 100;
    const high = Math.max(...chartData.map(d => d.high));
    const low = Math.min(...chartData.map(d => d.low));

    return { change, changePercent, high, low };
  };

  const stats = getStats();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold">{payload[0].payload.date}</p>
          <p className="text-sm">
            <span className="text-muted-foreground">Price: </span>
            <span className="font-medium">${payload[0].value.toFixed(2)}</span>
          </p>
          {payload[0].payload.high && (
            <p className="text-sm">
              <span className="text-muted-foreground">High: </span>
              <span className="font-medium">${payload[0].payload.high.toFixed(2)}</span>
            </p>
          )}
          {payload[0].payload.low && (
            <p className="text-sm">
              <span className="text-muted-foreground">Low: </span>
              <span className="font-medium">${payload[0].payload.low.toFixed(2)}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Price History - {symbol}</CardTitle>
            <CardDescription>
              {stats.changePercent >= 0 ? '↑' : '↓'} 
              <span className={stats.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}>
                {' '}{stats.changePercent.toFixed(2)}%
              </span>
              {' '}(${stats.change.toFixed(2)})
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <div className="flex gap-1 border rounded-md p-1">
              {(['1m', '3m', '6m', '1y', '5y', 'all'] as TimeRange[]).map(range => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                  className="h-7 px-2 text-xs"
                >
                  {range.toUpperCase()}
                </Button>
              ))}
            </div>
            <div className="flex gap-1 border rounded-md p-1">
              <Button
                variant={chartType === 'line' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('line')}
                className="h-7 px-2 text-xs"
              >
                Line
              </Button>
              <Button
                variant={chartType === 'area' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('area')}
                className="h-7 px-2 text-xs"
              >
                Area
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            No price history data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            {chartType === 'area' ? (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  domain={['auto', 'auto']}
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#8884d8" 
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
                />
              </AreaChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  domain={['auto', 'auto']}
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={false}
                  name="Close Price"
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
          <div>
            <span className="text-muted-foreground">Period High: </span>
            <span className="font-semibold">${stats.high.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Period Low: </span>
            <span className="font-semibold">${stats.low.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
