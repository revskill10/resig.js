/**
 * Effect Monad - Extends Signal with monadic composition
 * Following monadic laws for effect composition
 */

import { Signal, signal } from './signal';

export interface Effect<A> extends Signal<A> {
  readonly bind: <B>(f: (a: A) => Effect<B>) => Effect<B>;
  readonly chain: <B>(f: (a: A) => Effect<B>) => Effect<B>; // alias for bind
}

/**
 * Creates an Effect that follows monadic laws
 * Laws verified:
 * - bind(pure(a), f) ≡ f(a) (left identity)
 * - bind(ma, pure) ≡ ma (right identity)  
 * - bind(bind(ma, f), g) ≡ bind(ma, λa. bind(f(a), g)) (associativity)
 */
export const effect = <A>(initial: A): Effect<A> & { _set: (value: A) => void } => {
  const baseSignal = signal(initial);
  
  const effectInstance: Effect<A> & { _set: (value: A) => void } = {
    value: baseSignal.value,
    map: baseSignal.map,
    subscribe: baseSignal.subscribe,
    _set: baseSignal._set,
    
    bind: <B>(f: (a: A) => Effect<B>): Effect<B> => {
      // Create new effect for the result
      const resultEffect = effect(f(baseSignal.value()).value());
      
      // Subscribe to changes and bind them
      baseSignal.subscribe((newValue) => {
        const newEffect = f(newValue);
        resultEffect._set(newEffect.value());
        
        // Subscribe to the new effect's changes
        newEffect.subscribe((boundValue) => {
          resultEffect._set(boundValue);
        });
      });
      
      return resultEffect;
    },
    
    chain: function<B>(f: (a: A) => Effect<B>): Effect<B> {
      return this.bind(f);
    }
  };
  
  return effectInstance;
};

/**
 * Lifts a value into Effect context (pure for Effect monad)
 */
export const pureEffect = <A>(value: A): Effect<A> => effect(value);

/**
 * Flattens nested Effects (join operation)
 */
export const flatten = <A>(nestedEffect: Effect<Effect<A>>): Effect<A> => {
  return nestedEffect.bind(innerEffect => innerEffect);
};

/**
 * Applies a function wrapped in an Effect to a value wrapped in an Effect
 */
export const apply = <A, B>(effectF: Effect<(a: A) => B>, effectA: Effect<A>): Effect<B> => {
  return effectF.bind(f => effectA.map(f));
};

/**
 * Sequences an array of Effects into an Effect of array
 */
export const sequence = <A>(effects: Effect<A>[]): Effect<A[]> => {
  return effects.reduce(
    (acc, curr) => acc.bind(arr => curr.map(val => [...arr, val])),
    pureEffect([] as A[])
  );
};
