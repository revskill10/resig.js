import { use, time$, computed } from 'resig.js';

function TimeSignalDemo() {
  const message = use('Hello');
  const delayMs = use(1000);

  // Time-based signals - NO React hooks leaked!
  const timeSignal = time$(Date.now());
  const delayedMessage = time$(message.value());

  // Computed signals for display - NO dependency arrays!
  const currentTime = computed(() =>
    new Date(timeSignal.value()).toLocaleTimeString()
  );

  const delayedDisplay = computed(() =>
    delayedMessage.value()
  );

  // Start time updates using time algebra
  const startTimeUpdates = () => {
    const intervalSignal = timeSignal.interval(1000);
    return intervalSignal.subscribe(() => {
      timeSignal.set(Date.now());
    });
  };
  
  const triggerDelay = () => {
    const delayed = delayedMessage.delay(delayMs.value());
    delayed.subscribe((value) => {
      console.log('Delayed value received:', value);
    });
  };
  
  const triggerTimeout = () => {
    const timeoutSignal = timeSignal.timeout(2000);
    timeoutSignal.subscribe((value) => {
      if (value instanceof Error) {
        console.log('Timeout occurred:', value.message);
      } else {
        console.log('Completed before timeout:', value);
      }
    });
  };
  
  const triggerInterval = () => {
    const intervalSignal = timeSignal.interval(500);
    let count = 0;
    const unsubscribe = intervalSignal.subscribe(() => {
      count++;
      console.log(`Interval tick ${count}:`, new Date().toLocaleTimeString());
      if (count >= 5) {
        unsubscribe();
        console.log('Interval stopped after 5 ticks');
      }
    });
  };
  
  return (
    <div className="demo-section">
      <h2>⏰ Time Algebra (Temporal Operations)</h2>
      
      <div>
        <h3>Current Time</h3>
        <p>Time: <strong>{currentTime.value()}</strong></p>
        <button onClick={startTimeUpdates}>Start Auto-Update</button>
        <button onClick={() => timeSignal.set(Date.now())}>Update Now</button>
        <p><em>Uses time algebra, not React hooks</em></p>
      </div>
      
      <div>
        <h3>Delayed Operations</h3>
        <div>
          <label>Message: </label>
          <input 
            value={message.value()} 
            onChange={(e) => message.set(e.target.value)}
          />
        </div>
        <div>
          <label>Delay (ms): </label>
          <input 
            type="number" 
            value={delayMs.value()} 
            onChange={(e) => delayMs.set(Number(e.target.value))}
          />
        </div>
        <p>Delayed Message: <strong>{delayedDisplay.value()}</strong></p>
        <button onClick={triggerDelay}>Trigger Delay</button>
        <p><em>Check console for delayed output</em></p>
      </div>
      
      <div>
        <h3>Timeout Operations</h3>
        <button onClick={triggerTimeout}>Test Timeout (2s)</button>
        <p><em>Check console for timeout behavior</em></p>
      </div>
      
      <div>
        <h3>Interval Operations</h3>
        <button onClick={triggerInterval}>Start Interval (500ms, 5 ticks)</button>
        <p><em>Check console for interval output</em></p>
      </div>
      
      <div>
        <h3>Quick Presets</h3>
        <button onClick={() => { message.set('Fast!'); delayMs.set(500); }}>
          Fast Delay (500ms)
        </button>
        <button onClick={() => { message.set('Slow...'); delayMs.set(2000); }}>
          Slow Delay (2s)
        </button>
        <button onClick={() => { message.set('Instant'); delayMs.set(0); }}>
          No Delay
        </button>
      </div>
      
      <div>
        <h4>✅ Demonstrates:</h4>
        <ul>
          <li>✨ <strong>NO React hooks!</strong> - Pure time algebra</li>
          <li>Time-based signal operations (delay, timeout, interval)</li>
          <li>Temporal composition and chaining</li>
          <li>Real-time updates with automatic cleanup</li>
          <li>Time algebra: delay, timeout, interval operations</li>
        </ul>
      </div>
    </div>
  );
}

export default TimeSignalDemo;
