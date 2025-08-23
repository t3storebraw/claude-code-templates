'use client';

import { ReactNode } from 'react';
import { cn, formatNumber, formatCurrency, formatPercentage } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: number;
  trendLabel?: string;
  format?: 'number' | 'currency' | 'percentage';
  className?: string;
  gradient?: string;
}

export default function MetricCard({
  title,
  value,
  icon,
  trend,
  trendLabel,
  format = 'number',
  className,
  gradient = 'from-purple-600 to-violet-600'
}: MetricCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return formatCurrency(val);
      case 'percentage':
        return formatPercentage(val);
      default:
        return formatNumber(val);
    }
  };

  const getTrendColor = (trendValue: number) => {
    if (trendValue > 0) return 'text-green-500';
    if (trendValue < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const getTrendIcon = (trendValue: number) => {
    if (trendValue > 0) return <TrendingUp className="h-4 w-4" />;
    if (trendValue < 0) return <TrendingDown className="h-4 w-4" />;
    return null;
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl",
      className
    )}>
      {/* Background Gradient */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-90",
        gradient
      )} />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                {icon}
              </div>
            )}
            <h3 className="text-sm font-medium text-white/90 uppercase tracking-wider">
              {title}
            </h3>
          </div>
        </div>

        {/* Value */}
        <div className="mb-2">
          <div className="text-3xl font-bold text-white">
            {formatValue(value)}
          </div>
        </div>

        {/* Trend */}
        {trend !== undefined && (
          <div className="flex items-center space-x-2">
            <div className={cn(
              "flex items-center space-x-1 text-sm font-medium",
              getTrendColor(trend)
            )}>
              {getTrendIcon(trend)}
              <span>{Math.abs(trend).toFixed(1)}%</span>
            </div>
            {trendLabel && (
              <span className="text-xs text-white/70">
                {trendLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
    </div>
  );
}