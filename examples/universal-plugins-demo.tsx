/**
 * Universal Plugin System Demo
 * Shows the same plugins working across React and Svelte
 */

// ===== SHARED PLUGIN CONFIGURATIONS =====
// These plugin compositions work identically across ALL frameworks!

import { 
  debouncePlugin, 
  loggerPlugin, 
  cachePlugin, 
  validatePlugin,
  persistPlugin,
  compose,
  commonPlugins
} from 'resig.js/plugins';

// Shared plugin compositions that work everywhere
export const userInputPlugins = compose(
  debouncePlugin(300),
  validatePlugin((value: string) => value.length > 0),
  loggerPlugin('UserInput')
);

export const apiDataPlugins = compose(
  cachePlugin('user-data', 60000),
  loggerPlugin('APIData')
);

export const formFieldPlugins = commonPlugins.formField(
  'email-field',
  (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  300
);

export const realTimePlugins = commonPlugins.realTime('LiveData', 100);

// ===== REACT IMPLEMENTATION =====

import React from 'react';
import { 
  useSignal, 
  useComputed, 
  usePersistentSignal,
  useAsyncSignal 
} from 'resig.js/react/adapter';

export function ReactPluginDemo() {
  // Same plugin compositions work in React!
  const [userInput, setUserInput] = useSignal('', userInputPlugins);
  const [email, setEmail] = usePersistentSignal('user-email', '', formFieldPlugins);
  const [liveData, setLiveData] = useSignal(0, realTimePlugins);

  // Async signal with API plugins
  const [userData, refetchUser] = useAsyncSignal(
    async () => {
      const response = await fetch('/api/user');
      return response.json();
    },
    undefined,
    apiDataPlugins
  );

  // Computed values with plugins
  const processedInput = useComputed(
    () => `Processed: ${userInput.toUpperCase()}`,
    loggerPlugin('ProcessedInput')
  );

  return (
    <div className="plugin-demo">
      <h2>React + Universal Plugins</h2>
      
      <div>
        <label>User Input (debounced + validated + logged):</label>
        <input 
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type something..."
        />
        <p>Processed: {processedInput}</p>
      </div>

      <div>
        <label>Email (persistent + validated + debounced):</label>
        <input 
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email..."
        />
      </div>

      <div>
        <label>Live Data (real-time + throttled):</label>
        <button onClick={() => setLiveData(liveData + 1)}>
          Update: {liveData}
        </button>
      </div>

      <div>
        <label>API Data (cached + logged):</label>
        {userData.loading && <p>Loading...</p>}
        {userData.error && <p>Error: {userData.error.message}</p>}
        {userData.data && <p>User: {userData.data.name}</p>}
        <button onClick={refetchUser}>Refetch</button>
      </div>
    </div>
  );
}

// ===== SVELTE IMPLEMENTATION =====
// Note: This would be in a .svelte file, shown here as template

export const SveltePluginDemo = `
<script>
  import { 
    useSignal, 
    useComputed, 
    usePersistentSignal,
    useAsyncSignal 
  } from 'resig.js/svelte/adapter';
  
  // EXACT SAME plugin compositions work in Svelte!
  import { 
    userInputPlugins, 
    formFieldPlugins, 
    apiDataPlugins, 
    realTimePlugins 
  } from './universal-plugins-demo';

  const [userInput, setUserInput] = useSignal('', userInputPlugins);
  const [email, setEmail] = usePersistentSignal('user-email', '', formFieldPlugins);
  const [liveData, setLiveData] = useSignal(0, realTimePlugins);

  // Async signal with API plugins
  const [userData, refetchUser] = useAsyncSignal(
    async () => {
      const response = await fetch('/api/user');
      return response.json();
    },
    undefined,
    apiDataPlugins
  );

  // Computed values with plugins
  const processedInput = useComputed(
    () => \`Processed: \${userInput().toUpperCase()}\`,
    loggerPlugin('ProcessedInput')
  );
</script>

<div class="plugin-demo">
  <h2>Svelte + Universal Plugins</h2>
  
  <div>
    <label>User Input (debounced + validated + logged):</label>
    <input 
      bind:value={userInput()}
      on:input={(e) => setUserInput(e.target.value)}
      placeholder="Type something..."
    />
    <p>Processed: {processedInput()}</p>
  </div>

  <div>
    <label>Email (persistent + validated + debounced):</label>
    <input 
      type="email"
      bind:value={email()}
      on:input={(e) => setEmail(e.target.value)}
      placeholder="Enter email..."
    />
  </div>

  <div>
    <label>Live Data (real-time + throttled):</label>
    <button on:click={() => setLiveData(liveData() + 1)}>
      Update: {liveData()}
    </button>
  </div>

  <div>
    <label>API Data (cached + logged):</label>
    {#if userData().loading}
      <p>Loading...</p>
    {/if}
    {#if userData().error}
      <p>Error: {userData().error.message}</p>
    {/if}
    {#if userData().data}
      <p>User: {userData().data.name}</p>
    {/if}
    <button on:click={refetchUser}>Refetch</button>
  </div>
</div>
`;

// ===== SOLIDJS IMPLEMENTATION =====

export const SolidJSPluginDemo = `
import { 
  useSignal, 
  useComputed, 
  usePersistentSignal,
  useAsyncSignal 
} from 'resig.js/solid/adapter';

// EXACT SAME plugin compositions work in SolidJS!
import { 
  userInputPlugins, 
  formFieldPlugins, 
  apiDataPlugins, 
  realTimePlugins 
} from './universal-plugins-demo';

function SolidPluginDemo() {
  const [userInput, setUserInput] = useSignal('', userInputPlugins);
  const [email, setEmail] = usePersistentSignal('user-email', '', formFieldPlugins);
  const [liveData, setLiveData] = useSignal(0, realTimePlugins);

  // Same exact plugin usage!
  const [userData, refetchUser] = useAsyncSignal(
    async () => {
      const response = await fetch('/api/user');
      return response.json();
    },
    undefined,
    apiDataPlugins
  );

  const processedInput = useComputed(
    () => \`Processed: \${userInput().toUpperCase()}\`,
    loggerPlugin('ProcessedInput')
  );

  return (
    <div class="plugin-demo">
      <h2>SolidJS + Universal Plugins</h2>
      {/* Same template structure, different syntax */}
    </div>
  );
}
`;

// ===== KEY BENEFITS DEMONSTRATED =====

export const PluginBenefits = `
🌟 UNIVERSAL PLUGIN BENEFITS:

1. **Write Once, Use Everywhere**
   - Same plugin compositions work in React, Svelte, SolidJS, Vue, Qwik
   - No framework-specific plugin implementations needed

2. **Composable Architecture**
   - Mix and match plugins: debounce + validate + cache + log
   - Create reusable plugin combinations
   - Framework adapters handle the integration

3. **Framework-Native Performance**
   - React: Uses useSyncExternalStore for optimal re-renders
   - Svelte: Uses $state/$derived for fine-grained reactivity
   - SolidJS: Uses createSignal/createMemo for granular updates
   - Vue: Uses ref/computed for proxy-based reactivity
   - Qwik: Uses useSignal for resumable execution

4. **Developer Experience**
   - Learn plugin patterns once, apply everywhere
   - Easy migration between frameworks
   - Consistent debugging and testing
   - Shared knowledge across teams

5. **Business Logic Portability**
   - Core reactive logic is framework-agnostic
   - Plugins encapsulate cross-cutting concerns
   - Easy to extract and reuse across projects
`;

export default ReactPluginDemo;
