import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { mockAssets, assetTypes } from '@/data/mockData';
import { Asset, AssetTypeCode } from '@/types/portfolio';
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
import { Search, ArrowUpDown, TrendingUp, TrendingDown, Filter } from 'lucide-react';

type SortField = 'symbol' | 'total_value' | 'gain_loss_percent' | 'quantity';
type SortDirection = 'asc' | 'desc';

export default function Assets() {
  const [searchQuery, setSearchQuery] = useState('');
  const [assetTypeFilter, setAssetTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('total_value');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const filteredAssets = useMemo(() => {
    let result = [...mockAssets];

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
  }, [searchQuery, assetTypeFilter, statusFilter, sortField, sortDirection]);

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
    BOND: 'bg-success/20 text-success',
    CASH: 'bg-warning/20 text-warning',
    CRYPTO: 'bg-chart-3/20 text-chart-3',
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
          <Button className="bg-primary hover:bg-primary/90">
            + Add Asset
          </Button>
        </div>

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
              <SelectItem value="STOCK">Stocks</SelectItem>
              <SelectItem value="BOND">Bonds</SelectItem>
              <SelectItem value="CASH">Cash</SelectItem>
              <SelectItem value="CRYPTO">Crypto</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] bg-secondary border-border">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
              <SelectItem value="watching">Watching</SelectItem>
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
                <TableHead className="text-muted-foreground text-right">Price</TableHead>
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
                <TableRow key={asset.id} className="border-border hover:bg-secondary/50">
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
                  <TableCell className="text-right font-medium">{asset.quantity}</TableCell>
                  <TableCell className="text-right">${asset.current_price.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-semibold">${asset.total_value?.toLocaleString()}</TableCell>
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
                      ${asset.gain_loss?.toLocaleString()}
                    </p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {filteredAssets.length} of {mockAssets.length} assets</span>
        </div>
      </div>
    </MainLayout>
  );
}
