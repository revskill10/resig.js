import { useMachine, useSignal } from '../../../../src/react/hooks';

type State = 'idle' | 'loading' | 'success' | 'error';
type Action = 'start' | 'success' | 'error' | 'reset';

function StateMachineDemo() {
  // State machine - XState replacement with NO dependencies!
  const [state, send] = useMachine<State, Action>('idle', (state, action) => {
    switch (state) {
      case 'idle':
        return action === 'start' ? 'loading' : state;
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

  // Additional state for demo
  const [attempts, setAttempts] = useSignal(0);

  const getStateColor = () => {
    switch (state) {
      case 'idle': return '#6c757d';
      case 'loading': return '#ffc107';
      case 'success': return '#28a745';
      case 'error': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const simulateAsync = () => {
    send('start');
    setAttempts(attempts + 1);

    setTimeout(() => {
      send(Math.random() > 0.5 ? 'success' : 'error');
    }, 1500);
  };

  return (
    <div className="demo-section">
      <h2>🤖 State Machine (XState replacement)</h2>
      
      <div>
        <h3>Current State</h3>
        <div 
          style={{ 
            padding: '20px', 
            backgroundColor: getStateColor(), 
            color: 'white', 
            borderRadius: '8px',
            textAlign: 'center',
            fontSize: '24px',
            fontWeight: 'bold',
            textTransform: 'uppercase'
          }}
        >
          {state}
        </div>
        <p>Attempts: <strong>{attempts}</strong></p>
      </div>
      
      <div>
        <h3>Actions</h3>
        <button 
          onClick={() => send('start')} 
          disabled={state !== 'idle'}
        >
          Start
        </button>
        <button 
          onClick={() => send('success')} 
          disabled={state !== 'loading'}
        >
          Success
        </button>
        <button 
          onClick={() => send('error')} 
          disabled={state !== 'loading'}
        >
          Error
        </button>
        <button 
          onClick={() => send('reset')} 
          disabled={state === 'idle' || state === 'loading'}
        >
          Reset
        </button>
      </div>
      
      <div>
        <h3>Simulation</h3>
        <button onClick={simulateAsync}>
          Simulate Async Operation
        </button>
        <p><em>Automatically transitions: idle → loading → success/error</em></p>
      </div>
      
      <div>
        <h3>State Transitions</h3>
        <ul>
          <li><strong>idle</strong> + start → loading</li>
          <li><strong>loading</strong> + success → success</li>
          <li><strong>loading</strong> + error → error</li>
          <li><strong>success/error</strong> + reset → idle</li>
        </ul>
      </div>
      
      <div>
        <h4>✅ Demonstrates:</h4>
        <ul>
          <li>✨ <strong>NO dependency arrays!</strong> - Pure state algebra</li>
          <li>Finite state machine with explicit transitions</li>
          <li>Type-safe state and action definitions</li>
          <li>Automatic UI updates on state changes</li>
          <li>State machine algebra: states, actions, transitions</li>
        </ul>
      </div>
    </div>
  );
}

export default StateMachineDemo;
