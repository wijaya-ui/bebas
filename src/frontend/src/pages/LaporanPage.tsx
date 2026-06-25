import { Variant_in_out } from "@/backend";
import { Badge } from "@/components/ui/badge";
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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGetMovementReport,
  useGetStockReport,
  useListItems,
} from "@/hooks/useQueries";
import { useUrlParams } from "@/hooks/useUrlParams";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  Package,
  Search,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

const CATEGORIES = [
  "Elektronik",
  "Pakaian",
  "Makanan",
  "Minuman",
  "Obat",
  "Alat Tulis",
  "Lainnya",
];

export default function LaporanPage() {
  const { identity } = useInternetIdentity();
  const { getParam, setParam } = useUrlParams();

  const [activeTab, setActiveTab] = useState<string>(
    getParam("tab") || "stock",
  );
  const [stockCategory, setStockCategory] = useState<string>(
    getParam("category") || "all",
  );
  const [stockStatus, setStockStatus] = useState<string>(
    getParam("status") || "all",
  );
  const [movementStart, setMovementStart] = useState<string>(
    getParam("start") ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
  );
  const [movementEnd, setMovementEnd] = useState<string>(
    getParam("end") || new Date().toISOString().split("T")[0],
  );
  const [searchStock, setSearchStock] = useState(getParam("search") || "");

  const isAuthenticated = !!identity;

  // Sync URL params
  useEffect(() => {
    setParam("tab", activeTab);
  }, [activeTab, setParam]);
  useEffect(() => {
    setParam("category", stockCategory);
  }, [stockCategory, setParam]);
  useEffect(() => {
    setParam("status", stockStatus);
  }, [stockStatus, setParam]);
  useEffect(() => {
    setParam("start", movementStart);
  }, [movementStart, setParam]);
  useEffect(() => {
    setParam("end", movementEnd);
  }, [movementEnd, setParam]);
  useEffect(() => {
    setParam("search", searchStock || null);
  }, [searchStock, setParam]);

  const { data: stockReport, isLoading: stockLoading } = useGetStockReport(
    stockCategory === "all" ? undefined : stockCategory,
    stockStatus === "all" ? undefined : stockStatus,
  );

  const startTimestamp = BigInt(new Date(movementStart).getTime()) * 1_000_000n;
  const endTimestamp = BigInt(new Date(movementEnd).getTime()) * 1_000_000n;
  const { data: movementReport, isLoading: movementLoading } =
    useGetMovementReport(startTimestamp, endTimestamp);

  const filteredStock = stockReport?.filter(
    (item) =>
      item.name.toLowerCase().includes(searchStock.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchStock.toLowerCase()),
  );

  // Calculate totals per category
  const categoryTotals = filteredStock?.reduce(
    (acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.currentStock;
      return acc;
    },
    {} as Record<string, number>,
  );

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-display font-bold mb-2">Laporan</h2>
        <p className="text-muted-foreground max-w-md">
          Silakan masuk untuk melihat laporan stok.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold">Laporan Stok</h1>
        <p className="text-muted-foreground text-sm">
          Lihat laporan stok dan pergerakan barang
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList data-ocid="report.tabs">
          <TabsTrigger value="stock" data-ocid="report.tab.stock">
            <Package className="h-4 w-4 mr-2" />
            Stok Barang
          </TabsTrigger>
          <TabsTrigger value="movement" data-ocid="report.tab.movement">
            <ArrowDownLeft className="h-4 w-4 mr-2" />
            Pergerakan Stok
          </TabsTrigger>
        </TabsList>

        {/* Stock Report */}
        <TabsContent value="stock" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama atau SKU..."
                  value={searchStock}
                  onChange={(e) => setSearchStock(e.target.value)}
                  className="pl-9"
                  data-ocid="report.stock_search"
                />
              </div>
              <Select value={stockCategory} onValueChange={setStockCategory}>
                <SelectTrigger
                  className="w-[160px]"
                  data-ocid="report.stock_category_filter"
                >
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={stockStatus} onValueChange={setStockStatus}>
                <SelectTrigger
                  className="w-[140px]"
                  data-ocid="report.stock_status_filter"
                >
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="safe">Stok Aman</SelectItem>
                  <SelectItem value="low">Stok Rendah</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardContent className="p-0">
                {stockLoading ? (
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders are static and index is stable
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Kategori</TableHead>
                          <TableHead className="text-right">Stok</TableHead>
                          <TableHead className="text-right">Min</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStock && filteredStock.length > 0 ? (
                          filteredStock.map((item, idx) => (
                            <TableRow
                              key={item.id.toString()}
                              data-ocid={`report.stock.row.${idx + 1}`}
                            >
                              <TableCell className="font-medium">
                                {item.name}
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {item.sku}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="text-xs">
                                  {item.category}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {item.currentStock}
                              </TableCell>
                              <TableCell className="text-right text-muted-foreground">
                                {item.minStock}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    item.status === "low"
                                      ? "destructive"
                                      : "default"
                                  }
                                  className="text-xs"
                                >
                                  {item.status === "low" ? "Rendah" : "Aman"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="text-center py-8 text-muted-foreground"
                            >
                              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">
                                Tidak ada data yang cocok dengan filter
                              </p>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                      {categoryTotals &&
                        Object.keys(categoryTotals).length > 0 && (
                          <TableFooter>
                            <TableRow>
                              <TableCell colSpan={3} className="font-medium">
                                Total per Kategori
                              </TableCell>
                              <TableCell colSpan={3}>
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(categoryTotals).map(
                                    ([cat, total]) => (
                                      <Badge
                                        key={cat}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {cat}: {total}
                                      </Badge>
                                    ),
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          </TableFooter>
                        )}
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Movement Report */}
        <TabsContent value="movement" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Date filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-xs">
                  Dari Tanggal
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={movementStart}
                  onChange={(e) => setMovementStart(e.target.value)}
                  data-ocid="report.movement_start_date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-xs">
                  Sampai Tanggal
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={movementEnd}
                  onChange={(e) => setMovementEnd(e.target.value)}
                  data-ocid="report.movement_end_date"
                />
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                {movementLoading ? (
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders are static and index is stable
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
                          <TableHead>Tipe</TableHead>
                          <TableHead className="text-right">Jumlah</TableHead>
                          <TableHead>Keterangan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {movementReport && movementReport.length > 0 ? (
                          movementReport.map((item, idx) => (
                            <TableRow
                              key={item.id.toString()}
                              data-ocid={`report.movement.row.${idx + 1}`}
                            >
                              <TableCell>
                                {new Date(
                                  Number(item.date) / 1_000_000,
                                ).toLocaleDateString("id-ID")}
                              </TableCell>
                              <TableCell className="font-medium">
                                {item.itemName}
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {item.sku}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    item.movementType === Variant_in_out.in_
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="gap-1 text-xs"
                                >
                                  {item.movementType === Variant_in_out.in_ ? (
                                    <ArrowDownLeft className="h-3 w-3" />
                                  ) : (
                                    <ArrowUpRight className="h-3 w-3" />
                                  )}
                                  {item.movementType === Variant_in_out.in_
                                    ? "Masuk"
                                    : "Keluar"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {item.movementType === Variant_in_out.in_
                                  ? "+"
                                  : "-"}
                                {item.quantity}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {item.note || "-"}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="text-center py-8 text-muted-foreground"
                            >
                              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">
                                Tidak ada data pergerakan stok pada rentang
                                tanggal ini
                              </p>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
