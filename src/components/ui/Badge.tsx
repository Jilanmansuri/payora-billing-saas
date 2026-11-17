import React from 'react';
import { cn, getStatusBadgeStyle } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  withDot?: boolean;
}

export function Badge({
  className,
  status,
  variant,
  withDot = true,
  children,
  ...props
}: BadgeProps) {
  let styleClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  if (status) {
    const s = getStatusBadgeStyle(status);
    styleClasses = `${s.bg} ${s.text} ${s.border}`;
    dotColor = s.dot;
  } else if (variant) {
    switch (variant) {
      case 'success':
        styleClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        dotColor = 'bg-emerald-500';
        break;
      case 'warning':
        styleClasses = 'bg-amber-50 text-amber-700 border-amber-200';
        dotColor = 'bg-amber-500';
        break;
      case 'danger':
        styleClasses = 'bg-rose-50 text-rose-700 border-rose-200';
        dotColor = 'bg-rose-500';
        break;
      case 'info':
        styleClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200';
        dotColor = 'bg-indigo-500';
        break;
      case 'neutral':
      default:
        styleClasses = 'bg-slate-100 text-slate-700 border-slate-200';
        dotColor = 'bg-slate-400';
        break;
    }
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize',
        styleClasses,
        className
      )}
      {...props}
    >
      {withDot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColor)} />}
      {children || status}
    </span>
  );
}

