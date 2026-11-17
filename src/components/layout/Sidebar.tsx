'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Package,
  Repeat,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  Sparkles,
  Database,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export const navigationItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Products & Plans', href: '/products', icon: Package },
  { name: 'Subscriptions', href: '/subscriptions', icon: Repeat },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'w-64 bg-slate-950 text-slate-300 flex flex-col shrink-0 border-r border-slate-800/80 min-h-screen select-none',
        className
      )}
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/60">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 fill-white/20" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-white tracking-tight">Billora</span>
              <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.2 rounded">
                SaaS
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Smart Billing. Simple Business.</p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="p-3 grow space-y-1 overflow-y-auto">
        <div className="px-3 pt-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Main Menu
        </div>
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group',
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0 transition-colors',
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  )}
                />
                <span>{item.name}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
            </Link>
          );
        })}
      </div>

      {/* Database Status & Landing Page Link */}
      <div className="p-4 border-t border-slate-800/60 space-y-3 bg-slate-950/60">
        <div className="flex items-center justify-between text-xs px-2 py-1.5 rounded-md bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px]">Database</span>
          </div>
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Connected
          </span>
        </div>

        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-2 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors rounded group"
        >
          <span className="flex items-center gap-1.5">
            <ExternalLink className="w-3.5 h-3.5" />
            View Landing Page
          </span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </aside>
  );
}

