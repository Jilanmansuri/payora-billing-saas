import React, { Suspense } from 'react';
import { AppShell } from '@/components/layout/AppShell';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">Loading Billora...</div>}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
