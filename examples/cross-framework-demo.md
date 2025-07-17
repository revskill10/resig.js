# Cross-Framework Demo: Same Logic, Every Framework

This demo shows the **exact same reactive logic** working across all major frameworks using Signal-Σ adapters.

## The Component: Todo App with Real-time Stats

A todo application with:
- ✅ Add/remove todos
- 🔍 Filter todos (all/active/completed)
- 📊 Real-time statistics
- 💾 localStorage persistence
- ✨ Form validation

## React Implementation

```tsx
// TodoApp.tsx
import { 
  useSignal, 
  useComputed, 
  usePersistentSignal,
  useValidatedSignal 
} from 'resig.js/react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export function TodoApp() {
  const [todos, setTodos] = usePersistentSignal<Todo[]>('react-todos', []);
  const [filter, setFilter] = useSignal<'all' | 'active' | 'completed'>('all');
  const [newTodo, setNewTodo, isValid] = useValidatedSignal('', (text) => text.trim().length > 0);

  const filteredTodos = useComputed(() => {
    switch (filter) {
      case 'active': return todos.filter(todo => !todo.completed);
      case 'completed': return todos.filter(todo => todo.completed);
      default: return todos;
    }
  });

  const stats = useComputed(() => ({
    total: todos.length,
    active: todos.filter(todo => !todo.completed).length,
    completed: todos.filter(todo => todo.completed).length,
  }));

  const addTodo = () => {
    if (isValid) {
      setTodos([...todos, { 
        id: Date.now(), 
        text: newTodo.trim(), 
        completed: false 
      }]);
      setNewTodo('');
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const removeTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="todo-app">
      <h1>React Todo App</h1>
      
      <div className="add-todo">
        <input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add a todo..."
          className={isValid ? 'valid' : 'invalid'}
        />
        <button onClick={addTodo} disabled={!isValid}>Add</button>
      </div>

      <div className="filters">
        <button 
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'active' : ''}
        >
          All ({stats.total})
        </button>
        <button 
          onClick={() => setFilter('active')}
          className={filter === 'active' ? 'active' : ''}
        >
          Active ({stats.active})
        </button>
        <button 
          onClick={() => setFilter('completed')}
          className={filter === 'completed' ? 'active' : ''}
        >
          Completed ({stats.completed})
        </button>
      </div>

      <ul className="todo-list">
        {filteredTodos.map(todo => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span>{todo.text}</span>
            <button onClick={() => removeTodo(todo.id)}>×</button>
          </li>
        ))}
      </ul>

      <div className="stats">
        <p>Total: {stats.total} | Active: {stats.active} | Completed: {stats.completed}</p>
      </div>
    </div>
  );
}
```

## SolidJS Implementation

```tsx
// TodoApp.tsx
import { 
  useSignal, 
  useComputed, 
  usePersistentSignal,
  useValidatedSignal 
} from 'resig.js/solid';
import { For } from 'solid-js';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export function TodoApp() {
  const [todos, setTodos] = usePersistentSignal<Todo[]>('solid-todos', []);
  const [filter, setFilter] = useSignal<'all' | 'active' | 'completed'>('all');
  const [newTodo, setNewTodo, isValid] = useValidatedSignal('', (text) => text.trim().length > 0);

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

  const addTodo = () => {
    if (isValid()) {
      setTodos([...todos(), { 
        id: Date.now(), 
        text: newTodo().trim(), 
        completed: false 
      }]);
      setNewTodo('');
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(todos().map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const removeTodo = (id: number) => {
    setTodos(todos().filter(todo => todo.id !== id));
  };

  return (
    <div class="todo-app">
      <h1>SolidJS Todo App</h1>
      
      <div class="add-todo">
        <input
          value={newTodo()}
          onInput={(e) => setNewTodo(e.currentTarget.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add a todo..."
          class={isValid() ? 'valid' : 'invalid'}
        />
        <button onClick={addTodo} disabled={!isValid()}>Add</button>
      </div>

      <div class="filters">
        <button 
          onClick={() => setFilter('all')}
          class={filter() === 'all' ? 'active' : ''}
        >
          All ({stats().total})
        </button>
        <button 
          onClick={() => setFilter('active')}
          class={filter() === 'active' ? 'active' : ''}
        >
          Active ({stats().active})
        </button>
        <button 
          onClick={() => setFilter('completed')}
          class={filter() === 'completed' ? 'active' : ''}
        >
          Completed ({stats().completed})
        </button>
      </div>

      <ul class="todo-list">
        <For each={filteredTodos()}>
          {(todo) => (
            <li class={todo.completed ? 'completed' : ''}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
              />
              <span>{todo.text}</span>
              <button onClick={() => removeTodo(todo.id)}>×</button>
            </li>
          )}
        </For>
      </ul>

      <div class="stats">
        <p>Total: {stats().total} | Active: {stats().active} | Completed: {stats().completed}</p>
      </div>
    </div>
  );
}
```

## Key Observations

### 🎯 **Identical Logic**
The reactive logic is **99% identical** across frameworks:
- Same hook names and signatures
- Same computed value definitions
- Same state management patterns

### 🔄 **Framework-Specific Adaptations**
Only minor syntax differences:
- **React**: Direct value access (`todos`)
- **SolidJS**: Function call access (`todos()`)
- **Svelte**: Function call access (`todos()`)
- **Vue**: Function call access (`todos()`)
- **Qwik**: Function call access (`todos()`)

### 🚀 **Performance Benefits**
Each adapter leverages the framework's native optimizations:
- **React**: Batching and reconciliation
- **SolidJS**: Fine-grained reactivity
- **Svelte**: Compile-time optimizations
- **Vue**: Proxy-based reactivity
- **Qwik**: Resumable execution

### 💡 **Developer Experience**
- **Learn once, use everywhere**
- **Consistent debugging experience**
- **Shared knowledge across teams**
- **Easy framework migration**

## Running the Examples

```bash
# React
cd examples/react-app && npm run dev

# SolidJS  
cd examples/solid-app && npm run dev

# Svelte
cd examples/svelte-app && npm run dev

# Vue
cd examples/vue-app && npm run dev

# Qwik
cd examples/qwik-app && npm run dev
```

This demonstrates the true power of Signal-Σ's core abstraction: **universal reactive programming** that works seamlessly across the entire JavaScript ecosystem.
