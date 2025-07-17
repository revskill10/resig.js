/**
 * Plugin Engine - Zero-runtime cost category functors
 * Each plugin is a category functor that rewrites the AST lazily
 */

import { Signal } from '../core/signal';
import { Effect } from '../core/effect';
import { Time, debounce, throttle } from '../algebras/time';

export type Plugin<A> = (signal: Signal<A>) => Signal<A>;

/**
 * Debounce plugin - delays signal updates
 */
export const debouncePlugin = <A>(ms: number): Plugin<A> => (signal: Signal<A>) => {
  return debounce(ms, signal as Effect<A>);
};

/**
 * Throttle plugin - limits signal update frequency
 */
export const throttlePlugin = <A>(ms: number): Plugin<A> => (signal: Signal<A>) => {
  return throttle(ms, signal as Effect<A>);
};

/**
 * Cache plugin - caches signal values in localStorage
 */
export const cachePlugin = <A>(key: string, ttl: number = 300000): Plugin<A> => (signal: Signal<A>) => {
  // Try to load from cache
  try {
    const cached = localStorage.getItem(`signal_cache_${key}`);
    const cacheTime = localStorage.getItem(`signal_cache_time_${key}`);
    
    if (cached && cacheTime) {
      const age = Date.now() - parseInt(cacheTime);
      if (age < ttl) {
        // Return cached signal
        const cachedSignal = signal.map(() => JSON.parse(cached));
        return cachedSignal;
      }
    }
  } catch (e) {
    // Cache read failed, proceed without cache
  }
  
  // Subscribe to signal changes and cache them
  signal.subscribe((value) => {
    try {
      localStorage.setItem(`signal_cache_${key}`, JSON.stringify(value));
      localStorage.setItem(`signal_cache_time_${key}`, Date.now().toString());
    } catch (e) {
      // Cache write failed, continue without caching
    }
  });
  
  return signal;
};

/**
 * Logger plugin - logs signal changes
 */
export const loggerPlugin = <A>(prefix: string = 'Signal'): Plugin<A> => (signal: Signal<A>) => {
  signal.subscribe((value) => {
    console.log(`${prefix}:`, value);
  });
  return signal;
};

/**
 * Filter plugin - only emits values that pass predicate
 */
export const filterPlugin = <A>(predicate: (value: A) => boolean): Plugin<A> => (signal: Signal<A>) => {
  return signal.map(value => predicate(value) ? value : signal.value());
};

/**
 * Transform plugin - applies transformation to signal values
 */
export const transformPlugin = <A, B>(transform: (value: A) => B): Plugin<A> => (signal: Signal<A>) => {
  return signal.map(transform) as unknown as Signal<A>;
};

/**
 * Validation plugin - validates signal values
 */
export const validatePlugin = <A>(
  validator: (value: A) => boolean,
  onError?: (value: A) => void
): Plugin<A> => (signal: Signal<A>) => {
  signal.subscribe((value) => {
    if (!validator(value)) {
      onError?.(value);
    }
  });
  return signal;
};

/**
 * Persistence plugin - persists signal state
 */
export const persistPlugin = <A>(key: string): Plugin<A> => (signal: Signal<A>) => {
  // Load initial state from storage
  try {
    const stored = localStorage.getItem(`persist_${key}`);
    if (stored) {
      const parsedValue = JSON.parse(stored);
      // Create new signal with stored value
      const persistedSignal = signal.map(() => parsedValue);
      
      // Subscribe to changes and persist them
      persistedSignal.subscribe((value) => {
        try {
          localStorage.setItem(`persist_${key}`, JSON.stringify(value));
        } catch (e) {
          // Persist failed, continue without persistence
        }
      });
      
      return persistedSignal;
    }
  } catch (e) {
    // Load failed, proceed with original signal
  }
  
  // Subscribe to changes and persist them
  signal.subscribe((value) => {
    try {
      localStorage.setItem(`persist_${key}`, JSON.stringify(value));
    } catch (e) {
      // Persist failed, continue without persistence
    }
  });
  
  return signal;
};

/**
 * Compose multiple plugins
 */
export const compose = <A>(...plugins: Plugin<A>[]): Plugin<A> => (signal: Signal<A>) => {
  return plugins.reduce((acc, plugin) => plugin(acc), signal);
};

/**
 * Apply plugin to signal
 */
export const apply = <A>(plugin: Plugin<A>) => (signal: Signal<A>): Signal<A> => {
  return plugin(signal);
};

/**
 * Conditional plugin application
 */
export const when = <A>(condition: boolean, plugin: Plugin<A>): Plugin<A> => (signal: Signal<A>) => {
  return condition ? plugin(signal) : signal;
};

/**
 * Plugin that applies different plugins based on signal value
 */
export const switchPlugin = <A>(
  selector: (value: A) => string,
  plugins: Record<string, Plugin<A>>,
  defaultPlugin?: Plugin<A>
): Plugin<A> => (signal: Signal<A>) => {
  const currentValue = signal.value();
  const key = selector(currentValue);
  const selectedPlugin = plugins[key] || defaultPlugin;
  
  return selectedPlugin ? selectedPlugin(signal) : signal;
};

/**
 * Built-in plugin combinations
 */
export const commonPlugins = {
  /**
   * Debug plugin - combines logging and validation
   */
  debug: <A>(name: string, validator?: (value: A) => boolean): Plugin<A> => 
    compose(
      loggerPlugin(`Debug[${name}]`),
      validator ? validatePlugin(validator, (value) => console.warn(`Invalid value in ${name}:`, value)) : (s) => s
    ),
  
  /**
   * Performance plugin - combines debounce and cache
   */
  performance: <A>(key: string, debounceMs: number = 100, cacheTtl: number = 300000): Plugin<A> =>
    compose(
      debouncePlugin(debounceMs),
      cachePlugin(key, cacheTtl)
    ),
  
  /**
   * Persistent state plugin - combines persistence and validation
   */
  persistentState: <A>(key: string, validator?: (value: A) => boolean): Plugin<A> =>
    compose(
      persistPlugin(key),
      validator ? validatePlugin(validator) : (s) => s
    )
};
