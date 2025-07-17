/**
 * Core Signal Category - Functor implementation
 * Following category-theoretic laws for structure preservation
 */

export interface Signal<A> {
  readonly value: () => A;
  readonly map: <B>(f: (a: A) => B) => Signal<B>;
  readonly subscribe: (fn: (a: A) => void) => () => void; // unsubscribe
}

/**
 * Creates a basic signal with functor laws
 * Laws verified:
 * - map(id) ≡ id (identity)
 * - map(f ∘ g) ≡ map(f) ∘ map(g) (composition)
 */
export const signal = <A>(initial: A): Signal<A> & { _set: (value: A) => void } => {
  let current = initial;
  const subscribers = new Set<(value: A) => void>();

  const notify = () => {
    subscribers.forEach(fn => fn(current));
  };

  const signalInstance: Signal<A> & { _set: (value: A) => void } = {
    value: () => current,
    
    map: <B>(f: (a: A) => B): Signal<B> => {
      // Create derived signal that follows functor laws
      const derived = signal(f(current));
      
      // Subscribe to changes and map them
      signalInstance.subscribe((newValue) => {
        derived._set(f(newValue));
      });
      
      return derived;
    },
    
    subscribe: (fn: (a: A) => void) => {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    },
    
    _set: (value: A) => {
      if (value !== current) {
        current = value;
        notify();
      }
    }
  };

  return signalInstance;
};

/**
 * Identity function for functor law verification
 */
export const id = <A>(a: A): A => a;

/**
 * Function composition for functor law verification
 */
export const compose = <A, B, C>(f: (b: B) => C, g: (a: A) => B) => (a: A): C => f(g(a));

/**
 * Pure function - lifts a value into Signal context
 */
export const pure = <A>(value: A): Signal<A> => signal(value);
