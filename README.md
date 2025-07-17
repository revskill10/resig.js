# Signal-Σ (resig.js)

> A reactive signal library that eliminates React hooks and dependency arrays completely

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Reactive](https://img.shields.io/badge/Reactive-FF6B6B?style=for-the-badge&logo=reactivex&logoColor=white)](https://reactivex.io/)

## 🎯 **What is Signal-Σ?**

Signal-Σ is a **production-ready reactive signal library** that completely replaces React hooks with automatic dependency tracking. It provides predictable, composable reactive programming for React applications.

### ✨ **Key Features**

- **🚫 NO useState, NO useEffect, NO dependency arrays!**
- **🔧 Reliable architecture** - Predictable behavior with proven patterns
- **⚡ Automatic dependency tracking** - Changes propagate automatically
- **🔌 Zero-runtime cost plugins** - Composable features and utilities
- **🤖 State machines** - XState replacement with type-safe transitions
- **🌐 Network operations** - React-Query replacement with automatic refetching
- **⏰ Time-based features** - Debouncing, throttling, intervals without useEffect
- **💾 Persistence** - Automatic localStorage sync
- **🛡️ Type safety** - Full TypeScript support with inference
- **📊 DevTools** - Built-in signal debugging and monitoring

## 🚀 **Quick Start**

```bash
npm install resig.js
```

### Universal Framework Support

Signal-Σ works seamlessly across **all major frameworks** with the same API:

#### React
```tsx
import { useSignal, useComputed } from 'resig.js/react';

function Counter() {
  const [count, setCount] = useSignal(0);
  const doubled = useComputed(() => count * 2);

  return (
    <div>
      <p>Count: {count}</p>
      <p>Doubled: {doubled}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
}
```

#### SolidJS
```tsx
import { useSignal, useComputed } from 'resig.js/solid';

function Counter() {
  const [count, setCount] = useSignal(0);
  const doubled = useComputed(() => count() * 2);

  return (
    <div>
      <p>Count: {count()}</p>
      <p>Doubled: {doubled()}</p>
      <button onClick={() => setCount(count() + 1)}>+</button>
    </div>
  );
}
```

#### Svelte 5 (Runes)
```svelte
<script>
  import { useSignal, useComputed } from 'resig.js/svelte';

  const [count, setCount] = useSignal(0);
  const doubled = useComputed(() => count() * 2);
</script>

<div>
  <p>Count: {count()}</p>
  <p>Doubled: {doubled()}</p>
  <button onclick={() => setCount(count() + 1)}>+</button>
</div>
```

#### Vue.js
```vue
<template>
  <div>
    <p>Count: {{ count() }}</p>
    <p>Doubled: {{ doubled() }}</p>
    <button @click="setCount(count() + 1)">+</button>
  </div>
</template>

<script setup>
import { useSignal, useComputed } from 'resig.js/vue';

const [count, setCount] = useSignal(0);
const doubled = useComputed(() => count() * 2);
</script>
```

#### Qwik
```tsx
import { component$ } from '@builder.io/qwik';
import { useSignal, useComputed } from 'resig.js/qwik';

export default component$(() => {
  const [count, setCount] = useSignal(0);
  const doubled = useComputed(() => count() * 2);

  return (
    <div>
      <p>Count: {count()}</p>
      <p>Doubled: {doubled()}</p>
      <button onClick$={() => setCount(count() + 1)}>+</button>
    </div>
  );
});
```

### 🌟 **Same API, Every Framework**

The beauty of Signal-Σ is that **the same reactive logic works everywhere**. Learn once, use everywhere!

### 📝 **Featured Demo: Svelte 5 Todo App**

Our comprehensive Svelte 5 todo app demonstrates the full power of Signal-Σ with Svelte runes:

```svelte
<script>
  import {
    useSignal,
    useComputed,
    usePersistentSignal,
    useValidatedSignal,
    useDebouncedSignal,
    useMachine
  } from 'resig.js/svelte';

  // Persistent todos with localStorage
  const [todos, setTodos] = usePersistentSignal('svelte-todos', []);

  // Real-time validation
  const [newTodo, setNewTodo, isValid] = useValidatedSignal('',
    text => text.trim().length > 0
  );

  // Debounced search
  const [searchTerm, setSearchTerm, debouncedSearch] = useDebouncedSignal('', 300);

  // State machine for bulk operations
  const [bulkState, sendBulk] = useMachine('idle', (state, action) => {
    switch (state) {
      case 'idle': return action === 'start_delete' ? 'deleting' : state;
      case 'deleting': return action === 'finish' ? 'idle' : state;
      default: return state;
    }
  });

  // Automatic computed values - no dependency arrays!
  const filteredTodos = useComputed(() => {
    let filtered = todos();

    if (debouncedSearch().trim()) {
      filtered = filtered.filter(todo =>
        todo.text.toLowerCase().includes(debouncedSearch().toLowerCase())
      );
    }

    return filtered;
  });

  const stats = useComputed(() => ({
    total: todos().length,
    active: todos().filter(todo => !todo.completed).length,
    completed: todos().filter(todo => todo.completed).length,
    completionRate: todos().length > 0
      ? Math.round((todos().filter(todo => todo.completed).length / todos().length) * 100)
      : 0
  }));
</script>

<!-- Template uses the reactive values seamlessly -->
<div>
  <p>Total: {stats().total} | Completion: {stats().completionRate}%</p>
  <input bind:value={newTodo()} placeholder="Add todo..." />
  <button on:click={addTodo} disabled={!isValid()}>Add</button>

  {#each filteredTodos() as todo}
    <div>{todo.text}</div>
  {/each}
</div>
```

**Key Features:**
- 🔄 **Real-time search** with 300ms debouncing
- 💾 **Automatic persistence** to localStorage
- ✅ **Form validation** with visual feedback
- 📊 **Live statistics** and completion tracking
- 🎛️ **State machine** for bulk operations
- 🚀 **Native Svelte 5 runes** integration

## 🌐 **Framework Adapters**

Signal-Σ showcases the power of its core abstraction by providing native adapters for all major frameworks:

| Framework | Import Path | Native Integration |
|-----------|-------------|-------------------|
| **React** | `resig.js/react` | useState, useEffect, useMemo |
| **SolidJS** | `resig.js/solid` | createSignal, createMemo, createEffect |
| **Svelte 5** | `resig.js/svelte` | $state, $derived, $effect |
| **Vue.js** | `resig.js/vue` | ref, computed, watchEffect |
| **Qwik** | `resig.js/qwik` | useSignal, useTask$, useVisibleTask$ |

### Framework-Specific Features

Each adapter leverages the framework's native reactivity system:

#### React Adapter
- Uses React's reconciliation and batching
- Integrates with React DevTools
- Supports Suspense and Concurrent Features

#### SolidJS Adapter
- Leverages SolidJS's fine-grained reactivity
- Zero virtual DOM overhead
- Automatic cleanup with onCleanup

#### Svelte 5 Adapter
- Uses Svelte 5's new runes system
- Compile-time optimizations
- Automatic cleanup and lifecycle management

#### Vue.js Adapter
- Integrates with Vue's reactivity system
- Works with Vue DevTools
- Supports composition API patterns

#### Qwik Adapter
- Resumable execution model
- Server-side rendering optimization
- Progressive hydration support

### Cross-Framework State Sharing

The core Signal-Σ abstraction enables **cross-framework state sharing**:

```typescript
// Shared state (framework-agnostic)
import { signal } from 'resig.js';

export const globalCounter = signal(0);
export const globalTheme = signal('light');

// Use in React
import { useSignal } from 'resig.js/react';
const [count, setCount] = useSignal(globalCounter.value());

// Use in SolidJS
import { useSignal } from 'resig.js/solid';
const [count, setCount] = useSignal(globalCounter.value());

// Use in Vue
import { useSignal } from 'resig.js/vue';
const [count, setCount] = useSignal(globalCounter.value());
```

## 📚 **Complete API Reference**

Signal-Σ provides a comprehensive set of universal hooks that work identically across all frameworks:

### 🔧 **Universal Hooks**

The foundation of Signal-Σ - these hooks work the same way in React, Svelte 5, SolidJS, Vue, and Qwik.

#### `useSignal<T>(initialValue: T, plugins?: Plugin<T>): [() => T, (value: T) => void]`

**Replaces:** `useState`
**Purpose:** Basic reactive state management with optional plugins

```tsx
// React
import { useSignal } from 'resig.js/react';
import { loggerPlugin } from 'resig.js/plugins';

function ReactExample() {
  const [name, setName] = useSignal('Alice');
  const [count, setCount] = useSignal(0, loggerPlugin('Counter'));
  const [user, setUser] = useSignal({ id: 1, name: 'John' });

  return (
    <div>
      <input value={name()} onChange={(e) => setName(e.target.value)} />
      <button onClick={() => setCount(count() + 1)}>Count: {count()}</button>
      <button onClick={() => setUser({...user(), name: 'Updated'})}>
        Update User
      </button>
    </div>
  );
}

// Svelte 5 - IDENTICAL API!
import { useSignal } from 'resig.js/svelte';
import { loggerPlugin } from 'resig.js/plugins';

const [name, setName] = useSignal('Alice');
const [count, setCount] = useSignal(0, loggerPlugin('Counter'));
```

#### `useComputed<T>(compute: () => T, plugins?: Plugin<T>): () => T`

**Replaces:** `useMemo`, `useCallback`, and most `useEffect` cases
**Purpose:** Derived values with automatic dependency tracking

```tsx
// React
import { useSignal, useComputed } from 'resig.js/react';
import { loggerPlugin } from 'resig.js/plugins';

function ComputedExample() {
  const [firstName, setFirstName] = useSignal('John');
  const [lastName, setLastName] = useSignal('Doe');
  const [items, setItems] = useSignal([1, 2, 3, 4, 5]);

  // Automatically updates when firstName or lastName changes
  const fullName = useComputed(() => `${firstName()} ${lastName()}`);
  const initials = useComputed(() => `${firstName()[0]}${lastName()[0]}`);

  // Complex computations with plugins
  const statistics = useComputed(() => ({
    total: items().reduce((sum, item) => sum + item, 0),
    average: items().length > 0 ? items().reduce((sum, item) => sum + item, 0) / items().length : 0,
    max: Math.max(...items()),
    min: Math.min(...items())
  }), loggerPlugin('Statistics'));

  // Side effects (replaces useEffect)
  useComputed(() => {
    document.title = `${fullName()} - ${statistics().total} items`;
    return null; // We don't need the return value
  });

  return (
    <div>
      <p>Full Name: {fullName()}</p>
      <p>Initials: {initials()}</p>
      <p>Total: {statistics().total}, Average: {statistics().average}</p>
    </div>
  );
}

// Svelte 5 - IDENTICAL logic!
const [firstName, setFirstName] = useSignal('John');
const [lastName, setLastName] = useSignal('Doe');
const fullName = useComputed(() => `${firstName()} ${lastName()}`);
```

#### `useEffect(effect: () => void | (() => void), deps?: any[]): void`

**Replaces:** `useEffect`
**Purpose:** Side effects with automatic cleanup

```tsx
// React
import { useSignal, useEffect } from 'resig.js/react';

function EffectExample() {
  const [count, setCount] = useSignal(0);
  const [name, setName] = useSignal('Alice');

  // Effect with dependencies
  useEffect(() => {
    console.log('Count changed to:', count());
    return () => console.log('Count effect cleanup');
  }, [count]);

  // Effect without dependencies (runs on every change)
  useEffect(() => {
    document.title = `${name()} - Count: ${count()}`;
  });

  return (
    <div>
      <p>Count: {count()}</p>
      <button onClick={() => setCount(count() + 1)}>Increment</button>
    </div>
  );
}
```

### ⚡ **Async Hooks**

Handle asynchronous operations with built-in loading states and error handling.

#### `useAsyncSignal<T>(asyncFn: () => Promise<T>, initialValue?: T, plugins?: Plugin<T>): [() => AsyncState<T>, () => void, (value: T) => void]`

**Purpose:** Manual async data fetching with refetch and optimistic updates

```tsx
// React
import { useSignal, useAsyncSignal } from 'resig.js/react';
import { retryPlugin, loggerPlugin, compose } from 'resig.js/plugins';

function UserProfile() {
  const [userId, setUserId] = useSignal(1);

  const asyncPlugins = compose(
    retryPlugin(3, 1000),
    loggerPlugin('UserData')
  );

  const [userState, refetchUser, setUser] = useAsyncSignal(
    async () => {
      const response = await fetch(`/api/users/${userId()}`);
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    },
    null,
    asyncPlugins
  );

  return (
    <div>
      {userState().loading && <div>Loading user...</div>}
      {userState().error && <div>Error: {userState().error.message}</div>}
      {userState().data && (
        <div>
          <h1>{userState().data.name}</h1>
          <p>{userState().data.email}</p>
        </div>
      )}
      <button onClick={refetchUser}>Refetch User</button>
      <button onClick={() => setUser({...userState().data, name: 'Updated Name'})}>
        Optimistic Update
      </button>
    </div>
  );
}
```

#### `useAsyncComputed<T>(asyncCompute: () => Promise<T>, deps: unknown[])`

**Purpose:** Async computed values with dependency arrays

```tsx
import { useSignal, useAsyncComputed } from 'resig.js';

function PostsList() {
  const [userId, setUserId] = useSignal(1);
  const [filter, setFilter] = useSignal('all');

  // Recomputes when userId or filter changes
  const postsState = useAsyncComputed(async () => {
    const response = await fetch(`/api/posts?userId=${userId}&filter=${filter}`);
    if (!response.ok) throw new Error('Failed to fetch posts');
    return response.json();
  }, [userId, filter]);

  // Derived async computation
  const postCountState = useAsyncComputed(async () => {
    // Simulate some async processing
    await new Promise(resolve => setTimeout(resolve, 100));
    return postsState.data?.length || 0;
  }, [postsState.data]);

  return (
    <div>
      {postsState.loading && <div>Loading posts...</div>}
      {postsState.error && <div>Error: {postsState.error.message}</div>}
      {postsState.data && (
        <div>
          <p>Found {postsState.data.length} posts</p>
          <p>Post count (async computed): {postCountState.data}</p>
        </div>
      )}
    </div>
  );
}
```

#### `useAsyncComputedSignal<T>(asyncCompute: () => Promise<T>, deps: unknown[])`

**Purpose:** Returns an async computed **signal** that can be used in other computations

```tsx
import { useSignal, useComputed, useAsyncComputedSignal } from 'resig.js';

function Dashboard() {
  const [userId, setUserId] = useSignal(1);

  // Returns a signal, not just state
  const userStatsSignal = useAsyncComputedSignal(async () => {
    const posts = await fetch(`/api/posts?userId=${userId}`).then(r => r.json());
    return {
      totalPosts: posts.length,
      avgTitleLength: posts.reduce((sum, post) => sum + post.title.length, 0) / posts.length,
      lastPostDate: new Date().toISOString(),
      userId: userId
    };
  }, [userId]);

  // Other signals can use this async computed signal
  const isActiveUser = useComputed(() => {
    const stats = userStatsSignal.value();
    return stats.data && stats.data.totalPosts > 5;
  });

  const userStatsDisplay = useComputed(() => {
    const stats = userStatsSignal.value();
    if (stats.loading) return "Computing user statistics...";
    if (stats.error) return `Error: ${stats.error.message}`;
    if (!stats.data) return "No statistics available";
    return `User ${stats.data.userId} has ${stats.data.totalPosts} posts`;
  });

  return (
    <div>
      <p>{userStatsDisplay}</p>
      <p>Active User: {isActiveUser ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

### 🤖 **State Management Hooks**

Advanced state management with state machines.

#### `useMachine<S, A>(initialState: S, reducer: (state: S, action: A) => S, plugins?: Plugin<S>): [() => S, (action: A) => void]`

**Replaces:** XState
**Purpose:** Type-safe state machines with simple, predictable transitions

```tsx
// React
import { useMachine } from 'resig.js/react';
import { loggerPlugin } from 'resig.js/plugins';

type State = 'idle' | 'loading' | 'success' | 'error';
type Action = 'start' | 'success' | 'error' | 'reset';

function AsyncButton() {
  const [state, send] = useMachine<State, Action>(
    'idle',
    (state, action) => {
      switch (state) {
        case 'idle': return action === 'start' ? 'loading' : state;
        case 'loading':
          return action === 'success' ? 'success' :
                 action === 'error' ? 'error' : state;
        case 'success':
        case 'error': return action === 'reset' ? 'idle' : state;
        default: return state;
      }
    },
    loggerPlugin('AsyncButton')
  );

  const handleClick = async () => {
    send('start');
    try {
      await fetch('/api/data');
      send('success');
    } catch {
      send('error');
    }
  };

  return (
    <div>
      <button onClick={handleClick} disabled={state() === 'loading'}>
        {state() === 'loading' ? 'Loading...' : 'Click me'}
      </button>
      {state() === 'success' && <p>✅ Success!</p>}
      {state() === 'error' && (
        <div>
          <p>❌ Error occurred</p>
          <button onClick={() => send('reset')}>Reset</button>
        </div>
      )}
    </div>
  );
}

// Svelte 5 - IDENTICAL logic!
const [state, send] = useMachine('idle', reducer, loggerPlugin('AsyncButton'));
```

#### `useEffect<T>(initialValue: T): [T, (value: T) => void, Effect<T>]`

**Purpose:** Advanced effect composition for complex side effect patterns

```tsx
import { useEffect, useSignal } from 'resig.js';

function EffectExample() {
  const [count, setCount] = useSignal(0);
  const [effectValue, setEffectValue, effectMonad] = useEffect('initial');

  // Chain effects together
  const handleEffectDemo = () => {
    const newValue = `Step 1: Effect -> count(${count}) -> processed`;
    setEffectValue(newValue);

    // Chain another effect
    setTimeout(() => {
      const finalValue = `Step 2: ${newValue} -> final`;
      setEffectValue(finalValue);
    }, 500);
  };

  return (
    <div>
      <p>Effect Value: {effectValue}</p>
      <button onClick={handleEffectDemo}>Run Effect Chain</button>
    </div>
  );
}
```

### 🌐 **Network Hooks**

**Replaces:** React-Query, SWR
**Purpose:** Automatic data fetching with loading states and retry logic

#### `useFetch<T>(fetcher: () => Promise<T>): [AsyncState<T>, () => Fetch<T>, (n: number) => Fetch<T>]`

```tsx
import { useSignal, useFetch } from 'resig.js';

function UserProfile() {
  const [userId, setUserId] = useSignal(1);

  // Automatically refetches when userId changes
  const [userState, refetch, retry] = useFetch(() =>
    fetch(`/api/users/${userId}`).then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      return res.json();
    })
  );

  return (
    <div>
      {userState.loading && <div>Loading user...</div>}
      {userState.error && (
        <div>
          <p>Error: {userState.error.message}</p>
          <button onClick={() => retry(3)}>Retry 3 times</button>
        </div>
      )}
      {userState.data && (
        <div>
          <h1>{userState.data.name}</h1>
          <p>{userState.data.email}</p>
          <button onClick={refetch}>Refresh</button>
        </div>
      )}
    </div>
  );
}
```

### 💾 **Persistence Hooks**

Automatic data persistence without manual localStorage management.

#### `usePersistentSignal<T>(key: string, initialValue: T): [T, (value: T) => void]`

**Purpose:** Automatic localStorage persistence

```tsx
import { usePersistentSignal } from 'resig.js';

