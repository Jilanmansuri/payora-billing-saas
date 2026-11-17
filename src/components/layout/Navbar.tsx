'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import {
  Search,
  Calendar,
  Bell,
  Sparkles,
  RefreshCw,
  Plus,
  CheckCircle2,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

export function Navbar({ onMobileMenuToggle }: { onMobileMenuToggle?: () => void }) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activities, setActivities] = useState<{ title: string; description: string; createdAt: string }[]>([]);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    setCurrentDate(formatDate(new Date(), 'EEEE, MMMM dd, yyyy'));
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/dashboard/recent-activity?limit=5');
      const data = await res.json();
      if (data.success && data.data) {
        setActivities(data.data);
      }
    } catch {
      // ignore
    }
  };

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/customers?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    toast.info('Seeding database with sample SaaS data...');
    try {
      const res = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dropExisting: true }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Database seeded successfully! Refreshing...');
        window.location.reload();
      } else {
        toast.error(data.error || 'Seeding failed');
      }
    } catch {
      toast.error('Failed to trigger database seed');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <header className="h-16 border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <form onSubmit={handleGlobalSearch} className="relative hidden sm:block w-72 md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customers, subscriptions, invoices..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
          />
        </form>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Current Date Display */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 font-medium px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{currentDate}</span>
        </div>

        {/* Quick Seed Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleSeedData}
          isLoading={isSeeding}
          className="text-xs hidden sm:inline-flex"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1" />
          Seed Demo Data
        </Button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-slate-900" />
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 p-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                  Recent Activity
                </h4>
                <button
                  onClick={() => setIsNotificationsOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                {activities.length > 0 ? (
                  activities.map((act, idx) => (
                    <div
                      key={idx}
                      className="text-xs p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{act.title}</p>
                      <p className="text-slate-500 line-clamp-2 mt-0.5">{act.description}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {formatDate(act.createdAt, 'MMM dd, h:mm a')}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">No recent activity</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User / Organization Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-indigo-100 dark:ring-indigo-900/40">
            BL
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-none">
              Billora Admin
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-none">admin@billora.io</p>
          </div>
        </div>
      </div>
    </header>
  );
}

