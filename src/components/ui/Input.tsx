import { ReactNode, InputHTMLAttributes } from 'react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const sizeClasses = {
  sm: 'input-sm',
  md: '',
  lg: 'input-lg',
};

export const Input = ({
  label,
  error,
  helperText,
  icon,
  size = 'md',
  fullWidth = true,
  className = '',
  ...props
}: InputProps) => {
  const sizeClass = sizeClasses[size];
  const widthClass = fullWidth ? 'w-full' : '';
  const errorClass = error ? 'input-error' : '';
  
  const inputClasses = [
    'input input-bordered',
    sizeClass,
    widthClass,
    errorClass,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="form-control w-full">
      {label && (
        <label className="label">
          <span className="label-text font-medium">{label}</span>
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          className={`${inputClasses} ${icon ? 'pl-10' : ''}`}
          {...props}
        />
      </div>
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
      {helperText && !error && (
        <label className="label">
          <span className="label-text-alt text-base-content/70">{helperText}</span>
        </label>
      )}
    </div>
  );
};

export const Textarea = ({
  label,
  error,
  helperText,
  size = 'md',
  fullWidth = true,
  className = '',
  ...props
}: Omit<InputProps, 'type'>) => {
  const sizeClass = sizeClasses[size];
  const widthClass = fullWidth ? 'w-full' : '';
  const errorClass = error ? 'textarea-error' : '';
  
  const textareaClasses = [
    'textarea textarea-bordered',
    sizeClass,
    widthClass,
    errorClass,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="form-control w-full">
      {label && (
        <label className="label">
          <span className="label-text font-medium">{label}</span>
        </label>
      )}
      <textarea
        className={textareaClasses}
        {...props}
      />
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
      {helperText && !error && (
        <label className="label">
          <span className="label-text-alt text-base-content/70">{helperText}</span>
        </label>
      )}
    </div>
  );
};
