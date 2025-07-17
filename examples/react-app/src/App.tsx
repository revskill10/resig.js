import BasicSignalDemo from './components/BasicSignalDemo';
import ComputedSignalDemo from './components/ComputedSignalDemo';
import UseEffectReplacementDemo from './components/UseEffectReplacementDemo';
import PluginDemo from './components/PluginDemo';
import ExcelGridDemo from './components/ExcelGridDemo';
import EffectDemo from './components/EffectDemo';
import StateMachineDemo from './components/StateMachineDemo';
import FetchDemo from './components/FetchDemo';
import AdvancedDemo from './components/AdvancedDemo';

function App() {
  return (
    <div className="container">
      <h1>Signal-Σ React Example</h1>
      <p>
        A comprehensive demonstration of the category-theoretic signal library that eliminates React hooks and dependency arrays completely.
      </p>

      <BasicSignalDemo />
      <ComputedSignalDemo />
      <UseEffectReplacementDemo />
      <PluginDemo />
      <ExcelGridDemo />
      <EffectDemo />
      <StateMachineDemo />
      <FetchDemo />
      <AdvancedDemo />

      <div className="demo-section">
        <h2>🎯 Signal-Σ Key Features</h2>
        <ul>
          <li><strong>✨ NO useState, NO useEffect, NO dependency arrays!</strong></li>
          <li><strong>Functor Laws:</strong> map(id) ≡ id, map(f ∘ g) ≡ map(f) ∘ map(g)</li>
          <li><strong>Monad Laws:</strong> Left/right identity and associativity</li>
          <li><strong>Time Algebra:</strong> delay, timeout, interval, debounce, throttle</li>
          <li><strong>Network Algebra:</strong> fetch with retry, cache, timeout (React-Query replacement)</li>
          <li><strong>State Machine:</strong> Finite state machines with transitions (XState replacement)</li>
          <li><strong>Plugin System:</strong> Zero-runtime cost category functors</li>
          <li><strong>Automatic Dependency Tracking:</strong> No manual dependency management</li>
        </ul>

        <h3>🧮 Category Theory Foundation</h3>
        <p>
          Signal-Σ is built on solid mathematical foundations from category theory, ensuring:
        </p>
        <ul>
          <li><strong>Composability:</strong> Signals compose naturally without breaking</li>
          <li><strong>Predictability:</strong> Algebraic laws guarantee behavior</li>
          <li><strong>Performance:</strong> Zero-runtime cost through compile-time optimization</li>
          <li><strong>Type Safety:</strong> Full TypeScript support with inference</li>
        </ul>

        <h3>🎯 What You'll See Above</h3>
        <ul>
          <li><strong>Basic Signals:</strong> useState replacement with automatic reactivity</li>
          <li><strong>Computed Signals:</strong> Complex computed values without dependency arrays</li>
          <li><strong>useEffect Replacement:</strong> Side effects without useEffect or dependency arrays</li>
          <li><strong>Plugin System:</strong> Zero-runtime cost plugins with category functors</li>
          <li><strong>Excel Grid:</strong> High-performance spreadsheet with automatic formula calculation</li>
          <li><strong>Effect Monad:</strong> Monadic composition with bind/chain operations</li>
          <li><strong>State Machine:</strong> XState replacement with type-safe transitions</li>
          <li><strong>Network Algebra:</strong> React-Query replacement with automatic dependency tracking</li>
          <li><strong>Advanced Features:</strong> Debouncing, validation, persistence, and more</li>
        </ul>
      </div>
    </div>
  );
}

export default App;
