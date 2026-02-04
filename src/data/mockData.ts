import {
  Asset,
  AssetType,
  MarketData,
  Alert,
  PortfolioSummary,
  AssetAllocation,
  PerformanceDataPoint,
  TopPerformer,
  UserSettings,
} from '@/types/portfolio';

export const assetTypes: AssetType[] = [
  { id: 1, code: 'STOCK', name: 'Stocks', description: 'Equity securities', risk_level: 'medium', is_active: true, created_date: '2024-01-01', updated_date: '2024-01-01' },
  { id: 2, code: 'BOND', name: 'Bonds', description: 'Fixed income securities', risk_level: 'low', is_active: true, created_date: '2024-01-01', updated_date: '2024-01-01' },
  { id: 3, code: 'CASH', name: 'Cash', description: 'Cash and equivalents', risk_level: 'low', is_active: true, created_date: '2024-01-01', updated_date: '2024-01-01' },
  { id: 4, code: 'CRYPTO', name: 'Cryptocurrency', description: 'Digital assets', risk_level: 'very_high', is_active: true, created_date: '2024-01-01', updated_date: '2024-01-01' },
];

export const mockAssets: Asset[] = [
  {
    id: 1, asset_type_id: 1, market_data_id: 1, status: 'active', symbol: 'AAPL', name: 'Apple Inc.',
    quantity: 50, purchase_price: 150.00, current_price: 178.50, purchase_date: '2023-06-15',
    target_price: 200.00, added_to_watchlist_date: null, price_alerts_enabled: true, notes: '',
    priority_rank: 1, sector: 'Technology', created_date: '2023-06-15', updated_date: '2024-01-15',
    total_value: 8925, gain_loss: 1425, gain_loss_percent: 19.00
  },
  {
    id: 2, asset_type_id: 1, market_data_id: 2, status: 'active', symbol: 'MSFT', name: 'Microsoft Corporation',
    quantity: 30, purchase_price: 280.00, current_price: 378.91, purchase_date: '2023-03-20',
    target_price: 400.00, added_to_watchlist_date: null, price_alerts_enabled: true, notes: '',
    priority_rank: 2, sector: 'Technology', created_date: '2023-03-20', updated_date: '2024-01-15',
    total_value: 11367.30, gain_loss: 2967.30, gain_loss_percent: 35.33
  },
  {
    id: 3, asset_type_id: 1, market_data_id: 3, status: 'active', symbol: 'GOOGL', name: 'Alphabet Inc.',
    quantity: 25, purchase_price: 120.00, current_price: 141.80, purchase_date: '2023-08-10',
    target_price: 160.00, added_to_watchlist_date: null, price_alerts_enabled: false, notes: '',
    priority_rank: 3, sector: 'Technology', created_date: '2023-08-10', updated_date: '2024-01-15',
    total_value: 3545, gain_loss: 545, gain_loss_percent: 18.17
  },
  {
    id: 4, asset_type_id: 1, market_data_id: 4, status: 'active', symbol: 'NVDA', name: 'NVIDIA Corporation',
    quantity: 20, purchase_price: 250.00, current_price: 547.10, purchase_date: '2023-01-05',
    target_price: 600.00, added_to_watchlist_date: null, price_alerts_enabled: true, notes: 'AI play',
    priority_rank: 1, sector: 'Technology', created_date: '2023-01-05', updated_date: '2024-01-15',
    total_value: 10942, gain_loss: 5942, gain_loss_percent: 118.84
  },
  {
    id: 5, asset_type_id: 1, market_data_id: 5, status: 'active', symbol: 'TSLA', name: 'Tesla Inc.',
    quantity: 15, purchase_price: 280.00, current_price: 248.50, purchase_date: '2023-07-01',
    target_price: 300.00, added_to_watchlist_date: null, price_alerts_enabled: true, notes: '',
    priority_rank: 4, sector: 'Automotive', created_date: '2023-07-01', updated_date: '2024-01-15',
    total_value: 3727.50, gain_loss: -472.50, gain_loss_percent: -11.25
  },
  {
    id: 6, asset_type_id: 2, market_data_id: 6, status: 'active', symbol: 'BND', name: 'Vanguard Total Bond ETF',
    quantity: 100, purchase_price: 72.50, current_price: 73.85, purchase_date: '2023-02-15',
    target_price: 78.00, added_to_watchlist_date: null, price_alerts_enabled: false, notes: '',
    priority_rank: 1, sector: 'Fixed Income', created_date: '2023-02-15', updated_date: '2024-01-15',
    total_value: 7385, gain_loss: 135, gain_loss_percent: 1.86
  },
  {
    id: 7, asset_type_id: 2, market_data_id: 7, status: 'active', symbol: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF',
    quantity: 80, purchase_price: 100.00, current_price: 95.20, purchase_date: '2023-04-10',
    target_price: 110.00, added_to_watchlist_date: null, price_alerts_enabled: false, notes: '',
    priority_rank: 2, sector: 'Fixed Income', created_date: '2023-04-10', updated_date: '2024-01-15',
    total_value: 7616, gain_loss: -384, gain_loss_percent: -4.80
  },
  {
    id: 8, asset_type_id: 3, market_data_id: 8, status: 'active', symbol: 'CASH', name: 'Cash Holdings',
    quantity: 1, purchase_price: 25000.00, current_price: 25000.00, purchase_date: '2024-01-01',
    target_price: 25000.00, added_to_watchlist_date: null, price_alerts_enabled: false, notes: 'Emergency fund',
    priority_rank: 1, sector: 'Cash', created_date: '2024-01-01', updated_date: '2024-01-15',
    total_value: 25000, gain_loss: 0, gain_loss_percent: 0
  },
  {
    id: 9, asset_type_id: 4, market_data_id: 9, status: 'active', symbol: 'BTC', name: 'Bitcoin',
    quantity: 0.5, purchase_price: 35000.00, current_price: 43250.00, purchase_date: '2023-09-01',
    target_price: 60000.00, added_to_watchlist_date: null, price_alerts_enabled: true, notes: '',
    priority_rank: 1, sector: 'Cryptocurrency', created_date: '2023-09-01', updated_date: '2024-01-15',
    total_value: 21625, gain_loss: 4125, gain_loss_percent: 23.57
  },
  {
    id: 10, asset_type_id: 4, market_data_id: 10, status: 'active', symbol: 'ETH', name: 'Ethereum',
    quantity: 5, purchase_price: 1800.00, current_price: 2580.00, purchase_date: '2023-10-15',
    target_price: 3000.00, added_to_watchlist_date: null, price_alerts_enabled: true, notes: '',
    priority_rank: 2, sector: 'Cryptocurrency', created_date: '2023-10-15', updated_date: '2024-01-15',
    total_value: 12900, gain_loss: 3900, gain_loss_percent: 43.33
  },
];

