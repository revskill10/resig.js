/**
 * Signal-Σ - Category-theoretic signal library
 * A signal library that obeys algebraic laws, grows via plugins, and never breaks composition
 */

// Core category exports
export * from './core/signal';
export * from './core/effect';

// Algebra exports
export * from './algebras/time';
export * from './algebras/fetch';
export * from './algebras/state';

// React integration
export * from './react/hooks';

// Plugin system (explicit exports to avoid conflicts)
export {
  debouncePlugin,
  throttlePlugin,
  cachePlugin,
  loggerPlugin,
  filterPlugin,
  transformPlugin,
  validatePlugin,
  persistPlugin,
  commonPlugins
} from './plugins';
export { compose as composePlugins, apply as applyPlugin } from './plugins';

// Main API
import { signal } from './core/signal';
import { effect } from './core/effect';
import { time } from './algebras/time';
import { fetch } from './algebras/fetch';
import { machine } from './algebras/state';
import { use, computed, effect$, time$, fetch$, machine$ } from './react/hooks';

/**
 * Main Signal-Σ API
 */
export default {
  // Core constructors
  signal,
  effect,
  time,
  fetch,
  machine,

  // React hooks (NO dependency arrays!)
  use,
  computed,
  effect$,
  time$,
  fetch$,
  machine$
};
