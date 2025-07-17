/**
 * Svelte 5 Framework Adapter for Universal Plugin System
 * Integrates Signal-Σ plugins with Svelte 5 runes
 * Note: This is a TypeScript-compatible version. Actual Svelte usage would use runes.
 */

import { Signal, signal } from '../core/signal';
import { FrameworkAdapter } from '../adapters/universal';
import { Plugin } from '../plugins';

// Svelte 5 framework adapter implementation using runes
export const svelteAdapter: FrameworkAdapter<any> = {
  createSignal<T>(initialValue: T): [() => T, (value: T) => void] {
    // Use Svelte 5 $state rune
    let state = $state(initialValue);

    const getValue = () => state;
    const setValue = (value: T) => {
      state = value;
    };

    return [getValue, setValue];
  },

  createComputed<U>(compute: () => U): () => U {
    // Use Svelte 5 $derived rune
    const derived = $derived(compute());
    return () => derived;
  },

  createEffect(effect: () => void | (() => void)): void {
    // Use Svelte 5 $effect rune
    $effect(() => {
      const cleanup = effect();
      return cleanup;
    });
  },

  adaptSignal<T>(signal: Signal<T>): [() => T, (value: T) => void] {
    // Use Svelte 5 $state to create reactive state
    let state = $state(signal.value());

    // Use Svelte 5 $effect to subscribe to signal changes
    $effect(() => {
      const unsubscribe = signal.subscribe((newValue) => {
        state = newValue;
      });
      return unsubscribe;
    });

    const getValue = () => state;
    const setValue = (value: T) => {
      (signal as any)._set(value);
    };

    return [getValue, setValue];
  },

  toSignal<T>(getValue: () => T, setValue: (value: T) => void): Signal<T> {
    const sig = signal(getValue());
    
    // Override the _set method to use the provided setValue
    (sig as any)._set = (value: T) => {
      setValue(value);
      // Also update the internal signal
      (sig as any)._value = value;
      // Notify subscribers
      (sig as any)._subscribers.forEach((fn: any) => fn(value));
    };
    
    return sig;
  },
};

// Plugin-enhanced Svelte hooks using the universal adapter system
import {
  usePluginSignal,
  usePluginComputed,
  usePluginAsyncSignal,
  usePluginPersistentSignal,
  usePluginDebouncedSignal,
  usePluginValidatedSignal,
  usePluginMachine,
} from '../adapters/universal';

// Svelte hooks with plugin support
export const useSignal = <T>(
  initialValue: T,
  ...plugins: Plugin<T>[]
): [() => T, (value: T) => void] => {
  return usePluginSignal(svelteAdapter, initialValue, ...plugins);
};

export const useComputed = <T>(
  compute: () => T,
  ...plugins: Plugin<T>[]
): () => T => {
  return usePluginComputed(svelteAdapter, compute, ...plugins);
};

export const useAsyncSignal = <T>(
  asyncFn: () => Promise<T>,
  initialValue?: T,
  ...plugins: Plugin<any>[]
): [() => { data?: T; loading: boolean; error?: Error }, () => void, (value: T) => void] => {
  return usePluginAsyncSignal(svelteAdapter, asyncFn, initialValue, ...plugins);
};

export const usePersistentSignal = <T>(
  key: string,
  initialValue: T,
  ...plugins: Plugin<T>[]
): [() => T, (value: T) => void] => {
  return usePluginPersistentSignal(svelteAdapter, key, initialValue, ...plugins);
};

export const useDebouncedSignal = <T>(
  initialValue: T,
  delay: number,
  ...plugins: Plugin<T>[]
): [() => T, (value: T) => void, () => T] => {
  return usePluginDebouncedSignal(svelteAdapter, initialValue, delay, ...plugins);
};

export const useValidatedSignal = <T>(
  initialValue: T,
  validator: (value: T) => boolean,
  ...plugins: Plugin<T>[]
): [() => T, (value: T) => void, () => boolean] => {
  return usePluginValidatedSignal(svelteAdapter, initialValue, validator, ...plugins);
};

export const useMachine = <S, A>(
  initialState: S,
  reducer: (state: S, action: A) => S,
  ...plugins: Plugin<S>[]
): [() => S, (action: A) => void] => {
  return usePluginMachine(svelteAdapter, initialState, reducer, ...plugins);
};

// Re-export plugins for easy access
export * from '../plugins';
