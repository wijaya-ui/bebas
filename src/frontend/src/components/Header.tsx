import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { LogOut, Menu, User, Warehouse } from "lucide-react";
import { useState } from "react";
import Sidebar from "./Sidebar";

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const { identity, login, clear } = useInternetIdentity();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAuthenticated = !!identity;

  const getInitials = () => {
    if (!identity) return "?";
    const principal = identity.getPrincipal().toString();
    return principal.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-card px-4 shadow-subtle lg:h-16 lg:px-6">
      {/* Mobile menu toggle */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 lg:hidden"
            data-ocid="header.mobile_menu_button"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <div className="flex h-14 items-center border-b px-4">
            <Warehouse className="h-6 w-6 text-primary mr-2" />
            <span className="font-display font-bold text-lg">WMS</span>
          </div>
          <Sidebar
            currentPage={currentPage}
            onNavigate={(page) => {
              onNavigate(page);
              setMobileMenuOpen(false);
            }}
            mobile
          />
        </SheetContent>
      </Sheet>

      {/* Logo / Brand */}
      <div className="flex items-center gap-2">
        <Warehouse className="h-6 w-6 text-primary hidden lg:block" />
        <span className="font-display font-bold text-lg hidden lg:block">
          Warehouse MS
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Auth / Profile */}
      <div className="flex items-center gap-2">
        {!isAuthenticated ? (
          <Button onClick={login} size="sm" data-ocid="header.login_button">
            Masuk
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full"
                data-ocid="header.profile_dropdown"
                aria-label="Profile menu"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Pengguna</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {identity?.getPrincipal().toString().slice(0, 20)}...
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onNavigate("dashboard")}
                data-ocid="header.profile_dashboard"
              >
                <User className="mr-2 h-4 w-4" />
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={clear}
                className="text-destructive focus:text-destructive"
                data-ocid="header.logout_button"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
