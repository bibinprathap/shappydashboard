"use client";

import { useState } from "react";
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
  LucideIcon,
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
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { logout, hasPermission } = useAuth();

  // Filter navigation items based on user permissions
  const visibleNavigation = navigation.filter((item) => {
    // If no permission required, always show
    if (!item.permission) return true;
    // Otherwise, check if user has the required permission
    return hasPermission(item.permission);
  });

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-card border-r transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b">
        {!collapsed && (
          <span className="text-xl font-bold text-primary">Shappy</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("ml-auto", collapsed && "mx-auto")}
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
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
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
            collapsed && "justify-center px-0"
          )}
          onClick={logout}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
}
