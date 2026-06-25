import { Variant_in_out } from "@/backend";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  useCreateItem,
  useDeleteItem,
  useGetItemStockHistory,
  useListItems,
  useUpdateItem,
} from "@/hooks/useQueries";
import { useUrlParams } from "@/hooks/useUrlParams";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  ArrowDownLeft,
  ArrowUpRight,
  History,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const CATEGORIES = [
  "Elektronik",
  "Pakaian",
  "Makanan",
  "Minuman",
  "Obat",
  "Alat Tulis",
  "Lainnya",
];
const UNITS = ["pcs", "kg", "liter", "box", "pack", "meter", "roll"];

interface ItemFormData {
  name: string;
  sku: string;
  category: string;
  unit: string;
  minStock: number;
  expiryDate: string;
}

function ItemForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: {
  initialData?: Partial<ItemFormData>;
  onSubmit: (data: ItemFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [form, setForm] = useState<ItemFormData>({
    name: initialData?.name || "",
    sku: initialData?.sku || "",
    category: initialData?.category || "",
    unit: initialData?.unit || "pcs",
    minStock: initialData?.minStock || 0,
    expiryDate: initialData?.expiryDate || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.sku.trim() || !form.category) {
      toast.error("Nama, SKU, dan kategori wajib diisi");
      return;
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Barang</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nama barang"
            data-ocid="item.form.name_input"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sku">Kode SKU</Label>
          <Input
            id="sku"
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            placeholder="SKU-001"
            data-ocid="item.form.sku_input"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Kategori</Label>
          <Select
            value={form.category}
            onValueChange={(v) => setForm({ ...form, category: v })}
          >
            <SelectTrigger data-ocid="item.form.category_select">
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Satuan</Label>
          <Select
            value={form.unit}
            onValueChange={(v) => setForm({ ...form, unit: v })}
          >
            <SelectTrigger data-ocid="item.form.unit_select">
              <SelectValue placeholder="Pilih satuan" />
            </SelectTrigger>
            <SelectContent>
              {UNITS.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minStock">Stok Minimum</Label>
          <Input
            id="minStock"
            type="number"
            min={0}
            value={form.minStock}
            onChange={(e) =>
              setForm({
                ...form,
                minStock: Number.parseInt(e.target.value) || 0,
              })
            }
            data-ocid="item.form.min_stock_input"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expiryDate">Tanggal Kadaluarsa</Label>
          <Input
            id="expiryDate"
            type="date"
            value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            data-ocid="item.form.expiry_date_input"
          />
        </div>
      </div>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          data-ocid="item.form.cancel_button"
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          data-ocid="item.form.submit_button"
        >
          {isLoading ? "Menyimpan..." : "Simpan"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function StockHistoryDialog({
  itemId,
  itemName,
}: { itemId: bigint; itemName: string }) {
  const { data: history, isLoading } = useGetItemStockHistory(itemId);

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Riwayat Stok - {itemName}</DialogTitle>
        <DialogDescription>Pergerakan stok masuk dan keluar</DialogDescription>
      </DialogHeader>
      <ScrollArea className="h-[300px]">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static loading skeleton
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !history || history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Belum ada riwayat pergerakan stok</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Keterangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((h, idx) => (
                <TableRow
                  key={h.id.toString()}
                  data-ocid={`item.history.row.${idx + 1}`}
                >
                  <TableCell>
                    {new Date(Number(h.date) / 1_000_000).toLocaleDateString(
                      "id-ID",
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        h.movementType === Variant_in_out.in_
                          ? "default"
                          : "secondary"
                      }
                      className="gap-1"
                    >
                      {h.movementType === Variant_in_out.in_ ? (
                        <ArrowDownLeft className="h-3 w-3" />
                      ) : (
                        <ArrowUpRight className="h-3 w-3" />
                      )}
                      {h.movementType === Variant_in_out.in_
                        ? "Masuk"
                        : "Keluar"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {Number(h.quantity)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {h.note || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </ScrollArea>
    </DialogContent>
  );
}

export default function MasterBarangPage() {
  const { identity } = useInternetIdentity();
  const { data: items, isLoading, error } = useListItems();
  const createItem = useCreateItem();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();
  const { getParam, setParam } = useUrlParams();

  const [search, setSearch] = useState(getParam("search") || "");
  const [categoryFilter, setCategoryFilter] = useState<string>(
    getParam("category") || "all",
  );
  const [editingItem, setEditingItem] = useState<bigint | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [historyItem, setHistoryItem] = useState<{
    id: bigint;
    name: string;
  } | null>(null);

  const isAuthenticated = !!identity;

  // Sync URL params
  useEffect(() => {
    setParam("search", search);
  }, [search, setParam]);

  useEffect(() => {
    setParam("category", categoryFilter);
  }, [categoryFilter, setParam]);

  const filteredItems = items?.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCreate = (data: ItemFormData) => {
    createItem.mutate(
      {
        name: data.name,
        sku: data.sku,
        category: data.category,
        unit: data.unit,
        minStock: data.minStock,
        expiryDate: data.expiryDate
          ? BigInt(new Date(data.expiryDate).getTime()) * 1_000_000n
          : null,
      },
      {
        onSuccess: () => {
          toast.success("Barang berhasil ditambahkan");
          setFormOpen(false);
        },
        onError: () => toast.error("Gagal menambahkan barang"),
      },
    );
  };

  const handleUpdate = (data: ItemFormData) => {
    if (!editingItem) return;
    updateItem.mutate(
      {
        id: editingItem,
        name: data.name,
        sku: data.sku,
        category: data.category,
        unit: data.unit,
        minStock: data.minStock,
        expiryDate: data.expiryDate
          ? BigInt(new Date(data.expiryDate).getTime()) * 1_000_000n
          : null,
      },
      {
        onSuccess: () => {
          toast.success("Barang berhasil diperbarui");
          setEditingItem(null);
          setFormOpen(false);
        },
        onError: () => toast.error("Gagal memperbarui barang"),
      },
    );
  };

  const handleDelete = (id: bigint) => {
    deleteItem.mutate(id, {
      onSuccess: () => toast.success("Barang berhasil dihapus"),
      onError: () => toast.error("Gagal menghapus barang"),
    });
  };

  const editingItemData = editingItem
    ? items?.find((i) => i.id === editingItem)
    : undefined;

  const formInitialData = editingItemData
    ? {
        name: editingItemData.name,
        sku: editingItemData.sku,
        category: editingItemData.category,
        unit: editingItemData.unit,
        minStock: Number(editingItemData.minStock),
        expiryDate: editingItemData.expiryDate
          ? new Date(Number(editingItemData.expiryDate) / 1_000_000)
              .toISOString()
              .split("T")[0]
          : "",
      }
    : undefined;

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Package className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-display font-bold mb-2">Master Barang</h2>
        <p className="text-muted-foreground max-w-md">
          Silakan masuk untuk mengelola data barang.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Master Barang</h1>
          <p className="text-muted-foreground text-sm">
            Kelola data barang dan stok
          </p>
        </div>
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingItem(null);
                setFormOpen(true);
              }}
              data-ocid="item.add_button"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Barang
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit Barang" : "Tambah Barang"}
              </DialogTitle>
              <DialogDescription>
                {editingItem
                  ? "Perbarui data barang"
                  : "Tambah barang baru ke sistem"}
              </DialogDescription>
            </DialogHeader>
            <ItemForm
              initialData={formInitialData}
              onSubmit={editingItem ? handleUpdate : handleCreate}
              onCancel={() => {
                setFormOpen(false);
                setEditingItem(null);
              }}
              isLoading={createItem.isPending || updateItem.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-ocid="item.search_input"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]" data-ocid="item.category_filter">
            <SelectValue placeholder="Semua Kategori" />
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
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static loading skeleton
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive" className="m-4">
              <AlertDescription>Gagal memuat data barang</AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Stok</TableHead>
                    <TableHead>Min</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems && filteredItems.length > 0 ? (
                    filteredItems.map((item, idx) => (
                      <TableRow
                        key={item.id.toString()}
                        data-ocid={`item.table.row.${idx + 1}`}
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
                        <TableCell>
                          {Number(item.currentStock)} {item.unit}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {Number(item.minStock)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.currentStock <= item.minStock
                                ? "destructive"
                                : "default"
                            }
                            className="text-xs"
                          >
                            {item.currentStock <= item.minStock
                              ? "Rendah"
                              : "Aman"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setHistoryItem({
                                  id: item.id,
                                  name: item.name,
                                });
                              }}
                              data-ocid={`item.history_button.${idx + 1}`}
                              aria-label="Riwayat stok"
                            >
                              <History className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setEditingItem(item.id);
                                setFormOpen(true);
                              }}
                              data-ocid={`item.edit_button.${idx + 1}`}
                              aria-label="Edit barang"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  data-ocid={`item.delete_trigger.${idx + 1}`}
                                  aria-label="Hapus barang"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Hapus Barang
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Apakah Anda yakin ingin menghapus barang
                                    &quot;{item.name}&quot;? Tindakan ini tidak
                                    dapat dibatalkan.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel
                                    data-ocid={`item.delete_cancel.${idx + 1}`}
                                  >
                                    Batal
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(item.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    data-ocid={`item.delete_confirm.${idx + 1}`}
                                  >
                                    Hapus
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-muted-foreground"
                      >
                        <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">
                          {search || categoryFilter !== "all"
                            ? "Tidak ada barang yang cocok dengan filter"
                            : "Belum ada barang. Tambahkan barang pertama Anda."}
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

      {/* History Dialog */}
      <Dialog
        open={!!historyItem}
        onOpenChange={(open) => !open && setHistoryItem(null)}
      >
        {historyItem && (
          <StockHistoryDialog
            itemId={historyItem.id}
            itemName={historyItem.name}
          />
        )}
      </Dialog>
    </div>
  );
}
