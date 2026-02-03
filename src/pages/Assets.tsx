import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { mockAssets, assetTypes } from '@/data/mockData';
import { Asset, AssetTypeCode, MarketData } from '@/types/portfolio';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Search, ArrowUpDown, TrendingUp, TrendingDown, Filter } from 'lucide-react';

type SortField = 'symbol' | 'total_value' | 'gain_loss_percent' | 'quantity';
type SortDirection = 'asc' | 'desc';

interface AddAssetFormData {
  action: 'buy' | 'watchlist';
  symbol: string;
  quantity: string;
  price: string;
  date: string;
  targetPrice: string;
}

// Add Asset Form Component
function AddAssetDialog() {
  const [open, setOpen] = useState(false);
  const [marketDataList, setMarketDataList] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<AddAssetFormData>({
    action: 'buy',
    symbol: '',
    quantity: '',
    price: '',
    date: new Date().toISOString().split('T')[0],
    targetPrice: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch market data on dialog open
  useEffect(() => {
    if (open && marketDataList.length === 0) {
      fetchMarketData();
    }
  }, [open]);

  const fetchMarketData = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/api/market-data`);
      if (!response.ok) throw new Error('Failed to fetch market data');
      const data = await response.json();
      setMarketDataList(data);
    } catch (err) {
      setError('Failed to load market data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSymbolChange = (symbol: string) => {
    setFormData(prev => ({ ...prev, symbol }));
    // Auto-fill price from market data
    const marketData = marketDataList.find(m => m.symbol === symbol);
    if (marketData) {
      setFormData(prev => ({
        ...prev,
        price: marketData.currentPrice.toString(),
      }));
    }
  };

  const handleQuantityChange = (quantity: string) => {
    setFormData(prev => ({ ...prev, quantity }));
  };

  const handlePriceChange = (price: string) => {
    setFormData(prev => ({ ...prev, price }));
  };

  const handleDateChange = (date: string) => {
    setFormData(prev => ({ ...prev, date }));
  };

  const totalPrice = useMemo(() => {
    const qty = parseFloat(formData.quantity) || 0;
    const price = parseFloat(formData.price) || 0;
    return (qty * price).toFixed(2);
  }, [formData.quantity, formData.price]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      
      if (formData.action === 'buy') {
        // Validate form data for buy
        if (!formData.symbol || !formData.quantity || !formData.price || !formData.date) {
          throw new Error('All fields are required');
        }

        const payload = {
          symbol: formData.symbol,
          quantity: parseFloat(formData.quantity),
          price: parseFloat(formData.price),
          date: formData.date,
        };

        const response = await fetch(`${apiUrl}/api/assets/buy`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to buy asset');
        }
      } else {
        // Watchlist mode
        if (!formData.symbol) {
          throw new Error('Symbol is required');
        }

        const payload = {
          symbol: formData.symbol,
          targetPrice: formData.targetPrice ? parseFloat(formData.targetPrice) : null,
        };

        const response = await fetch(`${apiUrl}/api/assets/watchlist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to add to watchlist');
        }
      }

      // Reset form and close dialog
      setFormData({
        action: 'buy',
        symbol: '',
        quantity: '',
        price: '',
        date: new Date().toISOString().split('T')[0],
        targetPrice: '',
      });
      setOpen(false);
      // Trigger page refresh to show new asset
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedMarketData = marketDataList.find(m => m.symbol === formData.symbol);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          + Add Asset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Asset</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Action Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Action</label>
            <Select value={formData.action} onValueChange={(value: 'buy' | 'watchlist') => setFormData(prev => ({ ...prev, action: value }))}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buy">Buy Asset</SelectItem>
                <SelectItem value="watchlist">Add to Watchlist</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Asset Symbol Dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Asset</label>
            <Select value={formData.symbol} onValueChange={handleSymbolChange} disabled={loading}>
              <SelectTrigger className="bg-secondary border-border w-full">
                <SelectValue placeholder={loading ? 'Loading...' : 'Select an asset'} />
              </SelectTrigger>
              <SelectContent className="w-[600px]">
                {marketDataList.map((market) => (
                  <SelectItem key={market.id} value={market.symbol} className="truncate">
                    <span className="truncate">
                      {market.name} ({market.symbol})
                      {market.assetType?.code ? ` • ${market.assetType.code}` : ''}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Display selected asset info */}
          {selectedMarketData && (
            <div className="rounded-md bg-secondary/50 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Price:</span>
                <span className="font-medium">${selectedMarketData.currentPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium">{selectedMarketData.assetType?.name || selectedMarketData.assetType?.code || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sector/Category:</span>
                <span className="font-medium">
                  {selectedMarketData.sector || selectedMarketData.industry || 'N/A'}
                </span>
              </div>
            </div>
          )}

          {/* Conditional Fields based on Action */}
          {formData.action === 'buy' ? (
            <>
              {/* Quantity Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter quantity"
                  value={formData.quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  className="bg-secondary border-border"
                  required
                />
              </div>

              {/* Price Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Price per Unit</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter price"
                  value={formData.price}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  className="bg-secondary border-border"
                  required
                />
              </div>

              {/* Total Price Display */}
              <div className="rounded-md bg-secondary/50 p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Total Price:</span>
                  <span className="text-lg font-bold">${totalPrice}</span>
                </div>
              </div>

              {/* Date Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Purchase Date</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="bg-secondary border-border"
                  required
                />
              </div>
            </>
          ) : (
            <>
              {/* Target Price Input for Watchlist */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Price (Optional)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter target price"
                  value={formData.targetPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetPrice: e.target.value }))}
                  className="bg-secondary border-border"
                />
                <p className="text-xs text-muted-foreground">
                  Set a target price to get alerts when the asset reaches this level.
                </p>
              </div>
            </>
          )}

          {/* Submit Button */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={
                submitting || 
                !formData.symbol || 
                (formData.action === 'buy' && (!formData.quantity || !formData.price))
              }
            >
              {submitting 
                ? (formData.action === 'buy' ? 'Buying...' : 'Adding...') 
                : (formData.action === 'buy' ? 'Buy Asset' : 'Add to Watchlist')
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Assets() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [assetTypeFilter, setAssetTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('total_value');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch assets from API
  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/api/assets`);
      if (!response.ok) throw new Error('Failed to fetch assets');
      const data = await response.json();
      // Map API response to frontend format with null safety
      const assetsWithCalculations = data.map((asset: any) => {
        const currentPrice = asset.currentPrice || 0;
        const purchasePrice = asset.purchasePrice || 0;
        const quantity = asset.quantity || 0;
        return {
          id: asset.id,
          symbol: asset.symbol,
          name: asset.name || asset.marketData?.name || '',
          status: asset.status,
          quantity: quantity,
          purchase_price: purchasePrice,
          current_price: currentPrice,
          purchase_date: asset.purchaseDate,
          sector: asset.sector || asset.marketData?.sector || '',
          asset_type_id: asset.assetType?.id || 1,
          market_data_id: asset.marketData?.id,
          target_price: asset.targetPrice,
          added_to_watchlist_date: asset.addedToWatchlistDate,
          price_alerts_enabled: asset.priceAlertsEnabled,
          notes: asset.notes,
          priority_rank: asset.priorityRank,
          created_date: asset.createdDate,
          updated_date: asset.updatedDate,
          total_value: quantity * currentPrice,
          gain_loss: purchasePrice > 0 ? (currentPrice - purchasePrice) * quantity : 0,
          gain_loss_percent: purchasePrice > 0 ? ((currentPrice - purchasePrice) / purchasePrice) * 100 : 0,
        };
      });
      setAssets(assetsWithCalculations);
    } catch (err) {
      setError('Failed to load assets');
      console.error(err);
      // Fallback to mock data
      setAssets(mockAssets);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssets = useMemo(() => {
    let result = [...assets];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (asset) =>
          asset.symbol.toLowerCase().includes(query) ||
          asset.name.toLowerCase().includes(query) ||
          asset.sector.toLowerCase().includes(query)
      );
    }

    // Asset type filter
    if (assetTypeFilter !== 'all') {
      const typeId = assetTypes.find(t => t.code === assetTypeFilter)?.id;
      result = result.filter((asset) => asset.asset_type_id === typeId);
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((asset) => asset.status === statusFilter);
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'symbol':
          comparison = a.symbol.localeCompare(b.symbol);
          break;
        case 'total_value':
          comparison = (a.total_value || 0) - (b.total_value || 0);
          break;
        case 'gain_loss_percent':
          comparison = (a.gain_loss_percent || 0) - (b.gain_loss_percent || 0);
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [searchQuery, assetTypeFilter, statusFilter, sortField, sortDirection, assets]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getAssetTypeName = (typeId: number) => {
    return assetTypes.find(t => t.id === typeId)?.name || 'Unknown';
  };

  const getAssetTypeCode = (typeId: number): AssetTypeCode => {
    return (assetTypes.find(t => t.id === typeId)?.code || 'STOCK') as AssetTypeCode;
  };

  const TYPE_COLORS = {
    STOCK: 'bg-chart-2/20 text-chart-2',
    ETF: 'bg-primary/20 text-primary',
    BOND: 'bg-success/20 text-success',
    CASH: 'bg-warning/20 text-warning',
    CRYPTO: 'bg-chart-3/20 text-chart-3',
    MUTUAL_FUND: 'bg-purple-500/20 text-purple-400',
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Assets</h1>
            <p className="text-muted-foreground">Manage and track all your assets</p>
          </div>
          <AddAssetDialog />
        </div>

        {/* Error Display */}
        {error && (
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="rounded-md bg-secondary/50 p-4 text-center text-muted-foreground">
            Loading assets...
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>
          <Select value={assetTypeFilter} onValueChange={setAssetTypeFilter}>
            <SelectTrigger className="w-[150px] bg-secondary border-border">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Asset Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="STOCK">Stock</SelectItem>
              <SelectItem value="ETF">ETF</SelectItem>
              <SelectItem value="CRYPTO">Crypto</SelectItem>
              <SelectItem value="BOND">Bond</SelectItem>
              <SelectItem value="CASH">Cash</SelectItem>
              <SelectItem value="MUTUAL_FUND">Mutual Fund</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] bg-secondary border-border">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="OWNED">Owned</SelectItem>
              <SelectItem value="WATCHLIST">Watchlist</SelectItem>
              <SelectItem value="RESEARCH">Research</SelectItem>
              <SelectItem value="SOLD">Sold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-xl bg-card border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('symbol')}
                    className="h-auto p-0 font-medium hover:bg-transparent hover:text-foreground"
                  >
                    Asset
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-muted-foreground">Type</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground text-right">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('quantity')}
                    className="h-auto p-0 font-medium hover:bg-transparent hover:text-foreground"
                  >
                    Quantity
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-muted-foreground text-right">Purchase Price</TableHead>
                <TableHead className="text-muted-foreground text-right">Current Price</TableHead>
                <TableHead className="text-muted-foreground text-right">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('total_value')}
                    className="h-auto p-0 font-medium hover:bg-transparent hover:text-foreground"
                  >
                    Value
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-muted-foreground text-right">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('gain_loss_percent')}
                    className="h-auto p-0 font-medium hover:bg-transparent hover:text-foreground"
                  >
                    Gain/Loss
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.map((asset) => (
                <TableRow 
                  key={asset.id} 
                  className="border-border hover:bg-secondary/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/asset-info/${asset.symbol}`)}
                >
                  <TableCell>
                    <div>
                      <span className="font-semibold text-foreground">{asset.symbol}</span>
                      <p className="text-xs text-muted-foreground">{asset.name}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      'rounded-full px-2 py-1 text-xs font-medium',
                      TYPE_COLORS[getAssetTypeCode(asset.asset_type_id)]
                    )}>
                      {getAssetTypeName(asset.asset_type_id)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      'rounded-full px-2 py-1 text-xs font-medium',
                      asset.status === 'OWNED' && 'bg-success/20 text-success',
                      asset.status === 'WATCHLIST' && 'bg-blue-500/20 text-blue-500',
                      asset.status === 'RESEARCH' && 'bg-warning/20 text-warning',
                      asset.status === 'SOLD' && 'bg-muted text-muted-foreground'
                    )}>
                      {asset.status || 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">{(asset.quantity || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell className="text-right">${(asset.purchase_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell className="text-right">${(asset.current_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell className="text-right font-semibold">${(asset.total_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell className="text-right">
                    <div className={cn(
                      'flex items-center justify-end gap-1',
                      (asset.gain_loss_percent || 0) >= 0 ? 'text-success' : 'text-destructive'
                    )}>
                      {(asset.gain_loss_percent || 0) >= 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span className="font-semibold">
                        {(asset.gain_loss_percent || 0) >= 0 ? '+' : ''}
                        {asset.gain_loss_percent?.toFixed(2)}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      ${(asset.gain_loss || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {filteredAssets.length} of {assets.length} assets</span>
        </div>
      </div>
    </MainLayout>
  );
}
