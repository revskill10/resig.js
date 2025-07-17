import React from 'react';
import { useSignal, useComputed } from '../../../../src/react/hooks';

interface SignalEvent {
  id: string;
  timestamp: number;
  type: 'signal_created' | 'signal_updated' | 'signal_accessed' | 'effect_executed' | 'computed_evaluated';
  signalName: string;
  oldValue?: any;
  newValue?: any;
  details?: string;
}

interface SignalState {
  name: string;
  value: any;
  type: 'signal' | 'computed' | 'effect' | 'async';
  lastUpdated: number;
  accessCount: number;
}

// Global signal registry for dev tools
const globalSignalRegistry = new Map<string, SignalState>();
const globalEventLog: SignalEvent[] = [];

// Add some initial demo data
setTimeout(() => {
  globalEventLog.push({
    id: 'demo-1',
    timestamp: Date.now() - 5000,
    type: 'signal_created',
    signalName: 'demo-signal',
    newValue: 'Hello DevTool!',
    details: 'Demo signal created to show DevTool functionality',
  });

  globalSignalRegistry.set('demo-signal', {
    name: 'demo-signal',
    value: 'Hello DevTool!',
    type: 'signal',
    lastUpdated: Date.now() - 5000,
    accessCount: 3,
  });
}, 100);

// DevTool API for signals to register themselves
export const SignalDevToolAPI = {
  registerSignal: (name: string, value: any, type: 'signal' | 'computed' | 'effect' | 'async') => {
    // Use setTimeout to avoid render-time state updates
    setTimeout(() => {
      globalSignalRegistry.set(name, {
        name,
        value,
        type,
        lastUpdated: Date.now(),
        accessCount: 0,
      });

      globalEventLog.push({
        id: Math.random().toString(36),
        timestamp: Date.now(),
        type: 'signal_created',
        signalName: name,
        newValue: value,
        details: `Created ${type} signal: ${name}`,
      });
    }, 0);
  },

  updateSignal: (name: string, oldValue: any, newValue: any) => {
    setTimeout(() => {
      const signal = globalSignalRegistry.get(name);
      if (signal) {
        signal.value = newValue;
        signal.lastUpdated = Date.now();

        globalEventLog.push({
          id: Math.random().toString(36),
          timestamp: Date.now(),
          type: 'signal_updated',
          signalName: name,
          oldValue,
          newValue,
          details: `Updated ${signal.type}: ${name}`,
        });
      }
    }, 0);
  },

  accessSignal: (name: string) => {
    setTimeout(() => {
      const signal = globalSignalRegistry.get(name);
      if (signal) {
        signal.accessCount++;

        globalEventLog.push({
          id: Math.random().toString(36),
          timestamp: Date.now(),
          type: 'signal_accessed',
          signalName: name,
          details: `Accessed ${signal.type}: ${name} (count: ${signal.accessCount})`,
        });
      }
    }, 0);
  },

  executeEffect: (name: string, details: string) => {
    setTimeout(() => {
      globalEventLog.push({
        id: Math.random().toString(36),
        timestamp: Date.now(),
        type: 'effect_executed',
        signalName: name,
        details: `Effect executed: ${details}`,
      });
    }, 0);
  },

  evaluateComputed: (name: string, result: any) => {
    setTimeout(() => {
      globalEventLog.push({
        id: Math.random().toString(36),
        timestamp: Date.now(),
        type: 'computed_evaluated',
        signalName: name,
        newValue: result,
        details: `Computed evaluated: ${name}`,
      });
    }, 0);
  },

  getEvents: () => [...globalEventLog],
  getSignals: () => new Map(globalSignalRegistry),
  clearEvents: () => {
    globalEventLog.length = 0;
  },
  clearSignals: () => {
    globalSignalRegistry.clear();
  },
};

