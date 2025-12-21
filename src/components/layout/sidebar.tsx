'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Ticket,
  Store,
  TrendingUp,
  MousePointerClick,
  Gift,
  Image,
  Globe,
  Puzzle,
  ClipboardList,
  Settings,
  LogOut,
  ChevronLeft,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Admins', href: '/dashboard/admins', icon: Shield },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'Coupons', href: '/dashboard/coupons', icon: Ticket },
  { name: 'Merchants', href: '/dashboard/merchants', icon: Store },
  { name: 'Conversions', href: '/dashboard/conversions', icon: TrendingUp },
  { name: 'Clicks', href: '/dashboard/clicks', icon: MousePointerClick },
  { name: 'Deals', href: '/dashboard/deals', icon: Gift },
  { name: 'Banners', href: '/dashboard/banners', icon: Image },
  { name: 'Countries & Currencies', href: '/dashboard/reference', icon: Globe },
  { name: 'Extension', href: '/dashboard/extension', icon: Puzzle },
  { name: 'Audit Log', href: '/dashboard/audit-log', icon: ClipboardList },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div
      className={cn(
        'flex flex-col h-screen bg-card border-r transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
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
          className={cn('ml-auto', collapsed && 'mx-auto')}
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft
            className={cn(
              'h-4 w-4 transition-transform',
              collapsed && 'rotate-180'
            )}
          />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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
            'w-full justify-start gap-3',
            collapsed && 'justify-center px-0'
          )}
          onClick={() => {
            localStorage.removeItem('authToken');
            window.location.href = '/login';
          }}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
}