function ThemeSelector() {
  // Automatically saves to localStorage and loads on refresh
  const [theme, setTheme] = usePersistentSignal('app-theme', 'light');
  const [userPrefs, setUserPrefs] = usePersistentSignal('user-preferences', {
    notifications: true,
    autoSave: false,
    language: 'en'
  });

  return (
    <div>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="light">Light Theme</option>
        <option value="dark">Dark Theme</option>
        <option value="auto">Auto Theme</option>
      </select>

      <label>
        <input
          type="checkbox"
          checked={userPrefs.notifications}
          onChange={(e) => setUserPrefs({
            ...userPrefs,
            notifications: e.target.checked
          })}
        />
        Enable Notifications
      </label>
    </div>
  );
}
```

### ⏰ **Time-Based Hooks**

Handle time-based operations without useEffect complexity.

#### `useDebouncedSignal<T>(initialValue: T, delay: number): [T, (value: T) => void, T]`

**Purpose:** Debounced input without useEffect

```tsx
import { useDebouncedSignal, useComputed } from 'resig.js';

function SearchBox() {
  const [immediate, setSearch, debounced] = useDebouncedSignal('', 300);
  const [searchData] = useSignal(['apple', 'banana', 'cherry', 'date']);

  const results = useComputed(() => {
    if (!debounced) return [];
    return searchData.filter(item =>
      item.toLowerCase().includes(debounced.toLowerCase())
    );
  });

  return (
    <div>
      <input
        value={immediate}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
      />
      <p>Immediate: {immediate}</p>
      <p>Debounced (300ms): {debounced}</p>
      <ul>
        {results.map(result => <li key={result}>{result}</li>)}
      </ul>
    </div>
  );
}
```

### 🔍 **Validation Hooks**

Real-time validation without manual state management.

#### `useValidatedSignal<T>(initialValue: T, validator: (value: T) => boolean): [T, (value: T) => void, boolean]`

```tsx
import { useValidatedSignal } from 'resig.js';

