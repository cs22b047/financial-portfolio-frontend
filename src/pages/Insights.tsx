import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  TrendingUp, 
  PieChart,
  Shield,
  RefreshCw,
  Download,
  Star,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { useState } from 'react';

export default function Insights() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 3000);
  };

  return (
    <MainLayout>
      <div className="space-y-8 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-bold text-gradient">Portfolio Insights</h1>
              <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0">
                <Sparkles className="w-3 h-3 mr-1" />
                Smart Analysis
              </Badge>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Simple overview of your portfolio performance and key metrics.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="glass-card border-border/50">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            <Button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-primary to-chart-2 hover:from-primary/90 hover:to-chart-2/90"
            >
              {isAnalyzing ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <BarChart3 className="mr-2 h-4 w-4" />
              )}
              {isAnalyzing ? 'Analyzing...' : 'Refresh Data'}
            </Button>
          </div>
        </div>

        {/* Key Financial Insights */}
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          {/* Monthly Performance */}
          <Card className="glass-card p-6 border border-green-500/20 hover-lift">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-green-500/10">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Monthly Growth</h3>
                <p className="text-xs text-muted-foreground">This month's performance</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-green-400">+8.5%</div>
              <div className="text-sm text-muted-foreground">Best month in 6 months</div>
              <div className="text-xs text-muted-foreground">Gained $9,850 this month</div>
            </div>
          </Card>

          {/* Top Performer */}
          <Card className="glass-card p-6 border border-blue-500/20 hover-lift">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Star className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Top Performer</h3>
                <p className="text-xs text-muted-foreground">Best stock this month</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-400">Apple</div>
              <div className="text-sm text-muted-foreground">+12.5% gain</div>
              <div className="text-xs text-muted-foreground">Added $2,850 to portfolio</div>
            </div>
          </Card>

          {/* Diversification Status */}
          <Card className="glass-card p-6 border border-yellow-500/20 hover-lift">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-yellow-500/10">
                <PieChart className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Diversification</h3>
                <p className="text-xs text-muted-foreground">Portfolio spread</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-yellow-400">Good</div>
              <div className="text-sm text-muted-foreground">3 sectors, 8 stocks</div>
              <div className="text-xs text-muted-foreground">Well balanced mix</div>
            </div>
          </Card>
        </div>

        {/* Portfolio Summary Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="glass-card p-6 border border-border/50 hover-lift">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Total Value</h3>
                <p className="text-xs text-muted-foreground">Portfolio worth</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-foreground">$125,430</div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm text-success">+8.5% this month</span>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6 border border-border/50 hover-lift">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-success/10">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Total Gains</h3>
                <p className="text-xs text-muted-foreground">Profit/Loss</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-success">+$18,430</div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">+17.2% overall</span>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6 border border-border/50 hover-lift">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-chart-2/10">
                <Shield className="h-6 w-6 text-chart-2" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Risk Level</h3>
                <p className="text-xs text-muted-foreground">Portfolio safety</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-warning">Medium</div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Balanced approach</span>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6 border border-border/50 hover-lift">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-chart-3/10">
                <Star className="h-6 w-6 text-chart-3" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Performance</h3>
                <p className="text-xs text-muted-foreground">How you're doing</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-success">Excellent</div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Above average</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Your Investments */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Your Investments</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top Holdings */}
            <Card className="glass-card p-6 border border-border/50 hover-lift">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg">Top Holdings</h3>
                  <p className="text-sm text-muted-foreground">Your biggest investments</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Apple (AAPL)</div>
                    <div className="text-sm text-muted-foreground">Technology</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">$25,600</div>
                    <div className="text-sm text-success">+12.5%</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Microsoft (MSFT)</div>
                    <div className="text-sm text-muted-foreground">Technology</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">$18,900</div>
                    <div className="text-sm text-success">+8.3%</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Tesla (TSLA)</div>
                    <div className="text-sm text-muted-foreground">Automotive</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">$15,200</div>
                    <div className="text-sm text-destructive">-3.2%</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Investment Types */}
            <Card className="glass-card p-6 border border-border/50 hover-lift">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-chart-2/10">
                  <PieChart className="h-6 w-6 text-chart-2" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg">Investment Mix</h3>
                  <p className="text-sm text-muted-foreground">Where your money is</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Stocks</span>
                  <span className="text-sm font-semibold">70%</span>
                </div>
                <Progress value={70} className="h-2" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Bonds</span>
                  <span className="text-sm font-semibold">20%</span>
                </div>
                <Progress value={20} className="h-2" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Cash</span>
                  <span className="text-sm font-semibold">10%</span>
                </div>
                <Progress value={10} className="h-2" />
              </div>
            </Card>
          </div>
        </div>

        {/* Simple Market Info */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Market Update</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="glass-card p-6 border border-border/50 hover-lift">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-success/10">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Market Mood</h3>
                  <p className="text-xs text-muted-foreground">How investors feel</p>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">Positive</div>
                <div className="text-sm text-muted-foreground">Most people are buying</div>
              </div>
            </Card>

            <Card className="glass-card p-6 border border-border/50 hover-lift">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-warning/10">
                  <BarChart3 className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Market Movement</h3>
                  <p className="text-xs text-muted-foreground">Price changes</p>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">Stable</div>
                <div className="text-sm text-muted-foreground">Not too much change</div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}