# Signal-Σ + Svelte 5 Todo App Demo

This demo showcases **Signal-Σ working seamlessly with Svelte 5 runes**, demonstrating how the same reactive patterns work across different frameworks.

## 🚀 Features Demonstrated

### Core Signal-Σ Hooks
- **`useSignal`** - Basic reactive state using Svelte 5 `$state`
- **`useComputed`** - Derived values using Svelte 5 `$derived`
- **`usePersistentSignal`** - Automatic localStorage persistence
- **`useValidatedSignal`** - Real-time form validation
- **`useDebouncedSignal`** - Debounced search functionality
- **`useMachine`** - State machine for bulk operations

### Todo App Features
- ✅ Add/remove todos with validation
- 🔍 Real-time search with debouncing (300ms)
- 📊 Live statistics and completion rate
- 💾 Automatic localStorage persistence
- 🎛️ Filter todos (all/active/completed)
- 🔄 Bulk operations (complete all, delete completed)
- 📱 Responsive design
- ⚡ State machine for async operations

## 🏃‍♂️ Running the Demo

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3001
```

## 🔧 How It Works

### Svelte 5 Integration

Signal-Σ's Svelte adapter leverages Svelte 5's new runes system:

```javascript
// useSignal uses $state
const [todos, setTodos] = useSignal([]);
// Becomes: let todos = $state([]);

// useComputed uses $derived  
const filteredTodos = useComputed(() => todos().filter(...));
// Becomes: const filteredTodos = $derived(todos.filter(...));

// Effects use $effect
$effect(() => {
  localStorage.setItem('todos', JSON.stringify(todos));
});
```

### Key Benefits

1. **Native Performance** - Uses Svelte 5's fine-grained reactivity
2. **Automatic Cleanup** - Svelte handles subscription cleanup
3. **Compile-time Optimization** - Svelte's compiler optimizes the reactive code
4. **Same API** - Identical to React/SolidJS/Vue/Qwik versions

### Code Comparison

The reactive logic is **99% identical** to other framework versions:

```javascript
// This works in React, SolidJS, Svelte, Vue, and Qwik!
const [todos, setTodos] = usePersistentSignal('todos', []);
const [filter, setFilter] = useSignal('all');

const filteredTodos = useComputed(() => {
  switch (filter()) {
    case 'active': return todos().filter(todo => !todo.completed);
    case 'completed': return todos().filter(todo => todo.completed);
    default: return todos();
  }
});

const stats = useComputed(() => ({
  total: todos().length,
  active: todos().filter(todo => !todo.completed).length,
  completed: todos().filter(todo => todo.completed).length,
}));
```

Only the template syntax differs between frameworks!

## 📁 Project Structure

```
src/
├── routes/
│   ├── +layout.svelte    # Layout with CSS imports
│   ├── +page.svelte      # Main todo app component
│   └── +page.ts          # Page configuration
├── app.html              # HTML template
└── app.css               # Global styles
```

## 🎯 What This Demonstrates

1. **Universal Abstraction** - Signal-Σ works natively with Svelte 5 runes
2. **Framework Integration** - Leverages Svelte's compile-time optimizations
3. **Developer Experience** - Same API across all frameworks
4. **Performance** - Native Svelte reactivity with Signal-Σ patterns
5. **Migration Path** - Easy to move between frameworks

This proves that **great abstractions transcend framework boundaries** - the same reactive logic that powers React apps works seamlessly in Svelte 5 with zero changes to business logic!