function FormValidation() {
  const [email, setEmail, isEmailValid] = useValidatedSignal(
    '',
    (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );

  const [password, setPassword, isPasswordValid] = useValidatedSignal(
    '',
    (password) => password.length >= 8
  );

  const [confirmPassword, setConfirmPassword, isConfirmValid] = useValidatedSignal(
    '',
    (confirm) => confirm === password
  );

  return (
    <form>
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={{ borderColor: isEmailValid ? 'green' : 'red' }}
        />
        <span>{isEmailValid ? '✓' : '✗'} Valid email</span>
      </div>

      <div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          style={{ borderColor: isPasswordValid ? 'green' : 'red' }}
        />
        <span>{isPasswordValid ? '✓' : '✗'} At least 8 characters</span>
      </div>

      <div>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
          style={{ borderColor: isConfirmValid ? 'green' : 'red' }}
        />
        <span>{isConfirmValid ? '✓' : '✗'} Passwords match</span>
      </div>

      <button
        type="submit"
        disabled={!isEmailValid || !isPasswordValid || !isConfirmValid}
      >
        Submit
      </button>
    </form>
  );
}
```

## 🔌 **Universal Plugin System**

The true power of Signal-Σ lies in its **universal plugin system** - write plugins once, use them across **all frameworks**. Plugins are the core reusable abstraction that transcends framework boundaries.

### 🌟 **Write Once, Use Everywhere**

```typescript
// Define plugins once - they work in ALL frameworks!
import {
  compose,
  debouncePlugin,
  validatePlugin,
  loggerPlugin,
  persistPlugin,
  retryPlugin,
  timeoutPlugin,
  cachePlugin
} from 'resig.js/plugins';

const userInputPlugins = compose(
  debouncePlugin(300),
  validatePlugin((value: string) => value.length > 0),
  loggerPlugin('UserInput')
);

const asyncDataPlugins = compose(
  retryPlugin(3, 1000),
  timeoutPlugin(5000),
  cachePlugin(60000),
  loggerPlugin('AsyncData')
);

// Use in React
import { useSignal } from 'resig.js/react';
const [input, setInput] = useSignal('', userInputPlugins);

// Use in Svelte 5
import { useSignal } from 'resig.js/svelte';
const [input, setInput] = useSignal('', userInputPlugins);

// Use in SolidJS
import { useSignal } from 'resig.js/solid';
const [input, setInput] = useSignal('', userInputPlugins);

// Use in Vue
import { useSignal } from 'resig.js/vue';
const [input, setInput] = useSignal('', userInputPlugins);

// Use in Qwik
import { useSignal } from 'resig.js/qwik';
const [input, setInput] = useSignal('', userInputPlugins);
```

### 🏗️ **Plugin Architecture**

Plugins follow the simple pattern: `(config) => (signal) => signal`

```typescript
// Plugin interface
type Plugin<T> = (signal: Signal<T>) => Signal<T>;

// Plugin factory pattern
const myPlugin = (config: any) => (signal: Signal<T>) => {
  // Transform the signal while preserving reactivity
  return signal.map(value => /* transform value */);
};
```

### 🔧 **Core Plugins**

```typescript
import {
  // Core plugins from Signal-Σ
  debouncePlugin,
  validatePlugin,
  loggerPlugin,
  persistPlugin,
  stateMachinePlugin,

  // Extended plugins
  retryPlugin,
  timeoutPlugin,
  cachePlugin,
  throttlePlugin,
  transformPlugin,
  filterPlugin,
  historyPlugin,
  asyncPlugin,
  batchPlugin,
  conditionalPlugin,
  pipePlugin,

  // Composition
  compose
} from 'resig.js/plugins';

// Individual plugins
const [count, setCount] = useSignal(0, loggerPlugin('Counter'));
const [input, setInput] = useSignal('', debouncePlugin(300));

// Compose multiple plugins
const [userInput, setUserInput] = useSignal('', compose(
  debouncePlugin(300),
  validatePlugin((value: string) => value.length > 0),
  loggerPlugin('UserInput'),
  persistPlugin('user-input-cache')
));

// Async operations with plugins
const [userData, refetchUser] = useAsyncSignal(
  async () => {
    const response = await fetch('/api/user');
    return response.json();
  },
  null,
  compose(
    retryPlugin(3, 1000),
    timeoutPlugin(5000),
    loggerPlugin('UserData')
  )
);
```

### 🚀 **Universal Plugin Examples**

The same plugin compositions work identically across **all frameworks**:

#### Shared Plugin Definitions
```typescript
// shared-plugins.js - Works in ALL frameworks!
import { compose, debouncePlugin, validatePlugin, loggerPlugin } from 'resig.js/plugins';

export const emailPlugins = compose(
  debouncePlugin(300),
  validatePlugin((email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)),
  loggerPlugin('EmailField')
);

export const searchPlugins = compose(
  debouncePlugin(500),
  loggerPlugin('Search')
);

export const asyncDataPlugins = compose(
  retryPlugin(3, 1000),
  timeoutPlugin(5000),
  loggerPlugin('AsyncData')
);
```

#### React Example
```tsx
import { useSignal, useAsyncSignal } from 'resig.js/react';
import { emailPlugins, asyncDataPlugins } from './shared-plugins';

function ReactForm() {
  const [email, setEmail] = useSignal('', emailPlugins);
  const [userData, refetchUser] = useAsyncSignal(
    () => fetch('/api/user').then(r => r.json()),
    null,
    asyncDataPlugins
  );

  return (
    <input
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder="Email..."
    />
  );
}
```

#### Svelte 5 Example
```svelte
<script>
  import { useSignal, useAsyncSignal } from 'resig.js/svelte';
  // SAME plugin compositions!
  import { emailPlugins, asyncDataPlugins } from './shared-plugins';

  const [email, setEmail] = useSignal('', emailPlugins);
  const [userData, refetchUser] = useAsyncSignal(
    () => fetch('/api/user').then(r => r.json()),
    null,
    asyncDataPlugins
  );
</script>

<input
  value={email()}
  oninput={(e) => setEmail(e.target.value)}
  placeholder="Email..."
/>
```

#### SolidJS Example
```tsx
import { useSignal, useAsyncSignal } from 'resig.js/solid';
// SAME plugin compositions!
import { emailPlugins, asyncDataPlugins } from './shared-plugins';

function SolidForm() {
  const [email, setEmail] = useSignal('', emailPlugins);
  const [userData, refetchUser] = useAsyncSignal(
    () => fetch('/api/user').then(r => r.json()),
    null,
    asyncDataPlugins
  );

  return (
    <input
      value={email()}
      onInput={(e) => setEmail(e.currentTarget.value)}
      placeholder="Email..."
    />
  );
}
```

**Key Point:** The plugin compositions are **identical** across all frameworks!

### 🔧 **Plugin Interface & Usage Patterns**

#### Plugin Interface
```typescript
// All plugins follow this simple interface
type Plugin<T> = (signal: Signal<T>) => Signal<T>;

// Plugin factory pattern
const myPlugin = (config: ConfigType) => (signal: Signal<T>) => {
  // Transform the signal while preserving reactivity
  return signal.map(value => /* transform value based on config */);
};
```

#### Core Plugin Examples
```typescript
// Debounce plugin - delays updates
const debouncePlugin = (delay: number) => (signal: Signal<T>) => {
  // Implementation details handled by Signal-Σ core
  return signal.debounce(delay);
};

// Validation plugin - adds validation logic
const validatePlugin = <T>(validator: (value: T) => boolean) => (signal: Signal<T>) => {
  return signal.validate(validator);
};

// Logger plugin - logs all changes
const loggerPlugin = (prefix: string) => (signal: Signal<T>) => {
  return signal.tap(value => console.log(`[${prefix}]:`, value));
};

// Persist plugin - syncs with localStorage
const persistPlugin = (key: string) => (signal: Signal<T>) => {
  return signal.persist(key);
};
```

#### Plugin Composition Patterns
```typescript
// Simple composition
const [input, setInput] = useSignal('', debouncePlugin(300));

// Multiple plugins
const [email, setEmail] = useSignal('', compose(
  debouncePlugin(300),
  validatePlugin(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)),
  loggerPlugin('EmailField')
));

