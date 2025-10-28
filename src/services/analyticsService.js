import ReactGA from 'react-ga4';
import hotjar from '@hotjar/browser';
import { supabase } from '../lib/supabase';

// Initialize analytics
let isInitialized = false;

export const analyticsService = {
  /**
   * Initialize Google Analytics and Hotjar
   */
  initialize() {
    if (isInitialized) return;
    
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    const hotjarId = import.meta.env.VITE_HOTJAR_ID;
    
    // Initialize Google Analytics
    if (gaId) {
      ReactGA.initialize(gaId);
      console.log('📊 Google Analytics initialized');
    }

    // Initialize Hotjar
    if (hotjarId) {
      hotjar.initialize(parseInt(hotjarId), 6);
      console.log('🔥 Hotjar initialized');
    }

    isInitialized = true;
  },

  /**
   * Track page views
   */
  trackPageView(pageName, pagePath) {
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    
    if (gaId) {
      ReactGA.send({ hitType: 'pageview', page: pagePath, title: pageName });
    }

    // Store in Supabase for custom analytics
    this.saveEvent('page_view', pageName, {
      page_path: pagePath,
      page_title: pageName,
    });
  },

  /**
   * Track events
   */
  trackEvent(category, action, label, value) {
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    
    if (gaId) {
      ReactGA.event({
        category,
        action,
        label,
        value,
      });
    }

    // Store in Supabase
    this.saveEvent('event', action, {
      category,
      action,
      label,
      value,
    });
  },

  /**
   * Save event to Supabase
   */
  async saveEvent(eventType, eventName, metadata = {}) {
    try {
      const sessionId = this.getSessionId();
      const userAgent = navigator.userAgent;
      
      await supabase.from('analytics_events').insert({
        event_type: eventType,
        event_name: eventName,
        user_id: null, // Will be set if user is logged in
        session_id: sessionId,
        page_url: window.location.href,
        page_title: document.title,
        referrer: document.referrer,
        user_agent: userAgent,
        screen_width: window.screen.width,
        screen_height: window.screen.height,
        metadata,
      });
    } catch (error) {
      console.error('Analytics save error:', error);
    }
  },

  /**
   * Track A/B test assignment
   */
  async assignABTest(testName, variants = ['A', 'B']) {
    const sessionId = this.getSessionId();
    const variant = this.getStoredVariant(testName);
    
    if (!variant) {
      // Assign variant based on session hash
      const hash = this.hashSession(sessionId + testName);
      const assignedVariant = variants[hash % variants.length];
      this.setStoredVariant(testName, assignedVariant);
      
      await supabase.from('ab_test_results').insert({
        test_name: testName,
        variant: assignedVariant,
        session_id: sessionId,
      });
      
      return assignedVariant;
    }
    
    return variant;
  },

  /**
   * Track A/B test conversion
   */
  async trackABConversion(testName, conversionType, conversionValue = 0) {
    const sessionId = this.getSessionId();
    const variant = this.getStoredVariant(testName);
    
    if (!variant) return;
    
    try {
      await supabase.from('ab_test_results').insert({
        test_name: testName,
        variant,
        session_id: sessionId,
        conversion_type: conversionType,
        conversion_value: conversionValue,
      });
    } catch (error) {
      console.error('AB Test tracking error:', error);
    }
  },

  /**
   * Track performance metric
   */
  async trackPerformance(metricType, metricValue, deviceType = 'desktop') {
    try {
      await supabase.from('performance_metrics').insert({
        metric_type: metricType,
        metric_value: metricValue,
        page_url: window.location.href,
        device_type: window.screen.width < 768 ? 'mobile' : deviceType,
        metadata: {},
      });
    } catch (error) {
      console.error('Performance tracking error:', error);
    }
  },

  /**
   * Track heatmap click
   */
  async trackHeatmapClick(x, y, elementType, elementId, elementClasses) {
    try {
      const sessionId = this.getSessionId();
      
      await supabase.from('heatmap_data').insert({
        page_url: window.location.href,
        x_position: x,
        y_position: y,
        element_type: elementType,
        element_id: elementId,
        element_classes: elementClasses,
        session_id: sessionId,
      });
    } catch (error) {
      console.error('Heatmap tracking error:', error);
    }
  },

  /**
   * Track product view
   */
  trackProductView(productId, productName, category) {
    this.trackEvent('Products', 'View', productName, productId);
    
    this.trackEvent('Products', 'View Category', category, 0);
  },

  /**
   * Track add to cart
   */
  trackAddToCart(productId, productName, price, currency) {
    this.trackEvent('Cart', 'Add', productName, productId);
    
    // Enhanced ecommerce tracking
    ReactGA.event({
      category: 'Ecommerce',
      action: 'add_to_cart',
      label: productName,
      value: price,
    });
  },

  /**
   * Track purchase
   */
  trackPurchase(orderId, total, items, currency) {
    this.trackEvent('Purchase', 'Complete', orderId, total);
    
    // Enhanced ecommerce
    ReactGA.event({
      category: 'Ecommerce',
      action: 'purchase',
      value: total,
      currency: currency,
    });
  },

  /**
   * Get session ID
   */
  getSessionId() {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  },

  /**
   * Hash function for consistent variant assignment
   */
  hashSession(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  },

  /**
   * Get stored A/B test variant
   */
  getStoredVariant(testName) {
    return localStorage.getItem(`ab_test_${testName}`);
  },

  /**
   * Set stored A/B test variant
   */
  setStoredVariant(testName, variant) {
    localStorage.setItem(`ab_test_${testName}`, variant);
  },
};

// Auto-initialize on import in production
if (import.meta.env.PROD) {
  analyticsService.initialize();
}

