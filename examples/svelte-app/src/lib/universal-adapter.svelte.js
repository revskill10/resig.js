/**
 * Signal-Σ Universal Plugin Adapter for Svelte 5
 * Provides the EXACT same API as React, SolidJS, Vue, Qwik
 * 
 * This file uses Svelte 5 runes and must be a .svelte.js file
 */

import { signal } from '../../../../build/module/core/signal.js';
import { machine } from '../../../../build/module/algebras/state.js';

/**
 * Universal useSignal - adapted for Svelte 5 reactivity
 * @param {any} initialValue - Initial value for the signal
 * @param {Function} plugins - Optional composed plugins to apply
 * @returns {[any, Function]} - [reactiveValue, setValue] tuple
 */
export function useSignal(initialValue, plugins = null) {
  const coreSignal = plugins ? plugins(signal(initialValue)) : signal(initialValue);
  let state = $state(coreSignal.value());

  $effect(() => {
    const unsubscribe = coreSignal.subscribe((newValue) => {
      state = newValue;
    });
    return unsubscribe;
  });

  const setValue = (value) => {
    state = value;
    coreSignal._set(value);
  };

  // Return getter function to maintain reactivity
  const getValue = () => state;
  return [getValue, setValue];
}

/**
 * Universal useComputed - same API across all frameworks!
 * @param {Function} compute - Computation function
 * @param {Function} plugins - Optional composed plugins to apply
 * @returns {Function} - getValue function
 */
export function useComputed(compute, plugins = null) {
  // For now, keep it simple - just use Svelte's $derived
  const computedValue = $derived(compute());
  return () => computedValue;
}

/**
 * Universal useEffect - same API across all frameworks!
 * @param {Function} effect - Effect function that may return cleanup
 * @param {Array} deps - Optional dependency array
 */
export function useEffect(effect, deps = null) {
  if (deps === null) {
    // No dependencies - run on every change
    $effect(() => {
      const cleanup = effect();
      return cleanup;
    });
  } else {
    // With dependencies - track specific values
    $effect(() => {
      // Access all dependencies to track them
      deps.forEach(dep => typeof dep === 'function' ? dep() : dep);
      const cleanup = effect();
      return cleanup;
    });
  }
}

/**
 * Universal useAsyncSignal - handles async operations with loading states
 * @param {Function} asyncFn - Async function to execute
 * @param {any} initialValue - Initial value
 * @param {Function} plugins - Optional composed plugins
 * @returns {[Function, Function, Function]} - [getState, refetch, setValue]
 */
export function useAsyncSignal(asyncFn, initialValue = null, plugins = null) {
  const initialState = {
    data: initialValue,
    loading: false,
    error: null
  };

  // Use simple $state instead of useSignal to avoid circular dependencies
  let state = $state(initialState);

  const getState = () => state;

  const refetch = async () => {
    console.log('refetch called, setting loading to true');
    state = { ...state, loading: true, error: null };
    try {
      console.log('calling asyncFn...');
      const data = await asyncFn();
      console.log('asyncFn completed with data:', data);
      state = { data, loading: false, error: null };
    } catch (error) {
      console.log('asyncFn failed with error:', error);
      state = {
        ...state,
        loading: false,
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  };

  const setValue = (data) => {
    state = { data, loading: false, error: null };
  };

  return [getState, refetch, setValue];
}

/**
 * Universal useAsyncComputed - computed values from async operations
 * @param {Function} asyncCompute - Async computation function
 * @param {any} initialValue - Initial value
 * @param {Array} deps - Dependencies to watch
 * @param {Function} plugins - Optional composed plugins
 * @returns {Function} - getValue function returning {data, loading, error}
 */
export function useAsyncComputed(asyncCompute, initialValue = null, deps = [], plugins = null) {
  let state = $state({
    data: initialValue,
    loading: false,
    error: null
  });

  const getState = () => state;

  // Create a derived value that tracks dependencies
  const depsValue = $derived(deps.map(dep => typeof dep === 'function' ? dep() : dep));

  // Use effect to run async computation when dependencies change
  $effect(() => {
    // Access the derived dependencies to track them
    depsValue;

    // Use untrack to prevent the state update from triggering this effect again
    $effect.root(() => {
      const runAsync = async () => {
        state = { ...state, loading: true, error: null };
        try {
          const data = await asyncCompute();
          state = { data, loading: false, error: null };
        } catch (error) {
          state = {
            ...state,
            loading: false,
            error: error instanceof Error ? error : new Error(String(error))
          };
        }
      };

      runAsync();
    });
  });

  return getState;
}

/**
 * Universal useMachine - same API across all frameworks!
 * @param {any} initialState - Initial state
 * @param {Function} reducer - State reducer function
 * @param {Function} plugins - Optional composed plugins
 * @returns {[Function, Function]} - [getState, send] tuple
 */
export function useMachine(initialState, reducer, plugins = null) {
  const machineInstance = machine(initialState, reducer);
  let state = $state(machineInstance.state);

  // Subscribe to machine state changes
  $effect(() => {
    const unsubscribe = machineInstance.subscribe((newState) => {
      state = newState;
    });
    return unsubscribe;
  });

  const getState = () => state;
  const send = (action) => machineInstance.send(action);

  return [getState, send];
}

/**
 * Universal usePersistentSignal - same API across all frameworks!
 * @param {string} key - localStorage key
 * @param {any} initialValue - Initial value
 * @param {...Function} plugins - Additional plugins
 * @returns {[Function, Function]} - [getValue, setValue] tuple
 */
export function usePersistentSignal(key, initialValue, ...plugins) {
  const allPlugins = compose(persistPlugin(key), ...plugins);
  return useSignal(initialValue, allPlugins);
}

/**
 * Universal useValidatedSignal - same API across all frameworks!
 * @param {any} initialValue - Initial value
 * @param {Function} validator - Validation function
 * @param {...Function} plugins - Additional plugins
 * @returns {[Function, Function, Function]} - [getValue, setValue, getIsValid] tuple
 */
export function useValidatedSignal(initialValue, validator, ...plugins) {
  const [value, setValue] = useSignal(initialValue, compose(...plugins));
  const isValid = $derived(validator(value()));
  
  const getIsValid = () => isValid;
  
  return [value, setValue, getIsValid];
}

/**
 * Universal useDebouncedSignal - same API across all frameworks!
 * @param {any} initialValue - Initial value
 * @param {number} delay - Debounce delay in ms
 * @param {...Function} plugins - Additional plugins
 * @returns {[Function, Function, Function]} - [getImmediate, setImmediate, getDebounced] tuple
 */
export function useDebouncedSignal(initialValue, delay, ...plugins) {
  // Create immediate signal
  const [immediate, setImmediate] = useSignal(initialValue);
  
  // Create debounced signal with plugins
  const debouncedPlugins = compose(debouncePlugin(delay), ...plugins);
  const debouncedSignal = debouncedPlugins(signal(initialValue));
  let debouncedState = $state(debouncedSignal.value());
  
  // Connect immediate changes to debounced signal
  $effect(() => {
    debouncedSignal._set(immediate());
  });
  
  // Subscribe to debounced signal changes
  $effect(() => {
    const unsubscribe = debouncedSignal.subscribe((newValue) => {
      debouncedState = newValue;
    });
    return unsubscribe;
  });
  
  const getDebounced = () => debouncedState;
  
  return [immediate, setImmediate, getDebounced];
}
