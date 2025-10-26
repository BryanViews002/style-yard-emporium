// Performance monitoring utilities

interface PerformanceMetrics {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private observers: PerformanceObserver[] = [];

  private constructor() {
    this.initializeObservers();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeObservers(): void {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('LCP', lastEntry.startTime, {
          element: lastEntry.element?.tagName,
          url: lastEntry.url,
        });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordMetric('FID', entry.processingStart - entry.startTime, {
            eventType: entry.name,
          });
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        });
        this.recordMetric('CLS', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    }
  }

  public startTiming(name: string, metadata?: Record<string, any>): void {
    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      metadata,
    });
  }

  public endTiming(name: string): number | null {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`No timing found for ${name}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  public recordMetric(name: string, value: number, metadata?: Record<string, any>): void {
    const metric: PerformanceMetrics = {
      name,
      startTime: performance.now(),
      endTime: performance.now(),
      duration: value,
      metadata,
    };

    this.metrics.set(name, metric);

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance: ${name} = ${value.toFixed(2)}`, metadata);
    }
  }

  public getMetrics(): PerformanceMetrics[] {
    return Array.from(this.metrics.values());
  }

  public getMetric(name: string): PerformanceMetrics | undefined {
    return this.metrics.get(name);
  }

  public clearMetrics(): void {
    this.metrics.clear();
  }

  public disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Higher-order function for timing React components
export const withTiming = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) => {
  return React.memo((props: P) => {
    const monitor = PerformanceMonitor.getInstance();
    
    React.useEffect(() => {
      monitor.startTiming(`${componentName}-render`);
      return () => {
        monitor.endTiming(`${componentName}-render`);
      };
    });

    return <Component {...props} />;
  });
};

// Hook for timing custom operations
export const useTiming = (name: string) => {
  const monitor = PerformanceMonitor.getInstance();

  const startTiming = React.useCallback((metadata?: Record<string, any>) => {
    monitor.startTiming(name, metadata);
  }, [name, monitor]);

  const endTiming = React.useCallback(() => {
    return monitor.endTiming(name);
  }, [name, monitor]);

  return { startTiming, endTiming };
};

// Utility for measuring API call performance
export const measureApiCall = async <T>(
  apiCall: () => Promise<T>,
  endpoint: string
): Promise<T> => {
  const monitor = PerformanceMonitor.getInstance();
  monitor.startTiming(`api-${endpoint}`);

  try {
    const result = await apiCall();
    monitor.endTiming(`api-${endpoint}`);
    return result;
  } catch (error) {
    monitor.endTiming(`api-${endpoint}`);
    throw error;
  }
};

// Utility for measuring render performance
export const measureRender = <T>(
  renderFn: () => T,
  componentName: string
): T => {
  const monitor = PerformanceMonitor.getInstance();
  monitor.startTiming(`render-${componentName}`);
  
  const result = renderFn();
  
  monitor.endTiming(`render-${componentName}`);
  return result;
};

export default PerformanceMonitor;