function SignalDevTool() {
  const [isOpen, setIsOpen] = useSignal(true); // Default to open
  const [selectedTab, setSelectedTab] = useSignal<'events' | 'signals'>('events');
  const [refreshCount, setRefreshCount] = useSignal(0);

  // Get current events and signals
  const events = useComputed(() => {
    refreshCount; // Trigger recomputation when refreshCount changes
    return SignalDevToolAPI.getEvents().slice(-50); // Last 50 events
  });

  const signals = useComputed(() => {
    refreshCount; // Trigger recomputation when refreshCount changes
    return Array.from(SignalDevToolAPI.getSignals().values());
  });

  const refreshData = () => {
    setRefreshCount(prev => prev + 1);
  };

  const eventTypeColors = {
    signal_created: 'text-green-600 bg-green-50',
    signal_updated: 'text-blue-600 bg-blue-50',
    signal_accessed: 'text-gray-600 bg-gray-50',
    effect_executed: 'text-purple-600 bg-purple-50',
    computed_evaluated: 'text-orange-600 bg-orange-50',
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatValue = (value: any) => {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <div className="sticky top-0 w-full bg-white border-b-2 border-gray-300 shadow-lg z-[9999]">
      {/* Toggle Button */}
      {!isOpen && (
        <div className="p-2 bg-gray-800 text-white">
          <button
            onClick={() => setIsOpen(true)}
            className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 w-full"
          >
            🔧 Show Signal DevTool
          </button>
        </div>
      )}

      {/* DevTool Content */}
      {isOpen && (
        <div className="h-80">
          {/* Header */}
          <div className="flex items-center justify-between p-3 bg-gray-800 text-white">
            <h3 className="font-bold">🔧 Signal-Σ DevTool</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedTab('events')}
                className={`px-3 py-1 rounded ${selectedTab === 'events' ? 'bg-blue-600' : 'bg-gray-600'}`}
              >
                Events ({events.length})
              </button>
              <button
                onClick={() => setSelectedTab('signals')}
                className={`px-3 py-1 rounded ${selectedTab === 'signals' ? 'bg-blue-600' : 'bg-gray-600'}`}
              >
                Signals ({signals.length})
              </button>
              <button
                onClick={refreshData}
                className="px-3 py-1 rounded bg-green-600 hover:bg-green-700"
              >
                🔄 Refresh
              </button>
              <button
                onClick={() => SignalDevToolAPI.clearEvents()}
                className="px-3 py-1 rounded bg-red-600 hover:bg-red-700"
              >
                Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 rounded bg-gray-600 hover:bg-gray-700"
              >
                ✕ Hide
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="h-64 overflow-auto p-3">
            {selectedTab === 'events' && (
              <div className="space-y-2">
            
            {events.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No events yet. Interact with signals to see events here.
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className={`p-2 rounded border-l-4 ${eventTypeColors[event.type]}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-mono text-sm font-bold">
                        {event.type.toUpperCase()}
                      </div>
                      <div className="text-sm">{event.details}</div>
                      {event.oldValue !== undefined && (
                        <div className="text-xs mt-1">
                          <span className="text-red-600">Old:</span> {formatValue(event.oldValue)}
                        </div>
                      )}
                      {event.newValue !== undefined && (
                        <div className="text-xs mt-1">
                          <span className="text-green-600">New:</span> {formatValue(event.newValue)}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 ml-2">
                      {formatTime(event.timestamp)}
                    </div>
                  </div>
                </div>
              ))
              )}
            </div>
          )}

          {selectedTab === 'signals' && (
            <div className="space-y-2">
            {signals.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No signals registered yet.
              </div>
            ) : (
              signals.map((signal) => (
                <div
                  key={signal.name}
                  className="p-3 border rounded bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-bold text-sm">
                        {signal.name}
                        <span className={
                          signal.type === 'signal' ? 'ml-2 px-2 py-1 rounded text-xs bg-blue-100 text-blue-800' :
                          signal.type === 'computed' ? 'ml-2 px-2 py-1 rounded text-xs bg-green-100 text-green-800' :
                          signal.type === 'effect' ? 'ml-2 px-2 py-1 rounded text-xs bg-purple-100 text-purple-800' :
                          'ml-2 px-2 py-1 rounded text-xs bg-orange-100 text-orange-800'
                        }>
                          {signal.type}
                        </span>
                      </div>
                      <div className="text-sm mt-1 font-mono bg-white p-2 rounded border">
                        {formatValue(signal.value)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Accessed: {signal.accessCount} times | 
                        Last updated: {formatTime(signal.lastUpdated)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
              )}
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SignalDevTool;
