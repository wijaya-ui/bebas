import { Toaster } from "@/components/ui/sonner";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Layout from "./components/Layout";
import DashboardPage from "./pages/DashboardPage";
import LaporanPage from "./pages/LaporanPage";
import MasterBarangPage from "./pages/MasterBarangPage";
import StokKeluarPage from "./pages/StokKeluarPage";
import StokMasukPage from "./pages/StokMasukPage";

type Page =
  | "dashboard"
  | "master-barang"
  | "stok-masuk"
  | "stok-keluar"
  | "laporan";

function App() {
  const { isInitializing, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const isAuthenticated = !!identity;

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    if (!isInitializing) {
      queryClient.invalidateQueries();
    }
  }, [isAuthenticated, isInitializing, queryClient]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage />;
      case "master-barang":
        return <MasterBarangPage />;
      case "stok-masuk":
        return <StokMasukPage />;
      case "stok-keluar":
        return <StokKeluarPage />;
      case "laporan":
        return <LaporanPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default App;
