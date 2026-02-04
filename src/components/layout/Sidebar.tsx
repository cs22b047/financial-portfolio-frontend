import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  LayoutDashboard,
  Wallet,
  Bell,
  Settings,
  PieChart,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/', 
    icon: LayoutDashboard,
    description: 'Overview & Analytics',
    gradient: 'from-blue-500 to-purple-600'
  },
  { 
    name: 'Portfolio', 
    href: '/assets', 
    icon: Wallet,
    description: 'Asset Management',
    gradient: 'from-green-500 to-emerald-600'
  },
  { 
    name: 'Alerts', 
    href: '/alerts', 
    icon: Bell,
    description: 'Smart Notifications',
    gradient: 'from-yellow-500 to-orange-600'
  },
  { 
    name: 'Insights', 
    href: '/ai', 
    icon: Sparkles,
    description: 'Portfolio Insights',
    gradient: 'from-cyan-500 to-blue-600'
  },
  { 
    name: 'Settings', 
    href: '/settings', 
    icon: Settings,
    description: 'Preferences',
    gradient: 'from-gray-500 to-slate-600'
  },
];

export function Sidebar() {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [totalValue, setTotalValue] = useState(0);
  const [todayPL, setTodayPL] = useState(0);
  const [todayPLPercent, setTodayPLPercent] = useState(0);
  const [totalGainLossPercent, setTotalGainLossPercent] = useState(0);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  const formatCurrency = (value: number) => `$${Math.abs(value).toLocaleString()}`;

  useEffect(() => {
    const controller = new AbortController();

    const fetchSidebarStats = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/assets`, { signal: controller.signal });
        if (!response.ok) return;
        const assetsData = await response.json();

        const ownedAssets = assetsData.filter((asset: any) => asset.status === 'OWNED');
        let total = 0;
        let today = 0;
        let prevTotal = 0;
        let totalInvested = 0;

        ownedAssets.forEach((asset: any) => {
          const quantity = Number(asset.quantity || 0);
          const currentPrice = Number(
            asset.currentPrice ?? asset.current_price ?? asset.marketData?.currentPrice ?? asset.market_data?.current_price ?? 0
          );
          const dayChange = Number(
            asset.dayChange ?? asset.day_change ?? asset.marketData?.dayChange ?? asset.market_data?.day_change ?? 0
          );
          const previousClose = Number(
            asset.previousClose ?? asset.previous_close ?? asset.marketData?.previousClose ?? asset.market_data?.previous_close ??
              (currentPrice - dayChange)
          );

          const change = dayChange || (currentPrice - previousClose);
          total += quantity * currentPrice;
          today += quantity * change;
          prevTotal += quantity * (previousClose || (currentPrice - change));
          totalInvested += quantity * Number(asset.purchasePrice ?? asset.purchase_price ?? 0);
        });

        const percent = prevTotal > 0 ? (today / prevTotal) * 100 : 0;
        const totalPercent = totalInvested > 0 ? ((total - totalInvested) / totalInvested) * 100 : 0;

        setTotalValue(total);
        setTodayPL(today);
        setTodayPLPercent(percent);
        setTotalGainLossPercent(totalPercent);
      } catch (error) {
        if ((error as { name?: string })?.name === 'AbortError') return;
      }
    };

    fetchSidebarStats();

    return () => {
      controller.abort();
    };
  }, [apiUrl]);

  return (
    <aside className="fixed left-0 top-0 z-50 h-screen w-72 glass-card border-r border-border/50">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-2/5 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
      
      <div className="relative flex h-full flex-col">
        {/* Logo Section */}
        <div className="flex h-20 items-center gap-4 px-6 border-b border-border/30">
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-chart-2 shadow-lg">
              <PieChart className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-background animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gradient">PortfolioX</h1>
            <p className="text-xs text-muted-foreground">Pro Trading Suite</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="px-6 py-4 border-b border-border/30">
          <div className="grid grid-cols-2 gap-3">
            <div className="glass rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Total Value</div>
              <div className={cn(
                'text-sm font-bold',
                totalValue >= 0 ? 'text-success' : 'text-destructive'
              )}>
                {formatCurrency(totalValue)}
              </div>
              <div className={cn(
                'text-xs',
                totalGainLossPercent >= 0 ? 'text-success' : 'text-destructive'
              )}>
                {totalGainLossPercent >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}%
              </div>
            </div>
            <div className="glass rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Today</div>
              <div className={cn(
                'text-sm font-bold',
                todayPL >= 0 ? 'text-success' : 'text-destructive'
              )}>
                {todayPL >= 0 ? '+' : ''}{formatCurrency(todayPL)}
              </div>
              <div className={cn(
                'text-xs',
                todayPLPercent >= 0 ? 'text-success' : 'text-destructive'
              )}>
                {todayPLPercent >= 0 ? '+' : ''}{todayPLPercent.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
                className={cn(
                  'group relative flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300',
                  isActive
                    ? 'bg-primary/20 text-primary shadow-lg shadow-primary/20'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                )}
                
                {/* Icon with gradient background */}
                <div className={cn(
                  'relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300',
                  isActive 
                    ? `bg-gradient-to-br ${item.gradient} shadow-lg` 
                    : 'bg-sidebar-accent group-hover:bg-gradient-to-br group-hover:' + item.gradient
                )}>
                  <item.icon className={cn(
                    'h-5 w-5 transition-colors duration-300',
                    isActive ? 'text-white' : 'text-sidebar-foreground/70 group-hover:text-white'
                  )} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      'font-semibold transition-colors duration-300',
                      isActive && 'text-primary'
                    )}>
                      {item.name}
                    </span>
                    {hoveredItem === item.name && (
                      <ChevronRight className="h-4 w-4 text-muted-foreground animate-slide-up" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.description}
                  </p>
                </div>

                {/* Notification badge */}
                {item.name === 'Alerts' && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-pulse">
                    3
                  </div>
                )}

                {item.name === 'Insights' && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-[10px] font-bold text-white">
                    💡
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-border/30 p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-2 text-sm font-bold text-white shadow-lg">
                JD
              </div>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-background" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">John Doe</p>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                <p className="text-xs text-muted-foreground">Pro Trader</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </aside>
  );
}
