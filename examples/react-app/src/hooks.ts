import { useSyncExternalStore, useRef } from 'react';
import { Signal, Effect, StateMachine, Fetch, signal, effect, machine, fetch } from './signal';

/**
 * React Hooks for Signal-Σ - NO dependency arrays needed!
 * All hooks use useSyncExternalStore for automatic re-renders
 */

// Hook for basic signals - replaces useState completely
export function useSignal<T>(initialValue: T): [T, (value: T) => void] {
  const sigRef = useRef<Signal<T>>();
  if (!sigRef.current) {
    sigRef.current = signal(initialValue);
  }

  const value = useSyncExternalStore(sigRef.current.subscribe, sigRef.current.value);
  return [value, sigRef.current._set];
}

// Hook for computed signals - NO dependency arrays!
// React's re-rendering handles the reactivity automatically
export function useComputed<T>(compute: () => T): T {
  return compute();
}

// Hook for effects - monadic composition
export function useEffect<T>(initialValue: T): [T, (value: T) => void, Effect<T>] {
  const effRef = useRef<Effect<T>>();
  if (!effRef.current) {
    effRef.current = effect(initialValue);
  }

  const value = useSyncExternalStore(effRef.current.subscribe, effRef.current.value);
  return [value, effRef.current._set, effRef.current];
}

// Hook for state machines - replaces complex useState patterns
export function useMachine<S, A>(
  initialState: S,
  reducer: (state: S, action: A) => S
): [S, (action: A) => void] {
  const machineRef = useRef<StateMachine<S, A>>();
  if (!machineRef.current) {
    machineRef.current = machine(initialState, reducer);
  }

  const state = useSyncExternalStore(
    machineRef.current.subscribe,
    () => machineRef.current!.state
  );
  return [state, machineRef.current.send];
}

// Hook for async data fetching - replaces React Query
export function useFetch<T>(fetcher: () => Promise<T>): [
  { data?: T; loading: boolean; error?: Error },
  () => void,
  (n: number) => void
] {
  const fetchRef = useRef<Fetch<T>>();
  if (!fetchRef.current) {
    fetchRef.current = fetch(fetcher);
  }

  const state = useSyncExternalStore(fetchRef.current.subscribe, fetchRef.current.value);

  return [
    state,
    fetchRef.current.refetch,
    (n: number) => {
      const retryFetch = fetchRef.current!.retry(n);
      // Subscribe to retry results
      retryFetch.subscribe((retryState) => {
        fetchRef.current!._set(retryState);
      });
    }
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
  onError?: (value: T) => void
): [T, (value: T) => void, boolean] {
  const sigRef = useRef<Signal<T>>();
  const isValidRef = useRef<Signal<boolean>>();

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

  const value = useSyncExternalStore(sigRef.current.subscribe, sigRef.current.value);
  const valid = useSyncExternalStore(isValidRef.current.subscribe, isValidRef.current.value);

  return [value, setValue, valid];
}

// Hook for debounced signals
export function useDebouncedSignal<T>(
  initialValue: T,
  delay: number
): [T, (value: T) => void, T] {
  const immediateRef = useRef<Signal<T>>();
  const debouncedRef = useRef<Signal<T>>();
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

  const immediateValue = useSyncExternalStore(immediateRef.current.subscribe, immediateRef.current.value);
  const debouncedValue = useSyncExternalStore(debouncedRef.current.subscribe, debouncedRef.current.value);

  return [immediateValue, setValue, debouncedValue];
}

// Hook for persistent signals (localStorage)
export function usePersistentSignal<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const sigRef = useRef<Signal<T>>();

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

  const value = useSyncExternalStore(sigRef.current.subscribe, sigRef.current.value);
  return [value, sigRef.current._set];
}
