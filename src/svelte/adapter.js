/**
 * Svelte 5 Framework Adapter for Universal Plugin System
 * This file uses Svelte 5 runes and must be imported into .svelte files
 */

// This adapter provides the universal plugin API for Svelte 5
// It uses runes which are only available in .svelte files

export function useSignal(initialValue, ...plugins) {
  // Import the core signal and plugins
  import { signal } from '../core/signal.js';
  import { compose } from '../plugins/index.js';
  
  // Create Signal-Σ signal with plugins
  const coreSignal = plugins.length > 0 
    ? compose(...plugins)(signal(initialValue))
    : signal(initialValue);
  
  // Create Svelte 5 reactive state
  let state = $state(coreSignal.value());
  
  // Sync Signal-Σ with Svelte state
  $effect(() => {
    const unsubscribe = coreSignal.subscribe((newValue) => {
      state = newValue;
    });
    return unsubscribe;
  });
  
  // Return getter and setter
  const getValue = () => state;
  const setValue = (value) => {
    state = value;
    coreSignal._set(value);
  };
  
  return [getValue, setValue];
}

export function useComputed(compute, ...plugins) {
  import { signal } from '../core/signal.js';
  import { compose } from '../plugins/index.js';
  
  // Create computed value using Svelte 5 $derived
  const computedValue = $derived(compute());
  
  // If plugins are provided, apply them
  if (plugins.length > 0) {
    const coreSignal = compose(...plugins)(signal(computedValue));
    let state = $state(coreSignal.value());
    
    $effect(() => {
      coreSignal._set(computedValue);
    });
    
    $effect(() => {
      const unsubscribe = coreSignal.subscribe((newValue) => {
        state = newValue;
      });
      return unsubscribe;
    });
    
    return () => state;
  }
  
  return () => computedValue;
}

export function usePersistentSignal(key, initialValue, ...plugins) {
  import { signal } from '../core/signal.js';
  import { persistPlugin, compose } from '../plugins/index.js';
  
  // Add persistPlugin to the plugin chain
  const allPlugins = [persistPlugin(key), ...plugins];
  const coreSignal = compose(...allPlugins)(signal(initialValue));
  
  // Create Svelte 5 reactive state
  let state = $state(coreSignal.value());
  
  // Sync Signal-Σ with Svelte state
  $effect(() => {
    const unsubscribe = coreSignal.subscribe((newValue) => {
      state = newValue;
    });
    return unsubscribe;
  });
  
  const getValue = () => state;
  const setValue = (value) => {
    state = value;
    coreSignal._set(value);
  };
  
  return [getValue, setValue];
}

export function useValidatedSignal(initialValue, validator, ...plugins) {
  import { signal } from '../core/signal.js';
  import { validatePlugin, compose } from '../plugins/index.js';
  
  // Add validatePlugin to the plugin chain
  const allPlugins = [validatePlugin(validator), ...plugins];
  const coreSignal = compose(...allPlugins)(signal(initialValue));
  
  // Create Svelte 5 reactive state
  let state = $state(coreSignal.value());
  let isValid = $derived(validator(state));
  
  // Sync Signal-Σ with Svelte state
  $effect(() => {
    const unsubscribe = coreSignal.subscribe((newValue) => {
      state = newValue;
    });
    return unsubscribe;
  });
  
  const getValue = () => state;
  const setValue = (value) => {
    state = value;
    coreSignal._set(value);
  };
  const getIsValid = () => isValid;
  
  return [getValue, setValue, getIsValid];
}

export function useDebouncedSignal(initialValue, delay, ...plugins) {
  import { signal } from '../core/signal.js';
  import { debouncePlugin, compose } from '../plugins/index.js';
  
  // Create immediate and debounced signals
  const immediateSignal = signal(initialValue);
  const debouncedPlugins = [debouncePlugin(delay), ...plugins];
  const debouncedSignal = compose(...debouncedPlugins)(immediateSignal);
  
  // Create Svelte 5 reactive state
  let immediate = $state(immediateSignal.value());
  let debounced = $state(debouncedSignal.value());
  
  // Sync signals with Svelte state
  $effect(() => {
    const unsubscribeImmediate = immediateSignal.subscribe((newValue) => {
      immediate = newValue;
    });
    const unsubscribeDebounced = debouncedSignal.subscribe((newValue) => {
      debounced = newValue;
    });
    
    return () => {
      unsubscribeImmediate();
      unsubscribeDebounced();
    };
  });
  
  const getImmediate = () => immediate;
  const setImmediate = (value) => {
    immediate = value;
    immediateSignal._set(value);
  };
  const getDebounced = () => debounced;
  
  return [getImmediate, setImmediate, getDebounced];
}

// Re-export plugins for easy access
export * from '../plugins/index.js';
