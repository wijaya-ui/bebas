import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetDashboardSummary,
  useGetNearExpiryItems,
} from "@/hooks/useQueries";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  AlertTriangle,
  Boxes,
  CalendarClock,
  Package,
  TrendingDown,
} from "lucide-react";
import { motion } from "motion/react";

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  variant = "default",
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  description: string;
  variant?: "default" | "warning" | "danger";
}) {
  const variantStyles = {
    default: "bg-card",
    warning: "bg-warning/10 border-warning/30",
    danger: "bg-destructive/10 border-destructive/30",
  };

  const iconColors = {
    default: "text-primary",
    warning: "text-warning",
    danger: "text-destructive",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={variantStyles[variant]}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <p className="text-3xl font-display font-bold mt-1">
                {value.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            </div>
            <div
              className={`p-3 rounded-lg bg-background ${iconColors[variant]}`}
            >
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function NearExpiryTable() {
  const { data: items, isLoading, error } = useGetNearExpiryItems();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static loading skeleton
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Gagal memuat data kadaluarsa</AlertDescription>
      </Alert>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CalendarClock className="h-10 w-10 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Tidak ada barang yang mendekati kadaluarsa</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[320px]">
      <div className="space-y-2">
        {items.map((item, index) => (
          <motion.div
            key={item.id.toString()}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-smooth"
            data-ocid={`dashboard.near_expiry.item.${index + 1}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-md bg-warning/10">
                <CalendarClock className="h-4 w-4 text-warning" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.sku}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Badge
                variant={
                  item.daysUntilExpiry <= 7 ? "destructive" : "secondary"
                }
                className="text-xs"
              >
                {item.daysUntilExpiry} hari
              </Badge>
              <span className="text-sm font-medium">
                {item.currentStock} {item.unit || "unit"}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
}

export default function DashboardPage() {
  const { identity } = useInternetIdentity();
  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary();
  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Package className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-display font-bold mb-2">
          Selamat Datang di Warehouse MS
        </h2>
        <p className="text-muted-foreground max-w-md mb-6">
          Sistem manajemen gudang untuk pencatatan stok barang. Silakan masuk
          untuk mulai menggunakan aplikasi.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Ringkasan stok gudang Anda
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static loading skeleton
            <Skeleton key={i} className="h-28 w-full" />
          ))
        ) : (
          <>
            <StatCard
              title="Total Barang"
              value={Number(summary?.totalItems || 0n)}
              icon={Package}
              description="Jenis barang terdaftar"
            />
            <StatCard
              title="Total Stok"
              value={Number(summary?.totalStock || 0n)}
              icon={Boxes}
              description="Keseluruhan unit stok"
            />
            <StatCard
              title="Stok Rendah"
              value={Number(summary?.lowStockCount || 0n)}
              icon={TrendingDown}
              description="Di bawah minimum stok"
              variant="warning"
            />
            <StatCard
              title="Kadaluarsa"
              value={Number(summary?.nearExpiryCount || 0n)}
              icon={AlertTriangle}
              description="Mendekati kadaluarsa"
              variant="danger"
            />
          </>
        )}
      </div>

      {/* Near expiry section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Peringatan Kadaluarsa
                </CardTitle>
                <CardDescription>
                  Barang yang akan kadaluarsa dalam 30 hari ke depan
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <NearExpiryTable />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