// Async operations with plugins
const [userData, refetchUser] = useAsyncSignal(
  () => fetch('/api/user').then(r => r.json()),
  null,
  compose(
    retryPlugin(3, 1000),
    timeoutPlugin(5000),
    cachePlugin(60000),
    loggerPlugin('UserData')
  )
);

// State machines with plugins
const [state, send] = useMachine(
  'idle',
  (state, action) => /* reducer logic */,
  loggerPlugin('StateMachine')
);
```

#### Custom Plugin Creation
```typescript
// Create your own plugins following the same pattern
const customPlugin = (config: any) => (signal: Signal<T>) => {
  // Your custom logic here
  return signal.map(value => {
    // Transform value based on your needs
    return processValue(value, config);
  });
};

// Use your custom plugin
const [data, setData] = useSignal(initialValue, customPlugin(config));

// Compose with other plugins
const [enhanced, setEnhanced] = useSignal(initialValue, compose(
  customPlugin(config),
  loggerPlugin('Enhanced'),
  debouncePlugin(200)
));
```

### 🎯 **Built-in Plugin Combinations**

```typescript
import { commonPlugins } from 'resig.js/plugins';

// Form field plugin - validation + debouncing + persistence
const [email, setEmail] = useSignal('',
  commonPlugins.formField('email', (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
);

// API data plugin - fetch + caching + retry + logging
const [userData, setUserData] = useSignal(null,
  commonPlugins.apiData(() => fetch('/api/user').then(r => r.json()), 'user-cache')
);

// Real-time plugin - debouncing + logging for live updates
const [liveData, setLiveData] = useSignal(0,
  commonPlugins.realTime('LiveCounter', 100)
);

// Performance plugin - debounce + cache for expensive operations
const [expensiveData, setExpensiveData] = useSignal(null,
  commonPlugins.performance('expensive-cache', 300, 60000)
);
```

### 🏗️ **Framework Adapter Architecture**

Each framework has a lightweight adapter that integrates plugins with native reactivity:

```typescript
// Framework adapters implement this interface
interface FrameworkAdapter<T> {
  createSignal(initialValue: T): [() => T, (value: T) => void];
  createComputed<U>(compute: () => U): () => U;
  createEffect(effect: () => void | (() => void)): void;
  adaptSignal(signal: Signal<T>): [() => T, (value: T) => void];
  toSignal(getValue: () => T, setValue: (value: T) => void): Signal<T>;
}

// React adapter uses useSyncExternalStore
// Svelte adapter uses $state/$derived/$effect
// SolidJS adapter uses createSignal/createMemo/createEffect
// Vue adapter uses ref/computed/watchEffect
// Qwik adapter uses useSignal/useTask$/useVisibleTask$
```

This architecture ensures:
- **Plugins are framework-agnostic** - write once, use everywhere
- **Native performance** - each adapter uses framework-optimal patterns
- **Composability** - plugins compose cleanly with framework features
- **Type safety** - full TypeScript support across all frameworks

### Async Hooks

#### `useAsyncSignal<T>(asyncFn: () => Promise<T>, initialValue?: T)`
Manual async data fetching with refetch and optimistic updates.

```tsx
function UserProfile() {
  const [userId, setUserId] = useSignal(1);

  const [userState, refetchUser, setUser] = useAsyncSignal(async () => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  });

  return (
    <div>
      {userState.loading && <div>Loading...</div>}
      {userState.error && <div>Error: {userState.error.message}</div>}
      {userState.data && <div>User: {userState.data.name}</div>}
      <button onClick={refetchUser}>Refetch</button>
      <button onClick={() => setUser({...userState.data, name: 'Updated'})}>
        Optimistic Update
      </button>
    </div>
  );
}
```

#### `useAsyncComputed<T>(asyncCompute: () => Promise<T>, deps: unknown[])`
Async computed values with dependency arrays.

```tsx
function PostsList() {
  const [userId, setUserId] = useSignal(1);

  const postsState = useAsyncComputed(async () => {
    const response = await fetch(`/api/posts?userId=${userId}`);
    return response.json();
  }, [userId]); // Recomputes when userId changes

  return (
    <div>
      {postsState.loading && <div>Loading posts...</div>}
      {postsState.data && <div>{postsState.data.length} posts found</div>}
    </div>
  );
}
```

#### `useAsyncComputedSignal<T>(asyncCompute: () => Promise<T>, deps: unknown[])`
Returns an async computed **signal** that can be used in other computations.

```tsx
function Dashboard() {
  const [userId, setUserId] = useSignal(1);

  // Returns a signal, not just state
  const userStatsSignal = useAsyncComputedSignal(async () => {
    const posts = await fetch(`/api/posts?userId=${userId}`).then(r => r.json());
    return { totalPosts: posts.length, avgLength: posts.reduce(...) / posts.length };
  }, [userId]);

  // Other signals can use this async computed signal
  const isActiveUser = useComputed(() => {
    const stats = userStatsSignal.value();
    return stats.data && stats.data.totalPosts > 5;
  });

  const displayText = useComputed(() => {
    const stats = userStatsSignal.value();
    if (stats.loading) return "Computing...";
    if (stats.error) return "Error occurred";
    return `User has ${stats.data.totalPosts} posts`;
  });

  return <div>{displayText} - Active: {isActiveUser ? 'Yes' : 'No'}</div>;
}
```

## 🏗️ **Advanced APIs**

For advanced users who want to work with the underlying core functions.

### Core Signal Functions

```tsx
import { signal, effect, time, fetch, machine } from 'resig.js';

// Core signal creation
const mySignal = signal(42);
const value = mySignal.value(); // Get current value
mySignal._set(100); // Set new value

// Transform signals
const doubled = mySignal.map(x => x * 2);

// Subscribe to changes
const unsubscribe = mySignal.subscribe((newValue) => {
  console.log('Signal changed:', newValue);
});
```



### Time Utilities

```tsx
import { time, debounce, throttle } from 'resig.js';

// Time-based operations
const timeSignal = time('initial');
const delayed = timeSignal.delay(1000);
const withTimeout = timeSignal.timeout(5000);
const repeated = timeSignal.interval(1000);

// Utility functions
const debouncedSignal = debounce(300, mySignal);
const throttledSignal = throttle(1000, mySignal);
```

### HTTP Utilities

```tsx
import { fetch, get, post } from 'resig.js';

// Custom fetch operations
const userFetch = fetch(async () => {
  const response = await window.fetch('/api/user');
  return response.json();
});

// HTTP helpers
const userData = get('/api/user');
const createUser = post('/api/users', { name: 'John' });

// With retry and cache
const resilientFetch = userFetch.retry(3).cache('user-cache', 60000);
```

### State Machine Utilities

```tsx
import { machine, fsm, combine } from 'resig.js';

// Simple state machine
const simpleMachine = machine('idle', (state, action) => {
  switch (state) {
    case 'idle': return action === 'start' ? 'running' : state;
    case 'running': return action === 'stop' ? 'idle' : state;
    default: return state;
  }
});

// State machine with explicit transitions
const fsmMachine = fsm('idle', [
  { from: 'idle', to: 'loading', on: 'start' },
  { from: 'loading', to: 'success', on: 'success' },
  { from: 'loading', to: 'error', on: 'error' },
  { from: 'success', to: 'idle', on: 'reset' },
  { from: 'error', to: 'idle', on: 'reset' }
]);

// Combine multiple machines
const combined = combine(simpleMachine, fsmMachine);
```

## 📊 **Performance Showcase: Excel Grid**

Here's a high-performance Excel-like spreadsheet built with Signal-Σ that demonstrates automatic formula calculation and dependency tracking:

```tsx
import { useSignal, useComputed } from 'resig.js';

function ExcelGrid() {
  // Create a 20×10 grid of independent signals
  const grid = Array.from({length: 20}, () =>
    Array.from({length: 10}, () => useSignal(''))
  );

  // Each cell automatically computes its display value
  const computedGrid = grid.map((row, rowIndex) =>
    row.map((cell, colIndex) =>
      useComputed(() => {
        const value = cell[0];
        if (value.startsWith('=')) {
          return evaluateFormula(value, grid, rowIndex, colIndex);
        }
        return value;
      })
    )
  );

  // Live statistics computed from ALL cells automatically
  const stats = useComputed(() => {
    let sum = 0, count = 0;
    computedGrid.forEach(row =>
      row.forEach(cellValue => {
        const num = parseFloat(cellValue) || 0;
        if (num !== 0) { sum += num; count++; }
      })
    );
    return { sum, count, average: count > 0 ? sum / count : 0 };
  });

  // Formula evaluation function
  const evaluateFormula = (formula, grid, row, col) => {
    // Simple formula parser for demo
    if (formula === '=SUM(A1:A10)') {
      return grid.slice(0, 10).reduce((sum, r) => sum + (parseFloat(r[0][0]) || 0), 0);
    }
    if (formula.match(/^=A\d+\+B\d+$/)) {
      // Handle A1+B1 style formulas
      const [, a, b] = formula.match(/^=A(\d+)\+B(\d+)$/);
      const aVal = parseFloat(grid[parseInt(a)-1]?.[0]?.[0]) || 0;
      const bVal = parseFloat(grid[parseInt(b)-1]?.[1]?.[0]) || 0;
      return aVal + bVal;
    }
    return formula;
  };

  return (
    <div className="excel-grid">
      <div className="stats">
        <p>Total: {stats.sum} | Count: {stats.count} | Average: {stats.average.toFixed(2)}</p>
      </div>
      <table>
        {grid.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, colIndex) => (
              <td key={colIndex}>
                <input
                  value={cell[0]}
                  onChange={(e) => cell[1](e.target.value)}
                  placeholder={`${String.fromCharCode(65 + colIndex)}${rowIndex + 1}`}
                />
                <div className="computed-value">{computedGrid[rowIndex][colIndex]}</div>
              </td>
            ))}
          </tr>
        ))}
      </table>
    </div>
  );
}
```

**Key Features:**
- **200 independent signals** (20×10 grid) working in perfect harmony
- **Automatic formula recalculation** - no manual dependency tracking
- **Real-time statistics** computed from all cells
- **Excel-like formulas**: `=SUM(A1:A10)`, `=AVERAGE(B1:B5)`, `=A1+B1*2`
- **Zero performance optimization needed** - Signal-Σ handles everything

## 🔧 **Reliable Architecture**

Signal-Σ is built on proven reactive programming patterns, ensuring predictable behavior through consistent design principles.

### Predictable Updates

All signals follow consistent update patterns:

```tsx
// Signals always update predictably
const s = useSignal(42);
const mapped = useComputed(() => s); // Always stays in sync
// s and mapped always have the same value

