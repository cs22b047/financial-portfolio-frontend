import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { AllocationChart } from '@/components/dashboard/AllocationChart';
import { TopPerformers } from '@/components/dashboard/TopPerformers';
import { assetTypes } from '@/data/mockData';
import type {
  AssetAllocation,
  PerformanceDataPoint,
  PortfolioSummary,
  TopPerformer,
} from '@/types/portfolio';
import {
  Wallet,
  TrendingUp,
  DollarSign,
  PiggyBank,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface ApiTransaction {
  id: number;
  transactionType: 'BUY' | 'SELL' | 'DIVIDEND' | 'TRANSFER';
  quantity: number | null;
  price: number | null;
  transactionDate: string;
  asset?: {
    symbol?: string;
    name?: string;
    marketData?: {
      symbol?: string;
      name?: string;
      assetType?: {
        code?: string;
      };
    };
  };
}

interface RecentActivityItem {
  action: string;
  symbol: string;
  amount: string;
  date: string;
  type: 'buy' | 'sell' | 'dividend';
  shares: string;
}

interface AssetTypeGainLoss {
  type: string;
  gainLoss: number;
  percentage: number;
  count: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<PortfolioSummary>({
    total_value: 0,
    total_invested: 0,
    total_gain_loss: 0,
    total_gain_loss_percent: 0,
    daily_change: 0,
    daily_change_percent: 0,
  });
  const [allocation, setAllocation] = useState<AssetAllocation[]>([]);
  const [performance, setPerformance] = useState<PerformanceDataPoint[]>([]);
  const [topPerformerData, setTopPerformerData] = useState<TopPerformer[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [assetTypeGainLoss, setAssetTypeGainLoss] = useState<AssetTypeGainLoss[]>([]);
  const [marketStatus, setMarketStatus] = useState('UNKNOWN');
  const [lastUpdate, setLastUpdate] = useState('N/A');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  const formatCurrency = (value: number) => `${value.toLocaleString()}`;

  const mapAssetTypeCode = (asset: any) => {
    if (asset.assetType?.code) return asset.assetType.code;
    const typeId = asset.assetType?.id || asset.asset_type_id;
    return assetTypes.find((t: any) => t.id === typeId)?.code || 'STOCK';
  };

  const computeSummary = (assets: any[]) => {
    const ownedAssets = assets.filter((asset) => asset.status === 'OWNED');
    const totalValue = ownedAssets.reduce((sum, asset) => {
      const quantity = Number(asset.quantity || 0);
      const currentPrice = Number(asset.currentPrice || asset.current_price || 0);
      return sum + quantity * currentPrice;
    }, 0);

    const totalInvested = ownedAssets.reduce((sum, asset) => {
      const purchasePrice = Number(asset.purchasePrice || asset.purchase_price || 0);
      const quantity = Number(asset.quantity || 0);
      return sum + purchasePrice * quantity;
    }, 0);

    const totalGainLoss = ownedAssets.reduce((sum, asset) => {
      if (asset.unrealizedGainLoss !== undefined && asset.unrealizedGainLoss !== null) {
        return sum + Number(asset.unrealizedGainLoss || 0);
      }
      const quantity = Number(asset.quantity || 0);
      const currentPrice = Number(asset.currentPrice || asset.current_price || 0);
      const purchasePrice = Number(asset.purchasePrice || asset.purchase_price || 0);
      return sum + (currentPrice - purchasePrice) * quantity;
    }, 0);

    const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

    return {
      total_value: totalValue,
      total_invested: totalInvested,
      total_gain_loss: totalGainLoss,
      total_gain_loss_percent: totalGainLossPercent,
      daily_change: 0,
      daily_change_percent: 0,
    };
  };

  const computeAllocation = (assets: any[]) => {
    const ownedAssets = assets.filter((asset) => asset.status === 'OWNED');
    const totalCount = ownedAssets.length;

    const grouped = ownedAssets.reduce((acc, asset) => {
      const type = mapAssetTypeCode(asset);
      if (!acc[type]) {
        acc[type] = { count: 0 };
      }
      acc[type].count += 1;
      return acc;
    }, {} as Record<string, { count: number }>);

    return (Object.entries(grouped) as [string, { count: number }][]).map(([type, stats]) => ({
      type: type as AssetAllocation['type'],
      value: stats.count,
      percentage: totalCount > 0 ? (stats.count / totalCount) * 100 : 0,
      count: stats.count,
    }));
  };

  const buildTopPerformers = (assets: any[]) => {
    const ownedAssets = assets.filter((asset) => asset.status === 'OWNED');
    const performers = ownedAssets.map((asset) => {
      const quantity = Number(asset.quantity || 0);
      const currentPrice = Number(asset.currentPrice || asset.current_price || 0);
      const purchasePrice = Number(asset.purchasePrice || asset.purchase_price || 0);
      const gainLoss = asset.unrealizedGainLoss !== undefined && asset.unrealizedGainLoss !== null
        ? Number(asset.unrealizedGainLoss || 0)
        : (currentPrice - purchasePrice) * quantity;
      const gainLossPercent = asset.unrealizedGainLossPercent !== undefined && asset.unrealizedGainLossPercent !== null
        ? Number(asset.unrealizedGainLossPercent || 0)
        : (purchasePrice > 0 ? ((currentPrice - purchasePrice) / purchasePrice) * 100 : 0);

      return {
        symbol: asset.symbol,
        name: asset.name || asset.marketData?.name || '',
        gain_loss_percent: gainLossPercent,
        gain_loss: gainLoss,
        asset_type: mapAssetTypeCode(asset) as TopPerformer['asset_type'],
      } as TopPerformer;
    });

    return performers.sort((a, b) => b.gain_loss - a.gain_loss).slice(0, 5);
  };

  const computeAssetTypeGainLoss = (assets: any[]) => {
    const ownedAssets = assets.filter((asset) => asset.status === 'OWNED');
    
    const grouped = ownedAssets.reduce((acc, asset) => {
      const type = mapAssetTypeCode(asset);
      const quantity = Number(asset.quantity || 0);
      const currentPrice = Number(asset.currentPrice || asset.current_price || 0);
      const purchasePrice = Number(asset.purchasePrice || asset.purchase_price || 0);
      const gainLoss = asset.unrealizedGainLoss !== undefined && asset.unrealizedGainLoss !== null
        ? Number(asset.unrealizedGainLoss || 0)
        : (currentPrice - purchasePrice) * quantity;
      const invested = purchasePrice * quantity;

      if (!acc[type]) {
        acc[type] = { gainLoss: 0, invested: 0, count: 0 };
      }
      acc[type].gainLoss += gainLoss;
      acc[type].invested += invested;
      acc[type].count += 1;
      return acc;
    }, {} as Record<string, { gainLoss: number; invested: number; count: number }>);

    return (Object.entries(grouped) as [string, { gainLoss: number; invested: number; count: number }][]).map(([type, stats]) => ({
      type,
      gainLoss: stats.gainLoss,
      percentage: stats.invested > 0 ? (stats.gainLoss / stats.invested) * 100 : 0,
      count: stats.count,
    }));
  };

  const buildPerformanceHistory = async (assets: any[], totalInvested: number, totalValue: number) => {
    const ownedAssets = assets.filter((asset) => asset.status === 'OWNED');
    if (ownedAssets.length === 0) {
      setPerformance([
        {
          date: new Date().toISOString().split('T')[0],
          value: totalValue,
          gain_loss: totalValue - totalInvested,
        },
      ]);
      return;
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - 6);
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const priceHistoryResponses = await Promise.all(
      ownedAssets.map(async (asset) => {
        const symbol = asset.symbol;
        try {
          const response = await fetch(
            `${apiUrl}/api/price-history/symbol/${symbol}/range?startDate=${startDateStr}&endDate=${endDateStr}`
          );
          if (!response.ok) return [];
          const data = await response.json();
          return data.map((entry: any) => ({
            date: entry.priceDate || entry.price_date,
            close: Number(entry.adjustedClose || entry.closePrice || entry.adjusted_close || entry.close_price || 0),
          }));
        } catch {
          return [];
        }
      })
    );

    // Build a complete date range and forward-fill missing prices
    const allDates = new Set<string>();
    priceHistoryResponses.forEach(prices => {
      prices.forEach((entry: any) => {
        if (entry.date) allDates.add(entry.date);
      });
    });

    const sortedDates = Array.from(allDates).sort();
    if (sortedDates.length === 0) {
      setPerformance([
        {
          date: new Date().toISOString().split('T')[0],
          value: totalValue,
          gain_loss: totalValue - totalInvested,
        },
      ]);
      return;
    }

    // For each asset, create a map with forward-filled prices
    const assetPricesByDate = ownedAssets.map((asset, index) => {
      const quantity = Number(asset.quantity || 0);
      const currentPrice = Number(asset.currentPrice || asset.current_price || 0);
      const prices = priceHistoryResponses[index];
      
      const priceMap: Record<string, number> = {};
      let lastKnownPrice = currentPrice; // Start with current price as fallback

      // Build price map from historical data
      prices.forEach((entry: any) => {
        if (entry.date && entry.close > 0) {
          priceMap[entry.date] = entry.close;
        }
      });

      // Forward fill: for each date, use the last known price if no data exists
      const filledPrices: Record<string, number> = {};
      sortedDates.forEach(date => {
        if (priceMap[date]) {
          lastKnownPrice = priceMap[date];
        }
        filledPrices[date] = lastKnownPrice * quantity;
      });

      return filledPrices;
    });

    // Sum all assets for each date
    const performanceData = sortedDates.map(date => {
      const value = assetPricesByDate.reduce((sum, assetPrices) => sum + (assetPrices[date] || 0), 0);
      return {
        date,
        value,
        gain_loss: value - totalInvested,
      };
    });

    setPerformance(performanceData);
  };

  const mapRecentActivity = (transactions: ApiTransaction[]): RecentActivityItem[] => {
    return transactions
      .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
      .slice(0, 4)
      .map((tx) => {
        const quantity = Number(tx.quantity || 0);
        const price = Number(tx.price || 0);
        const isDividend = tx.transactionType === 'DIVIDEND';
        const totalValue = isDividend ? price : quantity * price;
        const action = tx.transactionType === 'BUY' ? 'Bought' : tx.transactionType === 'SELL' ? 'Sold' : 'Dividend';
        const type = tx.transactionType === 'BUY' ? 'buy' : tx.transactionType === 'SELL' ? 'sell' : 'dividend';
        const symbol = tx.asset?.marketData?.symbol || tx.asset?.symbol || 'N/A';

        return {
          action,
          symbol,
          amount: formatCurrency(totalValue),
          date: new Date(tx.transactionDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          type,
          shares: isDividend
            ? 'Dividend'
            : `${quantity.toFixed(2)} ${symbol}`.trim(),
        };
      });
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [assetsResponse, transactionsResponse] = await Promise.all([
          fetch(`${apiUrl}/api/assets`),
          fetch(`${apiUrl}/api/transactions`),
        ]);

        if (!assetsResponse.ok) throw new Error('Failed to fetch assets');
        const assetsData = await assetsResponse.json();

        const summaryData = computeSummary(assetsData);
        setSummary(summaryData);
        setAllocation(computeAllocation(assetsData));
        setTopPerformerData(buildTopPerformers(assetsData));
        setAssetTypeGainLoss(computeAssetTypeGainLoss(assetsData));
        await buildPerformanceHistory(assetsData, summaryData.total_invested, summaryData.total_value);

        const ownedAssets = assetsData.filter((asset: any) => asset.status === 'OWNED');
        const firstMarketData = ownedAssets[0]?.marketData;
        if (firstMarketData?.marketStatus) setMarketStatus(firstMarketData.marketStatus);
        if (firstMarketData?.lastUpdated || firstMarketData?.updatedDate) {
          const updated = firstMarketData.lastUpdated || firstMarketData.updatedDate;
          setLastUpdate(new Date(updated).toLocaleString());
        } else {
          setLastUpdate(new Date().toLocaleString());
        }

        if (transactionsResponse.ok) {
          const transactionsData = await transactionsResponse.json();
          setRecentActivity(mapRecentActivity(transactionsData));
        } else {
          setRecentActivity([]);
        }
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [apiUrl]);

  const activePositions = useMemo(() => allocation.reduce((sum, item) => sum + item.count, 0), [allocation]);
  const activeAssetTypes = useMemo(() => allocation.length, [allocation]);
  const marketStatusBadgeClass = marketStatus === 'OPEN'
    ? 'bg-green-500/10 text-green-400 border-green-500/20'
    : 'bg-muted/10 text-muted-foreground border-border';

  return (
    <MainLayout>
      <div className="space-y-8 animate-slide-up">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold text-gradient">Portfolio Dashboard</h1>
              <Badge variant="outline" className={marketStatusBadgeClass}>
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                {marketStatus}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Last updated {lastUpdate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span className="text-sm">NYSE, NASDAQ</span>
              </div>
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Portfolio Value"
            value={formatCurrency(summary.total_value)}
            change={`${formatCurrency(summary.daily_change)} (${summary.daily_change_percent.toFixed(2)}%) today`}
            changeType="positive"
            icon={Wallet}
            className="glass-card hover-lift"
          />
          <StatCard
            title="Total Invested"
            value={formatCurrency(summary.total_invested)}
            icon={DollarSign}
            iconColor="bg-chart-2/10"
            className="glass-card hover-lift"
          />
          <StatCard
            title="Total Gain/Loss"
            value={formatCurrency(summary.total_gain_loss)}
            change={`${summary.total_gain_loss_percent.toFixed(2)}%`}
            changeType={summary.total_gain_loss >= 0 ? 'positive' : 'negative'}
            icon={TrendingUp}
            iconColor="bg-success/10"
            className="glass-card hover-lift"
          />
          <StatCard
            title="Active Positions"
            value={activePositions.toString()}
            change={`${activeAssetTypes} asset types`}
            changeType="neutral"
            icon={PiggyBank}
            iconColor="bg-chart-3/10"
            className="glass-card hover-lift"
          />
        </div>

        {/* Charts Section */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PerformanceChart data={performance} assetTypeGainLoss={assetTypeGainLoss} />
          </div>
          <div>
            <AllocationChart data={allocation} />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid gap-8 lg:grid-cols-2">
          <TopPerformers data={topPerformerData} />
          
          {/* Enhanced Recent Activity */}
          <div className="glass-card p-6 border border-border/50 hover-lift">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Recent Activity
                  </h3>
                  <p className="text-sm text-muted-foreground">Latest portfolio transactions</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:bg-primary/10"
                  onClick={() => navigate('/transactions')}
                >
                  View All
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              {recentActivity.length === 0 && !loading ? (
                <div className="text-sm text-muted-foreground">No recent activity found.</div>
              ) : (
                recentActivity.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/30 hover:bg-secondary/50 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        item.type === 'buy' ? 'bg-success/20 text-success' :
                        item.type === 'sell' ? 'bg-destructive/20 text-destructive' :
                        'bg-primary/20 text-primary'
                      }`}>
                        {item.type === 'buy' ? <ArrowUpRight className="h-4 w-4" /> :
                         item.type === 'sell' ? <ArrowDownRight className="h-4 w-4" /> :
                         <DollarSign className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">{item.action}</span>
                          <Badge variant="outline" className="text-xs">{item.symbol}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{item.shares} • {item.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-semibold ${
                        item.type === 'buy' ? 'text-success' :
                        item.type === 'sell' ? 'text-destructive' :
                        'text-primary'
                      }`}>
                        {item.amount}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}