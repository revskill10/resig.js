# Signal-Σ (resig.js)

> A reactive signal library that eliminates React hooks and dependency arrays completely

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Reactive](https://img.shields.io/badge/Reactive-FF6B6B?style=for-the-badge&logo=reactivex&logoColor=white)](https://reactivex.io/)

## 🎯 **What is Signal-Σ?**

Signal-Σ is a **production-ready reactive signal library** that completely replaces React hooks with automatic dependency tracking. Built on category theory and algebraic principles, it provides predictable, composable reactive programming for React applications.

### ✨ **Key Features**

- **🚫 NO useState, NO useEffect, NO dependency arrays!**
- **🔧 Reliable architecture** - Built on category theory for predictable behavior
- **⚡ Automatic dependency tracking** - Changes propagate automatically
- **🔌 Zero-runtime cost plugins** - Composable cross-cutting concerns
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

### Basic Usage

```tsx
import { useSignal, useComputed } from 'resig.js';

function Counter() {
  // NO useState needed!
  const [count, setCount] = useSignal(0);

  // NO dependency arrays needed!
  const doubled = useComputed(() => count * 2);
  const isEven = useComputed(() => count % 2 === 0);

  return (
    <div>
      <p>Count: {count}</p>
      <p>Doubled: {doubled}</p>
      <p>Is Even: {isEven ? 'Yes' : 'No'}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
}
```

## 📚 **Complete API Reference**

Signal-Σ provides a comprehensive set of hooks and utilities organized into logical categories:

### 🔧 **Core Hooks**

The foundation of Signal-Σ - these replace React's basic hooks entirely.

#### `useSignal<T>(initialValue: T): [T, (value: T) => void]`

**Replaces:** `useState`
**Purpose:** Basic reactive state management

```tsx
import { useSignal } from 'resig.js';

function BasicExample() {
  const [name, setName] = useSignal('Alice');
  const [count, setCount] = useSignal(0);
  const [user, setUser] = useSignal({ id: 1, name: 'John' });

  return (
    <div>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      <button onClick={() => setUser({...user, name: 'Updated'})}>
        Update User
      </button>
    </div>
  );
}
```

#### `useComputed<T>(compute: () => T): T`

**Replaces:** `useMemo`, `useCallback`, and most `useEffect` cases
**Purpose:** Derived values with automatic dependency tracking

```tsx
import { useSignal, useComputed } from 'resig.js';

function ComputedExample() {
  const [firstName, setFirstName] = useSignal('John');
  const [lastName, setLastName] = useSignal('Doe');
  const [items, setItems] = useSignal([1, 2, 3, 4, 5]);

  // Automatically updates when firstName or lastName changes
  const fullName = useComputed(() => `${firstName} ${lastName}`);
  const initials = useComputed(() => `${firstName[0]}${lastName[0]}`);

  // Complex computations
  const statistics = useComputed(() => ({
    total: items.reduce((sum, item) => sum + item, 0),
    average: items.length > 0 ? items.reduce((sum, item) => sum + item, 0) / items.length : 0,
    max: Math.max(...items),
    min: Math.min(...items)
  }));

  // Side effects (replaces useEffect)
  useComputed(() => {
    document.title = `${fullName} - ${statistics.total} items`;
    return null; // We don't need the return value
  });

  return (
    <div>
      <p>Full Name: {fullName}</p>
      <p>Initials: {initials}</p>
      <p>Total: {statistics.total}, Average: {statistics.average}</p>
    </div>
  );
}
```

### ⚡ **Async Hooks**

Handle asynchronous operations with built-in loading states and error handling.

#### `useAsyncSignal<T>(asyncFn: () => Promise<T>, initialValue?: T)`

**Purpose:** Manual async data fetching with refetch and optimistic updates

```tsx
import { useSignal, useAsyncSignal } from 'resig.js';

function UserProfile() {
  const [userId, setUserId] = useSignal(1);

  const [userState, refetchUser, setUser] = useAsyncSignal(async () => {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  });

  return (
    <div>
      {userState.loading && <div>Loading user...</div>}
      {userState.error && <div>Error: {userState.error.message}</div>}
      {userState.data && (
        <div>
          <h1>{userState.data.name}</h1>
          <p>{userState.data.email}</p>
        </div>
      )}
      <button onClick={refetchUser}>Refetch User</button>
      <button onClick={() => setUser({...userState.data, name: 'Updated Name'})}>
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

Advanced state management with state machines and effects.

#### `useMachine<S, A>(initialState: S, reducer: (state: S, action: A) => S): [S, (action: A) => void]`

**Replaces:** XState
**Purpose:** Type-safe state machines with simple, predictable transitions

```tsx
import { useMachine } from 'resig.js';

type State = 'idle' | 'loading' | 'success' | 'error';
type Action = 'start' | 'success' | 'error' | 'reset';

function AsyncButton() {
  const [state, send] = useMachine<State, Action>('idle', (state, action) => {
    switch (state) {
      case 'idle': return action === 'start' ? 'loading' : state;
      case 'loading':
        return action === 'success' ? 'success' :
               action === 'error' ? 'error' : state;
      case 'success':
      case 'error': return action === 'reset' ? 'idle' : state;
      default: return state;
    }
  });

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
      <button onClick={handleClick} disabled={state === 'loading'}>
        {state === 'loading' ? 'Loading...' : 'Click me'}
      </button>
      {state === 'success' && <p>✅ Success!</p>}
      {state === 'error' && (
        <div>
          <p>❌ Error occurred</p>
          <button onClick={() => send('reset')}>Reset</button>
        </div>
      )}
    </div>
  );
}
```

#### `useEffect<T>(initialValue: T): [T, (value: T) => void, Effect<T>]`

**Purpose:** Monadic effect composition for advanced functional programming patterns

```tsx
import { useEffect, useSignal } from 'resig.js';