// Computed values compose reliably
const double = (x: number) => x * 2;
const addOne = (x: number) => x + 1;

// These are equivalent and always produce the same result:
const composed = useComputed(() => double(addOne(s)));
const chained = useComputed(() => addOne(s));
const final = useComputed(() => double(chained));
```

### Consistent Behavior

Effects follow consistent patterns for predictable composition:

```tsx
// Effects always behave consistently
// No surprises, no edge cases, no gotchas
// What you write is what you get
```

## 🔌 **Plugin System**

Zero-runtime cost plugins for cross-cutting concerns:

```tsx
import { debouncePlugin, loggerPlugin, cachePlugin } from 'resig.js/plugins';

// Combine multiple plugins
const enhanced = compose(
  debouncePlugin(300),
  loggerPlugin('MySignal'),
  cachePlugin('my-cache', 5000)
)(mySignal);
```

## 🎯 **Migration Guide**

### From useState

```tsx
// ❌ Before
const [count, setCount] = useState(0);
const [name, setName] = useState('Alice');
const [user, setUser] = useState({ id: 1, name: 'John' });

// ✅ After
const [count, setCount] = useSignal(0);
const [name, setName] = useSignal('Alice');
const [user, setUser] = useSignal({ id: 1, name: 'John' });
```

### From useEffect

```tsx
// ❌ Before
useEffect(() => {
  document.title = `Count: ${count}`;
}, [count]);

