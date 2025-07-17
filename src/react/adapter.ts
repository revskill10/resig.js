/**
 * React Framework Adapter for Universal Plugin System
 * Integrates Signal-Σ plugins with React's reactivity system
 */

import { useRef, useSyncExternalStore, useCallback } from 'react';
import { Signal, signal } from '../core/signal';
import { FrameworkAdapter } from '../adapters/universal';
import { Plugin } from '../plugins';

// React-specific framework adapter implementation
export const reactAdapter: FrameworkAdapter<any> = {
  createSignal<T>(initialValue: T): [() => T, (value: T) => void] {
    const sigRef = useRef<Signal<T> & { _set: (value: T) => void }>();
    if (!sigRef.current) {
      sigRef.current = signal(initialValue);
    }

    const value = useSyncExternalStore(
      sigRef.current.subscribe,
      sigRef.current.value,
    );

    const setValue = useCallback((newValue: T) => {
      sigRef.current!._set(newValue);
    }, []);

    return [() => value, setValue];
  },

  createComputed<U>(compute: () => U): () => U {
    // In React, computed values are just functions that access reactive state
    // React's re-rendering handles the reactivity automatically
    return compute;
  },

  createEffect(effect: () => void | (() => void)): void {
    // React effects are handled by the component lifecycle
    // For now, we'll execute immediately and let React handle re-execution
    const cleanup = effect();
    
    // Store cleanup for potential future use
    useRef(cleanup);
  },

  adaptSignal<T>(signal: Signal<T>): [() => T, (value: T) => void] {
    const value = useSyncExternalStore(
      signal.subscribe,
      signal.value,
    );

    const setValue = useCallback((newValue: T) => {
      (signal as any)._set(newValue);
    }, [signal]);

    return [() => value, setValue];
  },

  toSignal<T>(getValue: () => T, setValue: (value: T) => void): Signal<T> {
    const sig = signal(getValue());
    
    // Override the _set method to use the provided setValue
    (sig as any)._set = setValue;
    
    return sig;
  },
};

// Plugin-enhanced React hooks using the universal adapter system
import {
  usePluginSignal,
  usePluginComputed,
  usePluginAsyncSignal,
  usePluginPersistentSignal,
  usePluginDebouncedSignal,
  usePluginValidatedSignal,
  usePluginMachine,
} from '../adapters/universal';

// React hooks with plugin support
export const useSignal = <T>(
  initialValue: T,
  ...plugins: Plugin<T>[]
): [T, (value: T) => void] => {
  const [getValue, setValue] = usePluginSignal(reactAdapter, initialValue, ...plugins);
  return [getValue(), setValue];
};

export const useComputed = <T>(
  compute: () => T,
  ...plugins: Plugin<T>[]
): T => {
  const getValue = usePluginComputed(reactAdapter, compute, ...plugins);
  return getValue();
};

export const useAsyncSignal = <T>(
  asyncFn: () => Promise<T>,
  initialValue?: T,
  ...plugins: Plugin<any>[]
): [{ data?: T; loading: boolean; error?: Error }, () => void, (value: T) => void] => {
  const [getState, refetch, setValue] = usePluginAsyncSignal(
    reactAdapter,
    asyncFn,
    initialValue,
    ...plugins
  );
  return [getState(), refetch, setValue];
};

export const usePersistentSignal = <T>(
  key: string,
  initialValue: T,
  ...plugins: Plugin<T>[]
): [T, (value: T) => void] => {
  const [getValue, setValue] = usePluginPersistentSignal(
    reactAdapter,
    key,
    initialValue,
    ...plugins
  );
  return [getValue(), setValue];
};

export const useDebouncedSignal = <T>(
  initialValue: T,
  delay: number,
  ...plugins: Plugin<T>[]
): [T, (value: T) => void, T] => {
  const [getImmediate, setImmediate, getDebounced] = usePluginDebouncedSignal(
    reactAdapter,
    initialValue,
    delay,
    ...plugins
  );
  return [getImmediate(), setImmediate, getDebounced()];
};

export const useValidatedSignal = <T>(
  initialValue: T,
  validator: (value: T) => boolean,
  ...plugins: Plugin<T>[]
): [T, (value: T) => void, boolean] => {
  const [getValue, setValue, getIsValid] = usePluginValidatedSignal(
    reactAdapter,
    initialValue,
    validator,
    ...plugins
  );
  return [getValue(), setValue, getIsValid()];
};

export const useMachine = <S, A>(
  initialState: S,
  reducer: (state: S, action: A) => S,
  ...plugins: Plugin<S>[]
): [S, (action: A) => void] => {
  const [getState, send] = usePluginMachine(
    reactAdapter,
    initialState,
    reducer,
    ...plugins
  );
  return [getState(), send];
};

// Re-export plugins for easy access
export * from '../plugins';
