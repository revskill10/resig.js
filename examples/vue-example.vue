<!--
  Vue.js Example - Signal-Σ with Vue 3 Composition API
  Demonstrates how Signal-Σ works seamlessly with Vue reactivity
-->

<template>
  <div class="container mx-auto p-8">
    <h1 class="text-3xl font-bold mb-8">Signal-Σ + Vue.js Examples</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Counter Component -->
      <div class="p-4 border rounded">
        <h3 class="text-lg font-bold mb-2">Vue Counter</h3>
        <p>Count: {{ count() }}</p>
        <p>Doubled: {{ doubled() }}</p>
        <p>Is Even: {{ isEven() ? 'Yes' : 'No' }}</p>
        <button 
          class="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          @click="setCount(count() + 1)"
        >
          +
        </button>
        <button 
          class="bg-red-500 text-white px-4 py-2 rounded"
          @click="setCount(count() - 1)"
        >
          -
        </button>
      </div>

      <!-- State Machine Component -->
      <div class="p-4 border rounded">
        <h3 class="text-lg font-bold mb-2">Vue State Machine</h3>
        <p>Current State: <span class="font-mono">{{ state() }}</span></p>
        <div class="mt-2">
          <button 
            class="bg-green-500 text-white px-4 py-2 rounded mr-2"
            @click="handleAsync"
            :disabled="state() === 'loading'"
          >
            {{ state() === 'loading' ? 'Loading...' : 'Start Async' }}
          </button>
          <button 
            v-if="state() === 'success' || state() === 'error'"
            class="bg-gray-500 text-white px-4 py-2 rounded"
            @click="send('reset')"
          >
            Reset
          </button>
        </div>
        <p v-if="state() === 'success'" class="text-green-600 mt-2">✅ Success!</p>
        <p v-if="state() === 'error'" class="text-red-600 mt-2">❌ Error occurred</p>
      </div>

      <!-- Fetch Component -->
      <div class="p-4 border rounded">
        <h3 class="text-lg font-bold mb-2">Vue Fetch</h3>
        <p v-if="userState().loading">Loading user...</p>
        <p v-if="userState().error" class="text-red-600">
          Error: {{ userState().error?.message }}
        </p>
        <div v-if="userState().data">
          <p><strong>Name:</strong> {{ userState().data.name }}</p>
          <p><strong>Email:</strong> {{ userState().data.email }}</p>
        </div>
        <button 
          class="bg-blue-500 text-white px-4 py-2 rounded mr-2 mt-2"
          @click="refetch"
        >
          Refetch
        </button>
        <button 
          class="bg-orange-500 text-white px-4 py-2 rounded mt-2"
          @click="() => retry(3)"
        >
          Retry 3x
        </button>
      </div>

      <!-- Form Demo Component -->
      <div class="p-4 border rounded">
        <h3 class="text-lg font-bold mb-2">Vue Form & Utils</h3>
        
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Email Validation:</label>
          <input
            type="email"
            :value="email()"
            @input="setEmail($event.target.value)"
            :class="`border rounded px-3 py-2 w-full ${
              isEmailValid() ? 'border-green-500' : 'border-red-500'
            }`"
            placeholder="Enter email"
          />
          <span :class="`text-sm ${isEmailValid() ? 'text-green-600' : 'text-red-600'}`">
            {{ isEmailValid() ? '✓ Valid email' : '✗ Invalid email' }}
          </span>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Debounced Search:</label>
          <input
            type="text"
            :value="search()"
            @input="setSearch($event.target.value)"
            class="border rounded px-3 py-2 w-full"
            placeholder="Type to search..."
          />
          <p class="text-sm text-gray-600 mt-1">
            Immediate: {{ search() }} | Debounced: {{ debouncedSearch() }}
          </p>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Persistent Theme:</label>
          <select
            :value="theme()"
            @change="setTheme($event.target.value)"
            class="border rounded px-3 py-2"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
          <p class="text-sm text-gray-600 mt-1">
            Theme persisted to localStorage: {{ theme() }}
          </p>
        </div>
      </div>
    </div>

    <div class="mt-8 p-4 bg-blue-50 rounded">
      <h2 class="text-xl font-bold mb-2">🚀 Features Demonstrated</h2>
      <ul class="list-disc list-inside space-y-1 text-sm">
        <li><strong>useSignal:</strong> Basic reactive state (Vue ref)</li>
        <li><strong>useComputed:</strong> Derived values (Vue computed)</li>
        <li><strong>useMachine:</strong> State machines with type safety</li>
        <li><strong>useFetch:</strong> Automatic data fetching with loading states</li>
        <li><strong>useValidatedSignal:</strong> Real-time form validation</li>
        <li><strong>useDebouncedSignal:</strong> Debounced input handling</li>
        <li><strong>usePersistentSignal:</strong> localStorage persistence</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { 
  useSignal, 
  useComputed, 
  useMachine, 
  useFetch, 
  useAsyncSignal,
  usePersistentSignal,
  useDebouncedSignal,
  useValidatedSignal 
} from '../src/vue/hooks';

// Basic Counter
const [count, setCount] = useSignal(0);
const doubled = useComputed(() => count() * 2);
const isEven = useComputed(() => count() % 2 === 0);

// State Machine
const [state, send] = useMachine('idle', (state, action) => {
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

const handleAsync = async () => {
  send('start');
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (Math.random() > 0.5) {
      send('success');
    } else {
      send('error');
    }
  } catch {
    send('error');
  }
};

// Fetch Demo
const [userState, refetch, retry] = useFetch(async () => {
  const response = await fetch('https://jsonplaceholder.typicode.com/users/1');
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
});

// Form Validation
const [email, setEmail, isEmailValid] = useValidatedSignal(
  '',
  (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
);

const [search, setSearch, debouncedSearch] = useDebouncedSignal('', 300);
const [theme, setTheme] = usePersistentSignal('vue-theme', 'light');
</script>

<style scoped>
/* Add your preferred styling here */
</style>
