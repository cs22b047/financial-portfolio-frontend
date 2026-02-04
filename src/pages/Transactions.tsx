 import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, ArrowDownRight, ArrowUpRight, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TransactionAsset {
  symbol?: string;
  name?: string;
  marketData?: {
    symbol?: string;
    name?: string;
  };
}

interface TransactionItem {
  id: number;
  transactionType: 'BUY' | 'SELL' | 'DIVIDEND' | 'TRANSFER';
  quantity: number | null;
  price: number | null;
  transactionDate: string;
  totalValue?: number;
  totalCostWithFees?: number;
  asset?: TransactionAsset;
}

export default function Transactions() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5500';
        const response = await fetch(`${apiUrl}/api/transactions`);
        if (!response.ok) throw new Error('Failed to fetch transactions');
        const data = await response.json();
        const sorted = data.sort((a: TransactionItem, b: TransactionItem) =>
          new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
        );
        setTransactions(sorted);
      } catch (err) {
        setError('Failed to load transactions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const rows = useMemo(() => {
    return transactions.map((tx) => {
      const symbol = tx.asset?.marketData?.symbol || tx.asset?.symbol || 'N/A';
      const name = tx.asset?.marketData?.name || tx.asset?.name || '';
      const quantity = Number(tx.quantity || 0);
      const price = Number(tx.price || 0);
      const total = tx.totalValue ?? tx.totalCostWithFees ?? (tx.transactionType === 'DIVIDEND' ? price : quantity * price);

      return {
        ...tx,
        symbol,
        name,
        quantity,
        price,
        total,
      };
    });
  }, [transactions]);

  const renderTypeBadge = (type: TransactionItem['transactionType']) => {
    if (type === 'BUY') return <Badge className="bg-success/20 text-success border-success/30">BUY</Badge>;
    if (type === 'SELL') return <Badge className="bg-destructive/20 text-destructive border-destructive/30">SELL</Badge>;
    if (type === 'DIVIDEND') return <Badge className="bg-primary/20 text-primary border-primary/30">DIVIDEND</Badge>;
    return <Badge variant="outline">{type}</Badge>;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}
                className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            </div>
            <h1 className="text-3xl font-bold">Transactions</h1>
            <p className="text-sm text-muted-foreground">All portfolio activity</p>
          </div>
        </div>

        {error && (
          <div className="text-sm text-destructive">{error}</div>
        )}

        <div className="rounded-xl border border-border/50 bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Loading transactions...
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      {new Date(tx.transactionDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>{renderTypeBadge(tx.transactionType)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {tx.transactionType === 'BUY' ? (
                          <ArrowUpRight className="h-4 w-4 text-success" />
                        ) : tx.transactionType === 'SELL' ? (
                          <ArrowDownRight className="h-4 w-4 text-destructive" />
                        ) : (
                          <DollarSign className="h-4 w-4 text-primary" />
                        )}
                        <div>
                          <div className="font-medium">{tx.symbol}</div>
                          {tx.name && (
                            <div className="text-xs text-muted-foreground">{tx.name}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{tx.transactionType === 'DIVIDEND' ? '-' : tx.quantity.toFixed(2)}</TableCell>
                    <TableCell>${tx.price.toFixed(2)}</TableCell>
                    <TableCell className="font-semibold">${tx.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </MainLayout>
  );
}
