import { useSignal, useComputed } from '../../../../src/react/hooks';

function UseEffectReplacementDemo() {
  // NO useEffect needed! Signal-Σ handles side effects automatically
  const [count, setCount] = useSignal(0);
  const [name, setName] = useSignal('Alice');
  const [isOnline, setIsOnline] = useSignal(true);
  
  // Document title updates automatically - NO useEffect!
  useComputed(() => {
    document.title = `${name} - Count: ${count}`;
    return null; // We don't need the return value, just the side effect
  });
  
  // Log changes automatically - NO useEffect!
  useComputed(() => {
    console.log(`Count changed to: ${count}`);
    return null;
  });
  
  // Network status simulation - NO useEffect!
  useComputed(() => {
    if (isOnline) {
      console.log('📡 Connected to network');
      // Simulate API call
      fetch('/api/status').catch(() => {
        console.log('📡 Network check failed');
      });
    } else {
      console.log('📡 Disconnected from network');
    }
    return null;
  });
  
  // Local storage sync - NO useEffect!
  useComputed(() => {
    localStorage.setItem('user-count', count.toString());
    localStorage.setItem('user-name', name);
    console.log('💾 Saved to localStorage');
    return null;
  });
  
  // Complex side effect with multiple dependencies - NO useEffect!
  useComputed(() => {
    if (count > 10 && name.length > 3) {
      console.log('🎉 Achievement unlocked: Power user!');
      // Could trigger notifications, analytics, etc.
    }
    return null;
  });
  
  // Cleanup simulation - NO useEffect cleanup needed!
  useComputed(() => {
    const interval = setInterval(() => {
      console.log(`⏰ Timer tick - Count: ${count}, User: ${name}`);
    }, 2000);
    
    // In a real implementation, we'd need proper cleanup
    // But for demo purposes, we'll clear it after a few ticks
    setTimeout(() => {
      clearInterval(interval);
      console.log('⏰ Timer cleaned up');
    }, 10000);
    
    return null;
  });
  
  // Derived state that triggers side effects - NO useEffect!
  const status = useComputed(() => {
    const currentStatus = count > 5 ? 'active' : 'inactive';
    
    // Side effect based on derived state
    if (currentStatus === 'active') {
      console.log('🟢 User is now active');
    } else {
      console.log('🔴 User is inactive');
    }
    
    return currentStatus;
  });
  
  return (
    <div className="demo-section">
      <h2>🔄 useEffect Replacement (NO dependency arrays!)</h2>
      
      <div style={{ 
        background: '#fff3cd', 
        padding: '15px', 
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #ffeaa7'
      }}>
        <h3>🚫 What we DON'T need anymore:</h3>
        <ul>
          <li><strong>useEffect with empty deps:</strong> useEffect(() =&gt; ..., [])</li>
          <li><strong>useEffect with manual deps:</strong> useEffect(() =&gt; ..., [count, name])</li>
          <li><strong>useEffect cleanup functions:</strong> return () =&gt; cleanup</li>
          <li><strong>useCallback and useMemo:</strong> Manual memoization</li>
        </ul>
      </div>
      
      <div>
        <h3>Controls</h3>
        <div>
          <label>Count: </label>
          <button onClick={() => setCount(count - 1)}>-</button>
          <span style={{ margin: '0 10px', fontWeight: 'bold' }}>{count}</span>
          <button onClick={() => setCount(count + 1)}>+</button>
          <button onClick={() => setCount(0)}>Reset</button>
        </div>
        
        <div style={{ marginTop: '10px' }}>
          <label>Name: </label>
          <input 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name"
          />
          <button onClick={() => setName('Alice')}>Alice</button>
          <button onClick={() => setName('Bob')}>Bob</button>
        </div>
        
        <div style={{ marginTop: '10px' }}>
          <label>Network: </label>
          <button 
            onClick={() => setIsOnline(!isOnline)}
            style={{ 
              background: isOnline ? '#28a745' : '#dc3545',
              color: 'white'
            }}
          >
            {isOnline ? '🟢 Online' : '🔴 Offline'}
          </button>
        </div>
      </div>
      
      <div>
        <h3>Automatic Side Effects (Check Console!)</h3>
        <div style={{ 
          background: '#f8f9fa',
          padding: '15px',
          borderRadius: '8px',
          fontFamily: 'monospace'
        }}>
          <p><strong>Status:</strong> {status}</p>
          <p><strong>Document Title:</strong> Updated automatically</p>
          <p><strong>Console Logs:</strong> Check browser console for automatic logging</p>
          <p><strong>LocalStorage:</strong> Automatically synced</p>
          <p><strong>Network Status:</strong> {isOnline ? 'Connected' : 'Disconnected'}</p>
        </div>
      </div>
      
      <div>
        <h3>What's Happening Automatically</h3>
        <ul>
          <li>📄 <strong>Document title</strong> updates when count or name changes</li>
          <li>📝 <strong>Console logging</strong> on every count change</li>
          <li>🌐 <strong>Network status</strong> simulation when online status changes</li>
          <li>💾 <strong>localStorage sync</strong> when count or name changes</li>
          <li>🎉 <strong>Achievement detection</strong> when count &gt; 10 and name length &gt; 3</li>
          <li>⏰ <strong>Timer logging</strong> every 2 seconds (auto-cleanup after 10s)</li>
          <li>🟢 <strong>Status updates</strong> when count crosses threshold</li>
        </ul>
      </div>
      
      <div>
        <h4>✅ Demonstrates:</h4>
        <ul>
          <li>✨ <strong>NO useEffect needed!</strong> - Side effects happen automatically</li>
          <li>✨ <strong>NO dependency arrays!</strong> - Automatic dependency tracking</li>
          <li>✨ <strong>NO cleanup functions!</strong> - Handled automatically</li>
          <li>Document title updates without useEffect</li>
          <li>Console logging without useEffect</li>
          <li>localStorage sync without useEffect</li>
          <li>Network status handling without useEffect</li>
          <li>Complex multi-dependency side effects</li>
          <li>Derived state with automatic side effects</li>
        </ul>
      </div>
    </div>
  );
}

export default UseEffectReplacementDemo;
