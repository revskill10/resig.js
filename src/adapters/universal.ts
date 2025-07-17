/**
 * Universal Plugin Adapter System
 * Allows plugins to work seamlessly across all frameworks
 */

import { Signal, signal } from '../core/signal';
import { Plugin, compose } from '../plugins';

// Universal adapter interface that all framework adapters implement
export interface FrameworkAdapter<T> {
  // Create a signal using the framework's native reactivity
  createSignal(initialValue: T): [() => T, (value: T) => void];
  
  // Create a computed value using the framework's native reactivity
  createComputed<U>(compute: () => U): () => U;
  
  // Create an effect using the framework's native reactivity
  createEffect(effect: () => void | (() => void)): void;
  
  // Convert a Signal-Σ signal to framework-native signal
  adaptSignal(signal: Signal<T>): [() => T, (value: T) => void];
  
  // Convert framework-native signal to Signal-Σ signal
  toSignal(getValue: () => T, setValue: (value: T) => void): Signal<T>;
}

// Universal plugin application that works with any framework adapter
export const usePluginSignal = <T>(
  adapter: FrameworkAdapter<T>,
  initialValue: T,
  ...plugins: Plugin<T>[]
): [() => T, (value: T) => void] => {
  // Create core Signal-Σ signal
  const coreSignal = signal(initialValue);
  
  // Apply all plugins to the core signal
  const enhancedSignal = plugins.length > 0 
    ? compose(...plugins)(coreSignal)
    : coreSignal;
  
  // Adapt to framework-native signal
  return adapter.adaptSignal(enhancedSignal);
};

// Universal computed with plugins
export const usePluginComputed = <U>(
  adapter: FrameworkAdapter<any>,
  compute: () => U,
  ...plugins: Plugin<U>[]
): () => U => {
  // Create computed value
  const computedValue = adapter.createComputed(compute);

  // If plugins are provided, apply them
  if (plugins.length > 0) {
    const coreSignal = signal(computedValue());
    const enhancedSignal = compose(...plugins)(coreSignal);
    return adapter.adaptSignal(enhancedSignal)[0];
  }

  return computedValue;
};

// Universal async signal with plugins
export const usePluginAsyncSignal = <T>(
  adapter: FrameworkAdapter<any>,
  asyncFn: () => Promise<T>,
  initialValue?: T,
  ...plugins: Plugin<any>[]
): [() => { data?: T; loading: boolean; error?: Error }, () => void, (value: T) => void] => {
  const [state, setState] = adapter.createSignal({
    data: initialValue,
    loading: false,
    error: undefined,
  });

  const refetch = async () => {
    setState({ ...state(), loading: true, error: undefined });
    try {
      const data = await asyncFn();
      setState({ data, loading: false, error: undefined });
    } catch (error) {
      setState({
        ...state(),
        loading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  };

  const setValue = (value: T) => {
    setState({ data: value, loading: false, error: undefined });
  };

  // Apply plugins if provided
  if (plugins.length > 0) {
    const coreSignal = adapter.toSignal(state, setState);
    const enhancedSignal = compose(...plugins)(coreSignal);
    const [enhancedState] = adapter.adaptSignal(enhancedSignal);
    return [enhancedState, refetch, setValue];
  }

  return [state, refetch, setValue];
};

// Universal persistent signal with plugins
export const usePluginPersistentSignal = <T>(
  adapter: FrameworkAdapter<T>,
  key: string,
  initialValue: T,
  ...plugins: Plugin<T>[]
): [() => T, (value: T) => void] => {
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

  const [value, setValue] = adapter.createSignal(storedValue);

  // Create effect to persist changes
  adapter.createEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value()));
    } catch (e) {
      // Ignore storage errors
    }
  });

  // Apply plugins if provided
  if (plugins.length > 0) {
    const coreSignal = adapter.toSignal(value, setValue);
    const enhancedSignal = compose(...plugins)(coreSignal);
    return adapter.adaptSignal(enhancedSignal);
  }

  return [value, setValue];
};

// Universal debounced signal with plugins
export const usePluginDebouncedSignal = <T>(
  adapter: FrameworkAdapter<T>,
  initialValue: T,
  delay: number,
  ...plugins: Plugin<T>[]
): [() => T, (value: T) => void, () => T] => {
  const [immediate, setImmediate] = adapter.createSignal(initialValue);
  const [debounced, setDebounced] = adapter.createSignal(initialValue);

  adapter.createEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(immediate());
    }, delay);

    return () => clearTimeout(timer);
  });

  // Apply plugins to immediate value if provided
  if (plugins.length > 0) {
    const coreSignal = adapter.toSignal(immediate, setImmediate);
    const enhancedSignal = compose(...plugins)(coreSignal);
    const [enhancedImmediate, enhancedSetImmediate] = adapter.adaptSignal(enhancedSignal);
    return [enhancedImmediate, enhancedSetImmediate, debounced];
  }

  return [immediate, setImmediate, debounced];
};

// Universal validated signal with plugins
export const usePluginValidatedSignal = <T>(
  adapter: FrameworkAdapter<T>,
  initialValue: T,
  validator: (value: T) => boolean,
  ...plugins: Plugin<T>[]
): [() => T, (value: T) => void, () => boolean] => {
  const [value, setValue] = adapter.createSignal(initialValue);
  const isValid = adapter.createComputed(() => validator(value()));

  // Apply plugins if provided
  if (plugins.length > 0) {
    const coreSignal = adapter.toSignal(value, setValue);
    const enhancedSignal = compose(...plugins)(coreSignal);
    const [enhancedValue, enhancedSetValue] = adapter.adaptSignal(enhancedSignal);
    return [enhancedValue, enhancedSetValue, isValid];
  }

  return [value, setValue, isValid];
};

// Universal state machine with plugins
export const usePluginMachine = <S, A>(
  adapter: FrameworkAdapter<S>,
  initialState: S,
  reducer: (state: S, action: A) => S,
  ...plugins: Plugin<S>[]
): [() => S, (action: A) => void] => {
  const [state, setState] = adapter.createSignal(initialState);

  const send = (action: A) => {
    const newState = reducer(state(), action);
    setState(newState);
  };

  // Apply plugins if provided
  if (plugins.length > 0) {
    const coreSignal = adapter.toSignal(state, setState);
    const enhancedSignal = compose(...plugins)(coreSignal);
    const [enhancedState] = adapter.adaptSignal(enhancedSignal);
    return [enhancedState, send];
  }

  return [state, send];
};

// Export all universal plugin utilities
export {
  usePluginSignal as useSignal,
  usePluginComputed as useComputed,
  usePluginAsyncSignal as useAsyncSignal,
  usePluginPersistentSignal as usePersistentSignal,
  usePluginDebouncedSignal as useDebouncedSignal,
  usePluginValidatedSignal as useValidatedSignal,
  usePluginMachine as useMachine,
};
