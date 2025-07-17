/**
 * Qwik Example - Signal-Σ with Qwik
 * Demonstrates how Signal-Σ works seamlessly with Qwik reactivity
 */

import { component$ } from '@builder.io/qwik';
import { 
  useSignal, 
  useComputed, 
  useMachine, 
  useFetch, 
  useAsyncSignal,
  usePersistentSignal,
  useDebouncedSignal,
  useValidatedSignal 
} from '../src/qwik/hooks';

// Basic Counter Component
export const Counter = component$(() => {
  const [count, setCount] = useSignal(0);
  const doubled = useComputed(() => count() * 2);
  const isEven = useComputed(() => count() % 2 === 0);

  return (
    <div class="p-4 border rounded">
      <h3 class="text-lg font-bold mb-2">Qwik Counter</h3>
      <p>Count: {count()}</p>
      <p>Doubled: {doubled()}</p>
      <p>Is Even: {isEven() ? 'Yes' : 'No'}</p>
      <button 
        class="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        onClick$={() => setCount(count() + 1)}
      >
        +
      </button>
      <button 
        class="bg-red-500 text-white px-4 py-2 rounded"
        onClick$={() => setCount(count() - 1)}
      >
        -
      </button>
    </div>
  );
});

// State Machine Component
export const StateMachineDemo = component$(() => {
  type State = 'idle' | 'loading' | 'success' | 'error';
  type Action = 'start' | 'success' | 'error' | 'reset';

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

  const handleAsync = $(async () => {
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
  });

  return (
    <div class="p-4 border rounded">
      <h3 class="text-lg font-bold mb-2">Qwik State Machine</h3>
      <p>Current State: <span class="font-mono">{state()}</span></p>
      <div class="mt-2">
        <button 
          class="bg-green-500 text-white px-4 py-2 rounded mr-2"
          onClick$={handleAsync}
          disabled={state() === 'loading'}
        >
          {state() === 'loading' ? 'Loading...' : 'Start Async'}
        </button>
        {(state() === 'success' || state() === 'error') && (
          <button 
            class="bg-gray-500 text-white px-4 py-2 rounded"
            onClick$={() => send('reset')}
          >
            Reset
          </button>
        )}
      </div>
      {state() === 'success' && <p class="text-green-600 mt-2">✅ Success!</p>}
      {state() === 'error' && <p class="text-red-600 mt-2">❌ Error occurred</p>}
    </div>
  );
});

// Fetch Component
export const FetchDemo = component$(() => {
  const [userState, refetch, retry] = useFetch(async () => {
    const response = await fetch('https://jsonplaceholder.typicode.com/users/1');
    if (!response.ok) throw new Error('Failed to fetch');
    return response.json();
  });

  return (
    <div class="p-4 border rounded">
      <h3 class="text-lg font-bold mb-2">Qwik Fetch</h3>
      {userState().loading && <p>Loading user...</p>}
      {userState().error && <p class="text-red-600">Error: {userState().error?.message}</p>}
      {userState().data && (
        <div>
          <p><strong>Name:</strong> {userState().data.name}</p>
          <p><strong>Email:</strong> {userState().data.email}</p>
        </div>
      )}
      <button 
        class="bg-blue-500 text-white px-4 py-2 rounded mr-2 mt-2"
        onClick$={refetch}
      >
        Refetch
      </button>
      <button 
        class="bg-orange-500 text-white px-4 py-2 rounded mt-2"
        onClick$={() => retry(3)}
      >
        Retry 3x
      </button>
    </div>
  );
});

// Form Validation Component
export const FormDemo = component$(() => {
  const [email, setEmail, isEmailValid] = useValidatedSignal(
    '',
    (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );

  const [search, setSearch, debouncedSearch] = useDebouncedSignal('', 300);
  const [theme, setTheme] = usePersistentSignal('qwik-theme', 'light');

  return (
    <div class="p-4 border rounded">
      <h3 class="text-lg font-bold mb-2">Qwik Form & Utils</h3>
      
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">Email Validation:</label>
        <input
          type="email"
          value={email()}
          onInput$={(e) => setEmail((e.target as HTMLInputElement).value)}
          class={`border rounded px-3 py-2 w-full ${
            isEmailValid() ? 'border-green-500' : 'border-red-500'
          }`}
          placeholder="Enter email"
        />
        <span class={`text-sm ${isEmailValid() ? 'text-green-600' : 'text-red-600'}`}>
          {isEmailValid() ? '✓ Valid email' : '✗ Invalid email'}
        </span>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">Debounced Search:</label>
        <input
          type="text"
          value={search()}
          onInput$={(e) => setSearch((e.target as HTMLInputElement).value)}
          class="border rounded px-3 py-2 w-full"
          placeholder="Type to search..."
        />
        <p class="text-sm text-gray-600 mt-1">
          Immediate: {search()} | Debounced: {debouncedSearch()}
        </p>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">Persistent Theme:</label>
        <select
          value={theme()}
          onChange$={(e) => setTheme((e.target as HTMLSelectElement).value)}
          class="border rounded px-3 py-2"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="auto">Auto</option>
        </select>
        <p class="text-sm text-gray-600 mt-1">
          Theme persisted to localStorage: {theme()}
        </p>
      </div>
    </div>
  );
});

// Main App Component
export default component$(() => {
  return (
    <div class="container mx-auto p-8">
      <h1 class="text-3xl font-bold mb-8">Signal-Σ + Qwik Examples</h1>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Counter />
        <StateMachineDemo />
        <FetchDemo />
        <FormDemo />
      </div>
      <div class="mt-8 p-4 bg-blue-50 rounded">
        <h2 class="text-xl font-bold mb-2">🚀 Features Demonstrated</h2>
        <ul class="list-disc list-inside space-y-1 text-sm">
          <li><strong>useSignal:</strong> Basic reactive state (Qwik useSignal)</li>
          <li><strong>useComputed:</strong> Derived values (reactive functions)</li>
          <li><strong>useMachine:</strong> State machines with type safety</li>
          <li><strong>useFetch:</strong> Automatic data fetching with loading states</li>
          <li><strong>useValidatedSignal:</strong> Real-time form validation</li>
          <li><strong>useDebouncedSignal:</strong> Debounced input handling</li>
          <li><strong>usePersistentSignal:</strong> localStorage persistence</li>
        </ul>
      </div>
    </div>
  );
});
