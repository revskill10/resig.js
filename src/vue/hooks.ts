/**
 * Vue.js Adapter for Signal-Σ - Leverages Vue 3 Composition API
 * Uses ref, computed, and watchEffect for Vue reactivity
 */

import { ref, computed, watchEffect, onUnmounted } from 'vue';

import { Fetch, fetch } from '../algebras/fetch';
import { machine, StateMachine } from '../algebras/state';
import { time } from '../algebras/time';
import { Effect, effect } from '../core/effect';
import { Signal, signal } from '../core/signal';

// Vue Signal adapter - uses ref for reactivity
export function useSignal<T>(initialValue: T): [() => T, (value: T) => void] {
  const state = ref(initialValue);
  
  const getValue = () => state.value;
  const setValue = (value: T) => {
    state.value = value;
  };
  
  return [getValue, setValue];
}

// Vue Computed adapter - uses computed for automatic dependency tracking
export function useComputed<T>(compute: () => T): () => T {
  const computedValue = computed(compute);
  return () => computedValue.value;
}

// Vue Effect adapter - uses watchEffect for side effects
export function useEffect<T>(
  initialValue: T,
): [() => T, (value: T) => void, Effect<T>] {
  const state = ref(initialValue);
  const effectInstance = effect(initialValue);
  
  // Sync Vue ref with Signal-Σ effect
  watchEffect(() => {
    effectInstance._set(state.value);
  });
  
  const getValue = () => state.value;
  const setValue = (value: T) => {
    state.value = value;
  };
  
  return [getValue, setValue, effectInstance];
}

// Vue State Machine adapter
export function useMachine<S, A>(
  initialState: S,
  reducer: (state: S, action: A) => S,
): [() => S, (action: A) => void] {
  const machineInstance = machine(initialState, reducer);
  const state = ref(machineInstance.state);
  
  // Subscribe to machine state changes
  const unsubscribe = machineInstance.subscribe((newState) => {
    state.value = newState;
  });
  
  onUnmounted(unsubscribe);
  
  const getState = () => state.value;
  const send = (action: A) => machineInstance.send(action);
  
  return [getState, send];
}

// Vue Fetch adapter
export function useFetch<T>(
  fetcher: () => Promise<T>,
): [() => { data?: T; loading: boolean; error?: Error }, () => void, (n: number) => void] {
  const fetchInstance = fetch(fetcher);
  const state = ref(fetchInstance.value());
  
  // Subscribe to fetch state changes
  const unsubscribe = fetchInstance.subscribe((newState) => {
    state.value = newState;
  });
  
  onUnmounted(unsubscribe);
  
  const getState = () => state.value;
  
  const refetch = () => {
    const newFetch = fetch(fetcher);
    const unsub = newFetch.subscribe((newState) => {
      state.value = newState;
    });
    onUnmounted(unsub);
    return newFetch;
  };
  
  const retry = (n: number) => {
    const retryFetch = fetchInstance.retry(n);
    const unsub = retryFetch.subscribe((newState) => {
      state.value = newState;
    });
    onUnmounted(unsub);
    return retryFetch;
  };
  
  return [getState, refetch, retry];
}

// Vue Async Signal adapter
export function useAsyncSignal<T>(
  asyncFn: () => Promise<T>,
  initialValue?: T,
): [() => { data?: T; loading: boolean; error?: Error }, () => void, (value: T) => void] {
  const state = ref<{ data?: T; loading: boolean; error?: Error }>({
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

// Vue Async Computed adapter
export function useAsyncComputed<T>(
  asyncCompute: () => Promise<T>,
  deps: () => unknown[] = () => [],
): () => { data?: T; loading: boolean; error?: Error } {
  const state = ref<{ data?: T; loading: boolean; error?: Error }>({
    data: undefined,
    loading: false,
    error: undefined,
  });
  
  watchEffect(async () => {
    const currentDeps = deps();
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

// Vue Persistent Signal adapter
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
  
  const state = ref(storedValue);
  
  // Create effect to persist changes
  watchEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state.value));
    } catch (e) {
      // Ignore storage errors
    }
  });
  
  const getValue = () => state.value;
  const setValue = (value: T) => {
    state.value = value;
  };
  
  return [getValue, setValue];
}

// Vue Debounced Signal adapter
export function useDebouncedSignal<T>(
  initialValue: T,
  delay: number,
): [() => T, (value: T) => void, () => T] {
  const immediate = ref(initialValue);
  const debounced = ref(initialValue);
  
  watchEffect((onInvalidate) => {
    const timer = setTimeout(() => {
      debounced.value = immediate.value;
    }, delay);
    
    onInvalidate(() => clearTimeout(timer));
  });
  
  const getImmediate = () => immediate.value;
  const setImmediate = (value: T) => {
    immediate.value = value;
  };
  const getDebounced = () => debounced.value;
  
  return [getImmediate, setImmediate, getDebounced];
}

// Vue Validated Signal adapter
export function useValidatedSignal<T>(
  initialValue: T,
  validator: (value: T) => boolean,
): [() => T, (value: T) => void, () => boolean] {
  const state = ref(initialValue);
  const isValid = computed(() => validator(state.value));
  
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
