# Signal-Σ (resig.js)

> A reactive signal library that eliminates React hooks and dependency arrays completely

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Reactive](https://img.shields.io/badge/Reactive-FF6B6B?style=for-the-badge&logo=reactivex&logoColor=white)](https://reactivex.io/)

## 🎯 **What is Signal-Σ?**

Signal-Σ is a **production-ready reactive signal library** that completely replaces React hooks with automatic dependency tracking. No more `useState`, `useEffect`, or dependency arrays!

### ✨ **Key Features**

- **🚫 NO useState, NO useEffect, NO dependency arrays!**
- **🔧 Reliable architecture** - Predictable behavior with proven patterns
- **⚡ Automatic dependency tracking** - Changes propagate automatically
- **🔌 Zero-runtime cost plugins** - Composable cross-cutting concerns
- **🤖 State machines** - XState replacement with type-safe transitions
- **🌐 Network operations** - React-Query replacement with automatic refetching
- **⏰ Time-based features** - Debouncing, throttling, intervals without useEffect
- **💾 Persistence** - Automatic localStorage sync
- **🛡️ Type safety** - Full TypeScript support with inference

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

## � **Performance Showcase: Excel Grid**

Here's a high-performance Excel-like spreadsheet built with Signal-Σ that demonstrates automatic formula calculation and dependency tracking:

```tsx
function ExcelGrid() {
  // Create a 20×10 grid of independent signals
  const grid = Array.from({length: 20}, () =>
    Array.from({length: 10}, () => useSignal(''))
  );

  // Each cell automatically computes its display value
  const computedGrid = grid.map(row =>
    row.map(cell =>
      useComputed(() => {
        const value = cell[0];
        if (value.startsWith('=')) {
          return evaluateFormula(value); // Automatic recalculation!
        }
        return value;
      })
    )
  );

  // Live statistics computed from ALL cells automatically
  const stats = useComputed(() => {
    let sum = 0, count = 0;
    grid.forEach(row =>
      row.forEach(cell => {
        const num = parseFloat(computedGrid[row][col]) || 0;
        if (num !== 0) { sum += num; count++; }
      })
    );
    return { sum, count, average: sum / count };
  });

  // Formulas like =SUM(A1:A10), =AVERAGE(B1:B5), =A1+B1*2
  // automatically recalculate when any dependency changes!
}
```

**Key Features:**
- **200 independent signals** (20×10 grid) working in perfect harmony
- **Automatic formula recalculation** - no manual dependency tracking
- **Real-time statistics** computed from all cells
- **Excel-like formulas**: `=SUM(A1:A10)`, `=AVERAGE(B1:B5)`, `=A1+B1*2`
- **Zero performance optimization needed** - Signal-Σ handles everything

## �📚 **Complete API Reference**

### Core Hooks

#### `useSignal<T>(initialValue: T): [T, (value: T) => void]`

Replaces `useState` completely. No dependency arrays needed.

```tsx
const [name, setName] = useSignal('Alice');
const [count, setCount] = useSignal(0);
const [user, setUser] = useSignal({ id: 1, name: 'John' });
```

#### `useComputed<T>(compute: () => T): T`

Computed values with automatic dependency tracking. No dependency arrays needed.

```tsx
const [firstName, setFirstName] = useSignal('John');
const [lastName, setLastName] = useSignal('Doe');

// Automatically updates when firstName or lastName changes
const fullName = useComputed(() => `${firstName} ${lastName}`);
const initials = useComputed(() => `${firstName[0]}${lastName[0]}`);
```

### Side Effects (useEffect Replacement)

#### Replace useEffect with useComputed

```tsx
// ❌ Old way with useEffect
useEffect(() => {
  document.title = `Count: ${count}`;
}, [count]);

// ✅ New way with useComputed
useComputed(() => {
  document.title = `Count: ${count}`;
  return null; // We don't need the return value
});
```

#### Complex Side Effects

```tsx
const [user, setUser] = useSignal({ name: 'Alice', age: 25 });
const [isOnline, setIsOnline] = useSignal(true);

// Multiple dependencies, automatic tracking
useComputed(() => {
  if (isOnline && user.age >= 18) {
    console.log(`${user.name} is an adult and online`);
    // Could trigger analytics, notifications, etc.
  }
  return null;
});

// localStorage sync
useComputed(() => {
  localStorage.setItem('user', JSON.stringify(user));
  return null;
});
```

### State Machines (XState Replacement)

#### `useMachine<S, A>(initialState: S, reducer: (state: S, action: A) => S): [S, (action: A) => void]`

Type-safe state machines with simple, predictable transitions.

```tsx
type State = 'idle' | 'loading' | 'success' | 'error';
type Action = 'start' | 'success' | 'error' | 'reset';

function AsyncButton() {
  const [state, send] = useMachine<State, Action>('idle', (state, action) => {
    switch (state) {
      case 'idle': return action === 'start' ? 'loading' : state;
      case 'loading': return action === 'success' ? 'success' :
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
    <button onClick={handleClick} disabled={state === 'loading'}>
      {state === 'loading' ? 'Loading...' : 'Click me'}
    </button>
  );
}
```

### Network Operations (React-Query Replacement)

#### `useFetch<T>(fetcher: () => Promise<T>): [AsyncState<T>, () => void, (n: number) => void]`

Automatic data fetching with loading/error states and retry logic.

```tsx
function UserProfile() {
  const [userId, setUserId] = useSignal(1);

  // Automatically refetches when userId changes
  const [userState, refetch, retry] = useFetch(() =>
    fetch(`/api/users/${userId}`).then(res => res.json())
  );

  if (userState.loading) return <div>Loading...</div>;
  if (userState.error) return <div>Error: {userState.error.message}</div>;

  return (
    <div>
      <h1>{userState.data?.name}</h1>
      <button onClick={refetch}>Refresh</button>
      <button onClick={() => retry(3)}>Retry 3x</button>
    </div>
  );
}
```

### Advanced Hooks

#### `useDebouncedSignal<T>(initialValue: T, delay: number): [T, (value: T) => void, T]`

Debounced input without useEffect.

```tsx
function SearchBox() {
  const [immediate, setSearch, debounced] = useDebouncedSignal('', 300);

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
      <p>Searching for: {debounced}</p>
      <ul>
        {results.map(result => <li key={result}>{result}</li>)}
      </ul>
    </div>
  );
}
```

#### `useValidatedSignal<T>(initialValue: T, validator: (value: T) => boolean): [T, (value: T) => void, boolean]`

Real-time validation without manual state management.

```tsx
function EmailForm() {
  const [email, setEmail, isValid] = useValidatedSignal(
    '',
    (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );

  return (
    <div>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ borderColor: isValid ? 'green' : 'red' }}
      />
      <p>{isValid ? '✓ Valid email' : '✗ Invalid email'}</p>
    </div>
  );
}
```

#### `usePersistentSignal<T>(key: string, initialValue: T): [T, (value: T) => void]`

Automatic localStorage persistence.

```tsx
function ThemeSelector() {
  // Automatically saves to localStorage and loads on refresh
  const [theme, setTheme] = usePersistentSignal('theme', 'light');

  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value)}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  );
}
```

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

// ✅ After
const [count, setCount] = useSignal(0);
const [name, setName] = useSignal('Alice');
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

// ✅ After
useComputed(() => {
  document.title = `Count: ${count}`;
  return null;
});

useComputed(() => {
  localStorage.setItem('count', count.toString());
  return null;
});
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

// ✅ After
const expensiveValue = useComputed(() => {
  return heavyComputation(a, b, c);
});

const memoizedCallback = useComputed(() => {
  return () => doSomething(a, b);
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

// ✅ After
const [userState, refetch, retry] = useFetch(() => fetchUser(userId));
// Automatically refetches when userId changes
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

## 🎮 **Live Demo**

Check out the comprehensive demo at:

```bash
cd examples/react-app
npm install
npm run dev
```

Visit `http://localhost:3000` to see all features in action:

- ✅ Basic signals replacing useState
- ✅ Computed signals without dependency arrays
- ✅ useEffect replacement with automatic side effects
- ✅ Plugin system with zero-runtime cost composition
- ✅ **Excel Grid** - High-performance spreadsheet with automatic formulas
- ✅ State machines replacing XState
- ✅ Network operations replacing React-Query
- ✅ Advanced features: debouncing, validation, persistence

## 🏗️ **Architecture**

```
src/
├── core/
│   ├── signal.ts      # Basic Signal implementation
│   └── effect.ts      # Effect handling
├── features/
│   ├── time.ts        # Time-based features (delay, debounce, throttle)
│   ├── fetch.ts       # Network operations (React-Query replacement)
│   └── state.ts       # State machines (XState replacement)
├── react/
│   └── hooks.ts       # React integration hooks
└── plugins/
    └── index.ts       # Plugin system
```

## 🤝 **Contributing**

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Run tests: `npm test`
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📄 **License**

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- Reactive programming patterns inspired by proven architectures
- React team for the inspiration to improve upon hooks
- Open source community for innovative thinking

---

**Signal-Σ: Reliable reactive programming for modern React development** 🔧⚛️