useEffect(() => {
  localStorage.setItem('count', count.toString());
}, [count]);

useEffect(() => {
  const timer = setInterval(() => {
    console.log('Timer tick');
  }, 1000);
  return () => clearInterval(timer);
}, []);

// ✅ After
useComputed(() => {
  document.title = `Count: ${count}`;
  return null;
});

useComputed(() => {
  localStorage.setItem('count', count.toString());
  return null;
});

// For timers, use time algebra or plugins
const timerSignal = applyPlugin(throttlePlugin(1000))(useSignal('tick'));
```

### From useMemo/useCallback

```tsx
// ❌ Before
const expensiveValue = useMemo(() => {
  return heavyComputation(a, b, c);
}, [a, b, c]);

const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);

const filteredItems = useMemo(() => {
  return items.filter(item => item.category === selectedCategory);
}, [items, selectedCategory]);

// ✅ After
const expensiveValue = useComputed(() => {
  return heavyComputation(a, b, c);
});

const memoizedCallback = useComputed(() => {
  return () => doSomething(a, b);
});

const filteredItems = useComputed(() => {
  return items.filter(item => item.category === selectedCategory);
});
```

### From React-Query

```tsx
// ❌ Before
const { data, isLoading, error, refetch } = useQuery(
  ['user', userId],
  () => fetchUser(userId),
  { enabled: !!userId }
);

