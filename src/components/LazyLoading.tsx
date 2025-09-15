import React, { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy load heavy screens for better performance
export const LazyInsights = lazy(() => import('../screens/Insights'));
export const LazyHabitDetails = lazy(() => import('../screens/HabitDetails'));
export const LazySettings = lazy(() => import('../screens/Settings'));

// Loading fallback component
export function ScreenLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

// Higher-order component for lazy loading with error boundary
export function withLazyLoading<T extends object>(
  Component: React.ComponentType<T>,
  fallback?: React.ComponentType
) {
  return function LazyComponent(props: T) {
    return (
      <Suspense fallback={fallback ? <fallback /> : <ScreenLoader />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

// Preload critical resources
export function preloadCriticalResources() {
  // Preload critical images
  const criticalImages = [
    '/icon-192.png',
    '/icon-512.png',
  ];

  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });

  // Preload critical fonts
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'font';
  link.type = 'font/woff2';
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
}

// Image optimization component
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
}

export function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  className = '',
  loading = 'lazy',
  priority = false
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  const handleLoad = () => setIsLoaded(true);
  const handleError = () => setHasError(true);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      {hasError ? (
        <div className="flex items-center justify-center w-full h-full bg-muted text-muted-foreground">
          <span className="text-sm">Failed to load</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : loading}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            willChange: 'opacity',
          }}
        />
      )}
    </div>
  );
}

// SVG icon component for better performance
interface SvgIconProps {
  name: string;
  size?: number;
  className?: string;
}

export function SvgIcon({ name, size = 24, className = '' }: SvgIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`transition-colors ${className}`}
      style={{
        willChange: 'color',
      }}
    >
      {/* Icon paths would be defined here based on name */}
      <path
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      />
    </svg>
  );
}