export const portfolioSummary: PortfolioSummary = {
  total_value: 113032.80,
  total_invested: 95250.00,
  total_gain_loss: 17782.80,
  total_gain_loss_percent: 18.67,
  daily_change: 1245.50,
  daily_change_percent: 1.11,
};

export const assetAllocation: AssetAllocation[] = [
  { type: 'STOCK', value: 38506.80, percentage: 34.1, count: 5 },
  { type: 'BOND', value: 15001.00, percentage: 13.3, count: 2 },
  { type: 'CASH', value: 25000.00, percentage: 22.1, count: 1 },
  { type: 'CRYPTO', value: 34525.00, percentage: 30.5, count: 2 },
];

export const performanceHistory: PerformanceDataPoint[] = [
  { date: '2023-07-01', value: 85000, gain_loss: -5000 },
  { date: '2023-08-01', value: 87500, gain_loss: -2500 },
  { date: '2023-09-01', value: 82000, gain_loss: -8000 },
  { date: '2023-10-01', value: 88000, gain_loss: -2000 },
  { date: '2023-11-01', value: 95000, gain_loss: 5000 },
  { date: '2023-12-01', value: 102000, gain_loss: 12000 },
  { date: '2024-01-01', value: 108000, gain_loss: 18000 },
  { date: '2024-01-15', value: 113032.80, gain_loss: 17782.80 },
];

export const topPerformers: TopPerformer[] = [
  { symbol: 'NVDA', name: 'NVIDIA Corporation', gain_loss_percent: 118.84, gain_loss: 5942, asset_type: 'STOCK' },
  { symbol: 'ETH', name: 'Ethereum', gain_loss_percent: 43.33, gain_loss: 3900, asset_type: 'CRYPTO' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', gain_loss_percent: 35.33, gain_loss: 2967.30, asset_type: 'STOCK' },
  { symbol: 'BTC', name: 'Bitcoin', gain_loss_percent: 23.57, gain_loss: 4125, asset_type: 'CRYPTO' },
  { symbol: 'AAPL', name: 'Apple Inc.', gain_loss_percent: 19.00, gain_loss: 1425, asset_type: 'STOCK' },
];

export const mockAlerts: Alert[] = [
  {
    id: 1, asset_id: 4, asset_symbol: 'NVDA', asset_name: 'NVIDIA Corporation',
    alert_type: 'price_above', threshold_value: 550, current_value: 547.10,
    is_triggered: false, triggered_at: null, is_active: true, created_date: '2024-01-10',
    message: 'NVDA approaching target price of $550'
  },
  {
    id: 2, asset_id: 5, asset_symbol: 'TSLA', asset_name: 'Tesla Inc.',
    alert_type: 'price_below', threshold_value: 250, current_value: 248.50,
    is_triggered: true, triggered_at: '2024-01-14T10:30:00Z', is_active: true, created_date: '2024-01-05',
    message: 'TSLA dropped below $250 - consider buying more or reviewing position'
  },
  {
    id: 3, asset_id: 9, asset_symbol: 'BTC', asset_name: 'Bitcoin',
    alert_type: 'percent_change', threshold_value: 5, current_value: 3.2,
    is_triggered: false, triggered_at: null, is_active: true, created_date: '2024-01-08',
    message: 'BTC daily movement alert set at 5%'
  },
  {
    id: 4, asset_id: 7, asset_symbol: 'TLT', asset_name: 'iShares 20+ Year Treasury Bond ETF',
    alert_type: 'price_below', threshold_value: 95, current_value: 95.20,
    is_triggered: false, triggered_at: null, is_active: true, created_date: '2024-01-12',
    message: 'TLT approaching support level at $95'
  },
];

export const userSettings: UserSettings = {
  id: 1,
  user_name: 'John Doe',
  default_currency: 'USD',
  timezone: 'America/New_York',
  date_format: 'MM/DD/YYYY',
  decimal_places: 2,
  theme: 'dark',
  notifications_enabled: true,
  price_alerts_enabled: true,
  created_date: '2024-01-01',
  updated_date: '2024-01-15',
};
