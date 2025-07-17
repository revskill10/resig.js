# Universal Plugin System Showcase

This demonstrates the true power of Signal-Σ: **universal plugins that work identically across all frameworks**.

## 🎯 **The Problem Solved**

Traditional reactive libraries require framework-specific implementations:
- React: Custom hooks with useEffect, useMemo, useState
- Svelte: Stores and reactive statements  
- SolidJS: createSignal, createMemo, createEffect
- Vue: ref, computed, watch
- Qwik: useSignal, useTask$

**Signal-Σ Solution:** Write plugins once, use them everywhere!

## 🔌 **Universal Plugin Definitions**

```typescript
// shared-plugins.ts - Works in ALL frameworks!
import { 
  compose, 
  debouncePlugin, 
  validatePlugin, 
  loggerPlugin,
  persistPlugin,
  cachePlugin,
  asyncPlugin,
  commonPlugins
} from 'resig.js/plugins';

// Email field with validation, debouncing, and persistence
export const emailFieldPlugins = compose(
  debouncePlugin(300),
  validatePlugin((email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)),
  persistPlugin('user-email'),
  loggerPlugin('EmailField')
);

// Search with debouncing and caching
export const searchPlugins = compose(
  debouncePlugin(500),
  cachePlugin('search-cache', 60000),
  loggerPlugin('Search')
);

// API data with retry, caching, and logging
export const apiDataPlugins = commonPlugins.apiData(
  () => fetch('/api/user').then(r => r.json()),
  'user-api-cache',
  3 // retries
);

// Real-time counter with throttling
export const liveCounterPlugins = commonPlugins.realTime('LiveCounter', 100);

// Form field with all features
export const formFieldPlugins = commonPlugins.formField(
  'contact-form',
  (value: string) => value.trim().length > 0,
  300
);
```

## ⚛️ **React Implementation**

```tsx
// ReactApp.tsx
import React from 'react';
import { useSignal, useComputed } from 'resig.js/react/adapter';
import { 
  emailFieldPlugins, 
  searchPlugins, 
  apiDataPlugins, 
  liveCounterPlugins 
} from './shared-plugins';

export function ReactApp() {
  // Same plugin compositions work in React!
  const [email, setEmail] = useSignal('', emailFieldPlugins);
  const [search, setSearch] = useSignal('', searchPlugins);
  const [userData, refetchUser] = useSignal(null, apiDataPlugins);
  const [counter, setCounter] = useSignal(0, liveCounterPlugins);

  // Computed values with plugins
  const emailStatus = useComputed(() => 
    email.includes('@') ? 'Valid email format' : 'Invalid email'
  );

  return (
    <div className="app">
      <h1>React + Universal Plugins</h1>
      
      <div>
        <input 
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email (debounced + validated + persistent)"
        />
        <p>{emailStatus}</p>
      </div>

      <div>
        <input 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search (debounced + cached)"
        />
      </div>

      <div>
        <button onClick={() => setCounter(counter + 1)}>
          Live Counter: {counter} (throttled + logged)
        </button>
      </div>

      <div>
        {userData?.loading && <p>Loading user...</p>}
        {userData?.error && <p>Error: {userData.error.message}</p>}
        {userData?.data && <p>User: {userData.data.name}</p>}
        <button onClick={refetchUser}>Fetch User (cached + retry)</button>
      </div>
    </div>
  );
}
```

## 🔴 **Svelte 5 Implementation**

```svelte
<!-- SvelteApp.svelte -->
<script>
  import { useSignal, useComputed } from 'resig.js/svelte/adapter';
  // EXACT SAME plugin imports!
  import { 
    emailFieldPlugins, 
    searchPlugins, 
    apiDataPlugins, 
    liveCounterPlugins 
  } from './shared-plugins';

  // IDENTICAL plugin usage!
  const [email, setEmail] = useSignal('', emailFieldPlugins);
  const [search, setSearch] = useSignal('', searchPlugins);
  const [userData, refetchUser] = useSignal(null, apiDataPlugins);
  const [counter, setCounter] = useSignal(0, liveCounterPlugins);

  // Same computed logic
  const emailStatus = useComputed(() => 
    email().includes('@') ? 'Valid email format' : 'Invalid email'
  );
</script>

<div class="app">
  <h1>Svelte 5 + Universal Plugins</h1>
  
  <div>
    <input 
      type="email"
      bind:value={email()}
      on:input={(e) => setEmail(e.target.value)}
      placeholder="Email (debounced + validated + persistent)"
    />
    <p>{emailStatus()}</p>
  </div>

  <div>
    <input 
      bind:value={search()}
      on:input={(e) => setSearch(e.target.value)}
      placeholder="Search (debounced + cached)"
    />
  </div>

  <div>
    <button on:click={() => setCounter(counter() + 1)}>
      Live Counter: {counter()} (throttled + logged)
    </button>
  </div>

  <div>
    {#if userData()?.loading}
      <p>Loading user...</p>
    {/if}
    {#if userData()?.error}
      <p>Error: {userData().error.message}</p>
    {/if}
    {#if userData()?.data}
      <p>User: {userData().data.name}</p>
    {/if}
    <button on:click={refetchUser}>Fetch User (cached + retry)</button>
  </div>
</div>
```

