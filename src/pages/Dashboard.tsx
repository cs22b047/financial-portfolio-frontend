import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { AllocationChart } from '@/components/dashboard/AllocationChart';
import { TopPerformers } from '@/components/dashboard/TopPerformers';
import { portfolioSummary, performanceHistory, assetAllocation, topPerformers } from '@/data/mockData';
import { 
  Wallet, 
  TrendingUp, 
  DollarSign, 
  PiggyBank, 
  Activity, 
  Target, 
  Zap,
  Brain,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  BarChart3,
  Clock,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  const marketStatus = "OPEN";
  const lastUpdate = "2 mins ago";

  return (
    <MainLayout>
      <div className="space-y-8 animate-slide-up">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold text-gradient">Portfolio Dashboard</h1>
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
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
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="glass-card border-border/50">
              <Eye className="mr-2 h-4 w-4" />
              Market Overview
            </Button>
            <Button className="bg-gradient-to-r from-primary to-chart-2 hover:from-primary/90 hover:to-chart-2/90 shadow-lg">
              <Zap className="mr-2 h-4 w-4" />
              Quick Trade
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Portfolio Value"
            value={`$${portfolioSummary.total_value.toLocaleString()}`}
            change={`$${portfolioSummary.daily_change.toLocaleString()} (${portfolioSummary.daily_change_percent.toFixed(2)}%) today`}
            changeType="positive"
            icon={Wallet}
            className="glass-card hover-lift"
          />
          <StatCard
            title="Total Invested"
            value={`$${portfolioSummary.total_invested.toLocaleString()}`}
            icon={DollarSign}
            iconColor="bg-chart-2/10"
            className="glass-card hover-lift"
          />
          <StatCard
            title="Total Gain/Loss"
            value={`$${portfolioSummary.total_gain_loss.toLocaleString()}`}
            change={`${portfolioSummary.total_gain_loss_percent.toFixed(2)}%`}
            changeType={portfolioSummary.total_gain_loss >= 0 ? 'positive' : 'negative'}
            icon={TrendingUp}
            iconColor="bg-success/10"
            className="glass-card hover-lift"
          />
          <StatCard
            title="Active Positions"
            value="10"
            change="4 asset types"
            changeType="neutral"
            icon={PiggyBank}
            iconColor="bg-chart-3/10"
            className="glass-card hover-lift"
          />
        </div>

        {/* Charts Section */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PerformanceChart data={performanceHistory} />
          </div>
          <div>
            <AllocationChart data={assetAllocation} />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid gap-8 lg:grid-cols-2">
          <TopPerformers data={topPerformers} />
          
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
                <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                  View All
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { 
                  action: 'Bought', 
                  symbol: 'NVDA', 
                  amount: '$2,500', 
                  date: 'Jan 10, 2024',
                  type: 'buy',
                  shares: '4.57 shares'
                },
                { 
                  action: 'Dividend', 
                  symbol: 'AAPL', 
                  amount: '+$45.00', 
                  date: 'Jan 8, 2024',
                  type: 'dividend',
                  shares: '50 shares'
                },
                { 
                  action: 'Sold', 
                  symbol: 'AMD', 
                  amount: '$1,200', 
                  date: 'Jan 5, 2024',
                  type: 'sell',
                  shares: '8.33 shares'
                },
                { 
                  action: 'Bought', 
                  symbol: 'ETH', 
                  amount: '$3,000', 
                  date: 'Jan 3, 2024',
                  type: 'buy',
                  shares: '1.16 ETH'
                },
              ].map((item, index) => (
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
              ))}
            </div>
          </div>
        </div>

        {/* Market Sentiment Widget */}
        <div className="glass-card p-6 border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Market Sentiment
            </h3>
            <Badge className="bg-success/20 text-success border-success/30">Bullish</Badge>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-success/10 border border-success/20">
              <div className="text-2xl font-bold text-success">72%</div>
              <div className="text-xs text-muted-foreground">Bulls</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/10 border border-border/30">
              <div className="text-2xl font-bold text-muted-foreground">18%</div>
              <div className="text-xs text-muted-foreground">Neutral</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-destructive/10 border border-destructive/20">
              <div className="text-2xl font-bold text-destructive">10%</div>
              <div className="text-xs text-muted-foreground">Bears</div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}