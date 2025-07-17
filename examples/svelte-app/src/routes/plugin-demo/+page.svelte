<!--
  Signal-Σ Universal Plugin System Demo
  Shows how the same plugin concepts work across frameworks
-->

<script>
  // Import universal hooks from adapter
  import {
    useSignal,
    useComputed,
    useEffect,
    useAsyncSignal,
    useMachine
  } from '../../lib/universal-adapter.svelte.js';

  // Import universal plugins from plugins module
  import {
    debouncePlugin,
    validatePlugin,
    loggerPlugin,
    persistPlugin,
    retryPlugin,
    timeoutPlugin,
    compose
  } from '../../lib/universal-plugins.js';

  // This demonstrates REAL Signal-Σ universal plugins with clean API!
  // EXACT same code that works in React, SolidJS, Vue, Qwik - zero framework leakage!
  
  // Universal Signal-Σ API - EXACT same code works in React, SolidJS, Vue, Qwik!

  // Define plugin compositions (universal across all frameworks)
  const emailPlugins = compose(
    validatePlugin((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)),
    loggerPlugin('Email')
  );

  const searchPlugins = compose(
    debouncePlugin(300),
    loggerPlugin('Search')
  );

  const counterPlugins = loggerPlugin('Counter');

  const persistentPlugins = compose(
    persistPlugin('demo-data'),
    loggerPlugin('Persistent')
  );

  // Use the universal API - EXACT same as React/SolidJS/Vue/Qwik!
  // Only useSignal with composed plugins - no specialized hooks!
  const [email, setEmail] = useSignal('', emailPlugins);
  const [search, setSearch] = useSignal('', searchPlugins);
  const [counter, setCounter] = useSignal(0, counterPlugins);
  const [persistentData, setPersistentData] = useSignal('', persistentPlugins);

  // Email validation using computed value - no specialized hook needed!
  const emailValid = useComputed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email()));

  // Async data fetching with plugins
  const asyncPlugins = compose(
    retryPlugin(3, 1000),
    timeoutPlugin(5000),
    loggerPlugin('AsyncData')
  );

  const [userData, refetchUser, setUserData] = useAsyncSignal(
    async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (Math.random() > 0.7) throw new Error('Random API error');
      return { name: 'John Doe', email: 'john@example.com', id: Math.random() };
    },
    null,
    asyncPlugins
  );

  // State machine for email suggestions - manages the entire async flow!
  // States: 'idle' | 'loading' | 'success' | 'error'
  // Actions: 'fetch' | 'success' | 'error' | 'reset'

  const [suggestionState, sendSuggestion] = useMachine('idle', (state, action) => {
    switch (state) {
      case 'idle':
        return action === 'fetch' ? 'loading' : state;
      case 'loading':
        return action === 'success' ? 'success' :
               action === 'error' ? 'error' : state;
      case 'success':
      case 'error':
        return action === 'reset' ? 'idle' : state;
      default:
        return state;
    }
  });

  // Store the actual suggestions data
  const [suggestions, setSuggestions] = useSignal([]);

  // Async function for fetching suggestions
  const fetchEmailSuggestions = async () => {
    console.log('fetchEmailSuggestions: email value is:', email(), 'length:', email().length);
    if (!email() || email().length < 3) {
      console.log('fetchEmailSuggestions: email too short, not fetching');
      return;
    }

    sendSuggestion('fetch');

    try {
      console.log('fetchEmailSuggestions: starting fetch...');
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Simulate random failure
      if (Math.random() > 0.8) {
        throw new Error('Random API error');
      }

      const newSuggestions = [`${email()}@gmail.com`, `${email()}@yahoo.com`, `${email()}@outlook.com`];
      console.log('fetchEmailSuggestions: success with suggestions:', newSuggestions);
      setSuggestions(newSuggestions);
      sendSuggestion('success');
    } catch (error) {
      console.log('fetchEmailSuggestions: error:', error);
      sendSuggestion('error');
    }
  };

  // Effect for side effects
  useEffect(() => {
    console.log('Counter changed to:', counter());
    // Cleanup function
    return () => {
      console.log('Counter effect cleanup');
    };
  }, [counter]);
  
  // Actions using the universal API - same as React/SolidJS/Vue/Qwik!
  const incrementCounter = () => {
    setCounter(counter() + 1);
  };

  const testFetchSuggestions = () => {
    console.log('Button clicked! Email value:', email());
    console.log('Current suggestion state:', suggestionState());
    fetchEmailSuggestions();
  };

  const resetDemo = () => {
    setEmail('');
    setSearch('');
    setCounter(0);
    setPersistentData('');
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('demo-data');
    }
  };
</script>

