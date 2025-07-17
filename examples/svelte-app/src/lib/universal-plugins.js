/**
 * Universal Signal-Σ Plugins
 * Reusable plugins that work across all frameworks
 * 
 * These plugins extend the core Signal-Σ plugin system with additional functionality
 */

// Re-export core plugins from Signal-Σ
export {
  debouncePlugin,
  validatePlugin,
  loggerPlugin,
  persistPlugin,
  stateMachinePlugin,
  compose
} from '../../../../build/module/plugins/index.js';

/**
 * Retry plugin - retries failed async operations
 * Follows the Signal-Σ plugin pattern: (config) => (signal) => signal
 */
export const retryPlugin = (maxRetries = 3, delay = 1000) => (signal) => {
  // Return the original signal with retry behavior
  // The retry logic would be handled at the async operation level
  // For now, just pass through the signal to maintain Plugin<T> interface
  return signal.map(value => value);
};

/**
 * Timeout plugin - adds timeout to async operations
 * Follows the Signal-Σ plugin pattern: (config) => (signal) => signal
 */
export const timeoutPlugin = (timeout = 5000) => (signal) => {
  // Return the original signal with timeout behavior
  // The timeout logic would be handled at the async operation level
  // For now, just pass through the signal to maintain Plugin<T> interface
  return signal.map(value => value);
};

/**
 * Cache plugin - caches results for a specified duration
 * Follows the Signal-Σ plugin pattern: (config) => (signal) => signal
 */
export const cachePlugin = (duration = 60000) => (signal) => {
  // Return the original signal with cache behavior
  // The cache logic would be handled at the async operation level
  // For now, just pass through the signal to maintain Plugin<T> interface
  return signal.map(value => value);
};

/**
 * Throttle plugin - throttles signal updates
 * Follows the Signal-Σ plugin pattern: (config) => (signal) => signal
 */
export const throttlePlugin = (delay = 1000) => (signal) => {
  let lastUpdate = 0;
  return signal.map(value => {
    const now = Date.now();
    if (now - lastUpdate >= delay) {
      lastUpdate = now;
      return value;
    }
    return signal.value(); // Return previous value if throttled
  });
};

/**
 * Transform plugin - transforms signal values
 * Follows the Signal-Σ plugin pattern: (config) => (signal) => signal
 */
export const transformPlugin = (transformer) => (signal) => {
  return signal.map(transformer);
};

/**
 * Filter plugin - filters signal updates based on predicate
 * Follows the Signal-Σ plugin pattern: (config) => (signal) => signal
 */
export const filterPlugin = (predicate) => (signal) => {
  return signal.map(value => {
    if (predicate(value)) {
      return value;
    }
    return signal.value(); // Return previous value if filtered out
  });
};

/**
 * History plugin - keeps track of signal value history
 * Follows the Signal-Σ plugin pattern: (config) => (signal) => signal
 */
export const historyPlugin = (maxHistory = 10) => (signal) => {
  const history = [];
  
  const historySignal = signal.map(value => {
    // Add to history
    history.push({ value, timestamp: Date.now() });
    
    // Limit history size
    if (history.length > maxHistory) {
      history.shift();
    }
    
    return value;
  });
  
  // Add history methods
  historySignal.getHistory = () => [...history];
  historySignal.getPrevious = () => history[history.length - 2]?.value;
  historySignal.canUndo = () => history.length > 1;
  
  return historySignal;
};

/**
 * Async plugin - handles async operations with loading states
 * Follows the Signal-Σ plugin pattern: (config) => (signal) => signal
 */
export const asyncPlugin = (config = {}) => (signal) => {
  const { 
    loadingState = 'loading',
    errorState = 'error',
    successState = 'success'
  } = config;
  
  // Transform signal to include async state
  return signal.map(value => {
    if (value && typeof value.then === 'function') {
      // Handle Promise values
      return {
        state: loadingState,
        data: null,
        error: null,
        promise: value
      };
    }
    
    // Handle regular values
    return {
      state: successState,
      data: value,
      error: null,
      promise: null
    };
  });
};

/**
 * Batch plugin - batches multiple updates into single update
 * Follows the Signal-Σ plugin pattern: (config) => (signal) => signal
 */
export const batchPlugin = (batchSize = 5, delay = 100) => (signal) => {
  const batch = [];
  let timeoutId = null;
  
  return signal.map(value => {
    batch.push(value);
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    if (batch.length >= batchSize) {
      const batchedValue = [...batch];
      batch.length = 0;
      return batchedValue;
    }
    
    timeoutId = setTimeout(() => {
      if (batch.length > 0) {
        const batchedValue = [...batch];
        batch.length = 0;
        signal._set(batchedValue);
      }
    }, delay);
    
    return signal.value(); // Return previous value while batching
  });
};

/**
 * Conditional plugin - applies plugin conditionally
 * Follows the Signal-Σ plugin pattern: (config) => (signal) => signal
 */
export const conditionalPlugin = (condition, plugin) => (signal) => {
  if (condition()) {
    return plugin(signal);
  }
  return signal;
};

/**
 * Pipe plugin - pipes signal through multiple transformations
 * Follows the Signal-Σ plugin pattern: (config) => (signal) => signal
 */
export const pipePlugin = (...transformers) => (signal) => {
  return transformers.reduce((acc, transformer) => {
    return acc.map(transformer);
  }, signal);
};
