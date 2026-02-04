import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Alert, Asset } from '@/types/portfolio';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Bell,
  BellOff,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Plus,
  Check,
  X,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';

const alertTypeIcons = {
  ABOVE: TrendingUp,
  BELOW: TrendingDown,
};

const alertTypeLabels = {
  ABOVE: 'Price Above',
  BELOW: 'Price Below',
};

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [direction, setDirection] = useState<'ABOVE' | 'BELOW'>('ABOVE');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  useEffect(() => {
    fetchAlerts();
    fetchAssets();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/alerts`);
      if (response.ok) {
        const data = await response.json();
        setAlerts(data);
      }
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/assets`);
      if (response.ok) {
        const data = await response.json();
        setAssets(data.filter((a: Asset) => a.status === 'OWNED'));
      }
    } catch (err) {
      console.error('Failed to fetch assets:', err);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/api/alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assetId: parseInt(selectedAssetId),
          targetPrice: parseFloat(targetPrice),
          aboveOrBelow: direction,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create alert');
      }

      // Reset form and close dialog
      setSelectedAssetId('');
      setTargetPrice('');
      setDirection('ABOVE');
      setDialogOpen(false);
      
      // Refresh alerts
      fetchAlerts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteAlert = async (id: number) => {
    try {
      const response = await fetch(`${apiUrl}/api/alerts/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setAlerts(alerts.filter(alert => alert.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete alert:', err);
    }
  };

  const resetAlert = async (id: number) => {
    try {
      const response = await fetch(`${apiUrl}/api/alerts/${id}/reset`, {
        method: 'PATCH',
      });
      
      if (response.ok) {
        const updated = await response.json();
        setAlerts(alerts.map(alert => alert.id === id ? updated : alert));
      }
    } catch (err) {
      console.error('Failed to reset alert:', err);
    }
  };

  const activeAlerts = alerts.filter(a => !a.triggered);
  const triggeredAlerts = alerts.filter(a => a.triggered);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading alerts...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Price Alerts</h1>
            <p className="text-muted-foreground">Monitor your assets with custom alerts</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => setDialogOpen(true)}>
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
                        <span className="font-semibold text-foreground">{alert.asset.symbol}</span>
                        <Badge variant="outline" className="text-warning border-warning/30">
                          Triggered
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {alertTypeLabels[alert.aboveOrBelow]}: ${alert.targetPrice.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(alert.updatedDate), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resetAlert(alert.id)}
                      className="text-xs"
                    >
                      Reset
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteAlert(alert.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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
            {alerts.length === 0 ? (
              <div className="p-12 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No alerts yet. Create your first alert to get started.</p>
              </div>
            ) : (
              alerts.map((alert) => {
                const Icon = alertTypeIcons[alert.aboveOrBelow];
                return (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-xl',
                        alert.aboveOrBelow === 'ABOVE' && 'bg-success/10',
                        alert.aboveOrBelow === 'BELOW' && 'bg-destructive/10'
                      )}>
                        <Icon className={cn(
                          'h-5 w-5',
                          alert.aboveOrBelow === 'ABOVE' && 'text-success',
                          alert.aboveOrBelow === 'BELOW' && 'text-destructive'
                        )} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{alert.asset.symbol}</span>
                          <span className="text-sm text-muted-foreground">{alert.asset.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {alertTypeLabels[alert.aboveOrBelow]}: ${alert.targetPrice.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Created: {format(new Date(alert.createdDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        variant={alert.triggered ? 'default' : 'outline'}
                        className={cn(
                          alert.triggered
                            ? 'bg-warning text-warning-foreground'
                            : 'text-muted-foreground'
                        )}
                      >
                        {alert.triggered ? 'Triggered' : 'Watching'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteAlert(alert.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Create Alert Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Price Alert</DialogTitle>
              <DialogDescription>
                Set up a price alert for your assets. You'll be notified when the price reaches your target.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAlert} className="space-y-4 mt-4">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="asset">Asset</Label>
                <Select value={selectedAssetId} onValueChange={setSelectedAssetId} required>
                  <SelectTrigger id="asset">
                    <SelectValue placeholder="Select an asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {assets.map((asset) => (
                      <SelectItem key={asset.id} value={asset.id.toString()}>
                        {asset.symbol} - {asset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetPrice">Target Price ($)</Label>
                <Input
                  id="targetPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Enter target price"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="direction">Alert When Price Goes</Label>
                <Select value={direction} onValueChange={(v) => setDirection(v as 'ABOVE' | 'BELOW')}>
                  <SelectTrigger id="direction">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ABOVE">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-success" />
                        Above Target
                      </div>
                    </SelectItem>
                    <SelectItem value="BELOW">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-destructive" />
                        Below Target
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Alert'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
