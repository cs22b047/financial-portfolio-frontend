import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp,
  Shield,
  Eye,
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  Lightbulb,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useSettings } from '@/context/SettingsContext';

// Types for API responses
interface Asset {
  id: number;
  symbol: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  status: string;
  assetType?: { code: string };
  marketData?: { symbol: string };
}

interface StockSummary {
  totalReturn: number;
  annualizedReturn: number;
  annualizedVolatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  var95: number;
}

interface HealthMetrics {
  healthScore: number;
  diversificationScore: number;
  riskScore: number;
  performanceScore: number;
  volatilityScore: number;
  details: {
    numPositions: number;
    avgSharpeRatio: number;
    avgVolatility: number;
    avgMaxDrawdown: number;
    topHoldingPercent: number;
    assetTypeBreakdown: Record<string, number>;
  };
}

export default function Insights() {
  const { settings, loading: settingsLoading } = useSettings();
  const [healthScore, setHealthScore] = useState(0);
  const [portfolioReturn, setPortfolioReturn] = useState(0);
  const [marketReturn, setMarketReturn] = useState(0);
  const [goalProgress, setGoalProgress] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics | null>(null);
  const [statusMessages, setStatusMessages] = useState<{ icon: 'success' | 'warning' | 'info'; message: string }[]>([]);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const goalTarget = settings?.target || 150000;
  const marketBenchmarkReturn = 10.5; // S&P 500 average annual return

  /**
   * Calculate Health Score based on:
   * 1. Diversification (25%): Number of positions & asset type spread
   * 2. Risk Management (25%): Sharpe ratio, VaR, Max Drawdown
   * 3. Performance (25%): Portfolio return vs benchmark
   * 4. Volatility Control (25%): Portfolio volatility vs market
   */
  const calculateHealthScore = useCallback((
    assets: Asset[],
    stockSummaries: Map<string, StockSummary>,
    totalValue: number,
    totalInvested: number
  ): HealthMetrics => {
    const ownedAssets = assets.filter(a => a.status === 'OWNED');
    
    if (ownedAssets.length === 0) {
      return {
        healthScore: 0,
        diversificationScore: 0,
        riskScore: 0,
        performanceScore: 0,
        volatilityScore: 0,
        details: {
          numPositions: 0,
          avgSharpeRatio: 0,
          avgVolatility: 0,
          avgMaxDrawdown: 0,
          topHoldingPercent: 0,
          assetTypeBreakdown: {},
        },
      };
    }

    // 1. DIVERSIFICATION SCORE (0-100)
    // - More positions = better (up to 15)
    // - More asset types = better
    // - Lower concentration = better (Herfindahl index)
    const positionWeights = ownedAssets.map(a => {
      const value = (a.quantity || 0) * (a.currentPrice || 0);
      return value / totalValue;
    });
    
    const herfindahlIndex = positionWeights.reduce((sum, w) => sum + w * w, 0);
    const positionScore = Math.min(100, (ownedAssets.length / 15) * 100);
    const concentrationScore = Math.max(0, 100 - herfindahlIndex * 100);
    
    const assetTypeBreakdown: Record<string, number> = {};
    ownedAssets.forEach(a => {
      const type = a.assetType?.code || 'STOCK';
      const value = (a.quantity || 0) * (a.currentPrice || 0);
      assetTypeBreakdown[type] = (assetTypeBreakdown[type] || 0) + value;
    });
    const numAssetTypes = Object.keys(assetTypeBreakdown).length;
    const assetTypeScore = Math.min(100, numAssetTypes * 25);
    
    const diversificationScore = (positionScore * 0.3 + concentrationScore * 0.4 + assetTypeScore * 0.3);

    // 2. RISK SCORE (0-100)
    // - Higher Sharpe ratio = better
    // - Lower Max Drawdown = better
    // - Lower VaR = better
    let totalSharpe = 0, totalMaxDrawdown = 0, totalVar = 0, summaryCount = 0;
    
    ownedAssets.forEach(a => {
      const summary = stockSummaries.get(a.symbol);
      if (summary) {
        totalSharpe += summary.sharpeRatio || 0;
        totalMaxDrawdown += Math.abs(summary.maxDrawdown || 0);
        totalVar += Math.abs(summary.var95 || 0);
        summaryCount++;
      }
    });
    
    const avgSharpe = summaryCount > 0 ? totalSharpe / summaryCount : 0;
    const avgMaxDrawdown = summaryCount > 0 ? totalMaxDrawdown / summaryCount : 0;
    const avgVar = summaryCount > 0 ? totalVar / summaryCount : 0;
    
    // Sharpe: 0-1 = poor, 1-2 = good, >2 = excellent
    const sharpeScore = Math.min(100, avgSharpe * 50);
    // Max Drawdown: < 10% = excellent, 10-20% = good, > 30% = poor
    const drawdownScore = Math.max(0, 100 - avgMaxDrawdown * 3);
    // VaR 95%: < 2% = good, 2-5% = moderate, > 5% = risky
    const varScore = Math.max(0, 100 - avgVar * 15);
    
    const riskScore = (sharpeScore * 0.5 + drawdownScore * 0.3 + varScore * 0.2);

    // 3. PERFORMANCE SCORE (0-100)
    // Portfolio return vs market benchmark
    const portfolioReturnPct = totalInvested > 0 
      ? ((totalValue - totalInvested) / totalInvested) * 100 
      : 0;
    
    const excessReturn = portfolioReturnPct - marketBenchmarkReturn;
    // Scale: -20% to +20% excess maps to 0-100
    const performanceScore = Math.max(0, Math.min(100, 50 + excessReturn * 2.5));

    // 4. VOLATILITY SCORE (0-100)
    // Lower portfolio volatility relative to market (15%) = better
    let totalVolatility = 0, volCount = 0;
    ownedAssets.forEach(a => {
      const weight = ((a.quantity || 0) * (a.currentPrice || 0)) / totalValue;
      const summary = stockSummaries.get(a.symbol);
      if (summary) {
        totalVolatility += (summary.annualizedVolatility || 0) * weight;
        volCount++;
      }
    });
    
    const avgVolatility = volCount > 0 ? totalVolatility : 20;
    const benchmarkVolatility = 15; // S&P 500 typical volatility
    const volatilityRatio = avgVolatility / benchmarkVolatility;
    const volatilityScore = Math.max(0, Math.min(100, 100 - (volatilityRatio - 1) * 50));

    // FINAL HEALTH SCORE (weighted average)
    const healthScore = Math.round(
      diversificationScore * 0.25 +
      riskScore * 0.25 +
      performanceScore * 0.25 +
      volatilityScore * 0.25
    );

    // Top holding percentage
    const maxPosition = Math.max(...ownedAssets.map(a => 
      ((a.quantity || 0) * (a.currentPrice || 0)) / totalValue * 100
    ));

    return {
      healthScore: Math.max(0, Math.min(100, healthScore)),
      diversificationScore: Math.round(diversificationScore),
      riskScore: Math.round(riskScore),
      performanceScore: Math.round(performanceScore),
      volatilityScore: Math.round(volatilityScore),
      details: {
        numPositions: ownedAssets.length,
        avgSharpeRatio: parseFloat(avgSharpe.toFixed(2)),
        avgVolatility: parseFloat(avgVolatility.toFixed(2)),
        avgMaxDrawdown: parseFloat(avgMaxDrawdown.toFixed(2)),
        topHoldingPercent: parseFloat(maxPosition.toFixed(1)),
        assetTypeBreakdown,
      },
    };
  }, [marketBenchmarkReturn]);

  // Generate status messages based on health metrics
  const generateStatusMessages = useCallback((metrics: HealthMetrics) => {
    const messages: { icon: 'success' | 'warning' | 'info'; message: string }[] = [];
    
    if (metrics.healthScore >= 70) {
      messages.push({ icon: 'success', message: 'Portfolio is healthy' });
    } else if (metrics.healthScore >= 50) {
      messages.push({ icon: 'info', message: 'Portfolio needs attention' });
    } else {
      messages.push({ icon: 'warning', message: 'Portfolio needs improvement' });
    }
    
    if (metrics.details.numPositions < 5) {
      messages.push({ icon: 'warning', message: 'Consider more diversification' });
    } else if (metrics.details.numPositions >= 10) {
      messages.push({ icon: 'success', message: 'Well diversified portfolio' });
    }
    
    if (metrics.details.topHoldingPercent > 30) {
      messages.push({ icon: 'warning', message: `Top holding is ${metrics.details.topHoldingPercent.toFixed(0)}% - consider rebalancing` });
    }
    
    if (metrics.details.avgSharpeRatio > 1) {
      messages.push({ icon: 'success', message: 'Good risk-adjusted returns' });
    } else if (metrics.details.avgSharpeRatio < 0.5) {
      messages.push({ icon: 'warning', message: 'Low risk-adjusted returns' });
    }
    
    if (metrics.details.avgVolatility > 25) {
      messages.push({ icon: 'warning', message: 'High portfolio volatility' });
    }
    
    const assetTypes = Object.keys(metrics.details.assetTypeBreakdown);
    if (!assetTypes.includes('BOND') && !assetTypes.includes('CASH')) {
      messages.push({ icon: 'info', message: 'Consider adding bonds for stability' });
    }
    
    return messages.slice(0, 3); // Limit to 3 messages
  }, []);

  // Fetch portfolio data and calculate health score
  useEffect(() => {
    // Wait for settings to load before fetching data
    if (settingsLoading) {
      return;
    }

    const fetchPortfolioData = async () => {
      setLoading(true);
      try {
        // Fetch assets
        const assetsResponse = await fetch(`${apiUrl}/api/assets`);
        if (!assetsResponse.ok) throw new Error('Failed to fetch assets');
        const assets: Asset[] = await assetsResponse.json();
        
        const ownedAssets = assets.filter(a => a.status === 'OWNED');
        
        // Calculate total value and invested
        let totalValue = 0;
        let totalInvested = 0;
        ownedAssets.forEach(a => {
          const qty = Number(a.quantity || 0);
          const currentPrice = Number(a.currentPrice || 0);
          const purchasePrice = Number(a.purchasePrice || 0);
          totalValue += qty * currentPrice;
          totalInvested += qty * purchasePrice;
        });

        // Fetch stock summaries for each owned asset
        const stockSummaries = new Map<string, StockSummary>();
        await Promise.all(
          ownedAssets.map(async (asset) => {
            try {
              const response = await fetch(`${apiUrl}/api/stock-summary/symbol/${asset.symbol}/period/5y`);
              if (response.ok) {
                const summary = await response.json();
                stockSummaries.set(asset.symbol, summary);
              }
            } catch {
              // Skip if no summary available
            }
          })
        );

        // Calculate health metrics
        const metrics = calculateHealthScore(assets, stockSummaries, totalValue, totalInvested);
        setHealthMetrics(metrics);
        
        // Calculate portfolio return
        const returnPct = totalInvested > 0 
          ? ((totalValue - totalInvested) / totalInvested) * 100 
          : 0;

        // Generate status messages
        setStatusMessages(generateStatusMessages(metrics));

        // Trigger animations with real data
        setIsVisible(true);
        
        // Animate to real values
        const targetHealthScore = metrics.healthScore;
        const targetReturn = returnPct;
        const targetGoalProgress = Math.min((totalValue / goalTarget) * 100, 100);
        
        let currentHealth = 0, currentReturn = 0, currentGoal = 0, currentVal = 0;
        
        const animationInterval = setInterval(() => {
          if (currentHealth < targetHealthScore) {
            currentHealth = Math.min(currentHealth + 2, targetHealthScore);
            setHealthScore(currentHealth);
          }
          if (currentReturn < targetReturn) {
            currentReturn = Math.min(currentReturn + 0.5, targetReturn);
            setPortfolioReturn(currentReturn);
          }
          if (currentGoal < targetGoalProgress) {
            currentGoal = Math.min(currentGoal + 1.5, targetGoalProgress);
            setGoalProgress(currentGoal);
          }
          if (currentVal < totalValue) {
            currentVal = Math.min(currentVal + totalValue / 40, totalValue);
            setCurrentValue(currentVal);
          }
          
          if (
            currentHealth >= targetHealthScore &&
            currentReturn >= targetReturn &&
            currentGoal >= targetGoalProgress &&
            currentVal >= totalValue
          ) {
            clearInterval(animationInterval);
          }
        }, 30);

        // Set market return (benchmark)
        setMarketReturn(marketBenchmarkReturn);

      } catch (error) {
        console.error('Error fetching portfolio data:', error);
        // Fall back to showing zero values
        setHealthScore(0);
        setPortfolioReturn(0);
        setCurrentValue(0);
        setGoalProgress(0);
        setIsVisible(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, [apiUrl, settingsLoading, goalTarget, calculateHealthScore, generateStatusMessages, marketBenchmarkReturn]);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Animated Header */}
        <div className={`flex items-center justify-between transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
        }`}>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-black to-gray-600 bg-clip-text text-transparent dark:from-gray-200 dark:via-white dark:to-gray-400">
              Portfolio Insights
            </h1>
            <p className="text-muted-foreground mt-1">
              {loading ? 'Analyzing your portfolio...' : 'AI-powered analysis of your investments'}
            </p>
          </div>
          {loading && (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          )}
        </div>

        {/* Animated Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Health Score - Animated */}
          <Card className={`glass-card border border-border/50 p-6 backdrop-blur-sm hover:bg-card/70 transform hover:scale-105 transition-all duration-500 hover:shadow-2xl ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'
          }`} style={{ transitionDelay: '100ms' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${healthScore >= 70 ? 'bg-success/20' : healthScore >= 50 ? 'bg-warning/20' : 'bg-destructive/20'} animate-pulse`}>
                <Shield className={`h-6 w-6 ${healthScore >= 70 ? 'text-success' : healthScore >= 50 ? 'text-warning' : 'text-destructive'}`} />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Health Score</h3>
            </div>
            
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 transition-all duration-300 ${
                healthScore >= 70 ? 'text-success' : healthScore >= 50 ? 'text-warning' : 'text-destructive'
              }`}>
                {Math.round(healthScore)}/100
              </div>
              <Badge className={`${
                healthScore >= 70 ? 'bg-success/20 text-success border-success/30' : 
                healthScore >= 50 ? 'bg-warning/20 text-warning border-warning/30' : 
                'bg-destructive/20 text-destructive border-destructive/30'
              }`}>
                {healthScore >= 70 ? 'Good Health' : healthScore >= 50 ? 'Moderate' : 'Needs Attention'}
              </Badge>
            </div>

            {healthMetrics && (
              <div className="mt-4 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                    <span className="text-muted-foreground">Diversification</span>
                    <span className="font-medium">{healthMetrics.diversificationScore}/100</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                    <span className="text-muted-foreground">Risk Mgmt</span>
                    <span className="font-medium">{healthMetrics.riskScore}/100</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                    <span className="text-muted-foreground">Performance</span>
                    <span className="font-medium">{healthMetrics.performanceScore}/100</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                    <span className="text-muted-foreground">Volatility</span>
                    <span className="font-medium">{healthMetrics.volatilityScore}/100</span>
                  </div>
                </div>
                <div className={`flex items-center gap-2 text-sm text-muted-foreground transition-all duration-700 ${
                  healthMetrics.details.numPositions >= 5 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5'
                }`}>
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>{healthMetrics.details.numPositions} positions across {Object.keys(healthMetrics.details.assetTypeBreakdown).length} asset types</span>
                </div>
                {healthMetrics.details.avgSharpeRatio > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Info className="h-4 w-4 text-primary" />
                    <span>Sharpe Ratio: {healthMetrics.details.avgSharpeRatio.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Performance - Animated */}
          <Card className={`glass-card border border-border/50 p-6 backdrop-blur-sm hover:bg-card/70 transform hover:scale-105 transition-all duration-500 hover:shadow-2xl ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'
          }`} style={{ transitionDelay: '200ms' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/20 animate-pulse">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Performance</h3>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Your Return</span>
                <span className={`text-2xl font-bold transition-all duration-300 ${
                  portfolioReturn >= 0 ? 'text-success' : 'text-destructive'
                }`}>
                  {portfolioReturn >= 0 ? '+' : ''}{portfolioReturn.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Market Benchmark (S&P 500)</span>
                <span className="text-xl text-foreground transition-all duration-300">
                  +{marketReturn.toFixed(1)}%
                </span>
              </div>
              
              {portfolioReturn > marketReturn ? (
                <div className={`text-center p-3 bg-success/10 rounded-lg border border-success/30 transition-all duration-1000 ${
                  isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}>
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4 text-success" />
                    <span className="text-success font-semibold">
                      Beating market by +{(portfolioReturn - marketReturn).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ) : portfolioReturn > 0 ? (
                <div className="text-center p-3 bg-warning/10 rounded-lg border border-warning/30">
                  <div className="flex items-center justify-center gap-2">
                    <Info className="h-4 w-4 text-warning" />
                    <span className="text-warning font-semibold">
                      {(marketReturn - portfolioReturn).toFixed(1)}% below market
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center p-3 bg-destructive/10 rounded-lg border border-destructive/30">
                  <div className="flex items-center justify-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <span className="text-destructive font-semibold">
                      Portfolio is down {Math.abs(portfolioReturn).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Goal Progress - Animated */}
          <Card className={`glass-card border border-border/50 p-6 backdrop-blur-sm hover:bg-card/70 transform hover:scale-105 transition-all duration-500 hover:shadow-2xl ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
          }`} style={{ transitionDelay: '300ms' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/20 animate-pulse">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Goal Progress</h3>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Value</span>
                <span className="text-xl font-bold text-foreground transition-all duration-300">
                  ${currentValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target</span>
                <span className="text-xl text-foreground">${goalTarget.toLocaleString()}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className={`transition-all duration-300 ${
                    goalProgress >= 100 ? 'text-success' : 'text-primary'
                  }`}>
                    {Math.min(Math.round(goalProgress), 100)}%
                  </span>
                </div>
                <Progress 
                  value={Math.min(goalProgress, 100)} 
                  className="h-3 transition-all duration-1000 ease-out" 
                />
                {goalProgress >= 100 && (
                  <div className="flex items-center gap-2 text-sm text-success">
                    <Sparkles className="h-4 w-4" />
                    <span>🎉 Goal achieved!</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Quick Tips - Animated */}
          <Card className={`glass-card border border-border/50 p-6 backdrop-blur-sm hover:bg-card/70 transform hover:scale-105 transition-all duration-500 hover:shadow-2xl ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
          }`} style={{ transitionDelay: '400ms' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-warning/20 animate-pulse">
                <Lightbulb className="h-6 w-6 text-warning" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">AI Recommendations</h3>
            </div>

            <div className="space-y-3">
              {healthMetrics && healthMetrics.details.numPositions < 5 && (
                <div className={`p-3 bg-warning/10 rounded-lg border border-warning/30 transition-all duration-300 transform hover:translate-x-2 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                }`} style={{ transitionDelay: '600ms' }}>
                  <div className="font-medium text-foreground mb-1">Diversify more</div>
                  <div className="text-sm text-muted-foreground">Add more positions to reduce risk (currently {healthMetrics.details.numPositions})</div>
                </div>
              )}
              
              {healthMetrics && healthMetrics.details.topHoldingPercent > 25 && (
                <div className={`p-3 bg-warning/10 rounded-lg border border-warning/30 transition-all duration-300 transform hover:translate-x-2 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                }`} style={{ transitionDelay: '700ms' }}>
                  <div className="font-medium text-foreground mb-1">Rebalance portfolio</div>
                  <div className="text-sm text-muted-foreground">Top holding is {healthMetrics.details.topHoldingPercent.toFixed(0)}% of portfolio</div>
                </div>
              )}
              
              {healthMetrics && !Object.keys(healthMetrics.details.assetTypeBreakdown).includes('BOND') && (
                <div className={`p-3 bg-secondary/50 rounded-lg hover:bg-secondary/70 transition-all duration-300 transform hover:translate-x-2 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                }`} style={{ transitionDelay: '800ms' }}>
                  <div className="font-medium text-foreground mb-1">Consider bonds</div>
                  <div className="text-sm text-muted-foreground">Add stability with fixed income assets</div>
                </div>
              )}
              
              {portfolioReturn > marketReturn && (
                <div className={`p-3 bg-success/10 rounded-lg border border-success/30 transition-all duration-300 transform hover:translate-x-2 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                }`} style={{ transitionDelay: '600ms' }}>
                  <div className="font-medium text-foreground mb-1">Keep holding</div>
                  <div className="text-sm text-muted-foreground">Your portfolio is outperforming the market</div>
                </div>
              )}
              
              {healthMetrics && healthMetrics.details.avgVolatility > 25 && (
                <div className={`p-3 bg-warning/10 rounded-lg border border-warning/30 transition-all duration-300 transform hover:translate-x-2 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                }`} style={{ transitionDelay: '900ms' }}>
                  <div className="font-medium text-foreground mb-1">Reduce volatility</div>
                  <div className="text-sm text-muted-foreground">Portfolio volatility ({healthMetrics.details.avgVolatility.toFixed(1)}%) is high</div>
                </div>
              )}
              
              {(!healthMetrics || (healthMetrics.details.numPositions >= 5 && healthMetrics.details.topHoldingPercent <= 25 && portfolioReturn <= marketReturn)) && (
                <div className={`p-3 bg-secondary/50 rounded-lg hover:bg-secondary/70 transition-all duration-300 transform hover:translate-x-2 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                }`} style={{ transitionDelay: '600ms' }}>
                  <div className="font-medium text-foreground mb-1">Stay the course</div>
                  <div className="text-sm text-muted-foreground">Continue with your investment strategy</div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Animated Status Updates */}
        <Card className={`glass-card border border-border/50 p-4 backdrop-blur-sm hover:bg-card/70 transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`} style={{ transitionDelay: '500ms' }}>
          <h3 className="text-lg font-semibold text-foreground mb-3">Status Updates</h3>
          
          <div className="flex flex-wrap gap-4">
            {statusMessages.map((status, index) => (
              <div 
                key={index}
                className={`flex items-center gap-2 transition-all duration-500 hover:scale-110 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5'
                }`} 
                style={{ transitionDelay: `${800 + index * 100}ms` }}
              >
                {status.icon === 'success' && <CheckCircle className="h-4 w-4 text-success" />}
                {status.icon === 'warning' && <AlertTriangle className="h-4 w-4 text-warning" />}
                {status.icon === 'info' && <Info className="h-4 w-4 text-primary" />}
                <span className="text-sm text-muted-foreground">{status.message}</span>
              </div>
            ))}
            {statusMessages.length === 0 && !loading && (
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">No portfolio data available</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}