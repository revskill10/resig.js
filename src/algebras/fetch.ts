/**
 * Network Algebra - HTTP operations and async data fetching
 * React-Query replacement with algebraic composition
 */

import { Effect, effect } from '../core/effect';

import { Time, timeout } from './time';

export interface AsyncState<T> {
  data?: T;
  loading: boolean;
  error?: Error;
}

export interface Fetch<A> extends Effect<AsyncState<A>> {
  readonly retry: (n: number) => Fetch<A>;
  readonly cache: (key: string, ttl?: number) => Fetch<A>;
  readonly refetch: () => Fetch<A>;
}

/**
 * Creates a Fetch effect with network operations
 */
export const fetch = <A>(
  fetcher: () => Promise<A>,
  deps: Effect<unknown>[] = [],
): Fetch<A> & { _set: (value: AsyncState<A>) => void } => {
  const baseEffect = effect<AsyncState<A>>({ loading: true });

  const fetchInstance: Fetch<A> & { _set: (value: AsyncState<A>) => void } = {
    value: baseEffect.value,
    map: baseEffect.map,
    subscribe: baseEffect.subscribe,
    bind: baseEffect.bind,
    chain: baseEffect.chain,
    _set: baseEffect._set,

    retry: (n: number): Fetch<A> => {
      const retryFetch = fetch(fetcher, deps);

      const attemptFetch = async (attemptsLeft: number): Promise<void> => {
        try {
          retryFetch._set({ loading: true });
          const data = await fetcher();
          retryFetch._set({ data, loading: false });
        } catch (error) {
          if (attemptsLeft > 0) {
            // Exponential backoff
            const delay = Math.pow(2, n - attemptsLeft) * 1000;
            setTimeout(() => attemptFetch(attemptsLeft - 1), delay);
          } else {
            retryFetch._set({
              error: error instanceof Error ? error : new Error(String(error)),
              loading: false,
            });
          }
        }
      };

      attemptFetch(n);
      return retryFetch;
    },

    cache: (key: string, ttl: number = 300000): Fetch<A> => {
      // 5 min default TTL
      const cached = fetch(fetcher, deps);

      // Check cache first
      const cacheKey = `fetch_cache_${key}`;
      const cacheTimeKey = `fetch_cache_time_${key}`;

      try {
        const cachedData = localStorage.getItem(cacheKey);
        const cacheTime = localStorage.getItem(cacheTimeKey);

        if (cachedData && cacheTime) {
          const age = Date.now() - parseInt(cacheTime);
          if (age < ttl) {
            cached._set({
              data: JSON.parse(cachedData),
              loading: false,
            });
            return cached;
          }
        }
      } catch (e) {
        // Cache read failed, proceed with fetch
      }

      // Subscribe to successful fetches and cache them
      baseEffect.subscribe((state) => {
        if (state.data && !state.loading && !state.error) {
          try {
            localStorage.setItem(cacheKey, JSON.stringify(state.data));
            localStorage.setItem(cacheTimeKey, Date.now().toString());
          } catch (e) {
            // Cache write failed, continue without caching
          }
        }
        cached._set(state);
      });

      return cached;
    },

    refetch: (): Fetch<A> => {
      const refetched = fetch(fetcher, deps);
      executeFetch(refetched);
      return refetched;
    },
  };

  // Execute initial fetch
  const executeFetch = async (
    target: Fetch<A> & { _set: (value: AsyncState<A>) => void },
  ) => {
    try {
      target._set({ loading: true });
      const data = await fetcher();
      target._set({ data, loading: false });
    } catch (error) {
      target._set({
        error: error instanceof Error ? error : new Error(String(error)),
        loading: false,
      });
    }
  };

  executeFetch(fetchInstance);

  // Re-fetch when dependencies change
  deps.forEach((dep) => {
    dep.subscribe(() => {
      executeFetch(fetchInstance);
    });
  });

  return fetchInstance;
};

/**
 * GET request helper
 */
export const get = <A>(url: string, deps: Effect<unknown>[] = []): Fetch<A> => {
  return fetch(
    () =>
      window.fetch(url).then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      }),
    deps,
  );
};

/**
 * POST request helper
 */
export const post = <A, B>(
  url: string,
  body: B,
  deps: Effect<unknown>[] = [],
): Fetch<A> => {
  return fetch(
    () =>
      window
        .fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          return res.json();
        }),
    deps,
  );
};

/**
 * Natural transformation: Time → Fetch (timeout injection)
 */
export const withTimeout =
  <A>(ms: number) =>
  (fetchEffect: Fetch<A>): Time<AsyncState<A> | Error> => {
    return timeout(ms, fetchEffect);
  };