## 🟠 **SolidJS Implementation**

```tsx
// SolidApp.tsx
import { useSignal, useComputed } from 'resig.js/solid/adapter';
// EXACT SAME plugin imports!
import { 
  emailFieldPlugins, 
  searchPlugins, 
  apiDataPlugins, 
  liveCounterPlugins 
} from './shared-plugins';

export function SolidApp() {
  // IDENTICAL plugin usage!
  const [email, setEmail] = useSignal('', emailFieldPlugins);
  const [search, setSearch] = useSignal('', searchPlugins);
  const [userData, refetchUser] = useSignal(null, apiDataPlugins);
  const [counter, setCounter] = useSignal(0, liveCounterPlugins);

  const emailStatus = useComputed(() => 
    email().includes('@') ? 'Valid email format' : 'Invalid email'
  );

  return (
    <div class="app">
      <h1>SolidJS + Universal Plugins</h1>
      
      <div>
        <input 
          type="email"
          value={email()}
          onInput={(e) => setEmail(e.currentTarget.value)}
          placeholder="Email (debounced + validated + persistent)"
        />
        <p>{emailStatus()}</p>
      </div>

      <div>
        <input 
          value={search()}
          onInput={(e) => setSearch(e.currentTarget.value)}
          placeholder="Search (debounced + cached)"
        />
      </div>

      <div>
        <button onClick={() => setCounter(counter() + 1)}>
          Live Counter: {counter()} (throttled + logged)
        </button>
      </div>

      <div>
        <Show when={userData()?.loading}>
          <p>Loading user...</p>
        </Show>
        <Show when={userData()?.error}>
          <p>Error: {userData()!.error!.message}</p>
        </Show>
        <Show when={userData()?.data}>
          <p>User: {userData()!.data!.name}</p>
        </Show>
        <button onClick={refetchUser}>Fetch User (cached + retry)</button>
      </div>
    </div>
  );
}
```

## 🌟 **Key Observations**

### 📊 **Code Comparison**

| Aspect | React | Svelte 5 | SolidJS | Vue | Qwik |
|--------|-------|----------|---------|-----|------|
| **Plugin Imports** | ✅ Identical | ✅ Identical | ✅ Identical | ✅ Identical | ✅ Identical |
| **Plugin Usage** | ✅ Identical | ✅ Identical | ✅ Identical | ✅ Identical | ✅ Identical |
| **Business Logic** | ✅ Identical | ✅ Identical | ✅ Identical | ✅ Identical | ✅ Identical |
| **Template Syntax** | ❌ Different | ❌ Different | ❌ Different | ❌ Different | ❌ Different |

### 🚀 **Benefits Achieved**

1. **Write Once, Use Everywhere**
   - Plugin compositions are 100% reusable across frameworks
   - Business logic is completely portable
   - No framework-specific plugin implementations needed

2. **Framework-Native Performance**
   - React: Uses `useSyncExternalStore` for optimal re-renders
   - Svelte: Uses `$state/$derived` for fine-grained reactivity
   - SolidJS: Uses `createSignal/createMemo` for granular updates
   - Vue: Uses `ref/computed` for proxy-based reactivity
   - Qwik: Uses `useSignal` for resumable execution

3. **Developer Experience**
   - Learn plugin patterns once, apply everywhere
   - Easy migration between frameworks
   - Consistent debugging and testing
   - Shared knowledge across teams

4. **Architecture Benefits**
   - Clean separation between business logic and presentation
   - Plugins encapsulate cross-cutting concerns
   - Framework adapters handle integration details
   - Type safety across all frameworks

## 🎯 **The Universal Plugin Advantage**

Signal-Σ proves that **great abstractions transcend framework boundaries**. By making plugins the core reusable abstraction, we achieve:

- **Universal Reactivity** - Same reactive patterns everywhere
- **Framework Agnostic** - Business logic independent of UI framework  
- **Native Performance** - Each framework's optimal patterns
- **Developer Productivity** - Learn once, use everywhere
- **Future Proof** - Easy to adopt new frameworks

This is the future of reactive programming: **universal, composable, and framework-agnostic**.
