import { useSignal, useComputed } from '../../../../src/react/hooks';

function ComputedSignalDemo() {
  // NO useState! Using Signal-Σ instead
  const [a, setA] = useSignal(5);
  const [b, setB] = useSignal(10);
  const [operation, setOperation] = useSignal<'add' | 'multiply' | 'subtract'>('add');

  // Computed signals - NO dependency arrays needed!
  const result = useComputed(() => {
    switch (operation) {
      case 'add': return a + b;
      case 'multiply': return a * b;
      case 'subtract': return a - b;
      default: return 0;
    }
  });

  const isEven = useComputed(() => result % 2 === 0);
  const description = useComputed(() => `${result} is ${isEven ? 'even' : 'odd'}`);
  const squared = useComputed(() => result ** 2);
  const squareRoot = useComputed(() => Math.sqrt(Math.abs(result)));
  
  return (
    <div className="demo-section">
      <h2>🧮 Computed Signals (Functor Laws)</h2>
      
      <div>
        <h3>Input Values</h3>
        <div>
          <label>A: </label>
          <input
            type="number"
            value={a}
            onChange={(e) => setA(Number(e.target.value))}
          />
        </div>
        <div>
          <label>B: </label>
          <input
            type="number"
            value={b}
            onChange={(e) => setB(Number(e.target.value))}
          />
        </div>
        <div>
          <label>Operation: </label>
          <select
            value={operation}
            onChange={(e) => setOperation(e.target.value as any)}
          >
            <option value="add">Add</option>
            <option value="multiply">Multiply</option>
            <option value="subtract">Subtract</option>
          </select>
        </div>
      </div>
      
      <div>
        <h3>Computed Results</h3>
        <p>Result: <strong>{result}</strong></p>
        <p>Description: <strong>{description}</strong></p>
        <p>Squared: <strong>{squared}</strong></p>
        <p>Square Root: <strong>{squareRoot.toFixed(2)}</strong></p>
      </div>
      
      <div>
        <h3>Quick Tests</h3>
        <button onClick={() => { setA(3); setB(4); setOperation('add'); }}>
          3 + 4 = 7
        </button>
        <button onClick={() => { setA(6); setB(7); setOperation('multiply'); }}>
          6 × 7 = 42
        </button>
        <button onClick={() => { setA(10); setB(3); setOperation('subtract'); }}>
          10 - 3 = 7
        </button>
      </div>
      
      <div>
        <h4>✅ Demonstrates:</h4>
        <ul>
          <li>✨ <strong>ZERO dependency arrays!</strong> - Pure composition</li>
          <li>Complex computed signals with multiple dependencies</li>
          <li>Nested computed signals (computed from computed)</li>
          <li>Automatic re-computation when any dependency changes</li>
          <li>Functor composition: map(f ∘ g) ≡ map(f) ∘ map(g)</li>
        </ul>
      </div>
    </div>
  );
}

export default ComputedSignalDemo;
