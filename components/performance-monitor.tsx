'use client';

import { memo, useEffect, useCallback, useState } from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

interface PerformanceMetric {
  name: string;
  value: number;
  threshold: number;
  timestamp: number;
}

const componentTimings: { [key: string]: number } = {};

export function startTiming(componentName: string) {
  componentTimings[componentName] = performance.now();
}

export function endTiming(componentName: string) {
  if (componentTimings[componentName]) {
    const duration = performance.now() - componentTimings[componentName];
    logPerf(`${componentName} Render`, duration, 0);
    delete componentTimings[componentName];
  }
}

function logPerf(action: string, duration: number, threshold = 0) {
  if (duration > threshold) {
    console.log('\x1b[36m%s\x1b[0m', `⏱️ ${action}: ${duration.toFixed(2)}ms`);
  }
}

const MetricBadge = memo(({ metric }: { metric: PerformanceMetric }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    transition={{ duration: 0.2 }}
  >
    <Badge
      variant={metric.value > metric.threshold ? 'destructive' : 'secondary'}
      className="flex items-center gap-1.5"
    >
      <Clock className="h-3 w-3" />
      {metric.name}: {metric.value.toFixed(2)}ms
    </Badge>
  </motion.div>
));
MetricBadge.displayName = 'MetricBadge';

const ErrorAlert = memo(({ message }: { message: string }) => (
  <Alert variant="destructive" className="mt-4">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>{message}</AlertDescription>
  </Alert>
));
ErrorAlert.displayName = 'ErrorAlert';

export const PerformanceMonitor = memo(() => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addMetric = useCallback(
    (name: string, value: number, threshold: number) => {
      setMetrics((prev) => {
        const newMetrics = prev.filter((m) => m.name !== name);
        return [
          ...newMetrics,
          {
            name,
            value,
            threshold,
            timestamp: Date.now(),
          },
        ].slice(-5); // Keep only last 5 metrics
      });
    },
    [],
  );

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    let layoutObserver: PerformanceObserver | null = null;
    let resourceObserver: PerformanceObserver | null = null;
    const mountTime = performance.now();

    try {
      startTiming('RootLayout');
      startTiming('MainContent');

      // Track layout shifts
      layoutObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'layout-shift') {
            addMetric('Layout Shift', entry.startTime, 0);
          }
        });
      });
      layoutObserver.observe({ entryTypes: ['layout-shift'] });

      // Track resource timing
      resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const resource = entry as PerformanceResourceTiming;
          const size = resource.encodedBodySize / 1024;

          if (resource.duration > 1000 || size > 500) {
            const name = resource.name.split('/').pop() || '';
            addMetric(`Resource: ${name}`, resource.duration, 1000);
          }
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });

      // Handle window load
      const handleLoad = () => {
        try {
          endTiming('MainContent');
          endTiming('RootLayout');

          const timing = performance.getEntriesByType(
            'navigation',
          )[0] as PerformanceNavigationTiming;
          const start = timing.fetchStart;

          const pageLoad = timing.loadEventEnd - start;
          const domReady = timing.domContentLoadedEventEnd - start;
          const firstPaint =
            performance.getEntriesByType('paint')[0]?.startTime || 0;

          if (pageLoad > 1000) addMetric('Page Load', pageLoad, 1000);
          if (domReady > 500) addMetric('DOM Ready', domReady, 500);
          if (firstPaint > 100) addMetric('First Paint', firstPaint, 100);
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : 'Failed to measure performance';
          setError(message);
          console.debug('Performance monitoring error:', err);
        }
      };

      window.addEventListener('load', handleLoad);

      return () => {
        window.removeEventListener('load', handleLoad);
        layoutObserver?.disconnect();
        resourceObserver?.disconnect();
        addMetric('Initial Mount', performance.now() - mountTime, 100);
      };
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to initialize performance monitoring';
      setError(message);
      console.debug('Performance monitoring setup error:', err);
      return () => {
        layoutObserver?.disconnect();
        resourceObserver?.disconnect();
      };
    }
  }, [addMetric]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      <AnimatePresence mode="popLayout">
        {metrics.map((metric) => (
          <MetricBadge
            key={`${metric.name}-${metric.timestamp}`}
            metric={metric}
          />
        ))}
      </AnimatePresence>
      {error && <ErrorAlert message={error} />}
    </div>
  );
});
PerformanceMonitor.displayName = 'PerformanceMonitor';
