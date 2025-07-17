import { useEffect, useSignal } from '../../../../src/react/hooks';

function EffectMonadDemo() {
  const [counter, setCounter] = useSignal(0);
  const [logMessages, setLogMessages] = useSignal<string[]>([
    `[${new Date().toLocaleTimeString()}] EffectMonadDemo initialized`
  ]);
  
  // Effect monad for composable side effects
  const [effectValue, setEffectValue, effectMonad] = useEffect(`Effect initialized with counter: ${counter}`);

  // Demonstrate effect composition and chaining
  const handleSimpleEffect = () => {
    setEffectValue(`Simple effect: counter is ${counter}`);
    addLog(`Simple effect executed with counter: ${counter}`);
  };

  const handleChainedEffects = () => {
    addLog('Starting effect chain...');
    
    // Chain effects using monadic composition
    const step1Effect = effectMonad.bind((value) => {
      const newValue = `Step 1: ${value} -> processed`;
      setEffectValue(newValue);
      addLog(`Effect Step 1: ${newValue}`);
      return effectMonad;
    });

    const step2Effect = step1Effect.bind((value) => {
      const newValue = `Step 2: ${value} -> enhanced`;
      setEffectValue(newValue);
      addLog(`Effect Step 2: ${newValue}`);
      return effectMonad;
    });

    const finalEffect = step2Effect.bind((value) => {
      const newValue = `Final: ${value} -> completed`;
      setEffectValue(newValue);
      addLog(`Effect Final: ${newValue}`);
      return effectMonad;
    });

    addLog('Effect chain completed!');
  };

  const handleEffectWithCounter = () => {
    // Demonstrate effect that uses external state
    const counterEffect = effectMonad.bind((value) => {
      const newValue = `Counter effect: ${value} + counter(${counter}) = result`;
      setEffectValue(newValue);
      addLog(`Counter effect: combined ${value} with counter ${counter}`);
      return effectMonad;
    });

    addLog(`Counter effect executed with counter: ${counter}`);
  };

  const addLog = (message: string) => {
    setLogMessages(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const clearLogs = () => {
    setLogMessages([]);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Effect Monad Demo (useEffect)</h2>
        <p className="text-gray-600 mb-4">
          Our useEffect is NOT React's useEffect - it's for monadic effect composition!
          It provides composable side effects using the Effect monad.
        </p>

        {/* Counter Control */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Counter State</h3>
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold">Counter: {counter}</span>
            <button
              onClick={() => setCounter(counter + 1)}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              Increment
            </button>
            <button
              onClick={() => setCounter(counter - 1)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Decrement
            </button>
            <button
              onClick={() => setCounter(0)}
              className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Current Effect Value */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Current Effect Value</h3>
          <div className="bg-gray-50 p-4 rounded border">
            <code className="text-sm">{effectValue}</code>
          </div>
        </div>

        {/* Effect Controls */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Effect Operations</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSimpleEffect}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Simple Effect
            </button>
            <button
              onClick={handleChainedEffects}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Chained Effects (bind)
            </button>
            <button
              onClick={handleEffectWithCounter}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
            >
              Effect with Counter
            </button>
          </div>
        </div>

        {/* Effect Log */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Effect Log</h3>
            <button
              onClick={clearLogs}
              className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
            >
              Clear Log
            </button>
          </div>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-60 overflow-y-auto">
            {!Array.isArray(logMessages) ? (
              <div className="text-red-500">Error: logMessages is not an array: {typeof logMessages}</div>
            ) : logMessages.length === 0 ? (
              <div className="text-gray-500">No effects executed yet...</div>
            ) : (
              logMessages.map((message: string, index: number) => (
                <div key={index} className="mb-1">
                  {message}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Features */}
        <div className="bg-blue-50 p-4 rounded">
          <h4 className="font-semibold mb-2">🎯 Effect Monad Features:</h4>
          <ul className="text-sm space-y-1">
            <li>• <strong>Monadic composition:</strong> Chain effects using .bind() method</li>
            <li>• <strong>Side effect management:</strong> Composable side effects with pure functions</li>
            <li>• <strong>State integration:</strong> Effects can read and modify state</li>
            <li>• <strong>Functional programming:</strong> Based on mathematical Effect monad</li>
            <li>• <strong>NOT React useEffect:</strong> This is for functional effect composition!</li>
            <li>• <strong>Composable:</strong> Effects can be combined and reused</li>
          </ul>
        </div>

        {/* Code Example */}
        <div className="bg-gray-50 p-4 rounded mt-4">
          <h4 className="font-semibold mb-2">💻 Code Example:</h4>
          <pre className="text-xs overflow-x-auto">
{`const [value, setValue, effect] = useEffect('initial');

// Chain effects using monadic composition
const chainedEffect = effect
  .bind(val => {
    setValue(\`Step 1: \${val}\`);
    return effect;
  })
  .bind(val => {
    setValue(\`Step 2: \${val}\`);
    return effect;
  });`}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default EffectMonadDemo;
