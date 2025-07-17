/**
 * Plugin Engine - Zero-runtime cost category functors
 * Each plugin is a category functor that rewrites the AST lazily
 */

import { debounce, throttle } from '../algebras/time';
import { Effect } from '../core/effect';
import { Signal } from '../core/signal';

export type Plugin<A> = (signal: Signal<A>) => Signal<A>;

/**
 * Debounce plugin - delays signal updates
 */
export const debouncePlugin =
  <A>(ms: number): Plugin<A> =>
  (signal: Signal<A>) => {
    return debounce(ms, signal as Effect<A>);
  };

/**
 * Throttle plugin - limits signal update frequency
 */
export const throttlePlugin =
  <A>(ms: number): Plugin<A> =>
  (signal: Signal<A>) => {
    return throttle(ms, signal as Effect<A>);
  };

/**
 * Cache plugin - caches signal values in localStorage
 */
export const cachePlugin =
  <A>(key: string, ttl: number = 300000): Plugin<A> =>
  (signal: Signal<A>) => {
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
export const loggerPlugin =
  <A>(prefix: string = 'Signal'): Plugin<A> =>
  (signal: Signal<A>) => {
    signal.subscribe((value) => {
      console.log(`${prefix}:`, value);
    });
    return signal;
  };

/**
 * Filter plugin - only emits values that pass predicate
 */
export const filterPlugin =
  <A>(predicate: (value: A) => boolean): Plugin<A> =>
  (signal: Signal<A>) => {
    return signal.map((value) => (predicate(value) ? value : signal.value()));
  };

/**
 * Transform plugin - applies transformation to signal values
 */
export const transformPlugin =
  <A, B>(transform: (value: A) => B): Plugin<A> =>
  (signal: Signal<A>) => {
    return signal.map(transform) as unknown as Signal<A>;
  };

/**
 * Validation plugin - validates signal values
 */
export const validatePlugin =
  <A>(
    validator: (value: A) => boolean,
    onError?: (value: A) => void,
  ): Plugin<A> =>
  (signal: Signal<A>) => {
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
export const persistPlugin =
  <A>(key: string): Plugin<A> =>
  (signal: Signal<A>) => {
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
export const compose =
  <A>(...plugins: Plugin<A>[]): Plugin<A> =>
  (signal: Signal<A>) => {
    return plugins.reduce((acc, plugin) => plugin(acc), signal);
  };

/**
 * Apply plugin to signal
 */
export const apply =
  <A>(plugin: Plugin<A>) =>
  (signal: Signal<A>): Signal<A> => {
    return plugin(signal);
  };

/**
 * Conditional plugin application
 */
export const when =
  <A>(condition: boolean, plugin: Plugin<A>): Plugin<A> =>
  (signal: Signal<A>) => {
    return condition ? plugin(signal) : signal;
  };

/**
 * Plugin that applies different plugins based on signal value
 */
export const switchPlugin =
  <A>(
    selector: (value: A) => string,
    plugins: Record<string, Plugin<A>>,
    defaultPlugin?: Plugin<A>,
  ): Plugin<A> =>
  (signal: Signal<A>) => {
    const currentValue = signal.value();
    const key = selector(currentValue);
    const selectedPlugin = plugins[key] || defaultPlugin;

    return selectedPlugin ? selectedPlugin(signal) : signal;
  };

/**
 * Async plugin - handles async operations with loading states
 */
export const asyncPlugin = <A, B>(
  asyncFn: (value: A) => Promise<B>,
  initialValue?: B
): Plugin<A> => (signal: Signal<A>) => {
  const asyncSignal = signal.map(() => ({
    data: initialValue,
    loading: false,
    error: undefined as Error | undefined
  }));

  signal.subscribe(async (value) => {
    // Set loading state
    (asyncSignal as any)._set({
      data: (asyncSignal as any).value().data,
      loading: true,
      error: undefined
    });

    try {
      const result = await asyncFn(value);
      (asyncSignal as any)._set({
        data: result,
        loading: false,
        error: undefined
      });
    } catch (error) {
      (asyncSignal as any)._set({
        data: (asyncSignal as any).value().data,
        loading: false,
        error: error instanceof Error ? error : new Error(String(error))
      });
    }
  });

  return asyncSignal as any;
};

/**
 * Validation plugin with real-time feedback
 */
export const validationPlugin = <A>(
  validator: (value: A) => boolean,
  onValidChange?: (isValid: boolean) => void
): Plugin<A> => (signal: Signal<A>) => {
  const validatedSignal = signal.map((value) => ({
    value,
    isValid: validator(value)
  }));

  if (onValidChange) {
    validatedSignal.subscribe(({ isValid }) => onValidChange(isValid));
  }

  return validatedSignal as any;
};

/**
 * State machine plugin
 */
export const stateMachinePlugin = <S, A>(
  initialState: S,
  reducer: (state: S, action: A) => S
): Plugin<A> => (actionSignal: Signal<A>) => {
  let currentState = initialState;
  const stateSignal = actionSignal.map(() => currentState);

  actionSignal.subscribe((action) => {
    currentState = reducer(currentState, action);
    (stateSignal as any)._set(currentState);
  });

  return stateSignal as any;
};

/**
 * Fetch plugin - HTTP operations with retry and caching
 */
export const fetchPlugin = <T>(
  fetcher: () => Promise<T>,
  options: {
    retries?: number;
    cacheKey?: string;
    cacheTtl?: number;
  } = {}
): Plugin<any> => (triggerSignal: Signal<any>) => {
  const { retries = 0, cacheKey, cacheTtl = 300000 } = options;

  const fetchSignal = triggerSignal.map(() => ({
    data: undefined as T | undefined,
    loading: false,
    error: undefined as Error | undefined
  }));

  const performFetch = async (attempt = 0): Promise<void> => {
    // Check cache first
    if (cacheKey) {
      try {
        const cached = localStorage.getItem(`fetch_cache_${cacheKey}`);
        const cacheTime = localStorage.getItem(`fetch_cache_time_${cacheKey}`);

        if (cached && cacheTime) {
          const age = Date.now() - parseInt(cacheTime);
          if (age < cacheTtl) {
            (fetchSignal as any)._set({
              data: JSON.parse(cached),
              loading: false,
              error: undefined
            });
            return;
          }
        }
      } catch (e) {
        // Cache read failed, proceed with fetch
      }
    }

    (fetchSignal as any)._set({
      data: (fetchSignal as any).value().data,
      loading: true,
      error: undefined
    });

    try {
      const result = await fetcher();

      // Cache the result
      if (cacheKey) {
        try {
          localStorage.setItem(`fetch_cache_${cacheKey}`, JSON.stringify(result));
          localStorage.setItem(`fetch_cache_time_${cacheKey}`, Date.now().toString());
        } catch (e) {
          // Cache write failed, continue without caching
        }
      }

      (fetchSignal as any)._set({
        data: result,
        loading: false,
        error: undefined
      });
    } catch (error) {
      if (attempt < retries) {
        // Retry after delay
        setTimeout(() => performFetch(attempt + 1), 1000 * Math.pow(2, attempt));
      } else {
        (fetchSignal as any)._set({
          data: (fetchSignal as any).value().data,
          loading: false,
          error: error instanceof Error ? error : new Error(String(error))
        });
      }
    }
  };

  triggerSignal.subscribe(() => performFetch());

  return fetchSignal as any;
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
      validator
        ? validatePlugin(validator, (value) =>
            console.warn(`Invalid value in ${name}:`, value),
          )
        : (s) => s,
    ),

  /**
   * Performance plugin - combines debounce and cache
   */
  performance: <A>(
    key: string,
    debounceMs: number = 100,
    cacheTtl: number = 300000,
  ): Plugin<A> =>
    compose(debouncePlugin(debounceMs), cachePlugin(key, cacheTtl)),

  /**
   * Persistent state plugin - combines persistence and validation
   */
  persistentState: <A>(
    key: string,
    validator?: (value: A) => boolean,
  ): Plugin<A> =>
    compose(
      persistPlugin(key),
      validator ? validatePlugin(validator) : (s) => s,
    ),

  /**
   * Form field plugin - combines validation, debouncing, and persistence
   */
  formField: <A>(
    key: string,
    validator: (value: A) => boolean,
    debounceMs: number = 300
  ): Plugin<A> =>
    compose(
      debouncePlugin(debounceMs),
      validationPlugin(validator),
      persistPlugin(key)
    ),

  /**
   * API data plugin - combines fetch, caching, and error handling
   */
  apiData: <T>(
    fetcher: () => Promise<T>,
    cacheKey: string,
    retries: number = 3
  ): Plugin<any> =>
    compose(
      fetchPlugin(fetcher, { retries, cacheKey }),
      loggerPlugin(`API[${cacheKey}]`)
    ),

  /**
   * Real-time data plugin - combines debouncing and logging for live updates
   */
  realTime: <A>(name: string, debounceMs: number = 100): Plugin<A> =>
    compose(
      debouncePlugin(debounceMs),
      loggerPlugin(`RealTime[${name}]`)
    ),
};
