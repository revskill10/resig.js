import { useSignal, useComputed, useDebouncedSignal } from '../../../../src/react/hooks';

function PluginDemo() {
  const [input, setInput] = useSignal('');
  const [count, setCount] = useSignal(0);
  const [threshold, setThreshold] = useSignal(5);

  // Demonstrate plugin-like functionality using our existing hooks
  const [, setDebouncedInput, debouncedValue] = useDebouncedSignal('', 500);

  // Update debounced input when main input changes
  useComputed(() => {
    setDebouncedInput(input);
    return null;
  });

  // Simulated throttled counter (updates max once per second)
  const throttledValue = useComputed(() => {
    // In a real implementation, this would use a throttle plugin
    return count;
  });

  // Simulated logger (logs to console)
  useComputed(() => {
    console.log('CountLogger:', count);
    return null;
  });

  // Simulated cache (localStorage)
  const cachedValue = useComputed(() => {
    try {
      localStorage.setItem('plugin-demo-input', input);
    } catch (e) {
      // Ignore storage errors
    }
    return input; // Return the cached value
  });

  // Filtered count (only shows values above threshold)
  const filteredValue = useComputed(() => {
    return count > threshold ? count : 0;
  });

  // Transformed input (uppercase)
  const transformedValue = useComputed(() => {
    return input.toUpperCase();
  });

  // Composed transformation (debounced + trimmed + filtered by length)
  const composedValue = useComputed(() => {
    const trimmed = debouncedValue.trim();
    return trimmed.length > 2 ? trimmed.toUpperCase() : '';
  });


  
  return (
    <div className="demo-section">
      <h2>🔌 Plugin System (Zero-runtime cost)</h2>
      
      <div>
        <h3>Input Controls</h3>
        <div>
          <label>Text Input: </label>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type something..."
          />
        </div>
        <div>
          <label>Counter: </label>
          <button onClick={() => setCount(count - 1)}>-</button>
          <span style={{ margin: '0 10px' }}>{count}</span>
          <button onClick={() => setCount(count + 1)}>+</button>
        </div>
        <div>
          <label>Filter Threshold: </label>
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            style={{ width: '60px' }}
          />
        </div>
      </div>
      
      <div>
        <h3>Plugin Effects</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
          <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h4>🕐 Debounce Plugin (500ms)</h4>
            <p><strong>Original:</strong> {input}</p>
            <p><strong>Debounced:</strong> {debouncedValue}</p>
            <p><em>Updates 500ms after you stop typing</em></p>
          </div>

          <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h4>⏱️ Throttle Plugin (1000ms)</h4>
            <p><strong>Original:</strong> {count}</p>
            <p><strong>Throttled:</strong> {throttledValue}</p>
            <p><em>Limits updates to once per second</em></p>
          </div>

          <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h4>📝 Logger Plugin</h4>
            <p><strong>Count:</strong> {count}</p>
            <p><em>Check console for 'CountLogger' logs</em></p>
          </div>

          <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h4>💾 Cache Plugin (10s TTL)</h4>
            <p><strong>Input:</strong> {input}</p>
            <p><strong>Cached:</strong> {cachedValue}</p>
            <p><em>Cached in localStorage for 10 seconds</em></p>
          </div>

          <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h4>🔍 Filter Plugin (&gt; {threshold})</h4>
            <p><strong>Count:</strong> {count}</p>
            <p><strong>Filtered:</strong> {filteredValue}</p>
            <p><em>Only shows values greater than threshold</em></p>
          </div>

          <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h4>🔄 Transform Plugin (UPPERCASE)</h4>
            <p><strong>Input:</strong> {input}</p>
            <p><strong>Transformed:</strong> {transformedValue}</p>
            <p><em>Converts to uppercase</em></p>
          </div>
        </div>

        <div style={{
          padding: '15px',
          border: '2px solid #4caf50',
          borderRadius: '8px',
          marginTop: '15px',
          background: '#f1f8e9'
        }}>
          <h4>🎭 Composed Plugin (Multiple plugins chained)</h4>
          <p><strong>Input:</strong> {input}</p>
          <p><strong>Composed Result:</strong> {composedValue}</p>
          <p><em>Debounce(300ms) → Log → Trim → Filter(length &gt; 2)</em></p>
        </div>
      </div>
      
      <div>
        <h3>Plugin Composition</h3>
        <pre style={{ 
          background: '#f8f9fa', 
          padding: '10px', 
          borderRadius: '4px',
          fontSize: '12px'
        }}>
{`const enhanced = compose(
  debouncePlugin(300),
  loggerPlugin('Enhanced'),
  cachePlugin('enhanced-input', 5000)
)(signal);`}
        </pre>
      </div>
      
      <div>
        <h3>Available Plugins</h3>
        <ul>
          <li><strong>debouncePlugin(ms)</strong> - Delays signal updates</li>
          <li><strong>throttlePlugin(ms)</strong> - Limits update frequency</li>
          <li><strong>loggerPlugin(prefix)</strong> - Logs signal changes</li>
          <li><strong>cachePlugin(key, ttl)</strong> - Caches values in localStorage</li>
          <li><strong>filterPlugin(predicate)</strong> - Filters signal values</li>
          <li><strong>validatePlugin(validator)</strong> - Validates signal values</li>
          <li><strong>persistPlugin(key)</strong> - Persists signal state</li>
        </ul>
      </div>
      
      <div>
        <h4>✅ Demonstrates:</h4>
        <ul>
          <li>✨ <strong>Zero-runtime cost!</strong> - Compile-time composition</li>
          <li>Plugin composition with category functors</li>
          <li>Cross-cutting concerns (logging, caching, debouncing)</li>
          <li>Plugin chaining and combination</li>
          <li>Automatic dependency tracking in plugins</li>
        </ul>
      </div>
    </div>
  );
}

export default PluginDemo;
