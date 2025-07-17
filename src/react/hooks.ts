/**
 * React Hooks for Signal-Σ - NO dependency arrays needed!
 * All hooks use useSyncExternalStore for automatic re-renders
 */

import { useRef, useSyncExternalStore } from 'react';

import { Fetch, fetch } from '../algebras/fetch';
import { machine, StateMachine } from '../algebras/state';
import { time } from '../algebras/time';
import { Effect, effect } from '../core/effect';
import { Signal, signal } from '../core/signal';

// Hook for basic signals - replaces useState completely
export function useSignal<T>(initialValue: T): [T, (value: T) => void] {
  const sigRef = useRef<Signal<T> & { _set: (value: T) => void }>();
  if (!sigRef.current) {
    sigRef.current = signal(initialValue);
  }

  const value = useSyncExternalStore(
    sigRef.current.subscribe,
    sigRef.current.value,
  );
  return [value, sigRef.current._set];
}

// Hook for computed signals - NO dependency arrays!
// React's re-rendering handles the reactivity automatically
export function useComputed<T>(compute: () => T): T {
  return compute();
}

// Hook for effects - monadic composition
export function useEffect<T>(
  initialValue: T,
): [T, (value: T) => void, Effect<T>] {
  const effRef = useRef<Effect<T> & { _set: (value: T) => void }>();
  if (!effRef.current) {
    effRef.current = effect(initialValue);
  }

  const value = useSyncExternalStore(
    effRef.current.subscribe,
    effRef.current.value,
  );
  return [value, effRef.current._set, effRef.current];
}

// Hook for state machines - replaces complex useState patterns
export function useMachine<S, A>(
  initialState: S,
  reducer: (state: S, action: A) => S,
): [S, (action: A) => void] {
  const machineRef = useRef<StateMachine<S, A>>();
  if (!machineRef.current) {
    machineRef.current = machine(initialState, reducer);
  }

  const state = useSyncExternalStore(
    machineRef.current.subscribe,
    () => machineRef.current!.state,
  );
  return [state, machineRef.current.send];
}

// Hook for async data fetching - replaces React Query
export function useFetch<T>(
  fetcher: () => Promise<T>,
): [
  { data?: T; loading: boolean; error?: Error },
  () => Fetch<T>,
  (n: number) => Fetch<T>,
] {
  const fetchRef = useRef<
    Fetch<T> & {
      _set: (value: { data?: T; loading: boolean; error?: Error }) => void;
    }
  >();
  if (!fetchRef.current) {
    fetchRef.current = fetch(fetcher);
  }

  const state = useSyncExternalStore(
    fetchRef.current.subscribe,
    fetchRef.current.value,
  );

  return [
    state,
    () => fetchRef.current!.refetch(),
    (n: number) => fetchRef.current!.retry(n),
  ];
}

// Hook for derived/computed values from multiple signals
// React's re-rendering handles the reactivity automatically
export function useDerived<T>(derive: () => T): T {
  return derive();
}

// Hook for signal with validation
export function useValidatedSignal<T>(
  initialValue: T,
  validator: (value: T) => boolean,
  onError?: (value: T) => void,
): [T, (value: T) => void, boolean] {
  const sigRef = useRef<Signal<T> & { _set: (value: T) => void }>();
  const isValidRef = useRef<
    Signal<boolean> & { _set: (value: boolean) => void }
  >();

  if (!sigRef.current) {
    sigRef.current = signal(initialValue);
  }
  if (!isValidRef.current) {
    isValidRef.current = signal(validator(initialValue));
  }

  const setValue = (value: T) => {
    const valid = validator(value);
    if (valid) {
      sigRef.current!._set(value);
      isValidRef.current!._set(true);
    } else {
      isValidRef.current!._set(false);
      onError?.(value);
    }
  };

  const value = useSyncExternalStore(
    sigRef.current.subscribe,
    sigRef.current.value,
  );
  const valid = useSyncExternalStore(
    isValidRef.current.subscribe,
    isValidRef.current.value,
  );

  return [value, setValue, valid];
}

// Hook for debounced signals
export function useDebouncedSignal<T>(
  initialValue: T,
  delay: number,
): [T, (value: T) => void, T] {
  const immediateRef = useRef<Signal<T> & { _set: (value: T) => void }>();
  const debouncedRef = useRef<Signal<T> & { _set: (value: T) => void }>();
  const timeoutRef = useRef<NodeJS.Timeout>();

  if (!immediateRef.current) {
    immediateRef.current = signal(initialValue);
  }
  if (!debouncedRef.current) {
    debouncedRef.current = signal(initialValue);
  }

  const setValue = (value: T) => {
    immediateRef.current!._set(value);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      debouncedRef.current!._set(value);
    }, delay);
  };

  const immediateValue = useSyncExternalStore(
    immediateRef.current.subscribe,
    immediateRef.current.value,
  );
  const debouncedValue = useSyncExternalStore(
    debouncedRef.current.subscribe,
    debouncedRef.current.value,
  );

  return [immediateValue, setValue, debouncedValue];
}

// Hook for persistent signals (localStorage)
export function usePersistentSignal<T>(
  key: string,
  initialValue: T,
): [T, (value: T) => void] {
  const sigRef = useRef<Signal<T> & { _set: (value: T) => void }>();

  if (!sigRef.current) {
    // Try to load from localStorage
    let storedValue = initialValue;
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        storedValue = JSON.parse(stored);
      }
    } catch (e) {
      // Use initial value if parsing fails
    }

    sigRef.current = signal(storedValue);

    // Subscribe to changes and persist them
    sigRef.current.subscribe(() => {
      try {
        localStorage.setItem(key, JSON.stringify(sigRef.current!.value()));
      } catch (e) {
        // Ignore storage errors
      }
    });
  }

  const value = useSyncExternalStore(
    sigRef.current.subscribe,
    sigRef.current.value,
  );
  return [value, sigRef.current._set];
}

