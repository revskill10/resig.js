/**
 * Qwik Adapter for Signal-Σ - Leverages Qwik signals and stores
 * Uses useSignal and useStore for Qwik reactivity
 */

import { useSignal as qwikUseSignal, useStore, useTask$, useVisibleTask$ } from '@builder.io/qwik';

import { Fetch, fetch } from '../algebras/fetch';
import { machine, StateMachine } from '../algebras/state';
import { time } from '../algebras/time';
import { Effect, effect } from '../core/effect';
import { Signal, signal } from '../core/signal';

// Qwik Signal adapter - uses Qwik's useSignal
export function useSignal<T>(initialValue: T): [() => T, (value: T) => void] {
  const state = qwikUseSignal(initialValue);
  
  const getValue = () => state.value;
  const setValue = (value: T) => {
    state.value = value;
  };
  
  return [getValue, setValue];
}

// Qwik Computed adapter - uses reactive getter
export function useComputed<T>(compute: () => T): () => T {
  // In Qwik, computed values are just functions that access reactive state
  return compute;
}

// Qwik Effect adapter - uses useTask$ for side effects
export function useEffect<T>(
  initialValue: T,
): [() => T, (value: T) => void, Effect<T>] {
  const state = qwikUseSignal(initialValue);
  const effectInstance = effect(initialValue);
  
  // Sync Qwik signal with Signal-Σ effect
  useTask$(({ track }) => {
    track(() => state.value);
    effectInstance._set(state.value);
  });
  
  const getValue = () => state.value;
  const setValue = (value: T) => {
    state.value = value;
  };
  
  return [getValue, setValue, effectInstance];
}

// Qwik State Machine adapter
export function useMachine<S, A>(
  initialState: S,
  reducer: (state: S, action: A) => S,
): [() => S, (action: A) => void] {
  const machineInstance = machine(initialState, reducer);
  const state = qwikUseSignal(machineInstance.state);
  
  // Subscribe to machine state changes
  useVisibleTask$(() => {
    const unsubscribe = machineInstance.subscribe((newState) => {
      state.value = newState;
    });
    
    return unsubscribe;
  });
  
  const getState = () => state.value;
  const send = (action: A) => machineInstance.send(action);
  
  return [getState, send];
}

// Qwik Fetch adapter
export function useFetch<T>(
  fetcher: () => Promise<T>,
): [() => { data?: T; loading: boolean; error?: Error }, () => void, (n: number) => void] {
  const fetchInstance = fetch(fetcher);
  const state = qwikUseSignal(fetchInstance.value());
  
  // Subscribe to fetch state changes
  useVisibleTask$(() => {
    const unsubscribe = fetchInstance.subscribe((newState) => {
      state.value = newState;
    });
    
    return unsubscribe;
  });
  
  const getState = () => state.value;
  
  const refetch = () => {
    const newFetch = fetch(fetcher);
    newFetch.subscribe((newState) => {
      state.value = newState;
    });
    return newFetch;
  };
  
  const retry = (n: number) => {
    const retryFetch = fetchInstance.retry(n);
    retryFetch.subscribe((newState) => {
      state.value = newState;
    });
    return retryFetch;
  };
  
  return [getState, refetch, retry];
}

// Qwik Async Signal adapter
export function useAsyncSignal<T>(
  asyncFn: () => Promise<T>,
  initialValue?: T,
): [() => { data?: T; loading: boolean; error?: Error }, () => void, (value: T) => void] {
  const state = qwikUseSignal<{ data?: T; loading: boolean; error?: Error }>({
    data: initialValue,
    loading: false,
    error: undefined,
  });
  
  const getState = () => state.value;
  
  const refetch = async () => {
    state.value = { ...state.value, loading: true, error: undefined };
    try {
      const data = await asyncFn();
      state.value = { data, loading: false, error: undefined };
    } catch (error) {
      state.value = {
        ...state.value,
        loading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  };
  
  const setValue = (value: T) => {
    state.value = { data: value, loading: false, error: undefined };
  };
  
  return [getState, refetch, setValue];
}

// Qwik Async Computed adapter
export function useAsyncComputed<T>(
  asyncCompute: () => Promise<T>,
  deps: () => unknown[] = () => [],
): () => { data?: T; loading: boolean; error?: Error } {
  const state = qwikUseSignal<{ data?: T; loading: boolean; error?: Error }>({
    data: undefined,
    loading: false,
    error: undefined,
  });
  
  useTask$(async ({ track }) => {
    track(deps);
    state.value = { ...state.value, loading: true, error: undefined };
    
    try {
      const data = await asyncCompute();
      state.value = { data, loading: false, error: undefined };
    } catch (error) {
      state.value = {
        ...state.value,
        loading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  });
  
  const getState = () => state.value;
  return getState;
}

// Qwik Persistent Signal adapter
export function usePersistentSignal<T>(
  key: string,
  initialValue: T,
): [() => T, (value: T) => void] {
  // Try to load from localStorage
  let storedValue = initialValue;
  
  const state = qwikUseSignal(storedValue);
  
  // Load from localStorage on client side
  useVisibleTask$(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        state.value = JSON.parse(stored);
      }
    } catch (e) {
      // Use initial value if parsing fails
    }
  });
  
  // Create effect to persist changes
  useTask$(({ track }) => {
    track(() => state.value);
    
    // Only persist on client side
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(state.value));
      } catch (e) {
        // Ignore storage errors
      }
    }
  });
  
  const getValue = () => state.value;
  const setValue = (value: T) => {
    state.value = value;
  };
  
  return [getValue, setValue];
}

// Qwik Debounced Signal adapter
export function useDebouncedSignal<T>(
  initialValue: T,
  delay: number,
): [() => T, (value: T) => void, () => T] {
  const immediate = qwikUseSignal(initialValue);
  const debounced = qwikUseSignal(initialValue);
  
  useTask$(({ track, cleanup }) => {
    track(() => immediate.value);
    
    const timer = setTimeout(() => {
      debounced.value = immediate.value;
    }, delay);
    
    cleanup(() => clearTimeout(timer));
  });
  
  const getImmediate = () => immediate.value;
  const setImmediate = (value: T) => {
    immediate.value = value;
  };
  const getDebounced = () => debounced.value;
  
  return [getImmediate, setImmediate, getDebounced];
}

// Qwik Validated Signal adapter
export function useValidatedSignal<T>(
  initialValue: T,
  validator: (value: T) => boolean,
): [() => T, (value: T) => void, () => boolean] {
  const state = qwikUseSignal(initialValue);
  const isValid = qwikUseSignal(validator(initialValue));
  
  useTask$(({ track }) => {
    track(() => state.value);
    isValid.value = validator(state.value);
  });
  
  const getValue = () => state.value;
  const setValue = (value: T) => {
    state.value = value;
  };
  const getIsValid = () => isValid.value;
  
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
