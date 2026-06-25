import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useListItems,
  useListStockIn,
  useRecordStockIn,
} from "@/hooks/useQueries";
import { useUrlParams } from "@/hooks/useUrlParams";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { ArrowDownLeft, Package, Plus, Search } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function StokMasukPage() {
  const { identity } = useInternetIdentity();
  const { data: items } = useListItems();
  const { data: stockInHistory, isLoading: historyLoading } = useListStockIn();
  const recordStockIn = useRecordStockIn();
  const { getParam, setParam } = useUrlParams();

  const [selectedItem, setSelectedItem] = useState<string>(
    getParam("item") || "",
  );
  const [quantity, setQuantity] = useState<string>(getParam("qty") || "");
  const [date, setDate] = useState<string>(
    getParam("date") || new Date().toISOString().split("T")[0],
  );
  const [notes, setNotes] = useState(getParam("notes") || "");
  const [searchHistory, setSearchHistory] = useState(getParam("search") || "");

  const isAuthenticated = !!identity;

  // Sync URL params
  useEffect(() => {
    setParam("item", selectedItem || null);
  }, [selectedItem, setParam]);
  useEffect(() => {
    setParam("qty", quantity || null);
  }, [quantity, setParam]);
  useEffect(() => {
    setParam("date", date || null);
  }, [date, setParam]);
  useEffect(() => {
    setParam("notes", notes || null);
  }, [notes, setParam]);
  useEffect(() => {
    setParam("search", searchHistory || null);
  }, [searchHistory, setParam]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !quantity || Number.parseInt(quantity) <= 0) {
      toast.error("Pilih barang dan masukkan jumlah yang valid");
      return;
    }

    recordStockIn.mutate(
      {
        itemId: BigInt(selectedItem),
        quantity: Number.parseInt(quantity),
        date: BigInt(new Date(date).getTime()) * 1_000_000n,
        notes: notes.trim() || null,
      },
      {
        onSuccess: () => {
          toast.success("Stok masuk berhasil dicatat");
          setSelectedItem("");
          setQuantity("");
          setNotes("");
        },
        onError: () => toast.error("Gagal mencatat stok masuk"),
      },
    );
  };

  const filteredHistory = stockInHistory?.filter((h) => {
    const itemName = items?.find((i) => i.id === h.itemId)?.name || "";
    return (
      itemName.toLowerCase().includes(searchHistory.toLowerCase()) ||
      h.note?.toLowerCase().includes(searchHistory.toLowerCase())
    );
  });

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <ArrowDownLeft className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-display font-bold mb-2">Stok Masuk</h2>
        <p className="text-muted-foreground max-w-md">
          Silakan masuk untuk mencatat stok masuk.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold">Stok Masuk</h1>
        <p className="text-muted-foreground text-sm">
          Catat barang masuk ke gudang
        </p>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Form Stok Masuk
            </CardTitle>
            <CardDescription>
              Pilih barang dan masukkan detail transaksi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Barang</Label>
                  <Select value={selectedItem} onValueChange={setSelectedItem}>
                    <SelectTrigger data-ocid="stock_in.item_select">
                      <SelectValue placeholder="Pilih barang" />
                    </SelectTrigger>
                    <SelectContent>
                      {items?.map((item) => (
                        <SelectItem
                          key={item.id.toString()}
                          value={item.id.toString()}
                        >
                          {item.name} ({item.sku})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qty">Jumlah</Label>
                  <Input
                    id="qty"
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0"
                    data-ocid="stock_in.quantity_input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Tanggal</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    data-ocid="stock_in.date_input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Keterangan</Label>
                  <Input
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Opsional"
                    data-ocid="stock_in.notes_input"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={recordStockIn.isPending}
                  data-ocid="stock_in.submit_button"
                >
                  <ArrowDownLeft className="h-4 w-4 mr-2" />
                  {recordStockIn.isPending
                    ? "Menyimpan..."
                    : "Catat Stok Masuk"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* History */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Riwayat Stok Masuk</CardTitle>
              <CardDescription>Daftar transaksi stok masuk</CardDescription>
            </div>
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari riwayat..."
                value={searchHistory}
                onChange={(e) => setSearchHistory(e.target.value)}
                className="pl-9"
                data-ocid="stock_in.history_search"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {historyLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static loading skeleton
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Barang</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Keterangan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory && filteredHistory.length > 0 ? (
                    filteredHistory.map((h, idx) => {
                      const item = items?.find((i) => i.id === h.itemId);
                      return (
                        <TableRow
                          key={h.id.toString()}
                          data-ocid={`stock_in.history.row.${idx + 1}`}
                        >
                          <TableCell>
                            {new Date(
                              Number(h.date) / 1_000_000,
                            ).toLocaleDateString("id-ID")}
                          </TableCell>
                          <TableCell className="font-medium">
                            {item?.name || "-"}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {item?.sku || "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="default" className="gap-1">
                              <ArrowDownLeft className="h-3 w-3" />+{h.quantity}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {h.note || "-"}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                      >
                        <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Belum ada riwayat stok masuk</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