function EffectExample() {
  const [count, setCount] = useSignal(0);
  const [effectValue, setEffectValue, effectMonad] = useEffect('initial');

  // Chain effects using monadic composition
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

## 🔌 **Plugin System**

Zero-runtime cost plugins for cross-cutting concerns. Plugins are category functors that compose cleanly.

### Core Plugins

```tsx
import {
  debouncePlugin,
  throttlePlugin,
  cachePlugin,
  loggerPlugin,
  filterPlugin,
  transformPlugin,
  validatePlugin,
  persistPlugin,
  composePlugins,
  applyPlugin
} from 'resig.js';

// Individual plugins
const mySignal = useSignal(0);
const debouncedSignal = applyPlugin(debouncePlugin(300))(mySignal);
const loggedSignal = applyPlugin(loggerPlugin('MySignal'))(mySignal);

// Compose multiple plugins
const enhancedSignal = composePlugins(
  debouncePlugin(300),
  loggerPlugin('Enhanced'),
  cachePlugin('my-cache', 5000),
  validatePlugin((value) => value >= 0, (value) => console.warn('Invalid:', value))
)(mySignal);
```

### Plugin Examples

#### Debounce Plugin
```tsx
function DebouncedInput() {
  const [input, setInput] = useSignal('');
  const debouncedInput = applyPlugin(debouncePlugin(300))(input);

  return (
    <div>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <p>Immediate: {input}</p>
      <p>Debounced: {debouncedInput}</p>
    </div>
  );
}
```

#### Cache Plugin
```tsx
function CachedData() {
  const [data, setData] = useSignal({ expensive: 'computation' });
  const cachedData = applyPlugin(cachePlugin('data-cache', 60000))(data);

  return <div>Cached: {JSON.stringify(cachedData)}</div>;
}
```

#### Logger Plugin
```tsx
function LoggedSignal() {
  const [count, setCount] = useSignal(0);
  const loggedCount = applyPlugin(loggerPlugin('Counter'))(count);

  return (
    <div>
      <p>Count: {loggedCount}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

### Built-in Plugin Combinations

```tsx
import { commonPlugins } from 'resig.js';

// Debug plugin - combines logging and validation
const debugSignal = applyPlugin(
  commonPlugins.debug('MySignal', (value) => value > 0)
)(mySignal);

// Performance plugin - combines debounce and cache
const performanceSignal = applyPlugin(
  commonPlugins.performance('perf-cache', 100, 300000)
)(mySignal);
```

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

## 🏗️ **Core Algebra APIs**

For advanced users who want to work with the underlying algebraic structures.

### Signal Core

```tsx
import { signal, effect, time, fetch, machine } from 'resig.js';

// Core signal creation
const mySignal = signal(42);
const value = mySignal.value(); // Get current value
mySignal._set(100); // Set new value

// Signal mapping (Functor)
const doubled = mySignal.map(x => x * 2);

// Subscribe to changes
const unsubscribe = mySignal.subscribe((newValue) => {
  console.log('Signal changed:', newValue);
});
```

### Effect Monad

```tsx
import { effect, pureEffect, flatten, sequence } from 'resig.js';

// Create effect
const myEffect = effect('initial');

// Monadic composition
const chainedEffect = myEffect
  .bind(value => pureEffect(`Step 1: ${value}`))
  .bind(value => pureEffect(`Step 2: ${value}`));

// Sequence multiple effects
const effects = [effect('a'), effect('b'), effect('c')];
const sequenced = sequence(effects); // Effect<string[]>
```

### Time Algebra

```tsx
import { time, debounce, throttle, timeout } from 'resig.js';

// Time-based operations
const timeSignal = time('initial');
const delayed = timeSignal.delay(1000);
const withTimeout = timeSignal.timeout(5000);
const repeated = timeSignal.interval(1000);

// Utility functions
const debouncedSignal = debounce(300, mySignal);
const throttledSignal = throttle(1000, mySignal);
```

### Fetch Algebra

```tsx
import { fetch, get, post } from 'resig.js';

// Custom fetch
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

### State Machine Algebra

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

// Finite state machine with explicit transitions
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
// ❌ Before
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

// ✅ After (Signal-Σ)
// No context needed! Just use signals directly
const [user, setUser] = useSignal(null);
const [theme, setTheme] = useSignal('light');

// Signals are automatically available across components
// No providers, no context, no prop drilling!
```

## 🎮 **Live Demo**

Check out the comprehensive demo at:

```bash
cd examples/react-app
npm install
npm run dev
```

Visit `http://localhost:3000` to see all features in action:

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

Signal-Σ is built on solid mathematical foundations using category theory and algebraic structures.

```
src/
├── core/
│   ├── signal.ts      # Core Signal Functor implementation
│   └── effect.ts      # Effect Monad for side effect composition
├── algebras/
│   ├── time.ts        # Time algebra (delay, debounce, throttle, intervals)
│   ├── fetch.ts       # Network algebra (HTTP operations, caching, retry)
│   └── state.ts       # State algebra (machines, FSM, transitions)
├── react/
│   └── hooks.ts       # React integration hooks
├── plugins/
│   └── index.ts       # Plugin system (zero-runtime cost functors)
└── types/
    └── index.ts       # TypeScript type definitions
```

### Mathematical Foundations

#### Signal Functor
```typescript
interface Signal<A> {
  readonly value: () => A;
  readonly map: <B>(f: (a: A) => B) => Signal<B>;
  readonly subscribe: (fn: (a: A) => void) => () => void;
}
```

**Laws:**
- **Identity**: `signal.map(id) ≡ signal`
- **Composition**: `signal.map(f).map(g) ≡ signal.map(x => g(f(x)))`

#### Effect Monad
```typescript
interface Effect<A> extends Signal<A> {
  readonly bind: <B>(f: (a: A) => Effect<B>) => Effect<B>;
  readonly chain: <B>(f: (a: A) => Effect<B>) => Effect<B>; // alias for bind
}
```

**Laws:**
- **Left Identity**: `bind(pure(a), f) ≡ f(a)`
- **Right Identity**: `bind(ma, pure) ≡ ma`
- **Associativity**: `bind(bind(ma, f), g) ≡ bind(ma, a => bind(f(a), g))`

### Plugin Architecture

Plugins are category functors that transform signals while preserving their structure:

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

### Common Patterns

#### Loading States
```tsx
const [isLoading, setIsLoading] = useSignal(false);
const [data, setData] = useSignal(null);
const [error, setError] = useSignal(null);

const fetchData = async () => {
  setIsLoading(true);
  setError(null);
  try {
    const result = await api.getData();
    setData(result);
  } catch (err) {
    setError(err);
  } finally {
    setIsLoading(false);
  }
};
```

#### Form Handling
```tsx
const [formData, setFormData] = useSignal({ name: '', email: '' });
const [errors, setErrors] = useSignal({});

const isValid = useComputed(() =>
  Object.keys(errors).length === 0 && formData.name && formData.email
);

const updateField = (field, value) => {
  setFormData({ ...formData, [field]: value });
  // Validate and update errors...
};
```

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

- **Category Theory** - Mathematical foundations for reliable composition
- **React Team** - Inspiration to improve upon hooks architecture
- **Functional Programming Community** - Algebraic patterns and best practices
- **Open Source Contributors** - Making reactive programming accessible

---

## 🚀 **Get Started Today**

```bash
npm install resig.js
```

**Signal-Σ: Reliable reactive programming for modern React development** 🔧⚛️

*Built with category theory. Powered by algebra. Designed for developers.*
