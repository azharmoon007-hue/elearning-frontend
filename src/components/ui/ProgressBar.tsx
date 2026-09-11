import React from 'react';

interface ProgressBarProps {
  percentage?: number;
  value?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'success' | 'amber';
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  value,
  size = 'md',
  variant = 'primary',
  showLabel = false,
  className = '',
}) => {
  const actualValue = value ?? percentage ?? 0;
  const clamped = Math.min(100, Math.max(0, Math.round(actualValue)));

  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const variantStyles = {
    primary: 'bg-indigo-600',
    success: 'bg-emerald-500',
    amber: 'bg-amber-500',
  };

  return (
    <div className={`w-full flex items-center gap-3 ${className}`}>
      <div className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ${sizeStyles[size]}`}>
        <div
          className={`${sizeStyles[size]} ${variantStyles[variant]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 min-w-[36px] text-right">
          {clamped}%
        </span>
      )}
    </div>
  );
};
