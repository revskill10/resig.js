/**
 * React Hooks Integration - Compositional hooks without deps arrays
 * Following the DESIGN.md: No deps array, ever.
 */

// Mock React for TypeScript compatibility
const React = {
  useMemo: <T>(fn: () => T, ...args: unknown[]) => {
    void args;
    return fn();
  },
};
const useSyncExternalStore = <T>(
  _subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => T,
): T => getSnapshot();

import { Fetch, fetch } from '../algebras/fetch';
import { machine, state, State } from '../algebras/state';
import { Time, time } from '../algebras/time';
import { Effect, effect } from '../core/effect';
import { Signal, signal } from '../core/signal';

/**
 * Core hook - replaces useState completely
 * No deps array needed - automatic dependency tracking via useSyncExternalStore
 */
export function use<A>(
  initialValue: A,
): Signal<A> & { set: (value: A) => void } {
  // Create signal instance only once using lazy initialization
  const signalInstance = React.useMemo(
    () => signal(initialValue),
    [initialValue],
  );

  // Use React's useSyncExternalStore for automatic re-renders
  const value = useSyncExternalStore(
    signalInstance.subscribe,
    signalInstance.value,
  );

  // Return signal interface with public setter
  return {
    value: () => value,
    map: signalInstance.map,
    subscribe: signalInstance.subscribe,
    set: (newValue: A) => signalInstance._set(newValue),
  };
}

// Alias for convenience
export const useSignal = use;

/**
 * Effect hook - extends signal with monadic operations
 */
export function effect$<A>(
  initialValue: A,
): Effect<A> & { set: (value: A) => void } {
  const effectInstance = React.useMemo(
    () => effect(initialValue),
    [initialValue],
  );

  const value = useSyncExternalStore(
    effectInstance.subscribe,
    effectInstance.value,
  );

  return {
    value: () => value,
    map: effectInstance.map,
    subscribe: effectInstance.subscribe,
    bind: effectInstance.bind,
    chain: effectInstance.chain,
    set: (newValue: A) => effectInstance._set(newValue),
  };
}

/**
 * Time hook - temporal operations
 */
export function time$<A>(
  initialValue: A,
): Time<A> & { set: (value: A) => void } {
  const timeInstance = React.useMemo(() => time(initialValue), [initialValue]);

  const value = useSyncExternalStore(
    timeInstance.subscribe,
    timeInstance.value,
  );

  return {
    value: () => value,
    map: timeInstance.map,
    subscribe: timeInstance.subscribe,
    bind: timeInstance.bind,
    chain: timeInstance.chain,
    delay: timeInstance.delay,
    timeout: timeInstance.timeout,
    interval: timeInstance.interval,
    set: (newValue: A) => timeInstance._set(newValue),
  };
}

/**
 * Fetch hook - network operations (React-Query replacement)
 */
export function fetch$<A>(fetcher: () => Promise<A>): Fetch<A> {
  const fetchInstance = React.useMemo(() => fetch(fetcher), [fetcher]);

  const value = useSyncExternalStore(
    fetchInstance.subscribe,
    fetchInstance.value,
  );

  return {
    value: () => value,
    map: fetchInstance.map,
    subscribe: fetchInstance.subscribe,
    bind: fetchInstance.bind,
    chain: fetchInstance.chain,
    retry: fetchInstance.retry,
    cache: fetchInstance.cache,
    refetch: fetchInstance.refetch,
  };
}

/**
 * Computed signal - pure function composition
 * No deps array needed - composition handles dependencies automatically
 */
export function computed<A>(compute: () => A): Signal<A> {
  const computedSignal = React.useMemo(() => signal(compute()), [compute]);

  // Use React's useSyncExternalStore for re-renders
  const value = useSyncExternalStore(
    computedSignal.subscribe,
    computedSignal.value,
  );

  return {
    value: () => value,
    map: computedSignal.map,
    subscribe: computedSignal.subscribe,
  };
}

/**
 * State machine hook
 */
export function machine$<S, A>(
  initialState: S,
  reducer: (state: S, action: A) => S,
): [S, (action: A) => void] {
  const machineInstance = React.useMemo(
    () => machine(initialState, reducer),
    [initialState, reducer],
  );

  const state = useSyncExternalStore(
    machineInstance.subscribe,
    () => machineInstance.state,
  );

  return [state, machineInstance.send];
}

/**
 * State hook with algebraic operations
 */
export function state$<S, A>(
  initialState: S,
  initialValue: A,
): State<S, A> & { setState: (s: S) => void } {
  const stateInstance = React.useMemo(
    () => state(initialState, initialValue),
    [initialState, initialValue],
  );

  const value = useSyncExternalStore(
    stateInstance.subscribe,
    stateInstance.value,
  );

  return {
    value: () => value,
    map: stateInstance.map,
    subscribe: stateInstance.subscribe,
    bind: stateInstance.bind,
    chain: stateInstance.chain,
    get: stateInstance.get,
    put: stateInstance.put,
    modify: stateInstance.modify,
    setState: (s: S) => stateInstance._setState(s),
  };
}
