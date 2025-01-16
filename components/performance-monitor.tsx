'use client'

import { useEffect } from 'react'

// Track component render times
const componentTimings: { [key: string]: number } = {}

export function startTiming(componentName: string) {
  componentTimings[componentName] = performance.now()
}

export function endTiming(componentName: string) {
  if (componentTimings[componentName]) {
    const duration = performance.now() - componentTimings[componentName]
    logPerf(`${componentName} Render`, duration, 0)
    delete componentTimings[componentName]
  }
}

function logPerf(action: string, duration: number, threshold = 0) {
  if (duration > threshold) {
    console.log('\x1b[36m%s\x1b[0m', `⏱️ ${action}: ${duration.toFixed(2)}ms`);
  }
}

export function PerformanceMonitor() {
  useEffect(() => {
    // Only monitor in development
    if (process.env.NODE_ENV !== 'development') return;

    // Start timing layout and main content
    startTiming('RootLayout')
    startTiming('MainContent')

    // Log initial mount
    const mountTime = performance.now();
    
    // Create a PerformanceObserver to track layout shifts
    const layoutObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'layout-shift') {
          logPerf('Layout Shift', entry.startTime, 0);
        }
      });
    });

    try {
      layoutObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.debug('Layout shifts cannot be monitored:', e);
    }
    
    // Wait for window load to measure full page metrics
    window.addEventListener('load', () => {
      try {
        endTiming('MainContent')
        endTiming('RootLayout')

        // Navigation Timing API metrics
        const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const start = timing.fetchStart;
        
        // Calculate timings relative to fetchStart
        const pageLoad = timing.loadEventEnd - start;
        const domReady = timing.domContentLoadedEventEnd - start;
        const firstPaint = performance.getEntriesByType('paint')[0]?.startTime || 0;

        // Only log metrics above certain thresholds
        if (pageLoad > 1000) logPerf('Page Load', pageLoad);
        if (domReady > 500) logPerf('DOM Ready', domReady);
        if (firstPaint > 100) logPerf('First Paint', firstPaint);
        
        // Log only very large resources (>1s load time or >500KB)
        const resources = performance.getEntriesByType('resource');
        resources.forEach((entry) => {
          const resource = entry as PerformanceResourceTiming;
          const size = resource.encodedBodySize / 1024;
          
          if (resource.duration > 1000 || size > 500) {
            const name = resource.name.split('/').pop();
            logPerf(`Large Resource: ${name}`, resource.duration, 1000);
            if (size > 500) {
              console.log('\x1b[33m%s\x1b[0m', `⚠️ Size: ${size.toFixed(2)}KB`);
            }
          }
        });
      } catch (error) {
        // Ignore errors in performance monitoring
        console.debug('Performance monitoring error:', error);
      }
    });

    return () => {
      // Log component mount time only if significant
      logPerf('Initial Mount', performance.now() - mountTime, 100);
      // Cleanup
      try {
        layoutObserver.disconnect();
      } catch {
        // Ignore cleanup errors
      }
    };
  }, []);

  // This component doesn't render anything
  return null;
} 