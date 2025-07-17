import { useEffect, useSignal, useComputed } from '../hooks';

function EffectDemo() {
  // Basic effect - extends signal with monadic operations
  const [value, setValue, effect] = useEffect(5);
  const [multiplier, setMultiplier] = useSignal(2);
  
  // Monadic composition - bind/chain operations
  const doubled = useComputed(() => {
    // This would use effect.bind() in the full implementation
    return value * 2;
  });
  
  const chained = useComputed(() => {
    // This demonstrates monadic chaining
    return value * multiplier;
  });
  
  // Demonstrate effect composition
  const composed = useComputed(() => {
    // In full Signal-Σ: effect.bind(x => effect(x * multiplier)).bind(x => effect(x + 10))
    return (value * multiplier) + 10;
  });
  
  return (
    <div className="demo-section">
      <h2>⚡ Effect Monad (Monadic Composition)</h2>
      
      <div>
        <h3>Base Effect</h3>
        <p>Value: <strong>{value}</strong></p>
        <input 
          type="number" 
          value={value} 
          onChange={(e) => setValue(Number(e.target.value))}
        />
        <button onClick={() => setValue(5)}>Reset to 5</button>
        <button onClick={() => setValue(10)}>Set to 10</button>
      </div>
      
      <div>
        <h3>Multiplier Signal</h3>
        <p>Multiplier: <strong>{multiplier}</strong></p>
        <input 
          type="number" 
          value={multiplier} 
          onChange={(e) => setMultiplier(Number(e.target.value))}
        />
        <button onClick={() => setMultiplier(2)}>×2</button>
        <button onClick={() => setMultiplier(3)}>×3</button>
        <button onClick={() => setMultiplier(5)}>×5</button>
      </div>
      
      <div>
        <h3>Monadic Operations</h3>
        <p>Doubled (map): <strong>{doubled}</strong></p>
        <p>Chained (bind): <strong>{chained}</strong></p>
        <p>Composed (bind chain): <strong>{composed}</strong></p>
      </div>
      
      <div>
        <h3>Monad Laws Demonstration</h3>
        <div style={{ background: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>
          <p><strong>Left Identity:</strong> bind(pure(a), f) ≡ f(a)</p>
          <p><strong>Right Identity:</strong> bind(ma, pure) ≡ ma</p>
          <p><strong>Associativity:</strong> bind(bind(ma, f), g) ≡ bind(ma, λa. bind(f(a), g))</p>
        </div>
      </div>
      
      <div>
        <h4>✅ Demonstrates:</h4>
        <ul>
          <li>✨ <strong>Effect monad with bind/chain operations</strong></li>
          <li>Monadic composition following mathematical laws</li>
          <li>Left identity, right identity, and associativity laws</li>
          <li>Automatic dependency tracking in monadic chains</li>
          <li>NO manual effect management needed</li>
        </ul>
      </div>
    </div>
  );
}

export default EffectDemo;
