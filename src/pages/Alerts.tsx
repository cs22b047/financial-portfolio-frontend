import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { mockAlerts } from '@/data/mockData';
import { Alert } from '@/types/portfolio';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  BellOff,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Activity,
  Plus,
  Check,
  X,
} from 'lucide-react';
import { format } from 'date-fns';

const alertTypeIcons = {
  price_above: TrendingUp,
  price_below: TrendingDown,
  percent_change: Activity,
  volume_spike: AlertTriangle,
};

const alertTypeLabels = {
  price_above: 'Price Above',
  price_below: 'Price Below',
  percent_change: 'Percent Change',
  volume_spike: 'Volume Spike',
};

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);

  const toggleAlert = (id: number) => {
    setAlerts(alerts.map(alert =>
      alert.id === id ? { ...alert, is_active: !alert.is_active } : alert
    ));
  };

  const dismissAlert = (id: number) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const activeAlerts = alerts.filter(a => a.is_active);
  const triggeredAlerts = alerts.filter(a => a.is_triggered);

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Price Alerts</h1>
            <p className="text-muted-foreground">Monitor your assets with custom alerts</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Create Alert
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-card p-5 border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold text-foreground">{activeAlerts.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Bell className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-card p-5 border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Triggered</p>
                <p className="text-2xl font-bold text-warning">{triggeredAlerts.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-card p-5 border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold text-muted-foreground">
                  {alerts.length - activeAlerts.length}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                <BellOff className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>

        {/* Triggered Alerts */}
        {triggeredAlerts.length > 0 && (
          <div className="rounded-xl bg-warning/5 border border-warning/20 p-4">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <h3 className="font-semibold text-warning">Triggered Alerts</h3>
            </div>
            <div className="space-y-3">
              {triggeredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-card border border-border"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                      <Check className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{alert.asset_symbol}</span>
                        <Badge variant="outline" className="text-warning border-warning/30">
                          Triggered
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      {alert.triggered_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Triggered: {format(new Date(alert.triggered_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => dismissAlert(alert.id)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Alerts */}
        <div className="rounded-xl bg-card border border-border/50 overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-card-foreground">All Alerts</h3>
            <p className="text-sm text-muted-foreground">Manage your price alerts</p>
          </div>
          <div className="divide-y divide-border">
            {alerts.map((alert) => {
              const Icon = alertTypeIcons[alert.alert_type];
              return (
                <div
                  key={alert.id}
                  className={cn(
                    'flex items-center justify-between p-5 transition-colors',
                    !alert.is_active && 'opacity-50'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-xl',
                      alert.alert_type === 'price_above' && 'bg-success/10',
                      alert.alert_type === 'price_below' && 'bg-destructive/10',
                      alert.alert_type === 'percent_change' && 'bg-chart-2/10',
                      alert.alert_type === 'volume_spike' && 'bg-warning/10'
                    )}>
                      <Icon className={cn(
                        'h-5 w-5',
                        alert.alert_type === 'price_above' && 'text-success',
                        alert.alert_type === 'price_below' && 'text-destructive',
                        alert.alert_type === 'percent_change' && 'text-chart-2',
                        alert.alert_type === 'volume_spike' && 'text-warning'
                      )} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{alert.asset_symbol}</span>
                        <span className="text-sm text-muted-foreground">{alert.asset_name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {alertTypeLabels[alert.alert_type]}: ${alert.threshold_value.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Current: ${alert.current_value.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant={alert.is_triggered ? 'default' : 'outline'}
                      className={cn(
                        alert.is_triggered
                          ? 'bg-warning text-warning-foreground'
                          : 'text-muted-foreground'
                      )}
                    >
                      {alert.is_triggered ? 'Triggered' : 'Watching'}
                    </Badge>
                    <Switch
                      checked={alert.is_active}
                      onCheckedChange={() => toggleAlert(alert.id)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
