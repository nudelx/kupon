import { ReactNode } from 'react';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  icon?: ReactNode;
}

const variantClasses = {
  default: 'badge-neutral',
  primary: 'badge-primary',
  secondary: 'badge-secondary',
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
  info: 'badge-info',
};

const sizeClasses = {
  sm: 'badge-sm',
  md: '',
  lg: 'badge-lg',
};

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  icon,
}: BadgeProps) => {
  const variantClass = variantClasses[variant];
  const sizeClass = sizeClasses[size];
  
  const classes = [
    'badge',
    variantClass,
    sizeClass,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </div>
  );
};