const { mutate } = useMutation(updateUser);

// ✅ After
const [userState, refetch, retry] = useFetch(() => fetchUser(userId));
// Automatically refetches when userId changes

// For mutations, use regular async functions with signals
const [isUpdating, setIsUpdating] = useSignal(false);
const updateUserMutation = async (userData) => {
  setIsUpdating(true);
  try {
    await updateUser(userData);
    refetch(); // Refetch user data
  } finally {
    setIsUpdating(false);
  }
};
```

### From XState

```tsx
// ❌ Before (XState)
const machine = createMachine({
  initial: 'idle',
  states: {
    idle: { on: { START: 'loading' } },
    loading: { on: { SUCCESS: 'success', ERROR: 'error' } },
    success: { on: { RESET: 'idle' } },
    error: { on: { RESET: 'idle' } }
  }
});

const [state, send] = useMachine(machine);

// ✅ After (Signal-Σ)
const [state, send] = useMachine('idle', (state, action) => {
  switch (state) {
    case 'idle': return action === 'start' ? 'loading' : state;
    case 'loading': return action === 'success' ? 'success' :
                           action === 'error' ? 'error' : state;
    case 'success':
    case 'error': return action === 'reset' ? 'idle' : state;
    default: return state;
  }
});
```

### From Context + useReducer

```tsx
// ❌ Before - Complex setup with Context and useReducer
const AppContext = createContext();

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER': return { ...state, user: action.payload };
    case 'SET_THEME': return { ...state, theme: action.payload };
    default: return state;
  }
};

function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, { user: null, theme: 'light' });
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

function App() {
  return (
    <AppProvider>
      <Header />
      <Main />
    </AppProvider>
  );
}

function Header() {
  const { state, dispatch } = useContext(AppContext);
  return (
    <div>
      <span>Welcome {state.user?.name}</span>
      <button onClick={() => dispatch({ type: 'SET_THEME', payload: 'dark' })}>
        Switch to {state.theme === 'light' ? 'dark' : 'light'} theme
      </button>
    </div>
  );
}

// ✅ After (Signal-Σ) - Simple signals, no setup needed
// Create signals in a shared file (e.g., store.js)
export const [user, setUser] = useSignal(null);
export const [theme, setTheme] = useSignal('light');

// Use directly in any component - no providers or context!
function Header() {
  return (
    <div>
      <span>Welcome {user?.name}</span>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Switch to {theme === 'light' ? 'dark' : 'light'} theme
      </button>
    </div>
  );
}

function App() {
  return (
    <div>
      <Header />
      <Main />
    </div>
  );
}

// Signals work across any component automatically!
// No providers, no context, no prop drilling!
```

## 🎮 **Live Demos**

### React Demo
```bash
cd examples/react-app
npm install
npm run dev
# Visit http://localhost:3000
```

### Svelte 5 Todo Demo
```bash
cd examples/svelte-app
npm install
npm run dev
# Visit http://localhost:3001
```

### All Framework Examples
```bash
# React
cd examples/react-app && npm run dev

# SolidJS
cd examples/solid-app && npm run dev

# Svelte 5
cd examples/svelte-app && npm run dev

# Vue.js
cd examples/vue-app && npm run dev

