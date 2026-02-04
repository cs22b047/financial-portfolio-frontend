import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useSettings } from '@/context/SettingsContext';
import { Button } from '@/components/ui/button';
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
  User,
  Globe,
  Palette,
  Save,
  RefreshCw,
  Wallet,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const { settings, loading, updateSettings } = useSettings();
  const [isSaving, setIsSaving] = useState(false);
  
  // Local form state
  const [formData, setFormData] = useState({
    userName: '',
    currency: 'USD',
    defaultCurrency: 'USD',
    theme: 'dark',
    timeZone: 'America/New_York',
    wallet: 0,
  });

  // Update form when settings load
  useEffect(() => {
    if (settings) {
      setFormData({
        userName: settings.userName || '',
        currency: settings.currency || 'USD',
        defaultCurrency: settings.defaultCurrency || 'USD',
        theme: settings.theme || 'dark',
        timeZone: settings.timeZone || 'America/New_York',
        wallet: settings.wallet || 0,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(formData);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Manage your account preferences</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="bg-primary hover:bg-primary/90">
            {isSaving ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>

        {/* Profile Section */}
        <div className="rounded-xl bg-card border border-border/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Profile</h3>
              <p className="text-sm text-muted-foreground">Your personal information</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                className="bg-secondary border-border"
                placeholder="Enter your name"
              />
            </div>
          </div>
        </div>

        {/* Wallet Section */}
        <div className="rounded-xl bg-card border border-border/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Wallet className="h-5 w-5 text-success" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Wallet</h3>
              <p className="text-sm text-muted-foreground">Available funds for trading</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wallet">Current Balance</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="wallet"
                  type="number"
                  step="0.01"
                  value={formData.wallet}
                  onChange={(e) => setFormData({ ...formData, wallet: parseFloat(e.target.value) || 0 })}
                  className="bg-secondary border-border pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Available balance: ${formData.wallet.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Regional Settings */}
        <div className="rounded-xl bg-card border border-border/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
              <Globe className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Regional Settings</h3>
              <p className="text-sm text-muted-foreground">Customize your locale preferences</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                  <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Default Currency</Label>
              <Select
                value={formData.defaultCurrency}
                onValueChange={(value) => setFormData({ ...formData, defaultCurrency: value })}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                  <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Timezone</Label>
              <Select
                value={formData.timeZone}
                onValueChange={(value) => setFormData({ ...formData, timeZone: value })}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                  <SelectItem value="Europe/London">London (GMT)</SelectItem>
                  <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                  <SelectItem value="Asia/Hong_Kong">Hong Kong (HKT)</SelectItem>
                  <SelectItem value="Asia/Kolkata">Mumbai (IST)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="rounded-xl bg-card border border-border/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
              <Palette className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Appearance</h3>
              <p className="text-sm text-muted-foreground">Customize the look and feel</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select
              value={formData.theme}
              onValueChange={(value) => setFormData({ ...formData, theme: value })}
            >
              <SelectTrigger className="w-[200px] bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Changes take effect immediately after saving
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
