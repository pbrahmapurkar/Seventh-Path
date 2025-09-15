// Performance monitoring utilities for 60fps optimization
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private frameCount = 0;
  private lastTime = 0;
  private fps = 0;
  private isMonitoring = false;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMonitoring(): void {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    this.lastTime = performance.now();
    this.frameCount = 0;
    this.measureFPS();
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
  }

  private measureFPS(): void {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    this.frameCount++;

    if (currentTime - this.lastTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      this.frameCount = 0;
      this.lastTime = currentTime;

      // Log performance warnings
      if (this.fps < 50) {
        console.warn(`Low FPS detected: ${this.fps}fps`);
      }
    }

    requestAnimationFrame(() => this.measureFPS());
  }

  getFPS(): number {
    return this.fps;
  }

  // Measure component render time
  measureRenderTime<T>(componentName: string, renderFn: () => T): T {
    const start = performance.now();
    const result = renderFn();
    const end = performance.now();
    const renderTime = end - start;

    if (renderTime > 16) { // More than one frame at 60fps
      console.warn(`${componentName} render took ${renderTime.toFixed(2)}ms`);
    }

    return result;
  }

  // Debounce function for performance
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Throttle function for performance
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }
}

// React hook for performance monitoring
export function usePerformanceMonitor(componentName: string) {
  const monitor = PerformanceMonitor.getInstance();

  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      monitor.startMonitoring();
    }
    return () => {
      if (process.env.NODE_ENV === 'development') {
        monitor.stopMonitoring();
      }
    };
  }, [monitor]);

  return {
    measureRender: (renderFn: () => React.ReactNode) => 
      monitor.measureRenderTime(componentName, renderFn),
    getFPS: () => monitor.getFPS(),
    debounce: monitor.debounce.bind(monitor),
    throttle: monitor.throttle.bind(monitor),
  };
}

// Memory usage monitoring
export function getMemoryUsage(): {
  used: number;
  total: number;
  percentage: number;
} {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
      percentage: Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100),
    };
  }
  return { used: 0, total: 0, percentage: 0 };
}

// Bundle size analyzer
export function analyzeBundleSize(): void {
  if (process.env.NODE_ENV === 'development') {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    
    console.group('Bundle Analysis');
    console.log('Scripts:', scripts.length);
    console.log('Stylesheets:', stylesheets.length);
    
    // Log memory usage
    const memory = getMemoryUsage();
    console.log('Memory Usage:', `${memory.used}MB / ${memory.total}MB (${memory.percentage}%)`);
    
    console.groupEnd();
  }
}

// Image loading optimization
export function optimizeImageLoading(): void {
  // Add intersection observer for lazy loading
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    // Observe all images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach((img) => {
      imageObserver.observe(img);
    });
  }
}

// Critical resource preloader
export function preloadCriticalResources(): void {
  const criticalResources = [
    { href: '/icon-192.png', as: 'image' },
    { href: '/icon-512.png', as: 'image' },
  ];

  criticalResources.forEach(({ href, as }) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = as;
    link.href = href;
    document.head.appendChild(link);
  });
}

// Service Worker registration for caching
export function registerServiceWorker(): void {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  }
}

// Performance budget checker
export function checkPerformanceBudget(): {
  passed: boolean;
  metrics: {
    fps: number;
    memoryUsage: number;
    renderTime: number;
  };
} {
  const monitor = PerformanceMonitor.getInstance();
  const memory = getMemoryUsage();
  
  const metrics = {
    fps: monitor.getFPS(),
    memoryUsage: memory.percentage,
    renderTime: 0, // This would be measured per component
  };

  const passed = metrics.fps >= 50 && metrics.memoryUsage < 80;

  return { passed, metrics };
}
