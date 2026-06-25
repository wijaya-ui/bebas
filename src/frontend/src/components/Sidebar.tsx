import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  LayoutDashboard,
  LogIn,
  Package,
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  mobile?: boolean;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "master-barang", label: "Master Barang", icon: Package },
  { id: "stok-masuk", label: "Stok Masuk", icon: ArrowDownLeft },
  { id: "stok-keluar", label: "Stok Keluar", icon: ArrowUpRight },
  { id: "laporan", label: "Laporan", icon: FileText },
];

export default function Sidebar({
  currentPage,
  onNavigate,
  mobile,
}: SidebarProps) {
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const [collapsed] = useState(false);

  if (!isAuthenticated) {
    return (
      <div
        className={cn(
          "flex flex-col h-full",
          mobile ? "p-4" : "p-4 border-r bg-sidebar",
        )}
      >
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
          <LogIn className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">Belum Masuk</p>
            <p className="text-xs text-muted-foreground mt-1">
              Silakan masuk untuk mengakses menu
            </p>
          </div>
          <Button onClick={login} size="sm" data-ocid="sidebar.login_button">
            Masuk dengan Internet Identity
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full",
        mobile ? "" : "border-r bg-sidebar",
      )}
    >
      {/* Navigation */}
      <nav className={cn("flex-1 overflow-auto", mobile ? "p-2" : "p-3")}>
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-smooth",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                  data-ocid={`sidebar.nav.${item.id}`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span
                    className={cn(collapsed && !mobile ? "hidden" : "block")}
                  >
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer branding */}
      {!mobile && (
        <div className="border-t p-3">
          <p className="text-xs text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} Warehouse MS
          </p>
        </div>
      )}
    </div>
  );
}
