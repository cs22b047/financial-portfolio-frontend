import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle,
  Lightbulb,
  Zap,
  BarChart3,
  PieChart,
  Activity,
  Shield,
  Rocket,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AIInsights() {
  const insights = [
    {
      id: 1,
      type: 'opportunity',
      title: 'Rebalancing Opportunity',
      description: 'Your tech allocation is 45% above optimal. Consider reducing NVDA position by 15%.',
      confidence: 92,
      impact: 'high',
      action: 'Rebalance Portfolio',
      icon: Target,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      id: 2,
      type: 'risk',
      title: 'Concentration Risk Alert',
      description: 'Single asset (NVDA) represents 18% of portfolio. Diversification recommended.',
      confidence: 87,
      impact: 'medium',
      action: 'Diversify Holdings',
      icon: AlertTriangle,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20'
    },
    {
      id: 3,
      type: 'growth',
      title: 'Growth Momentum',
      description: 'AI analysis shows strong momentum in your green energy positions. Consider increasing allocation.',
      confidence: 78,
      impact: 'high',
      action: 'Increase Position',
      icon: Rocket,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    },
    {
      id: 4,
      type: 'market',
      title: 'Market Sentiment Shift',
      description: 'Sentiment analysis indicates potential market correction. Consider defensive positioning.',
      confidence: 65,
      impact: 'medium',
      action: 'Review Strategy',
      icon: Shield,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    }
  ];

  const portfolioScore = 85;
  const riskScore = 72;
  const diversificationScore = 68;
  const performanceScore = 91;

  return (
    <MainLayout>
      <div className="space-y-8 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold text-gradient">AI Portfolio Insights</h1>
              <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0">
                <Sparkles className="w-3 h-3 mr-1" />
                Powered by AI
              </Badge>
            </div>
            <p className="text-muted-foreground">Advanced AI analysis of your portfolio performance and opportunities</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="glass-card border-border/50">
              <Eye className="mr-2 h-4 w-4" />
              View Report
            </Button>
            <Button className="bg-gradient-to-r from-primary to-chart-2 hover:from-primary/90 hover:to-chart-2/90">
              <Brain className="mr-2 h-4 w-4" />
              Generate Analysis
            </Button>
          </div>
        </div>

        {/* AI Score Dashboard */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="glass-card p-6 border border-border/50 hover-lift">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Star className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Portfolio Score</span>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                Excellent
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-foreground">{portfolioScore}/100</div>
              <Progress value={portfolioScore} className="h-2" />
            </div>
          </Card>

          <Card className="glass-card p-6 border border-border/50 hover-lift">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-chart-2/10">
                  <Shield className="h-4 w-4 text-chart-2" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Risk Score</span>
              </div>
              <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/30">
                Moderate
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-foreground">{riskScore}/100</div>
              <Progress value={riskScore} className="h-2" />
            </div>
          </Card>

          <Card className="glass-card p-6 border border-border/50 hover-lift">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-chart-3/10">
                  <PieChart className="h-4 w-4 text-chart-3" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Diversification</span>
              </div>
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                Needs Work
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-foreground">{diversificationScore}/100</div>
              <Progress value={diversificationScore} className="h-2" />
            </div>
          </Card>

          <Card className="glass-card p-6 border border-border/50 hover-lift">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-success/10">
                  <TrendingUp className="h-4 w-4 text-success" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Performance</span>
              </div>
              <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                Outstanding
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-foreground">{performanceScore}/100</div>
              <Progress value={performanceScore} className="h-2" />
            </div>
          </Card>
        </div>

        {/* AI Insights Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {insights.map((insight) => (
            <Card key={insight.id} className={cn(
              'glass-card p-6 border hover-lift transition-all duration-300',
              insight.borderColor
            )}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn('p-3 rounded-xl', insight.bgColor)}>
                    <insight.icon className={cn('h-5 w-5', insight.color)} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{insight.title}</h3>
                    <Badge variant="outline" className={cn(
                      'text-xs mt-1',
                      insight.impact === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                      insight.impact === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                      'bg-green-500/10 text-green-400 border-green-500/30'
                    )}>
                      {insight.impact.toUpperCase()} IMPACT
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Confidence</div>
                  <div className="text-lg font-bold text-foreground">{insight.confidence}%</div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">{insight.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Updated 5 mins ago</span>
                </div>
                <Button size="sm" variant="outline" className={cn(
                  'border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30'
                )}>
                  {insight.action}
                  <ArrowUpRight className="ml-2 h-3 w-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Market Analysis */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="glass-card p-6 border border-border/50 hover-lift">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-chart-2">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Market Sentiment</h3>
                <p className="text-xs text-muted-foreground">AI-powered analysis</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Bullish Signals</span>
                <span className="text-sm font-semibold text-success">72%</span>
              </div>
              <Progress value={72} className="h-2" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Bearish Signals</span>
                <span className="text-sm font-semibold text-destructive">28%</span>
              </div>
              <Progress value={28} className="h-2" />
            </div>
          </Card>

          <Card className="glass-card p-6 border border-border/50 hover-lift">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-chart-2 to-chart-3">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Volatility Forecast</h3>
                <p className="text-xs text-muted-foreground">Next 30 days</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">Medium</div>
                <div className="text-xs text-muted-foreground">Expected volatility: 18-25%</div>
              </div>
              <div className="flex items-center justify-center gap-2">
                <TrendingDown className="h-4 w-4 text-destructive" />
                <span className="text-xs text-muted-foreground">Decreasing from current levels</span>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6 border border-border/50 hover-lift">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-chart-3 to-primary">
                <Lightbulb className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">AI Recommendation</h3>
                <p className="text-xs text-muted-foreground">Top priority action</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Reduce NVDA position by 15% and reallocate to defensive sectors for better risk-adjusted returns.
              </div>
              <Button size="sm" className="w-full bg-gradient-to-r from-primary to-chart-2">
                <Zap className="mr-2 h-4 w-4" />
                Execute Recommendation
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}