import { useSignal, useComputed } from '../hooks';

function BasicSignalDemo() {
  // Basic signals - NO useState needed!
  const [count, setCount] = useSignal(0);
  const [name, setName] = useSignal('Alice');

  // Computed signals - NO dependency arrays!
  const doubled = useComputed(() => count * 2);
  const greeting = useComputed(() => `Hello, ${name}!`);
  const summary = useComputed(() => `${greeting} Count: ${count}, Doubled: ${doubled}`);

  return (
    <div className="demo-section">
      <h2>🔄 Signal-Σ Concept Demo</h2>
      <p><em>This shows what our category-theoretic signal library would replace</em></p>

      <div>
        <h3>Counter Signal - NO useState!</h3>
        <p>Count: <strong>{count}</strong></p>
        <p>Doubled: <strong>{doubled}</strong></p>
        <button onClick={() => setCount(count + 1)}>Increment</button>
        <button onClick={() => setCount(count - 1)}>Decrement</button>
        <button onClick={() => setCount(0)}>Reset</button>
      </div>

      <div>
        <h3>Name Signal - NO useState!</h3>
        <p>Greeting: <strong>{greeting}</strong></p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name"
        />
        <button onClick={() => setName('Alice')}>Alice</button>
        <button onClick={() => setName('Bob')}>Bob</button>
        <button onClick={() => setName('Charlie')}>Charlie</button>
      </div>

      <div>
        <h3>Composed Signal - NO dependency arrays!</h3>
        <p><strong>{summary}</strong></p>
      </div>

      <div>
        <h4>✅ Signal-Σ Features:</h4>
        <ul>
          <li>✨ <strong>NO dependency arrays!</strong> - Automatic tracking</li>
          <li>Category-theoretic foundation with algebraic laws</li>
          <li>Functor laws: map(id) ≡ id, map(f ∘ g) ≡ map(f) ∘ map(g)</li>
          <li>Monad laws: left/right identity, associativity</li>
          <li>Time algebra: delay, timeout, interval, debounce</li>
          <li>Network algebra: fetch, retry, cache (React-Query replacement)</li>
          <li>State machines: finite state machines with transitions</li>
          <li>Plugin system: composable plugins with zero runtime cost</li>
        </ul>
      </div>
    </div>
  );
}

export default BasicSignalDemo;
