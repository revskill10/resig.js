# Running Signal-Σ Framework Demos

This guide shows how to run all the Signal-Σ framework demos to see the same reactive logic working across different frameworks.

## 🚀 Quick Start - All Demos

### 1. Build the Core Library
```bash
# From the root directory
cd resig.js
npm install
npm run build
```

### 2. Run Individual Framework Demos

#### React Demo (Port 3000)
```bash
cd examples/react-app
npm install
npm run dev
# Visit http://localhost:3000
```

#### Svelte 5 Todo Demo (Port 3001)
```bash
cd examples/svelte-app
npm install
npm run dev
# Visit http://localhost:3001
```

#### SolidJS Demo (Port 3002)
```bash
cd examples/solid-app
npm install
npm run dev
# Visit http://localhost:3002
```

#### Vue.js Demo (Port 3003)
```bash
cd examples/vue-app
npm install
npm run dev
# Visit http://localhost:3003
```

#### Qwik Demo (Port 3004)
```bash
cd examples/qwik-app
npm install
npm run dev
# Visit http://localhost:3004
```

## 🎯 What Each Demo Shows

### React Demo
- Complete Signal-Σ feature showcase
- Excel-like spreadsheet with formulas
- All hooks and utilities
- React DevTools integration

### Svelte 5 Todo Demo ⭐ **Featured**
- **Complete todo application** with advanced features
- **Svelte 5 runes integration** ($state, $derived, $effect)
- **Real-time search** with debouncing
- **Form validation** with visual feedback
- **localStorage persistence** 
- **State machine** for bulk operations
- **Live statistics** and completion tracking
- **Responsive design**

### SolidJS Demo
- SolidJS fine-grained reactivity
- createSignal, createMemo integration
- Performance optimizations

### Vue.js Demo
- Vue 3 Composition API integration
- ref, computed, watchEffect usage
- Vue DevTools support

### Qwik Demo
- Resumable execution model
- Server-side rendering optimization
- Progressive hydration

## 🔍 Code Comparison

The beauty of Signal-Σ is that the **core reactive logic is identical** across all frameworks:

```javascript
// This exact code works in ALL frameworks!
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

Only the **template syntax** differs between frameworks!

## 🌟 Key Observations

### Universal Patterns
- **Same hook names** across all frameworks
- **Identical reactive logic** 
- **Consistent API surface**
- **Framework-native performance**

### Framework-Specific Benefits
- **React**: Batching, Suspense, DevTools
- **SolidJS**: Fine-grained reactivity, no virtual DOM
- **Svelte 5**: Compile-time optimization, runes
- **Vue.js**: Proxy reactivity, DevTools
- **Qwik**: Resumable execution, SSR optimization

### Developer Experience
- **Learn once, use everywhere**
- **Easy framework migration**
- **Shared knowledge across teams**
- **Consistent debugging patterns**

## 🎮 Interactive Demo Experience

1. **Start with Svelte 5 Todo Demo** - Most comprehensive example
2. **Compare with React Demo** - See the same patterns
3. **Try other frameworks** - Notice the consistency
4. **Inspect the code** - 99% identical reactive logic

This demonstrates the true power of Signal-Σ: **universal reactive programming** that works seamlessly across the entire JavaScript ecosystem!

## 🔧 Troubleshooting

### Build Issues
```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

### Port Conflicts
Each demo runs on a different port. If you have conflicts, check the vite.config files in each example directory.

### Missing Dependencies
Make sure to run `npm install` in both the root directory and each example directory.

## 📚 Next Steps

- Explore the source code in each `examples/` directory
- Compare the reactive logic across frameworks
- Try modifying the examples to see the patterns
- Read the comprehensive API documentation in the main README
