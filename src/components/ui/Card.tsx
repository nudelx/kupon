import { ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  sm: 'p-3',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
};

export const Card = ({
  children,
  className = '',
  hover = true,
  padding = 'md',
}: CardProps) => {
  const baseClasses = 'card bg-base-100 border border-base-300 rounded-xl shadow-sm';
  const hoverClass = hover ? 'hover:shadow-md transition-shadow duration-200' : '';
  const paddingClass = paddingClasses[padding];
  
  const classes = [
    baseClasses,
    hoverClass,
    paddingClass,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`card-header ${className}`}>
    {children}
  </div>
);

export const CardBody = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`card-body ${className}`}>
    {children}
  </div>
);

export const CardActions = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`card-actions ${className}`}>
    {children}
  </div>
);
