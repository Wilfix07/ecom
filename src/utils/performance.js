/**
 * Performance utilities for React components
 */

/**
 * Throttle function calls to limit frequency
 */
export function throttle(func, delay) {
  let timeoutId;
  let lastExecTime = 0;
  
  return function (...args) {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func.apply(this, args);
      lastExecTime = currentTime;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}

/**
 * Memoize expensive computations
 */
export function memoize(fn, keyGenerator) {
  const cache = new Map();
  
  return function (...args) {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Lazy load images for better performance
 */
export function lazyLoadImage(src, placeholder = '/placeholder.jpg') {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(src);
    img.onerror = () => resolve(placeholder);
  });
}

/**
 * Preload resources
 */
export function preloadResources(urls) {
  return Promise.all(
    urls.map(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'fetch';
      link.href = url;
      document.head.appendChild(link);
    })
  );
}

