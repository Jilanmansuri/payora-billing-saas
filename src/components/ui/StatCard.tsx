import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  changePercentage?: number;
  comparisonLabel?: string;
  icon?: React.ReactNode;
  iconColor?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  changePercentage,
  comparisonLabel = 'vs last month',
  icon,
  iconColor = 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400',
  className,
}: StatCardProps) {
  const isPositive = typeof changePercentage === 'number' && changePercentage > 0;
  const isNegative = typeof changePercentage === 'number' && changePercentage < 0;
  const isZero = typeof changePercentage === 'number' && changePercentage === 0;

  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-xs transition-all hover:shadow-sm',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </p>
        {icon && (
          <div
            className={cn(
              'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
              iconColor
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3">
        <h4 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {value}
        </h4>

        {typeof changePercentage === 'number' && (
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-medium px-1.5 py-0.5 rounded',
                isPositive && 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
                isNegative && 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
                isZero && 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              )}
            >
              {isPositive && <TrendingUp className="w-3.5 h-3.5" />}
              {isNegative && <TrendingDown className="w-3.5 h-3.5" />}
              {isZero && <Minus className="w-3.5 h-3.5" />}
              {isPositive ? '+' : ''}
              {changePercentage.toFixed(1)}%
            </span>
            <span className="text-slate-400 dark:text-slate-500">{comparisonLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}

