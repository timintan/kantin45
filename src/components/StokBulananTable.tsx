import { useState, useMemo, useEffect, Fragment } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRp } from '@/lib/wib';
import { ChevronDown, ChevronRight, Package } from 'lucide-react';
import { apiGet, type Product } from '@/lib/api';

interface StokItem {
  nama: string;
  qty: number;
  hargaBeli: number;
  totalModal: number;
}

interface StokBulan {
  bulan: string;
  bulanFull: string;
  jumlahItem: number;
  totalModalStok: number;
  items: StokItem[];
}

interface Props {
  data: any[];
  year: string;
}

const BULAN_FULL = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const BULAN_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export default function StokBulananTable({ data, year }: Props) {
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    apiGet<Product[]>('getProduk').then(p => {
      setProducts(Array.isArray(p) ? p : []);
    }).catch(() => setProducts([]));
  }, []);

  const stokBulanan = useMemo<StokBulan[]>(() => {
    if (products.length === 0) return BULAN_FULL.map((bulanFull, i) => ({
      bulan: BULAN_SHORT[i], bulanFull, jumlahItem: 0, totalModalStok: 0, items: []
    }));

    const soldPerMonth: Record<string, number[]> = {};

    data.forEach(t => {
      const d = new Date(t.tanggal);
      if (isNaN(d.getTime())) return;
      const wib = new Date(d.getTime() + 7 * 3600000);
      const m = wib.getUTCMonth();
      const yr = wib.getUTCFullYear();
      if (String(yr) !== year) return;

      (t.items || []).forEach((item: any) => {
        const key = item.nama || item.id || 'unknown';
        if (!soldPerMonth[key]) soldPerMonth[key] = new Array(12).fill(0);
        soldPerMonth[key][m] += item.qty || 1;
      });
    });

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return BULAN_FULL.map((bulanFull, monthIdx) => {
      const bulan = BULAN_SHORT[monthIdx];

      if (String(currentYear) === year && monthIdx > currentMonth) {
        return { bulan, bulanFull, jumlahItem: 0, totalModalStok: 0, items: [] };
      }

      const items: StokItem[] = products.map(p => {
        const key = p.nama;
        const monthlySold = soldPerMonth[key] || new Array(12).fill(0);

        let soldAfter = 0;
        for (let m = monthIdx + 1; m < 12; m++) {
          soldAfter += monthlySold[m];
        }

        const endStock = p.stok + soldAfter;

        return {
          nama: p.nama,
          qty: endStock,
          hargaBeli: p.hargaBeli,
          totalModal: endStock * p.hargaBeli,
        };
      }).filter(item => item.qty > 0);

      const jumlahItem = items.reduce((s, i) => s + i.qty, 0);
      const totalModalStok = items.reduce((s, i) => s + i.totalModal, 0);

      return { bulan, bulanFull, jumlahItem, totalModalStok, items };
    });
  }, [data, year, products]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Package className="h-[18px] w-[18px] text-primary" />
          Stok Barang Akhir Bulan — {year}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-6 sm:pt-0">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2.5 text-xs font-semibold text-muted-foreground w-8"></th>
                <th className="text-left p-2.5 text-xs font-semibold text-muted-foreground">Bulan</th>
                <th className="text-right p-2.5 text-xs font-semibold text-muted-foreground">Jumlah Item</th>
                <th className="text-right p-2.5 text-xs font-semibold text-muted-foreground">Total Modal Stok</th>
              </tr>
            </thead>
            <tbody>
              {stokBulanan.map((m, idx) => (
                <Fragment key={idx}>
                  <tr
                    className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setExpandedMonth(expandedMonth === idx ? null : idx)}
                  >
                    <td className="p-2.5">
                      {m.items.length > 0 ? (
                        expandedMonth === idx ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      ) : null}
                    </td>
                    <td className="p-2.5 font-medium">{m.bulanFull}</td>
                    <td className="p-2.5 text-right">{m.jumlahItem}</td>
                    <td className="p-2.5 text-right font-semibold text-primary">{formatRp(m.totalModalStok)}</td>
                  </tr>
                  {expandedMonth === idx && m.items.length > 0 && (
                    <tr>
                      <td colSpan={4} className="p-0">
                        <div className="bg-muted/30 p-3">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-1.5 text-muted-foreground">Produk</th>
                                <th className="text-right p-1.5 text-muted-foreground">Stok</th>
                                <th className="text-right p-1.5 text-muted-foreground">Harga Beli</th>
                                <th className="text-right p-1.5 text-muted-foreground">Total Modal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {m.items.map((item, i) => (
                                <tr key={i} className="border-b last:border-b-0">
                                  <td className="p-1.5">{item.nama}</td>
                                  <td className="p-1.5 text-right">{item.qty}</td>
                                  <td className="p-1.5 text-right">{formatRp(item.hargaBeli)}</td>
                                  <td className="p-1.5 text-right font-semibold">{formatRp(item.totalModal)}</td>
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
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
