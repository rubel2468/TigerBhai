// Performance optimization utilities to prevent forced reflows

// Debounce function to prevent excessive DOM queries
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for scroll/resize events
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Batch DOM reads to prevent forced reflows
export const batchDOMReads = (readFunctions) => {
  // First, read all properties
  const results = readFunctions.map(fn => fn());
  
  // Then, if any writes are needed, batch them
  return results;
};

// Optimized element measurement
export const measureElement = (element) => {
  if (!element) return null;
  
  // Use requestAnimationFrame to ensure layout is complete
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      const rect = element.getBoundingClientRect();
      resolve({
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
        bottom: rect.bottom,
        right: rect.right
      });
    });
  });
};

// Prevent layout thrashing by batching style changes
export const batchStyleChanges = (element, changes) => {
  if (!element) return;
  
  // Use requestAnimationFrame to batch changes
  requestAnimationFrame(() => {
    Object.assign(element.style, changes);
  });
};

// Optimized scroll handler
export const createOptimizedScrollHandler = (callback) => {
  let ticking = false;
  
  return function() {
    if (!ticking) {
      requestAnimationFrame(() => {
        callback();
        ticking = false;
      });
      ticking = true;
    }
  };
};

// Intersection Observer for lazy loading
export const createIntersectionObserver = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };
  
  return new IntersectionObserver(callback, defaultOptions);
};

// Memory-efficient event listener management
export const createEventManager = () => {
  const listeners = new Map();
  
  return {
    add: (element, event, handler, options = {}) => {
      const key = `${element}_${event}`;
      if (listeners.has(key)) {
        this.remove(element, event);
      }
      
      element.addEventListener(event, handler, options);
      listeners.set(key, { element, event, handler, options });
    },
    
    remove: (element, event) => {
      const key = `${element}_${event}`;
      const listener = listeners.get(key);
      if (listener) {
        element.removeEventListener(event, listener.handler, listener.options);
        listeners.delete(key);
      }
    },
    
    removeAll: () => {
      listeners.forEach(({ element, event, handler, options }) => {
        element.removeEventListener(event, handler, options);
      });
      listeners.clear();
    }
  };
};

// Performance monitoring for forced reflows
export const monitorForcedReflows = () => {
  if (typeof window === 'undefined') return;
  
  let reflowCount = 0;
  const originalGetComputedStyle = window.getComputedStyle;
  
  window.getComputedStyle = function(element, pseudoElement) {
    reflowCount++;
    if (reflowCount > 10) {
      console.warn('High number of forced reflows detected:', reflowCount);
    }
    return originalGetComputedStyle.call(this, element, pseudoElement);
  };
  
  // Reset counter periodically
  setInterval(() => {
    reflowCount = 0;
  }, 1000);
};