# Qwik
cd examples/qwik-app && npm run dev
```

## 🌟 **Features Demonstrated**

All demos showcase the same features working across frameworks:

- ✅ **Basic Signals** - useState replacement with automatic reactivity
- ✅ **Computed Signals** - useMemo/useCallback replacement without dependency arrays
- ✅ **useEffect Replacement** - Side effects with automatic dependency tracking
- ✅ **Async Signals** - React-Query replacement with loading states
- ✅ **State Machines** - XState replacement with simple reducers
- ✅ **Plugin System** - Zero-runtime cost composition
- ✅ **Excel Grid** - High-performance spreadsheet with automatic formulas
- ✅ **Time Features** - Debouncing, throttling, intervals
- ✅ **Validation** - Real-time form validation
- ✅ **Persistence** - Automatic localStorage sync
- ✅ **DevTools** - Built-in signal debugging and monitoring

## 🎯 **Best Practices**

### Signal Naming
```tsx
// ✅ Good - descriptive names
const [userName, setUserName] = useSignal('');
const [isLoading, setIsLoading] = useSignal(false);
const [userPreferences, setUserPreferences] = useSignal({});

// ❌ Avoid - generic names
const [data, setData] = useSignal('');
const [state, setState] = useSignal(false);
```

### Computed Organization
```tsx
// ✅ Good - break down complex computations
const [items, setItems] = useSignal([]);
const [filter, setFilter] = useSignal('all');

const filteredItems = useComputed(() =>
  items.filter(item => filter === 'all' || item.category === filter)
);

const itemCount = useComputed(() => filteredItems.length);
const hasItems = useComputed(() => itemCount > 0);

// ❌ Avoid - one giant computation
const everything = useComputed(() => {
  const filtered = items.filter(item => filter === 'all' || item.category === filter);
  return {
    items: filtered,
    count: filtered.length,
    hasItems: filtered.length > 0,
    // ... more complex logic
  };
});
```

### Side Effects
```tsx
// ✅ Good - specific side effects
useComputed(() => {
  document.title = `${userName} - My App`;
  return null;
});

useComputed(() => {
  localStorage.setItem('user-preferences', JSON.stringify(userPreferences));
  return null;
});

// ✅ Good - conditional side effects
useComputed(() => {
  if (isLoggedIn && hasNotifications) {
    showNotificationBadge();
  } else {
    hideNotificationBadge();
  }
  return null;
});
```

### Plugin Usage
```tsx
// ✅ Good - compose plugins for reusability
const createDebouncedInput = (initialValue, delay = 300) => {
  const [value, setValue] = useSignal(initialValue);
  return [
    value,
    setValue,
    applyPlugin(debouncePlugin(delay))(value)
  ];
};

// ✅ Good - use common plugin combinations
const performantSignal = applyPlugin(
  commonPlugins.performance('cache-key', 100, 60000)
)(mySignal);
```

## 🏗️ **Architecture**

Signal-Σ is built with a clean, modular architecture for reliability and performance.

```
src/
├── core/
│   ├── signal.ts      # Core Signal implementation
│   └── effect.ts      # Effect handling for side effect composition
├── algebras/
│   ├── time.ts        # Time utilities (delay, debounce, throttle, intervals)
│   ├── fetch.ts       # Network utilities (HTTP operations, caching, retry)
│   └── state.ts       # State utilities (machines, transitions)
├── react/
│   └── hooks.ts       # React integration hooks
├── plugins/
│   └── index.ts       # Plugin system for composable features
└── types/
    └── index.ts       # TypeScript type definitions
```

### Core Interfaces

#### Signal Interface
```typescript
interface Signal<A> {
  readonly value: () => A;
  readonly map: <B>(f: (a: A) => B) => Signal<B>;
  readonly subscribe: (fn: (a: A) => void) => () => void;
}
```

#### Effect Interface
```typescript
interface Effect<A> extends Signal<A> {
  readonly bind: <B>(f: (a: A) => Effect<B>) => Effect<B>;
  readonly chain: <B>(f: (a: A) => Effect<B>) => Effect<B>; // alias for bind
}
```

### Plugin Architecture

Plugins transform signals while preserving their behavior:

```typescript
type Plugin<A> = (signal: Signal<A>) => Signal<A>;
```

This ensures plugins compose cleanly and have zero runtime cost when not used.

## 🔍 **Debugging & DevTools**

Signal-Σ includes built-in debugging capabilities:

```tsx
import { SignalDevTool } from 'resig.js';

function App() {
  return (
    <div>
      <YourComponents />
      <SignalDevTool /> {/* Add this for debugging */}
    </div>
  );
}
```

The DevTool provides:
- **Real-time signal monitoring** - See all signal values and changes
- **Event log** - Track signal creation, updates, and subscriptions
- **Performance metrics** - Monitor signal update frequency
- **Dependency graph** - Visualize signal relationships

## 📚 **Learning Resources**

### Quick Reference Card

| Hook | Purpose | Replaces | Returns |
|------|---------|----------|---------|
| `useSignal` | Basic state | `useState` | `[value, setter]` |
| `useComputed` | Derived values | `useMemo`, `useCallback` | `value` |
| `useAsyncSignal` | Manual async | Custom hooks | `[state, refetch, setValue]` |
| `useAsyncComputed` | Auto async | React-Query | `state` |
| `useMachine` | State machines | XState | `[state, send]` |
| `useFetch` | HTTP requests | React-Query | `[state, refetch, retry]` |
| `usePersistentSignal` | localStorage | Custom hooks | `[value, setter]` |
| `useDebouncedSignal` | Debounced input | Custom hooks | `[immediate, setter, debounced]` |
| `useValidatedSignal` | Form validation | Custom hooks | `[value, setter, isValid]` |



## 🤝 **Contributing**

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create your feature branch**: `git checkout -b feature/amazing-feature`
3. **Install dependencies**: `npm install`
4. **Run tests**: `npm test`
5. **Run the demo**: `cd examples/react-app && npm run dev`
6. **Make your changes** and add tests
7. **Ensure all tests pass**: `npm run test`
8. **Commit your changes**: `git commit -m 'Add amazing feature'`
9. **Push to the branch**: `git push origin feature/amazing-feature`
10. **Open a Pull Request**

### Development Setup

```bash
# Clone the repo
git clone https://github.com/yourusername/resig.js.git
cd resig.js

# Install dependencies
npm install

# Build the library
npm run build

# Run tests
npm test

# Run the demo app
cd examples/react-app
npm install
npm run dev
```

## 📄 **License**

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **React Team** - Inspiration to improve upon hooks architecture
- **Functional Programming Community** - Proven patterns and best practices
- **Open Source Contributors** - Making reactive programming accessible

---

## 🚀 **Get Started Today**

```bash
npm install resig.js
```

**Signal-Σ: Universal reactive programming for the entire JavaScript ecosystem** 🌐⚛️

*Built for reliability. Powered by simplicity. Designed for every framework.*

### 🌟 **The Universal Signal Library**

Signal-Σ proves that **great abstractions transcend frameworks**. The same reactive logic that powers your React app can seamlessly run in SolidJS, Svelte 5, Vue.js, and Qwik with zero changes to your business logic.

**Learn once. Use everywhere. Build the future.**
