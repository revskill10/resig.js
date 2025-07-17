// Signal-Σ implementation for demo
export interface Signal<T> {
  value: () => T;
  map: <B>(f: (a: T) => B) => Signal<B>;
  subscribe: (cb: () => void) => () => void;
  _set: (value: T) => void;
}

export const signal = <T>(initial: T): Signal<T> => {
  let current = initial;
  const subscribers = new Set<() => void>();

  const signalInstance: Signal<T> = {
    value: () => current,
    map: <B>(f: (a: T) => B): Signal<B> => {
      const derived = signal(f(current));
      signalInstance.subscribe(() => {
        derived._set(f(current));
      });
      return derived;
    },
    subscribe: (cb: () => void) => {
      subscribers.add(cb);
      return () => subscribers.delete(cb);
    },
    _set: (value: T) => {
      if (value !== current) {
        current = value;
        subscribers.forEach(fn => fn());
      }
    }
  };

  return signalInstance;
};

// Effect monad
export interface Effect<T> extends Signal<T> {
  bind: <B>(f: (a: T) => Effect<B>) => Effect<B>;
  chain: <B>(f: (a: T) => Effect<B>) => Effect<B>;
}

export const effect = <T>(initial: T): Effect<T> => {
  const baseSignal = signal(initial);

  const effectInstance: Effect<T> = {
    value: baseSignal.value,
    map: baseSignal.map,
    subscribe: baseSignal.subscribe,
    _set: baseSignal._set,

    bind: <B>(f: (a: T) => Effect<B>): Effect<B> => {
      const resultEffect = effect(f(baseSignal.value()).value());

      baseSignal.subscribe((newValue) => {
        const newEffect = f(newValue);
        resultEffect._set(newEffect.value());

        newEffect.subscribe((boundValue) => {
          resultEffect._set(boundValue);
        });
      });

      return resultEffect;
    },

    chain: function<B>(f: (a: T) => Effect<B>): Effect<B> {
      return this.bind(f);
    }
  };

  return effectInstance;
};

// State machine
export interface StateMachine<S, A> {
  state: S;
  send: (action: A) => void;
  subscribe: (fn: (state: S) => void) => () => void;
}

export const machine = <S, A>(
  initialState: S,
  reducer: (state: S, action: A) => S
): StateMachine<S, A> => {
  let currentState = initialState;
  const subscribers = new Set<(state: S) => void>();

  const notify = () => {
    subscribers.forEach(fn => fn(currentState));
  };

  return {
    get state() {
      return currentState;
    },

    send: (action: A) => {
      const newState = reducer(currentState, action);
      if (newState !== currentState) {
        currentState = newState;
        notify();
      }
    },

    subscribe: (fn: (state: S) => void) => {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    }
  };
};

// Async state for fetch
export interface AsyncState<T> {
  data?: T;
  loading: boolean;
  error?: Error;
}

export interface Fetch<T> extends Signal<AsyncState<T>> {
  retry: (n: number) => Fetch<T>;
  refetch: () => void;
}

export const fetch = <T>(fetcher: () => Promise<T>): Fetch<T> => {
  const baseSignal = signal<AsyncState<T>>({ loading: true });

  const fetchInstance: Fetch<T> = {
    value: baseSignal.value,
    map: baseSignal.map,
    subscribe: baseSignal.subscribe,
    _set: baseSignal._set,

    retry: (n: number): Fetch<T> => {
      const retryFetch = fetch(fetcher);

      const attemptFetch = async (attemptsLeft: number): Promise<void> => {
        try {
          retryFetch._set({ loading: true });
          const data = await fetcher();
          retryFetch._set({ data, loading: false });
        } catch (error) {
          if (attemptsLeft > 0) {
            const delay = Math.pow(2, n - attemptsLeft) * 1000;
            setTimeout(() => attemptFetch(attemptsLeft - 1), delay);
          } else {
            retryFetch._set({
              error: error instanceof Error ? error : new Error(String(error)),
              loading: false
            });
          }
        }
      };

      attemptFetch(n);
      return retryFetch;
    },

    refetch: () => {
      executeFetch();
    }
  };

  const executeFetch = async () => {
    try {
      fetchInstance._set({ loading: true });
      const data = await fetcher();
      fetchInstance._set({ data, loading: false });
    } catch (error) {
      fetchInstance._set({
        error: error instanceof Error ? error : new Error(String(error)),
        loading: false
      });
    }
  };

  executeFetch();
  return fetchInstance;
};

// Plugin system
export type Plugin<A> = (signal: Signal<A>) => Signal<A>;

// Debounce plugin
export const debouncePlugin = <A>(ms: number): Plugin<A> => (signal: Signal<A>) => {
  const debounced = signal(signal.value());
  let timeoutId: NodeJS.Timeout;

  signal.subscribe(() => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      debounced._set(signal.value());
    }, ms);
  });

  return debounced;
};

// Throttle plugin
export const throttlePlugin = <A>(ms: number): Plugin<A> => (signal: Signal<A>) => {
  const throttled = signal(signal.value());
  let lastUpdate = 0;

  signal.subscribe(() => {
    const now = Date.now();
    if (now - lastUpdate >= ms) {
      throttled._set(signal.value());
      lastUpdate = now;
    }
  });

  return throttled;
};

// Logger plugin
export const loggerPlugin = <A>(prefix: string = 'Signal'): Plugin<A> => (signal: Signal<A>) => {
  signal.subscribe((value) => {
    console.log(`${prefix}:`, value);
  });
  return signal;
};

// Cache plugin
export const cachePlugin = <A>(key: string, ttl: number = 300000): Plugin<A> => (signal: Signal<A>) => {
  // Try to load from cache
  try {
    const cached = localStorage.getItem(`signal_cache_${key}`);
    const cacheTime = localStorage.getItem(`signal_cache_time_${key}`);

    if (cached && cacheTime) {
      const age = Date.now() - parseInt(cacheTime);
      if (age < ttl) {
        const cachedSignal = signal(JSON.parse(cached));
        return cachedSignal;
      }
    }
  } catch (e) {
    // Cache read failed, proceed without cache
  }

  // Subscribe to signal changes and cache them
  signal.subscribe(() => {
    try {
      localStorage.setItem(`signal_cache_${key}`, JSON.stringify(signal.value()));
      localStorage.setItem(`signal_cache_time_${key}`, Date.now().toString());
    } catch (e) {
      // Cache write failed, continue without caching
    }
  });

  return signal;
};

// Filter plugin
export const filterPlugin = <A>(predicate: (value: A) => boolean): Plugin<A> => (signal: Signal<A>) => {
  const filtered = signal(signal.value());

  signal.subscribe(() => {
    const value = signal.value();
    if (predicate(value)) {
      filtered._set(value);
    }
  });

  return filtered;
};

// Transform plugin
export const transformPlugin = <A, B>(transform: (value: A) => B): Plugin<A> => (signal: Signal<A>) => {
  const transformed = signal(transform(signal.value())) as unknown as Signal<A>;

  signal.subscribe(() => {
    const newValue = transform(signal.value()) as unknown as A;
    transformed._set(newValue);
  });

  return transformed;
};

// Compose multiple plugins
export const compose = <A>(...plugins: Plugin<A>[]): Plugin<A> => (signal: Signal<A>) => {
  return plugins.reduce((acc, plugin) => plugin(acc), signal);
};
