"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { permissions } from "@/lib/permissions";
import {
  LayoutDashboard,
  Users,
  Ticket,
  Store,
  Image,
  Globe,
  Puzzle,
  ClipboardList,
  LogOut,
  ChevronLeft,
  Shield,
  Menu,
  X,
  LucideIcon,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  permission?: string; // Optional permission required to view this item
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  {
    name: "Staff",
    href: "/staff",
    icon: Shield,
    permission: permissions.STAFF_VIEW,
  },
  {
    name: "Users",
    href: "/users",
    icon: Users,
    permission: permissions.USER_VIEW,
  },
  {
    name: "Coupons",
    href: "/coupons",
    icon: Ticket,
    permission: permissions.COUPON_VIEW,
  },
  {
    name: "Merchants",
    href: "/merchants",
    icon: Store,
    permission: permissions.MERCHANT_VIEW,
  },
  {
    name: "Push Notifications",
    href: "/notifications",
    icon: Globe,
    permission: permissions.PUSH_NOTIFICATION_VIEW,
  },
  {
    name: "Banners",
    href: "/banners",
    icon: Image,
    permission: permissions.BANNER_VIEW,
  },
  {
    name: "Audit Log",
    href: "/audit-log",
    icon: ClipboardList,
    permission: permissions.AUDIT_LOG_VIEW,
  },
  {
    name: "Coupon Reports",
    href: "/coupon-reports",
    icon: AlertTriangle,
    permission: permissions.COUPON_REPORT_VIEW,
  },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { logout, hasPermission } = useAuth();

  // Close mobile sidebar when route changes
  useEffect(() => {
    if (mobileOpen && onMobileClose) {
      onMobileClose();
    }
  }, [pathname]);

  // Filter navigation items based on user permissions
  const visibleNavigation = navigation.filter((item) => {
    // If no permission required, always show
    if (!item.permission) return true;
    // Otherwise, check if user has the required permission
    return hasPermission(item.permission);
  });

  const sidebarContent = (
    <div
      className={cn(
        "flex flex-col h-full bg-card border-r transition-all duration-300",
        // Desktop: normal width behavior
        "md:h-screen",
        collapsed ? "md:w-16" : "md:w-64",
        // Mobile: always full width in the drawer
        "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b">
        {!collapsed && (
          <span className="text-xl font-bold text-primary">Shappy</span>
        )}
        {/* Mobile close button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden ml-auto"
          onClick={onMobileClose}
        >
          <X className="h-5 w-5" />
        </Button>
        {/* Desktop collapse button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn("hidden md:flex ml-auto", collapsed && "mx-auto")}
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              collapsed && "rotate-180"
            )}
          />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {visibleNavigation.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  onClick={onMobileClose}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {(!collapsed || mobileOpen) && <span>{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3",
            collapsed && !mobileOpen && "justify-center px-0"
          )}
          onClick={logout}
        >
          <LogOut className="h-5 w-5" />
          {(!collapsed || mobileOpen) && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden md:block">{sidebarContent}</div>

      {/* Mobile Sidebar - overlay drawer */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={onMobileClose}
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 z-50 md:hidden animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}

// Export a hamburger menu button component for the header
export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon" className="md:hidden" onClick={onClick}>
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle menu</span>
    </Button>
  );
}
