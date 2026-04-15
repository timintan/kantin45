import { useState, useMemo, Fragment } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRp } from '@/lib/wib';
import { ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';

interface Props {
  data: any[];
  year: string;
}

const BULAN_FULL = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const BULAN_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

interface LossItem {
  nama: string;
  hilang: number;
  hargaBeli: number;
  totalLoss: number;
}

interface LossBulan {
  bulan: string;
  bulanFull: string;
  totalLoss: number;
  items: LossItem[];
}

export default function LossProfitBulanan({ data, year }: Props) {
  const { products } = useStore();
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);

  const lossBulanan = useMemo<LossBulan[]>(() => {
    return BULAN_FULL.map((bulanFull, idx) => ({
      bulan: BULAN_SHORT[idx],
      bulanFull,
      totalLoss: 0,
      items: [],
    }));
  }, [data, year, products]);

  const totalLoss = lossBulanan.reduce((s, m) => s + m.totalLoss, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertCircle className="h-[18px] w-[18px] text-destructive" />
          Loss Profit Bulanan — {year}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-6 sm:pt-0">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2.5 text-xs font-semibold text-muted-foreground w-8"></th>
                <th className="text-left p-2.5 text-xs font-semibold text-muted-foreground">Bulan</th>
                <th className="text-right p-2.5 text-xs font-semibold text-muted-foreground">Total Loss</th>
              </tr>
            </thead>
            <tbody>
              {lossBulanan.map((m, idx) => (
                <Fragment key={idx}>
                  <tr
                    className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setExpandedMonth(expandedMonth === idx ? null : idx)}
                  >
                    <td className="p-2.5">
                      {m.items.length > 0 ? (
                        expandedMonth === idx ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                      ) : null}
                    </td>
                    <td className="p-2.5 font-medium">{m.bulanFull}</td>
                    <td className={`p-2.5 text-right font-semibold ${m.totalLoss > 0 ? 'text-destructive' : ''}`}>{formatRp(m.totalLoss)}</td>
                  </tr>
                  {expandedMonth === idx && m.items.length > 0 && (
                    <tr>
                      <td colSpan={3} className="p-0">
                        <div className="bg-destructive/5 p-3">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-1.5 text-muted-foreground">Produk</th>
                                <th className="text-right p-1.5 text-muted-foreground">Hilang</th>
                                <th className="text-right p-1.5 text-muted-foreground">Harga Beli</th>
                                <th className="text-right p-1.5 text-muted-foreground">Total Loss</th>
                              </tr>
                            </thead>
                            <tbody>
                              {m.items.map((item, i) => (
                                <tr key={i} className="border-b last:border-b-0">
                                  <td className="p-1.5">{item.nama}</td>
                                  <td className="p-1.5 text-right text-destructive">{item.hilang}</td>
                                  <td className="p-1.5 text-right">{formatRp(item.hargaBeli)}</td>
                                  <td className="p-1.5 text-right font-semibold text-destructive">{formatRp(item.totalLoss)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              <tr className="border-t-2 font-bold">
                <td className="p-2.5" colSpan={2}>Total Loss</td>
                <td className="p-2.5 text-right text-destructive">{formatRp(totalLoss)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
