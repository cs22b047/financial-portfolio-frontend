// Asset Types based on database schema
export type AssetTypeCode = 'STOCK' | 'BOND' | 'CASH' | 'CRYPTO';
export type AssetStatus = 'OWNED' | 'WATCHLIST' | 'RESEARCH' | 'SOLD' | 'active' | 'sold' | 'watching';
export type TransactionType = 'buy' | 'sell' | 'dividend' | 'transfer';
export type RiskLevel = 'low' | 'medium' | 'high' | 'very_high' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
export type Sentiment = 'positive' | 'negative' | 'neutral';

export interface AssetType {
  id: number;
  code: AssetTypeCode;
  name: string;
  description: string;
  risk_level: RiskLevel;
  is_active: boolean;
  created_date: string;
  updated_date: string;
}

export interface MarketData {
  id: number;
  assetType: AssetType;
  symbol: string;
  name: string;
  currentPrice: number;
  previousClose: number;
  dayChange: number;
  dayChangePercent: number;
  volume: number;
  dayHigh: number;
  dayLow: number;
  week52High: number;
  week52Low: number;
  marketCap: number;
  bidPrice: number;
  askPrice: number;
  sector: string;
  industry: string;
  exchange: string;
  currency: string;
  dividendYield: number;
  peRatio: number;
  beta: number;
  eps: number;
  dataSource: string;
  lastUpdated: string;
  marketStatus: string;
  createdDate: string;
  updatedDate: string;
}

export interface Asset {
  id: number;
  asset_type_id: number;
  market_data_id: number;
  status: AssetStatus;
  symbol: string;
  name: string;
  quantity: number;
  purchase_price: number;
  current_price: number;
  purchase_date: string;
  target_price: number;
  added_to_watchlist_date: string | null;
  price_alerts_enabled: boolean;
  notes: string;
  priority_rank: number;
  sector: string;
  created_date: string;
  updated_date: string;
  // Computed/joined fields
  asset_type?: AssetType;
  market_data?: MarketData;
  total_value?: number;
  gain_loss?: number;
  gain_loss_percent?: number;
}

export interface Transaction {
  id: number;
  asset_id: number;
  transaction_type: TransactionType;
  quantity: number;
  price: number;
  transaction_date: string;
  fees: number;
  notes: string;
  currency: string;
  created_date: string;
  updated_date: string;
}

export interface PriceHistory {
  id: number;
  market_data_id: number;
  price_date: string;
  open_price: number;
  high_price: number;
  low_price: number;
  close_price: number;
  adjusted_close: number;
  volume: number;
  source: string;
  created_date: string;
  data_source: string;
}

export interface Dividend {
  id: number;
  asset_id: number;
  payment_date: string;
  amount_per_share: number;
  shares_held: number;
  total_amount: number;
  currency: string;
  created_at: string;
}

export interface UserSettings {
  id: number;
  user_name: string;
  default_currency: string;
  timezone: string;
  date_format: string;
  decimal_places: number;
  theme: string;
  notifications_enabled: boolean;
  price_alerts_enabled: boolean;
  created_date: string;
  updated_date: string;
}

export interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  is_crypto: boolean;
  is_active: boolean;
  created_date: string;
  updated_date: string;
  decimal_places: number;
  exchange_rate_to_usd: number;
  is_fiat: boolean;
  rate_updated_at: string;
}

export interface News {
  id: number;
  market_data_id: number;
  symbol: string;
  title: string;
  summary: string;
  link: string;
  image_url: string;
  source: string;
  publisher: string;
  published_date: string;
  sentiment: Sentiment;
  is_read: boolean;
  created_date: string;
}

export interface Alert {
  id: number;
  asset_id: number;
  asset_symbol: string;
  asset_name: string;
  alert_type: 'price_above' | 'price_below' | 'percent_change' | 'volume_spike';
  threshold_value: number;
  current_value: number;
  is_triggered: boolean;
  triggered_at: string | null;
  is_active: boolean;
  created_date: string;
  message: string;
}

// Dashboard specific types
export interface PortfolioSummary {
  total_value: number;
  total_invested: number;
  total_gain_loss: number;
  total_gain_loss_percent: number;
  daily_change: number;
  daily_change_percent: number;
}

export interface AssetAllocation {
  type: AssetTypeCode;
  value: number;
  percentage: number;
  count: number;
}

export interface PerformanceDataPoint {
  date: string;
  value: number;
  gain_loss: number;
}

export interface TopPerformer {
  symbol: string;
  name: string;
  gain_loss_percent: number;
  gain_loss: number;
  asset_type: AssetTypeCode;
}
