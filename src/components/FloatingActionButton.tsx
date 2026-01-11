import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'tertiary';
  disabled?: boolean;
  'aria-label'?: string;
}

export function FloatingActionButton({
  onClick,
  className = '',
  size = 'medium',
  variant = 'primary',
  disabled = false,
  'aria-label': ariaLabel = 'Add Habit',
}: FloatingActionButtonProps) {
  const sizeClasses = {
    small: 'w-10 h-10',
    medium: 'w-14 h-14', // 56dp
    large: 'w-16 h-16',
  };

  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/30 border border-white/10',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg border border-white/10',
    tertiary: 'bg-tertiary text-tertiary-foreground hover:bg-tertiary/90 shadow-md border border-white/10',
  };

  const iconSizes = {
    small: 16,
    medium: 24,
    large: 28,
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`
        fixed bottom-24 right-6 z-50
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        rounded-full
        flex items-center justify-center
        transition-all duration-200 ease-in-out
        hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2
        touch-target
        ${className}
      `}
      style={{
        // Safe area padding
        marginBottom: 'env(safe-area-inset-bottom, 16px)',
        marginRight: 'env(safe-area-inset-right, 16px)',
      }}
    >
      <Plus
        size={iconSizes[size]}
        className="transition-transform duration-200"
        style={{
          transform: disabled ? 'none' : 'scale(1)',
        }}
      />

      {/* Ripple effect overlay */}
      <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-200 hover:opacity-100" />
      </div>
    </button>
  );
}

// Extended FAB with label (optional)
interface ExtendedFABProps extends FloatingActionButtonProps {
  label: string;
  showLabel?: boolean;
}

export function ExtendedFAB({
  onClick,
  label,
  showLabel = false,
  className = '',
  size = 'medium',
  variant = 'primary',
  disabled = false,
  'aria-label': ariaLabel,
}: ExtendedFABProps) {
  const sizeClasses = {
    small: 'h-10 px-4',
    medium: 'h-14 px-6', // 56dp height
    large: 'h-16 px-8',
  };

  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-md',
    tertiary: 'bg-tertiary text-tertiary-foreground hover:bg-tertiary/90 shadow-sm',
  };

  const iconSizes = {
    small: 16,
    medium: 20,
    large: 24,
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || label}
      className={`
        fixed bottom-24 right-6 z-50
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        rounded-full
        flex items-center gap-3
        transition-all duration-200 ease-in-out
        hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2
        touch-target
        ${className}
      `}
      style={{
        // Material 3 elevation
        boxShadow: disabled
          ? '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)'
          : '0 4px 8px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)',
        // Safe area padding
        marginBottom: 'env(safe-area-inset-bottom, 16px)',
        marginRight: 'env(safe-area-inset-right, 16px)',
      }}
    >
      <Plus
        size={iconSizes[size]}
        className="transition-transform duration-200 flex-shrink-0"
      />

      {showLabel && (
        <span className="text-sm font-medium whitespace-nowrap">
          {label}
        </span>
      )}

      {/* Ripple effect overlay */}
      <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-200 hover:opacity-100" />
      </div>
    </button>
  );
}
