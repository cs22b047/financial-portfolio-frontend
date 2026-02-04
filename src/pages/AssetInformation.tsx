import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeft, TrendingUp, TrendingDown, AlertCircle, ExternalLink, Newspaper } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PriceHistoryChart } from '@/components/dashboard/PriceHistoryChart';
import { PriceHistory, News } from '@/types/portfolio';

interface MarketData {
  symbol: string;
  name: string;
  currentPrice: number;
  previousClose: number;
  dayChange: number;
  dayChangePercent: number;
  dayHigh: number;
  dayLow: number;
  week52High: number;
  week52Low: number;
  volume: number;
  marketCap: number;
  peRatio: number;
  dividendYield: number;
  sector: string;
  industry: string;
  exchange: string;
  currency: string;
}

interface ESGRating {
  symbol: string;
  totalScore: number;
  totalGrade: string;
  environmentScore: number;
  environmentGrade: string;
  socialScore: number;
  socialGrade: string;
  governanceScore: number;
  governanceGrade: string;
  controversyLevel: number;
  riskLevel: string;
  lastUpdated: string;
}

export default function AssetInformation() {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [esgRating, setEsgRating] = useState<ESGRating | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Buy/Sell dialog states
  const [buyOpen, setBuyOpen] = useState(false);
  const [sellOpen, setSellOpen] = useState(false);
  const [buyQuantity, setBuyQuantity] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [buyDate, setBuyDate] = useState(new Date().toISOString().split('T')[0]);
  const [sellQuantity, setSellQuantity] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [sellDate, setSellDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);

  useEffect(() => {
    fetchAssetData();
  }, [symbol]);

  // Auto-fill buy price with current market price when dialog opens
  useEffect(() => {
    if (buyOpen && marketData) {
      setBuyPrice(marketData.currentPrice.toString());
    }
  }, [buyOpen, marketData]);

  // Auto-fill sell price with current market price when dialog opens
  useEffect(() => {
    if (sellOpen && marketData) {
      setSellPrice(marketData.currentPrice.toString());
    }
  }, [sellOpen, marketData]);

  const buyTotal = useMemo(() => {
    const qty = parseFloat(buyQuantity) || 0;
    const price = parseFloat(buyPrice) || 0;
    return (qty * price).toFixed(2);
  }, [buyQuantity, buyPrice]);

  const sellTotal = useMemo(() => {
    const qty = parseFloat(sellQuantity) || 0;
    const price = parseFloat(sellPrice) || 0;
    return (qty * price).toFixed(2);
  }, [sellQuantity, sellPrice]);

  const handleBuySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTransactionError(null);

    try {
      if (!buyQuantity || !buyPrice || !buyDate || !symbol) {
        throw new Error('All fields are required');
      }

      const payload = {
        symbol: symbol,
        quantity: parseFloat(buyQuantity),
        price: parseFloat(buyPrice),
        date: buyDate,
      };

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
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

      // Reset form and close dialog
      setBuyQuantity('');
      setBuyPrice('');
      setBuyDate(new Date().toISOString().split('T')[0]);
      setBuyOpen(false);
      
      // Refresh data
      fetchAssetData();
    } catch (err) {
      setTransactionError(err instanceof Error ? err.message : 'An error occurred');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSellSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTransactionError(null);

    try {
      if (!sellQuantity || !sellPrice || !sellDate || !symbol) {
        throw new Error('All fields are required');
      }

      const payload = {
        symbol: symbol,
        quantity: parseFloat(sellQuantity),
        price: parseFloat(sellPrice),
        date: sellDate,
      };

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/api/assets/sell`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to sell asset');
      }

      // Reset form and close dialog
      setSellQuantity('');
      setSellPrice('');
      setSellDate(new Date().toISOString().split('T')[0]);
      setSellOpen(false);
      
      // Refresh data
      fetchAssetData();
    } catch (err) {
      setTransactionError(err instanceof Error ? err.message : 'An error occurred');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchAssetData = async () => {
    if (!symbol) {
      setError('No symbol provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

      // Fetch market data
      const marketResponse = await fetch(`${apiUrl}/api/market-data/symbol/${symbol}`);
      if (marketResponse.ok) {
        const marketDataRes = await marketResponse.json();
        setMarketData(marketDataRes);
      }

      // Fetch ESG ratings
      const esgResponse = await fetch(`${apiUrl}/api/esg-ratings/symbol/${symbol}`);
      if (esgResponse.ok) {
        const esgDataRes = await esgResponse.json();
        setEsgRating(esgDataRes);
      }

      // Fetch price history
      const priceHistoryResponse = await fetch(`${apiUrl}/api/price-history/symbol/${symbol}`);
      if (priceHistoryResponse.ok) {
        const priceHistoryData = await priceHistoryResponse.json();
        setPriceHistory(priceHistoryData);
      }

      // Fetch news
      const newsResponse = await fetch(`${apiUrl}/api/news/symbol/${symbol}`);
      if (newsResponse.ok) {
        const newsData = await newsResponse.json();
        // Sort by date descending and take top 6
        const sortedNews = newsData.sort((a: News, b: News) => 
          new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
        ).slice(0, 6);
        setNews(sortedNews);
      }
    } catch (err) {
      setError('Failed to load asset information');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-success bg-success/20';
    if (grade.startsWith('B')) return 'text-blue-500 bg-blue-500/20';
    if (grade.startsWith('C')) return 'text-warning bg-warning/20';
    return 'text-destructive bg-destructive/20';
  };

  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined) return 'N/A';
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/assets')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Assets
            </Button>
          </div>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading asset information...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !marketData) {
    return (
      <MainLayout>
        <div className="space-y-4 animate-fade-in">
          <Button variant="ghost" size="sm" onClick={() => navigate('/assets')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Assets
          </Button>
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Error Loading Asset
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error || 'Asset information not found'}</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/assets')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Assets
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{marketData.name}</h1>
              <p className="text-muted-foreground">{marketData.symbol}{marketData.sector ? ` • ${marketData.sector}` : ''}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="bg-success hover:bg-success/90" onClick={() => setBuyOpen(true)}>
              Buy {marketData.symbol}
            </Button>
            <Button className="bg-destructive hover:bg-destructive/90" onClick={() => setSellOpen(true)}>
              Sell {marketData.symbol}
            </Button>
          </div>
        </div>

        {/* Market Price Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Market Price</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Current Price</p>
                <p className="text-4xl font-bold text-foreground">
                  {marketData.currentPrice ? `$${marketData.currentPrice.toFixed(2)}` : 'N/A'}
                </p>
              </div>
              <div className={cn('p-4 rounded-lg', marketData.dayChange >= 0 ? 'bg-success/10' : 'bg-destructive/10')}>
                <p className="text-sm text-muted-foreground">Today's Change</p>
                <div className="flex items-center gap-2 mt-2">
                  {(marketData.dayChange || 0) >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-success" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-destructive" />
                  )}
                  <span className={cn('text-2xl font-bold', (marketData.dayChange || 0) >= 0 ? 'text-success' : 'text-destructive')}>
                    {marketData.dayChange ? `${marketData.dayChange >= 0 ? '+' : ''}${marketData.dayChange.toFixed(2)} (${marketData.dayChangePercent >= 0 ? '+' : ''}${marketData.dayChangePercent.toFixed(2)}%)` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Price Range */}
        <Card>
          <CardHeader>
            <CardTitle>Price Range</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Today High</p>
                <p className="text-lg font-semibold">{marketData.dayHigh ? `$${marketData.dayHigh.toFixed(2)}` : 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Today Low</p>
                <p className="text-lg font-semibold">{marketData.dayLow ? `$${marketData.dayLow.toFixed(2)}` : 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">52 Week High</p>
                <p className="text-lg font-semibold">{marketData.week52High ? `$${marketData.week52High.toFixed(2)}` : 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">52 Week Low</p>
                <p className="text-lg font-semibold">{marketData.week52Low ? `$${marketData.week52Low.toFixed(2)}` : 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Market Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Market Cap</p>
                <p className="text-lg font-semibold">${formatNumber(marketData.marketCap)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Volume</p>
                <p className="text-lg font-semibold">{formatNumber(marketData.volume)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">P/E Ratio</p>
                <p className="text-lg font-semibold">{marketData.peRatio?.toFixed(2) || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dividend Yield</p>
                <p className="text-lg font-semibold">{marketData.dividendYield?.toFixed(2) || 'N/A'}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Exchange</p>
                <p className="text-lg font-semibold">{marketData.exchange || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Industry</p>
                <p className="text-lg font-semibold">{marketData.industry || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Price History Chart */}
        <PriceHistoryChart data={priceHistory} symbol={symbol || ''} />

        {/* ESG Ratings */}
        {esgRating && (
          <Card>
            <CardHeader>
              <CardTitle>ESG Ratings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overall ESG Score */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Overall ESG Score</p>
                    <p className="text-4xl font-bold mt-2">{esgRating.totalScore.toFixed(1)}/100</p>
                  </div>
                  <div className={cn('text-5xl font-bold p-4 rounded-lg', getGradeColor(esgRating.totalGrade))}>
                    {esgRating.totalGrade}
                  </div>
                </div>
              </div>

              {/* ESG Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground uppercase font-medium">Environment</p>
                  <p className="text-3xl font-bold mt-2">{esgRating.environmentScore}</p>
                  <p className={cn('text-sm font-semibold mt-2', getGradeColor(esgRating.environmentGrade))}>
                    Grade: {esgRating.environmentGrade}
                  </p>
                </div>
                <div className="border border-border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground uppercase font-medium">Social</p>
                  <p className="text-3xl font-bold mt-2">{esgRating.socialScore}</p>
                  <p className={cn('text-sm font-semibold mt-2', getGradeColor(esgRating.socialGrade))}>
                    Grade: {esgRating.socialGrade}
                  </p>
                </div>
                <div className="border border-border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground uppercase font-medium">Governance</p>
                  <p className="text-3xl font-bold mt-2">{esgRating.governanceScore}</p>
                  <p className={cn('text-sm font-semibold mt-2', getGradeColor(esgRating.governanceGrade))}>
                    Grade: {esgRating.governanceGrade}
                  </p>
                </div>
              </div>

              {/* ESG Risk & Controversy */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Risk Level</p>
                  <p className="text-lg font-semibold mt-2">{esgRating.riskLevel}</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Controversy Level</p>
                  <p className="text-lg font-semibold mt-2">{esgRating.controversyLevel}/4</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* News Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="h-5 w-5" />
              Latest News
              {news.length > 0 && (
                <span className="text-xs font-normal text-muted-foreground ml-auto">
                  {news.length} article{news.length !== 1 ? 's' : ''}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {news.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Newspaper className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No recent news articles available for {marketData.name}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {news.map((article) => (
                  <div
                    key={article.id}
                    className="border border-border rounded-lg p-4 hover:bg-secondary/50 transition-colors group"
                  >
                    {/* Article Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      {article.sentiment && (
                        <span
                          className={cn(
                            'text-xs px-2 py-0.5 rounded-full shrink-0',
                            article.sentiment === 'positive' && 'bg-green-500/20 text-green-600',
                            article.sentiment === 'negative' && 'bg-red-500/20 text-red-600',
                            article.sentiment === 'neutral' && 'bg-gray-500/20 text-gray-600'
                          )}
                        >
                          {article.sentiment}
                        </span>
                      )}
                    </div>

                    {/* Article Summary */}
                    {article.summary && (
                      <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
                        {article.summary}
                      </p>
                    )}

                    {/* Article Footer */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        {article.source && (
                          <span className="font-medium">{article.source}</span>
                        )}
                        {article.publishedDate && (
                          <span>
                            {new Date(article.publishedDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        )}
                      </div>
                      {article.link && (
                        <a
                          href={article.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Read
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Buy Dialog */}
        <Dialog open={buyOpen} onOpenChange={setBuyOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Buy {symbol}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleBuySubmit} className="space-y-4">
              {transactionError && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {transactionError}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter quantity to buy"
                  value={buyQuantity}
                  onChange={(e) => setBuyQuantity(e.target.value)}
                  className="bg-secondary border-border"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Price per Unit</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter price"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  className="bg-secondary border-border"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Current market price: {marketData?.currentPrice ? `$${marketData.currentPrice.toFixed(2)}` : 'N/A'}
                </p>
              </div>

              <div className="rounded-md bg-secondary/50 p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Total Cost:</span>
                  <span className="text-lg font-bold">${buyTotal}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Purchase Date</label>
                <Input
                  type="date"
                  value={buyDate}
                  onChange={(e) => setBuyDate(e.target.value)}
                  className="bg-secondary border-border"
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBuyOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-success hover:bg-success/90"
                  disabled={submitting || !buyQuantity || !buyPrice}
                >
                  {submitting ? 'Processing...' : 'Confirm Buy'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Sell Dialog */}
        <Dialog open={sellOpen} onOpenChange={setSellOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Sell {symbol}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSellSubmit} className="space-y-4">
              {transactionError && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {transactionError}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter quantity to sell"
                  value={sellQuantity}
                  onChange={(e) => setSellQuantity(e.target.value)}
                  className="bg-secondary border-border"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Price per Unit</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter price"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  className="bg-secondary border-border"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Current market price: {marketData?.currentPrice ? `$${marketData.currentPrice.toFixed(2)}` : 'N/A'}
                </p>
              </div>

              <div className="rounded-md bg-secondary/50 p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Total Proceeds:</span>
                  <span className="text-lg font-bold">${sellTotal}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Sale Date</label>
                <Input
                  type="date"
                  value={sellDate}
                  onChange={(e) => setSellDate(e.target.value)}
                  className="bg-secondary border-border"
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSellOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-destructive hover:bg-destructive/90"
                  disabled={submitting || !sellQuantity || !sellPrice}
                >
                  {submitting ? 'Processing...' : 'Confirm Sell'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
