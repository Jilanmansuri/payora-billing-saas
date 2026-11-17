'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Repeat,
  FileText,
  CreditCard,
  BarChart3,
  Database,
  Lock,
  Layers,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Marketing Navigation */}
      <nav className="border-b border-slate-100 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 fill-white/20" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Billora
              </span>
              <span className="text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                SaaS
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
            <a href="#features" className="hover:text-indigo-600 transition-colors">
              Features
            </a>
            <a href="#architecture" className="hover:text-indigo-600 transition-colors">
              Architecture
            </a>
            <a href="#tech" className="hover:text-indigo-600 transition-colors">
              Tech Stack
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="primary" size="sm" className="shadow-sm">
                Open Dashboard <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-radial-[at_top_center] from-indigo-100/50 via-transparent to-transparent dark:from-indigo-950/30 -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Billing. Simple Business.</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 max-w-4xl mx-auto leading-[1.1]">
            The Enterprise Billing &amp; Subscription Engine for Modern SaaS
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Manage customer lifecycles, configure tiered pricing plans, automate renewal invoicing,
            track partial payment settlement, and analyze real MRR performance — powered by MongoDB
            and Next.js App Router.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link href="/dashboard">
              <Button size="lg" variant="primary" className="shadow-md shadow-indigo-500/20 text-sm">
                Explore Live Platform <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link href="/customers">
              <Button size="lg" variant="outline" className="text-sm">
                View Customers Vault
              </Button>
            </Link>
          </div>

          {/* Feature Highlights Pills */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Real MongoDB Database
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Full Subscription Lifecycle
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Vector PDF Invoicing
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Partial Payments &amp; Balance Tracking
            </span>
          </div>
        </div>

        {/* Dashboard Preview Frame */}
        <div className="max-w-6xl mx-auto px-4 mt-14">
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-2 shadow-2xl backdrop-blur-md">
            <div className="rounded-xl overflow-hidden border border-slate-200/60 dark:border-slate-800 bg-slate-950 p-6 text-white space-y-6">
              {/* Top Bar of Preview */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs text-slate-400 font-mono ml-2">app.billora.io/dashboard</span>
                </div>
                <div className="text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded">
                  Live MongoDB
                </div>
              </div>

              {/* Preview KPI row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block uppercase">Total Revenue</span>
                  <span className="text-2xl font-bold text-emerald-400 mt-1 block">$18,450.00</span>
                  <span className="text-[10px] text-emerald-500 font-semibold">+18.4% vs last month</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block uppercase">Monthly Run Rate (MRR)</span>
                  <span className="text-2xl font-bold text-indigo-400 mt-1 block">$4,280.00</span>
                  <span className="text-[10px] text-indigo-400 font-semibold">+12.5% expansion</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block uppercase">Active Subscriptions</span>
                  <span className="text-2xl font-bold text-white mt-1 block">20 Accounts</span>
                  <span className="text-[10px] text-slate-400">96.5% retention</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block uppercase">Payment Settlement</span>
                  <span className="text-2xl font-bold text-teal-400 mt-1 block">97.2%</span>
                  <span className="text-[10px] text-slate-400">0 duplicate charges</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Core Capabilities
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Engineered for Complete Financial Reliability
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Every workflow is built with strict database consistency, server-side mathematical validation, and real API routes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
                <Repeat className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">
                Subscription Lifecycle Engine
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Activate, pause, resume, upgrade, and downgrade tiers with automated next-billing calculations and historical pricing snapshots.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">
                Automated Invoicing &amp; PDF Export
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Generate itemized invoices with percentage or fixed discounts, regional tax calculations, and one-click printable vector PDF downloads.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950 text-violet-600 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">
                Simulated Payment Settlement
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Support for Card, Bank Transfer, UPI, and Cash. Handles partial balances with automated status transitions from Pending to Paid.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">
                MRR &amp; Cohort Analytics
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Recharts-powered interactive analytics: track MRR waterfalls, ARPU, success rates, interval distribution, and revenue trends across custom dates.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">
                Safe Customer Archival
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Protects financial audit integrity by preventing accidental deletion of customers with outstanding invoices or active subscriptions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">
                Mongoose ODM &amp; Atlas
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                8 strongly typed collections with compound indexing, Zod schema validation, and safe connection pooling ready for serverless Vercel deployment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Banner */}
      <section id="tech" className="py-16 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Powered by Modern Technologies
          </span>
          <div className="flex flex-wrap items-center justify-center gap-8 text-slate-600 dark:text-slate-400 font-semibold text-sm">
            <span>Next.js 16 App Router</span>
            <span>React 19</span>
            <span>TypeScript</span>
            <span>Tailwind CSS v4</span>
            <span>MongoDB Atlas</span>
            <span>Mongoose ODM</span>
            <span>Recharts</span>
            <span>jsPDF</span>
            <span>Zod</span>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-20 bg-indigo-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to experience seamless SaaS billing?
          </h2>
          <p className="text-indigo-100 text-sm sm:text-base max-w-xl mx-auto">
            Explore the live dashboard, generate real invoices, and test lifecycle renewal flows.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link href="/dashboard">
              <Button size="lg" className="bg-white text-indigo-700 hover:bg-slate-100 font-bold shadow-lg">
                Launch Billora Dashboard <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200">Billora</span>
            <span>&bull; Smart Billing. Simple Business.</span>
          </div>
          <p>&copy; 2026 Billora SaaS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