// Hook for async signals - handles Promise-based values
export function useAsyncSignal<T>(
  asyncFn: () => Promise<T>,
  initialValue?: T,
): [
  { data?: T; loading: boolean; error?: Error },
  () => void, // refetch
  (value: T) => void, // setValue (for optimistic updates)
] {
  const stateRef = useRef<
    Signal<{ data?: T; loading: boolean; error?: Error }> & {
      _set: (value: { data?: T; loading: boolean; error?: Error }) => void;
    }
  >();
  const abortControllerRef = useRef<AbortController>();

  if (!stateRef.current) {
    stateRef.current = signal({
      data: initialValue,
      loading: false,
      error: undefined,
    });
  }

  const refetch = () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    stateRef.current!._set({
      data: stateRef.current!.value().data,
      loading: true,
      error: undefined,
    });

    asyncFn()
      .then((data) => {
        if (!abortControllerRef.current?.signal.aborted) {
          stateRef.current!._set({ data, loading: false, error: undefined });
        }
      })
      .catch((error) => {
        if (!abortControllerRef.current?.signal.aborted) {
          stateRef.current!._set({
            data: stateRef.current!.value().data,
            loading: false,
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      });
  };

  const setValue = (value: T) => {
    stateRef.current!._set({ data: value, loading: false, error: undefined });
  };

  const state = useSyncExternalStore(
    stateRef.current.subscribe,
    stateRef.current.value,
  );

  return [state, refetch, setValue];
}

// Hook for async computed values - Simplified approach to avoid infinite loops
// Use manual trigger pattern for now until we can implement proper dependency tracking
export function useAsyncComputed<T>(
  asyncCompute: () => Promise<T>,
  deps: unknown[] = [],
): { data?: T; loading: boolean; error?: Error } {
  const stateRef = useRef<
    Signal<{ data?: T; loading: boolean; error?: Error }> & {
      _set: (value: { data?: T; loading: boolean; error?: Error }) => void;
    }
  >();
  const abortControllerRef = useRef<AbortController>();
  const lastDepsRef = useRef<unknown[]>([]);
  const isInitializedRef = useRef(false);

  if (!stateRef.current) {
    stateRef.current = signal({
      data: undefined,
      loading: false,
      error: undefined,
    });
  }

  // Check if dependencies changed
  const depsChanged =
    !isInitializedRef.current ||
    deps.length !== lastDepsRef.current.length ||
    deps.some((dep, index) => dep !== lastDepsRef.current[index]);

  if (depsChanged) {
    isInitializedRef.current = true;
    lastDepsRef.current = [...deps];

    // Cancel previous computation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    // Defer state update to avoid render-time updates
    setTimeout(() => {
      stateRef.current!._set({
        data: stateRef.current!.value().data,
        loading: true,
        error: undefined,
      });

      asyncCompute()
        .then((data) => {
          if (!abortControllerRef.current?.signal.aborted) {
            stateRef.current!._set({ data, loading: false, error: undefined });
          }
        })
        .catch((error) => {
          if (!abortControllerRef.current?.signal.aborted) {
            stateRef.current!._set({
              data: stateRef.current!.value().data,
              loading: false,
              error: error instanceof Error ? error : new Error(String(error)),
            });
          }
        });
    }, 0);
  }

  const state = useSyncExternalStore(
    stateRef.current.subscribe,
    stateRef.current.value,
  );

  return state;
}

// Hook for async computed signals - returns a signal that can be used in other computations
export function useAsyncComputedSignal<T>(
  asyncCompute: () => Promise<T>,
  deps: unknown[] = [],
): Signal<{ data?: T; loading: boolean; error?: Error }> & {
  _set: (value: { data?: T; loading: boolean; error?: Error }) => void;
} {
  const stateRef = useRef<
    Signal<{ data?: T; loading: boolean; error?: Error }> & {
      _set: (value: { data?: T; loading: boolean; error?: Error }) => void;
    }
  >();
  const abortControllerRef = useRef<AbortController>();
  const lastDepsRef = useRef<unknown[]>([]);
  const isInitializedRef = useRef(false);

  if (!stateRef.current) {
    stateRef.current = signal({
      data: undefined,
      loading: false,
      error: undefined,
    });
  }

  // Check if dependencies changed
  const depsChanged =
    !isInitializedRef.current ||
    deps.length !== lastDepsRef.current.length ||
    deps.some((dep, index) => dep !== lastDepsRef.current[index]);

  if (depsChanged) {
    isInitializedRef.current = true;
    lastDepsRef.current = [...deps];

    // Cancel previous computation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    // Defer state update to avoid render-time updates
    setTimeout(() => {
      stateRef.current!._set({
        data: stateRef.current!.value().data,
        loading: true,
        error: undefined,
      });

      asyncCompute()
        .then((data) => {
          if (!abortControllerRef.current?.signal.aborted) {
            stateRef.current!._set({ data, loading: false, error: undefined });
          }
        })
        .catch((error) => {
          if (!abortControllerRef.current?.signal.aborted) {
            stateRef.current!._set({
              data: stateRef.current!.value().data,
              loading: false,
              error: error instanceof Error ? error : new Error(String(error)),
            });
          }
        });
    }, 0);
  }

  return stateRef.current;
}

// Legacy aliases for backward compatibility
export const use = useSignal;
export const computed = useComputed;
export const effect$ = useEffect;
export const time$ = <T>(initialValue: T) => time(initialValue);
export const fetch$ = useFetch;
export const machine$ = useMachine;
