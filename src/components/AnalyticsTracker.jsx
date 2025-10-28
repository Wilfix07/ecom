import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analyticsService } from '../services/analyticsService';

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view on route change
    analyticsService.trackPageView(document.title, location.pathname);
  }, [location]);

  useEffect(() => {
    // Track performance metrics
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const timing = entry;
            analyticsService.trackPerformance('page_load_time', timing.loadEventEnd - timing.fetchStart);
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['navigation'] });
      } catch (error) {
        console.error('Performance tracking error:', error);
      }
    }

    // Track Core Web Vitals
    const trackWebVitals = async () => {
      if ('PerformanceObserver' in window) {
        // Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          analyticsService.trackPerformance('lcp', lastEntry.renderTime || lastEntry.loadTime);
        });

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            analyticsService.trackPerformance('fid', entry.processingStart - entry.startTime);
          }
        });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          analyticsService.trackPerformance('cls', clsValue);
        });

        try {
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
          fidObserver.observe({ entryTypes: ['first-input'] });
          clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (error) {
          console.error('Web Vitals tracking error:', error);
        }
      }
    };

    trackWebVitals();
  }, []);

  return null;
};

export default AnalyticsTracker;

