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
  Sparkles
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Insights() {
  const [healthScore, setHealthScore] = useState(0);
  const [portfolioReturn, setPortfolioReturn] = useState(0);
  const [marketReturn, setMarketReturn] = useState(0);
  const [goalProgress, setGoalProgress] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const portfolioData = {
    healthScore: 87,
    portfolioReturn: 18.4,
    marketReturn: 12.8,
    goalProgress: 84,
    currentValue: 125430,
    goalTarget: 150000
  };

  // Trigger animations on mount
  useEffect(() => {
    setIsVisible(true);
    
    // Animate health score
    const healthTimer = setInterval(() => {
      setHealthScore(prev => prev < portfolioData.healthScore ? prev + 2 : portfolioData.healthScore);
    }, 30);

    // Animate portfolio return
    const portfolioTimer = setInterval(() => {
      setPortfolioReturn(prev => prev < portfolioData.portfolioReturn ? prev + 0.3 : portfolioData.portfolioReturn);
    }, 40);

    // Animate market return
    const marketTimer = setInterval(() => {
      setMarketReturn(prev => prev < portfolioData.marketReturn ? prev + 0.2 : portfolioData.marketReturn);
    }, 50);

    // Animate goal progress
    const goalTimer = setInterval(() => {
      setGoalProgress(prev => prev < portfolioData.goalProgress ? prev + 1.5 : portfolioData.goalProgress);
    }, 35);

    // Animate current value
    const valueTimer = setInterval(() => {
      setCurrentValue(prev => prev < portfolioData.currentValue ? prev + 2500 : portfolioData.currentValue);
    }, 25);

    return () => {
      clearInterval(healthTimer);
      clearInterval(portfolioTimer);
      clearInterval(marketTimer);
      clearInterval(goalTimer);
      clearInterval(valueTimer);
    };
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Animated Header */}
        <div className={`flex items-center justify-between transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
        }`}>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent animate-pulse">
              Portfolio Insights
            </h1>
            <p className="text-slate-400 mt-1">Simple overview of your investments</p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Button>
        </div>

        {/* Animated Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Health Score - Animated */}
          <Card className={`bg-slate-900/50 border border-slate-700/50 p-6 backdrop-blur-sm hover:bg-slate-900/70 transform hover:scale-105 transition-all duration-500 hover:shadow-2xl ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'
          }`} style={{ transitionDelay: '100ms' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-500/20 animate-pulse">
                <Shield className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Health Score</h3>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2 transition-all duration-300">
                {Math.round(healthScore)}/100
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 animate-bounce">
                Good Health
              </Badge>
            </div>

            <div className="mt-4 space-y-2">
              <div className={`flex items-center gap-2 text-sm text-slate-300 transition-all duration-700 ${
                healthScore > 40 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5'
              }`}>
                <CheckCircle className="h-4 w-4 text-green-400 animate-pulse" />
                <span>Balanced portfolio</span>
              </div>
              <div className={`flex items-center gap-2 text-sm text-slate-300 transition-all duration-700 ${
                healthScore > 70 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5'
              }`} style={{ transitionDelay: '200ms' }}>
                <CheckCircle className="h-4 w-4 text-green-400 animate-pulse" />
                <span>Good diversification</span>
              </div>
            </div>
          </Card>

          {/* Performance - Animated */}
          <Card className={`bg-slate-900/50 border border-slate-700/50 p-6 backdrop-blur-sm hover:bg-slate-900/70 transform hover:scale-105 transition-all duration-500 hover:shadow-2xl ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'
          }`} style={{ transitionDelay: '200ms' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/20 animate-pulse">
                <TrendingUp className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Performance</h3>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Your Return</span>
                <span className="text-2xl font-bold text-blue-400 transition-all duration-300">
                  +{portfolioReturn.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Market Return</span>
                <span className="text-xl text-slate-300 transition-all duration-300">
                  +{marketReturn.toFixed(1)}%
                </span>
              </div>
              
              <div className={`text-center p-3 bg-green-500/10 rounded-lg border border-green-500/30 transition-all duration-1000 ${
                portfolioReturn > marketReturn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}>
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4 text-green-400 animate-spin" />
                  <span className="text-green-400 font-semibold">
                    Beating market by +{Math.max(0, portfolioReturn - marketReturn).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Goal Progress - Animated */}
          <Card className={`bg-slate-900/50 border border-slate-700/50 p-6 backdrop-blur-sm hover:bg-slate-900/70 transform hover:scale-105 transition-all duration-500 hover:shadow-2xl ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
          }`} style={{ transitionDelay: '300ms' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-500/20 animate-pulse">
                <Target className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Goal Progress</h3>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Current</span>
                <span className="text-xl font-bold text-white transition-all duration-300">
                  ${currentValue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target</span>
                <span className="text-xl text-slate-300">${portfolioData.goalTarget.toLocaleString()}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Progress</span>
                  <span className="text-purple-400 transition-all duration-300">
                    {Math.round(goalProgress)}%
                  </span>
                </div>
                <Progress 
                  value={goalProgress} 
                  className="h-3 transition-all duration-1000 ease-out" 
                />
              </div>
            </div>
          </Card>

          {/* Quick Tips - Animated */}
          <Card className={`bg-slate-900/50 border border-slate-700/50 p-6 backdrop-blur-sm hover:bg-slate-900/70 transform hover:scale-105 transition-all duration-500 hover:shadow-2xl ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
          }`} style={{ transitionDelay: '400ms' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-yellow-500/20 animate-pulse">
                <Lightbulb className="h-6 w-6 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Quick Tips</h3>
            </div>

            <div className="space-y-3">
              <div className={`p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800/70 transition-all duration-300 transform hover:translate-x-2 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
              }`} style={{ transitionDelay: '600ms' }}>
                <div className="font-medium text-white mb-1">Keep holding</div>
                <div className="text-sm text-slate-400">Your portfolio is performing well</div>
              </div>
              <div className={`p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800/70 transition-all duration-300 transform hover:translate-x-2 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
              }`} style={{ transitionDelay: '700ms' }}>
                <div className="font-medium text-white mb-1">Consider bonds</div>
                <div className="text-sm text-slate-400">Add stability to your portfolio</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Animated Status Updates */}
        <Card className={`bg-slate-900/50 border border-slate-700/50 p-4 backdrop-blur-sm hover:bg-slate-900/70 transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`} style={{ transitionDelay: '500ms' }}>
          <h3 className="text-lg font-semibold text-white mb-3">Status Updates</h3>
          
          <div className="flex flex-wrap gap-4">
            <div className={`flex items-center gap-2 transition-all duration-500 hover:scale-110 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5'
            }`} style={{ transitionDelay: '800ms' }}>
              <CheckCircle className="h-4 w-4 text-green-400 animate-pulse" />
              <span className="text-sm text-slate-300">Portfolio is healthy</span>
            </div>
            <div className={`flex items-center gap-2 transition-all duration-500 hover:scale-110 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5'
            }`} style={{ transitionDelay: '900ms' }}>
              <Info className="h-4 w-4 text-blue-400 animate-pulse" />
              <span className="text-sm text-slate-300">Review due next week</span>
            </div>
            <div className={`flex items-center gap-2 transition-all duration-500 hover:scale-110 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5'
            }`} style={{ transitionDelay: '1000ms' }}>
              <AlertTriangle className="h-4 w-4 text-yellow-400 animate-pulse" />
              <span className="text-sm text-slate-300">High tech allocation</span>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}