/**
 * SolidJS Adapter for Signal-Σ - Leverages SolidJS native reactivity
 * Uses SolidJS signals as the underlying reactive primitive
 */

import { createSignal, createMemo, createEffect, onCleanup } from 'solid-js';

import { Fetch, fetch } from '../algebras/fetch';
import { machine, StateMachine } from '../algebras/state';
import { time } from '../algebras/time';
import { Effect, effect } from '../core/effect';
import { Signal, signal } from '../core/signal';

// SolidJS Signal adapter - uses native SolidJS reactivity
export function useSignal<T>(initialValue: T): [() => T, (value: T) => void] {
  const [value, setValue] = createSignal(initialValue);
  return [value, setValue];
}

// SolidJS Computed adapter - uses createMemo for automatic dependency tracking
export function useComputed<T>(compute: () => T): () => T {
  return createMemo(compute);
}

// SolidJS Effect adapter - uses createEffect for side effects
export function useEffect<T>(
  initialValue: T,
): [() => T, (value: T) => void, Effect<T>] {
  const [value, setValue] = createSignal(initialValue);
  const effectInstance = effect(initialValue);
  
  // Sync SolidJS signal with Signal-Σ effect
  createEffect(() => {
    effectInstance._set(value());
  });
  
  return [value, setValue, effectInstance];
}

// SolidJS State Machine adapter
export function useMachine<S, A>(
  initialState: S,
  reducer: (state: S, action: A) => S,
): [() => S, (action: A) => void] {
  const machineInstance = machine(initialState, reducer);
  const [state, setState] = createSignal(machineInstance.state);
  
  // Subscribe to machine state changes
  machineInstance.subscribe((newState) => {
    setState(() => newState);
  });
  
  return [state, machineInstance.send];
}

// SolidJS Fetch adapter
export function useFetch<T>(
  fetcher: () => Promise<T>,
): [() => { data?: T; loading: boolean; error?: Error }, () => void, (n: number) => void] {
  const fetchInstance = fetch(fetcher);
  const [state, setState] = createSignal(fetchInstance.value());
  
  // Subscribe to fetch state changes
  const unsubscribe = fetchInstance.subscribe((newState) => {
    setState(() => newState);
  });
  
  onCleanup(unsubscribe);
  
  const refetch = () => {
    const newFetch = fetch(fetcher);
    const unsub = newFetch.subscribe((newState) => {
      setState(() => newState);
    });
    onCleanup(unsub);
    return newFetch;
  };
  
  const retry = (n: number) => {
    const retryFetch = fetchInstance.retry(n);
    const unsub = retryFetch.subscribe((newState) => {
      setState(() => newState);
    });
    onCleanup(unsub);
    return retryFetch;
  };
  
  return [state, refetch, retry];
}

// SolidJS Async Signal adapter
export function useAsyncSignal<T>(
  asyncFn: () => Promise<T>,
  initialValue?: T,
): [() => { data?: T; loading: boolean; error?: Error }, () => void, (value: T) => void] {
  const [state, setState] = createSignal<{ data?: T; loading: boolean; error?: Error }>({
    data: initialValue,
    loading: false,
    error: undefined,
  });
  
  const refetch = async () => {
    setState(prev => ({ ...prev, loading: true, error: undefined }));
    try {
      const data = await asyncFn();
      setState({ data, loading: false, error: undefined });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      }));
    }
  };
  
  const setValue = (value: T) => {
    setState({ data: value, loading: false, error: undefined });
  };
  
  return [state, refetch, setValue];
}

// SolidJS Async Computed adapter
export function useAsyncComputed<T>(
  asyncCompute: () => Promise<T>,
  deps: () => unknown[] = () => [],
): () => { data?: T; loading: boolean; error?: Error } {
  const [state, setState] = createSignal<{ data?: T; loading: boolean; error?: Error }>({
    data: undefined,
    loading: false,
    error: undefined,
  });
  
  createEffect(async () => {
    const currentDeps = deps();
    setState(prev => ({ ...prev, loading: true, error: undefined }));
    
    try {
      const data = await asyncCompute();
      setState({ data, loading: false, error: undefined });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      }));
    }
  });
  
  return state;
}

// SolidJS Persistent Signal adapter
export function usePersistentSignal<T>(
  key: string,
  initialValue: T,
): [() => T, (value: T) => void] {
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
  
  const [value, setValue] = createSignal(storedValue);
  
  // Create effect to persist changes
  createEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value()));
    } catch (e) {
      // Ignore storage errors
    }
  });
  
  return [value, setValue];
}

// SolidJS Debounced Signal adapter
export function useDebouncedSignal<T>(
  initialValue: T,
  delay: number,
): [() => T, (value: T) => void, () => T] {
  const [immediate, setImmediate] = createSignal(initialValue);
  const [debounced, setDebounced] = createSignal(initialValue);
  
  createEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(immediate());
    }, delay);
    
    onCleanup(() => clearTimeout(timer));
  });
  
  return [immediate, setImmediate, debounced];
}

// SolidJS Validated Signal adapter
export function useValidatedSignal<T>(
  initialValue: T,
  validator: (value: T) => boolean,
): [() => T, (value: T) => void, () => boolean] {
  const [value, setValue] = createSignal(initialValue);
  const isValid = createMemo(() => validator(value()));
  
  return [value, setValue, isValid];
}

// Export all hooks for easy importing
export {
  useSignal as signal,
  useComputed as computed,
  useEffect as effect$,
  useMachine as machine$,
  useFetch as fetch$,
};
