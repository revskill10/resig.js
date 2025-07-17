/**
 * Time Algebra - Clock ticks and temporal operations
 * Extends Effect with time-based operations
 */

import { Effect, effect } from '../core/effect';

export interface Time<A> extends Effect<A> {
  readonly delay: (ms: number) => Time<A>;
  readonly timeout: (ms: number) => Time<A | Error>;
  readonly interval: (ms: number) => Time<A>;
}

/**
 * Creates a Time effect with temporal operations
 */
export const time = <A>(initial: A): Time<A> & { _set: (value: A) => void } => {
  const baseEffect = effect(initial);

  const timeInstance: Time<A> & { _set: (value: A) => void } = {
    value: baseEffect.value,
    map: baseEffect.map,
    subscribe: baseEffect.subscribe,
    bind: baseEffect.bind,
    chain: baseEffect.chain,
    _set: baseEffect._set,

    delay: (ms: number): Time<A> => {
      const delayed = time(baseEffect.value());

      setTimeout(() => {
        delayed._set(baseEffect.value());
      }, ms);

      // Subscribe to original changes with delay
      baseEffect.subscribe((newValue) => {
        setTimeout(() => {
          delayed._set(newValue);
        }, ms);
      });

      return delayed;
    },

    timeout: (ms: number): Time<A | Error> => {
      const timedOut = time<A | Error>(baseEffect.value());
      let hasCompleted = false;

      // Set timeout
      const timeoutId = setTimeout(() => {
        if (!hasCompleted) {
          timedOut._set(new Error(`Timeout after ${ms}ms`));
        }
      }, ms);

      // Subscribe to original completion
      baseEffect.subscribe((newValue) => {
        if (!hasCompleted) {
          hasCompleted = true;
          clearTimeout(timeoutId);
          timedOut._set(newValue);
        }
      });

      return timedOut;
    },

    interval: (ms: number): Time<A> => {
      const intervalTime = time(baseEffect.value());
      let intervalId: NodeJS.Timeout;
      let subscriberCount = 0;
      let tickCount = 0;

      // Create a new Time object with custom subscribe
      const customIntervalTime: Time<A> & { _set: (value: A) => void } = {
        ...intervalTime,
        subscribe: (fn) => {
          subscriberCount++;

          // Start interval when first subscriber is added
          if (subscriberCount === 1) {
            intervalId = setInterval(() => {
              tickCount++;
              // Force a change by setting a slightly different value
              // For primitive types, we can append tick count
              const currentValue = baseEffect.value();
              if (typeof currentValue === 'number') {
                intervalTime._set((currentValue + tickCount * 0.000001) as A);
              } else if (typeof currentValue === 'string') {
                intervalTime._set((currentValue + '') as A);
              } else {
                // For objects, create a new reference
                intervalTime._set({
                  ...(currentValue as object),
                  _tick: tickCount,
                } as A);
              }
            }, ms);
          }

          const unsubscribe = intervalTime.subscribe(fn);
          return () => {
            subscriberCount--;
            if (subscriberCount === 0 && intervalId) {
              clearInterval(intervalId);
            }
            unsubscribe();
          };
        },
      };

      return customIntervalTime;
    },
  };

  return timeInstance;
};

/**
 * Creates a delayed effect
 */
export const delay = <A>(ms: number, value: A): Time<A> => {
  return time(value).delay(ms);
};

/**
 * Creates a timeout effect
 */
export const timeout = <A>(ms: number, effect: Effect<A>): Time<A | Error> => {
  const timeEffect = time(effect.value());
  effect.subscribe((value) => timeEffect._set(value));
  return timeEffect.timeout(ms);
};

/**
 * Creates an interval effect
 */
export const interval = <A>(ms: number, value: A): Time<A> => {
  const intervalTime = time(value);
  let intervalId: NodeJS.Timeout;
  let subscriberCount = 0;
  let tickCount = 0;

  // Create a new Time object with custom subscribe
  const customIntervalTime: Time<A> & { _set: (value: A) => void } = {
    ...intervalTime,
    subscribe: (fn) => {
      subscriberCount++;

      // Start interval when first subscriber is added
      if (subscriberCount === 1) {
        intervalId = setInterval(() => {
          tickCount++;
          // Force a change by setting a slightly different value
          if (typeof value === 'number') {
            intervalTime._set((value + tickCount * 0.000001) as A);
          } else if (typeof value === 'string') {
            intervalTime._set((value + '') as A);
          } else {
            // For objects, create a new reference
            intervalTime._set({ ...(value as object), _tick: tickCount } as A);
          }
        }, ms);
      }

      const unsubscribe = intervalTime.subscribe(fn);
      return () => {
        subscriberCount--;
        if (subscriberCount === 0 && intervalId) {
          clearInterval(intervalId);
        }
        unsubscribe();
      };
    },
  };

  return customIntervalTime;
};

/**
 * Debounce utility using Time algebra
 */
export const debounce = <A>(ms: number, effect: Effect<A>): Time<A> => {
  const debounced = time(effect.value());
  let timeoutId: NodeJS.Timeout;

  effect.subscribe((newValue) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      debounced._set(newValue);
    }, ms);
  });

  return debounced;
};

/**
 * Throttle utility using Time algebra
 */
export const throttle = <A>(ms: number, effect: Effect<A>): Time<A> => {
  const throttled = time(effect.value());
  let lastExecution = 0;

  effect.subscribe((newValue) => {
    const now = Date.now();
    if (now - lastExecution >= ms) {
      throttled._set(newValue);
      lastExecution = now;
    }
  });

  return throttled;
};