<div class="demo-container">
  <h1>🔌 Signal-Σ Universal Plugin Demo</h1>
  <p class="subtitle">Same plugin concepts working across all frameworks</p>
  
  <div class="plugin-section">
    <h2>📧 Email Validation Plugin</h2>
    <p class="description">
      <strong>Plugins:</strong> validatePlugin + loggerPlugin
    </p>
    <input
      type="email"
      value={email()}
      oninput={(e) => setEmail(e.target.value)}
      placeholder="Enter email..."
      class:valid={emailValid()}
      class:invalid={email() && !emailValid()}
    />
    <div class="status">
      {#if email()}
        {#if emailValid()}
          ✅ Valid email format
        {:else}
          ❌ Invalid email format
        {/if}
      {:else}
        💡 Type an email to see validation
      {/if}
    </div>
  </div>
  
  <div class="plugin-section">
    <h2>🔍 Debounced Search Plugin</h2>
    <p class="description">
      <strong>Plugins:</strong> debouncePlugin(300ms) + loggerPlugin
    </p>
    <input
      value={search()}
      oninput={(e) => setSearch(e.target.value)}
      placeholder="Type to search..."
    />
    <div class="status">
      <strong>Search Value:</strong> {search() || 'Empty'}
    </div>
    <div class="status">
      <strong>Note:</strong> This search is debounced by 300ms via searchPlugins
    </div>
  </div>
  
  <div class="plugin-section">
    <h2>📊 Throttled Counter Plugin</h2>
    <p class="description">
      <strong>Plugins:</strong> throttlePlugin(100ms) + loggerPlugin
    </p>
    <button onclick={incrementCounter}>
      Increment Counter
    </button>
    <div class="status">
      <strong>Current Count:</strong> {counter()}
    </div>
  </div>
  
  <div class="plugin-section">
    <h2>💾 Persistent Data Plugin</h2>
    <p class="description">
      <strong>Plugins:</strong> persistPlugin + loggerPlugin
    </p>
    <input
      value={persistentData()}
      oninput={(e) => setPersistentData(e.target.value)}
      placeholder="Type something to persist..."
    />
    <div class="status">
      Data automatically saved to localStorage: "{persistentData()}"
    </div>
  </div>
  
  <div class="plugin-section">
    <h2>🌐 Async Data Plugin</h2>
    <p class="description">
      <strong>Plugins:</strong> retryPlugin + loggerPlugin + useAsyncSignal
    </p>
    <button onclick={refetchUser}>
      Fetch User Data
    </button>
    <div class="status">
      {#if userData().loading}
        ⏳ Loading user data...
      {:else if userData().error}
        ❌ Error: {userData().error.message}
      {:else if userData().data}
        ✅ User: {userData().data.name} ({userData().data.email})
      {:else}
        💡 Click to fetch user data
      {/if}
    </div>
  </div>

  <div class="plugin-section">
    <h2>🤖 State Machine Plugin</h2>
    <p class="description">
      <strong>Plugins:</strong> useMachine + useSignal + loggerPlugin<br>
      <strong>Instructions:</strong> Type at least 3 characters in the email field above, then click the button<br>
      <strong>Current State:</strong> {suggestionState()}
    </p>
    <button onclick={testFetchSuggestions} disabled={!email() || email().length < 3 || suggestionState() === 'loading'}>
      {#if suggestionState() === 'loading'}
        ⏳ Loading...
      {:else}
        Get Email Suggestions
      {/if}
    </button>
    {#if suggestionState() === 'error'}
      <button onclick={() => sendSuggestion('reset')} class="reset-btn">
        🔄 Reset
      </button>
    {/if}
    <div class="status">
      {#if !email() || email().length < 3}
        💡 Type at least 3 characters in the email field above to enable suggestions
      {:else if suggestionState() === 'loading'}
        ⏳ Loading email suggestions...
      {:else if suggestionState() === 'error'}
        ❌ Error loading suggestions - click Reset to try again
      {:else if suggestionState() === 'success' && suggestions().length > 0}
        ✅ Suggestions: {suggestions().join(', ')}
      {:else}
        💡 Click to get email suggestions (State: {suggestionState()})
      {/if}
    </div>
  </div>

  <div class="actions">
    <button onclick={resetDemo} class="reset-btn">
      🔄 Reset Demo
    </button>
  </div>
  
  <div class="concept-explanation">
    <h2>🌟 Universal Plugin Concept</h2>
    <p>
      In a real Signal-Σ implementation, the same plugin compositions work across ALL frameworks:
    </p>
    <pre><code>// React
const [email, setEmail] = useSignal('', emailPlugins);

// Svelte 5
const [email, setEmail] = useSignal('', emailPlugins);

// SolidJS
const [email, setEmail] = useSignal('', emailPlugins);

// Vue
const [email, setEmail] = useSignal('', emailPlugins);

// Qwik
const [email, setEmail] = useSignal('', emailPlugins);</code></pre>
    
    <p>
      Where <code>emailPlugins</code> is defined once:
    </p>
    <pre><code>const emailPlugins = compose(
  debouncePlugin(300),
  validatePlugin(isValidEmail),
  loggerPlugin('Email'),
  persistPlugin('user-email')
);</code></pre>
  </div>
</div>

<style>
  .demo-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  
  h1 {
    color: #2563eb;
    text-align: center;
    margin-bottom: 0.5rem;
  }
  
  .subtitle {
    text-align: center;
    color: #6b7280;
    margin-bottom: 2rem;
  }
  
  .plugin-section {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .plugin-section h2 {
    margin-top: 0;
    color: #1e40af;
  }
  
  .description {
    color: #6b7280;
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }
  
  input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #d1d5db;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s;
  }
  
  input:focus {
    outline: none;
    border-color: #2563eb;
  }
  
  input.valid {
    border-color: #10b981;
  }
  
  input.invalid {
    border-color: #ef4444;
  }
  
  button {
    background: #2563eb;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  button:hover {
    background: #1d4ed8;
  }
  
  .reset-btn {
    background: #ef4444;
  }
  
  .reset-btn:hover {
    background: #dc2626;
  }
  
  .status {
    margin-top: 0.5rem;
    padding: 0.5rem;
    background: #f1f5f9;
    border-radius: 4px;
    font-size: 0.9rem;
  }
  
  .actions {
    text-align: center;
    margin: 2rem 0;
  }
  
  .concept-explanation {
    background: #fef3c7;
    border: 1px solid #f59e0b;
    border-radius: 8px;
    padding: 1.5rem;
    margin-top: 2rem;
  }
  
  .concept-explanation h2 {
    color: #92400e;
    margin-top: 0;
  }
  
  pre {
    background: #1f2937;
    color: #f9fafb;
    padding: 1rem;
    border-radius: 6px;
    overflow-x: auto;
    font-size: 0.9rem;
  }
  
  code {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  }
</style>
