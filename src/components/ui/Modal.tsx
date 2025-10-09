import { ReactNode, useEffect } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = '',
}: ModalProps) => {
  const sizeClass = sizeClasses[size];
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className={`modal-box w-11/12 ${sizeClass} ${className}`}>
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-base-content">{title}</h3>
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost"
              onClick={onClose}
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        {children}
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export const ModalHeader = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`modal-header ${className}`}>
    {children}
  </div>
);

export const ModalBody = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`modal-body ${className}`}>
    {children}
  </div>
);

export const ModalFooter = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`modal-action ${className}`}>
    {children}
  </div>
);
