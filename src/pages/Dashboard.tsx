import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { AllocationChart } from '@/components/dashboard/AllocationChart';
import { TopPerformers } from '@/components/dashboard/TopPerformers';
import { portfolioSummary, performanceHistory, assetAllocation, topPerformers } from '@/data/mockData';
import { Wallet, TrendingUp, DollarSign, PiggyBank } from 'lucide-react';

export default function Dashboard() {
  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your portfolio overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Portfolio Value"
            value={`$${portfolioSummary.total_value.toLocaleString()}`}
            change={`$${portfolioSummary.daily_change.toLocaleString()} (${portfolioSummary.daily_change_percent.toFixed(2)}%) today`}
            changeType="positive"
            icon={Wallet}
          />
          <StatCard
            title="Total Invested"
            value={`$${portfolioSummary.total_invested.toLocaleString()}`}
            icon={DollarSign}
            iconColor="bg-chart-2/10"
          />
          <StatCard
            title="Total Gain/Loss"
            value={`$${portfolioSummary.total_gain_loss.toLocaleString()}`}
            change={`${portfolioSummary.total_gain_loss_percent.toFixed(2)}%`}
            changeType={portfolioSummary.total_gain_loss >= 0 ? 'positive' : 'negative'}
            icon={TrendingUp}
            iconColor="bg-success/10"
          />
          <StatCard
            title="Total Assets"
            value="10"
            change="4 asset types"
            changeType="neutral"
            icon={PiggyBank}
            iconColor="bg-chart-3/10"
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PerformanceChart data={performanceHistory} />
          </div>
          <div>
            <AllocationChart data={assetAllocation} />
          </div>
        </div>

        {/* Top Performers */}
        <div className="grid gap-6 lg:grid-cols-2">
          <TopPerformers data={topPerformers} />
          <div className="rounded-xl bg-card p-6 border border-border/50">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-card-foreground">Recent Activity</h3>
              <p className="text-sm text-muted-foreground">Latest transactions</p>
            </div>
            <div className="space-y-4">
              {[
                { action: 'Bought', symbol: 'NVDA', amount: '$2,500', date: 'Jan 10, 2024' },
                { action: 'Dividend', symbol: 'AAPL', amount: '+$45.00', date: 'Jan 8, 2024' },
                { action: 'Sold', symbol: 'AMD', amount: '$1,200', date: 'Jan 5, 2024' },
                { action: 'Bought', symbol: 'ETH', amount: '$3,000', date: 'Jan 3, 2024' },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <span className="text-sm font-medium text-foreground">{item.action} {item.symbol}</span>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{item.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
