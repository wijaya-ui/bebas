import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import Header from "./Header";
import Sidebar from "./Sidebar";

type Page =
  | "dashboard"
  | "master-barang"
  | "stok-masuk"
  | "stok-keluar"
  | "laporan";

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Layout({
  children,
  currentPage,
  onNavigate,
}: LayoutProps) {
  const { isInitializing } = useInternetIdentity();

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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <Header
        currentPage={currentPage}
        onNavigate={(page) => onNavigate(page as Page)}
      />

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col border-r bg-sidebar shrink-0">
          <Sidebar
            currentPage={currentPage}
            onNavigate={(page) => onNavigate(page as Page)}
          />
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-auto bg-background">
          <div className="p-4 lg:p-6 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/40 py-3 px-4 lg:px-6">
        <p className="text-xs text-muted-foreground text-center">
          &copy; {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
