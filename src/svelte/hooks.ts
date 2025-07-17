/**
 * Svelte 5 (Runes) Adapter for Signal-Σ - Leverages Svelte 5 runes
 * Uses $state and $derived runes for native Svelte reactivity
 */

import { Fetch, fetch } from '../algebras/fetch';
import { machine, StateMachine } from '../algebras/state';
import { time } from '../algebras/time';
import { Effect, effect } from '../core/effect';
import { Signal, signal } from '../core/signal';

// Svelte 5 Signal adapter - uses $state rune
export function useSignal<T>(initialValue: T): [() => T, (value: T) => void] {
  let state = $state(initialValue);
  
  const getValue = () => state;
  const setValue = (value: T) => {
    state = value;
  };
  
  return [getValue, setValue];
}

// Svelte 5 Computed adapter - uses $derived rune
export function useComputed<T>(compute: () => T): () => T {
  const derived = $derived(compute());
  return () => derived;
}

// Svelte 5 Effect adapter - uses $effect rune
export function useEffect<T>(
  initialValue: T,
): [() => T, (value: T) => void, Effect<T>] {
  let state = $state(initialValue);
  const effectInstance = effect(initialValue);
  
  // Sync Svelte state with Signal-Σ effect
  $effect(() => {
    effectInstance._set(state);
  });
  
  const getValue = () => state;
  const setValue = (value: T) => {
    state = value;
  };
  
  return [getValue, setValue, effectInstance];
}

// Svelte 5 State Machine adapter
export function useMachine<S, A>(
  initialState: S,
  reducer: (state: S, action: A) => S,
): [() => S, (action: A) => void] {
  const machineInstance = machine(initialState, reducer);
  let state = $state(machineInstance.state);
  
  // Subscribe to machine state changes
  machineInstance.subscribe((newState) => {
    state = newState;
  });
  
  const getState = () => state;
  const send = (action: A) => machineInstance.send(action);
  
  return [getState, send];
}

// Svelte 5 Fetch adapter
export function useFetch<T>(
  fetcher: () => Promise<T>,
): [() => { data?: T; loading: boolean; error?: Error }, () => void, (n: number) => void] {
  const fetchInstance = fetch(fetcher);
  let state = $state(fetchInstance.value());
  
  // Subscribe to fetch state changes
  fetchInstance.subscribe((newState) => {
    state = newState;
  });
  
  const getState = () => state;
  
  const refetch = () => {
    const newFetch = fetch(fetcher);
    newFetch.subscribe((newState) => {
      state = newState;
    });
    return newFetch;
  };
  
  const retry = (n: number) => {
    const retryFetch = fetchInstance.retry(n);
    retryFetch.subscribe((newState) => {
      state = newState;
    });
    return retryFetch;
  };
  
  return [getState, refetch, retry];
}

// Svelte 5 Async Signal adapter
export function useAsyncSignal<T>(
  asyncFn: () => Promise<T>,
  initialValue?: T,
): [() => { data?: T; loading: boolean; error?: Error }, () => void, (value: T) => void] {
  let state = $state<{ data?: T; loading: boolean; error?: Error }>({
    data: initialValue,
    loading: false,
    error: undefined,
  });
  
  const getState = () => state;
  
  const refetch = async () => {
    state = { ...state, loading: true, error: undefined };
    try {
      const data = await asyncFn();
      state = { data, loading: false, error: undefined };
    } catch (error) {
      state = {
        ...state,
        loading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  };
  
  const setValue = (value: T) => {
    state = { data: value, loading: false, error: undefined };
  };
  
  return [getState, refetch, setValue];
}

// Svelte 5 Async Computed adapter
export function useAsyncComputed<T>(
  asyncCompute: () => Promise<T>,
  deps: () => unknown[] = () => [],
): () => { data?: T; loading: boolean; error?: Error } {
  let state = $state<{ data?: T; loading: boolean; error?: Error }>({
    data: undefined,
    loading: false,
    error: undefined,
  });
  
  $effect(async () => {
    const currentDeps = deps();
    state = { ...state, loading: true, error: undefined };
    
    try {
      const data = await asyncCompute();
      state = { data, loading: false, error: undefined };
    } catch (error) {
      state = {
        ...state,
        loading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  });
  
  const getState = () => state;
  return getState;
}

// Svelte 5 Persistent Signal adapter
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
  
  let state = $state(storedValue);
  
  // Create effect to persist changes
  $effect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      // Ignore storage errors
    }
  });
  
  const getValue = () => state;
  const setValue = (value: T) => {
    state = value;
  };
  
  return [getValue, setValue];
}

// Svelte 5 Debounced Signal adapter
export function useDebouncedSignal<T>(
  initialValue: T,
  delay: number,
): [() => T, (value: T) => void, () => T] {
  let immediate = $state(initialValue);
  let debounced = $state(initialValue);
  
  $effect(() => {
    const timer = setTimeout(() => {
      debounced = immediate;
    }, delay);
    
    return () => clearTimeout(timer);
  });
  
  const getImmediate = () => immediate;
  const setImmediate = (value: T) => {
    immediate = value;
  };
  const getDebounced = () => debounced;
  
  return [getImmediate, setImmediate, getDebounced];
}

// Svelte 5 Validated Signal adapter
export function useValidatedSignal<T>(
  initialValue: T,
  validator: (value: T) => boolean,
): [() => T, (value: T) => void, () => boolean] {
  let state = $state(initialValue);
  const isValid = $derived(validator(state));
  
  const getValue = () => state;
  const setValue = (value: T) => {
    state = value;
  };
  const getIsValid = () => isValid;
  
  return [getValue, setValue, getIsValid];
}

// Export all hooks for easy importing
export {
  useSignal as signal,
  useComputed as computed,
  useEffect as effect$,
  useMachine as machine$,
  useFetch as fetch$,
};
