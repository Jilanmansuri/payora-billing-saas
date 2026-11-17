'use client';

import React, { useState, Suspense } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Toaster } from 'sonner';
import { X } from 'lucide-react';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex flex-col antialiased font-sans">
      <div className="flex grow">
        {/* Desktop Sidebar */}
        <Suspense fallback={<aside className="w-64 bg-slate-950 shrink-0 hidden lg:block" />}>
          <Sidebar className="hidden lg:flex" />
        </Suspense>

        {/* Mobile Sidebar Backdrop & Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-10 w-64 bg-slate-950 flex flex-col h-full shadow-2xl">
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <Suspense fallback={<aside className="w-64 bg-slate-950" />}>
                <Sidebar className="w-full border-none" />
              </Suspense>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex flex-col grow min-w-0">
          <Suspense fallback={<header className="h-16 border-b border-slate-200 bg-white" />}>
            <Navbar onMobileMenuToggle={() => setMobileMenuOpen(true)} />
          </Suspense>
          <main className="grow p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            <Suspense fallback={<div className="h-64 rounded-xl bg-slate-100 animate-pulse" />}>
              {children}
            </Suspense>
          </main>
        </div>
      </div>

      {/* Global Toast Notifications */}
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
