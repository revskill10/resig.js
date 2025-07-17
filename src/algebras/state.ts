/**
 * State Machine Algebra - State management with algebraic operations
 * XState replacement with category-theoretic foundations
 */

import { Effect, effect } from '../core/effect';

export interface State<S, A> extends Effect<A> {
  readonly get: () => State<S, S>;
  readonly put: (s: S) => State<S, void>;
  readonly modify: (f: (s: S) => S) => State<S, void>;
}

/**
 * Creates a State effect with state management operations
 */
export const state = <S, A>(
  initialState: S, 
  initialValue: A
): State<S, A> & { _setState: (s: S) => void; _setValue: (a: A) => void } => {
  let currentState = initialState;
  const baseEffect = effect(initialValue);
  
  const stateInstance: State<S, A> & { _setState: (s: S) => void; _setValue: (a: A) => void } = {
    value: baseEffect.value,
    map: baseEffect.map,
    subscribe: baseEffect.subscribe,
    bind: baseEffect.bind,
    chain: baseEffect.chain,
    
    get: (): State<S, S> => {
      return state(currentState, currentState);
    },
    
    put: (newState: S): State<S, void> => {
      const putState = state(newState, undefined as void);
      currentState = newState;
      return putState;
    },
    
    modify: (f: (s: S) => S): State<S, void> => {
      const newState = f(currentState);
      return stateInstance.put(newState);
    },
    
    _setState: (s: S) => {
      currentState = s;
    },
    
    _setValue: baseEffect._set
  };
  
  return stateInstance;
};

/**
 * State machine with transitions
 */
export interface StateMachine<S, A> {
  readonly state: S;
  readonly send: (action: A) => void;
  readonly subscribe: (fn: (state: S) => void) => () => void;
}

/**
 * Creates a state machine with reducer-like transitions
 */
export const machine = <S, A>(
  initialState: S,
  reducer: (state: S, action: A) => S
): StateMachine<S, A> => {
  let currentState = initialState;
  const subscribers = new Set<(state: S) => void>();
  
  const notify = () => {
    subscribers.forEach(fn => fn(currentState));
  };
  
  return {
    get state() {
      return currentState;
    },
    
    send: (action: A) => {
      const newState = reducer(currentState, action);
      if (newState !== currentState) {
        currentState = newState;
        notify();
      }
    },
    
    subscribe: (fn: (state: S) => void) => {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    }
  };
};

/**
 * Finite State Machine with explicit states and transitions
 */
export interface FSM<S extends string, A> {
  readonly current: S;
  readonly send: (action: A) => void;
  readonly can: (action: A) => boolean;
  readonly subscribe: (fn: (state: S) => void) => () => void;
}

export type Transition<S extends string, A> = {
  from: S;
  to: S;
  on: A;
  guard?: () => boolean;
};

/**
 * Creates a finite state machine with explicit transitions
 */
export const fsm = <S extends string, A>(
  initialState: S,
  transitions: Transition<S, A>[]
): FSM<S, A> => {
  let currentState = initialState;
  const subscribers = new Set<(state: S) => void>();
  
  const notify = () => {
    subscribers.forEach(fn => fn(currentState));
  };
  
  const getTransition = (action: A): Transition<S, A> | undefined => {
    return transitions.find(t => 
      t.from === currentState && 
      t.on === action && 
      (!t.guard || t.guard())
    );
  };
  
  return {
    get current() {
      return currentState;
    },
    
    send: (action: A) => {
      const transition = getTransition(action);
      if (transition) {
        currentState = transition.to;
        notify();
      }
    },
    
    can: (action: A) => {
      return getTransition(action) !== undefined;
    },
    
    subscribe: (fn: (state: S) => void) => {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    }
  };
};

/**
 * Natural transformation: State → Signal (lens view)
 */
export const lens = <S, A>(f: (s: S) => A) => (stateEffect: State<S, A>) => {
  return stateEffect.map(f);
};

/**
 * Combines multiple state machines
 */
export const combine = <S1, S2, A1, A2>(
  machine1: StateMachine<S1, A1>,
  machine2: StateMachine<S2, A2>
): StateMachine<{ m1: S1; m2: S2 }, { type: 'm1'; action: A1 } | { type: 'm2'; action: A2 }> => {
  const subscribers = new Set<(state: { m1: S1; m2: S2 }) => void>();
  
  const notify = () => {
    subscribers.forEach(fn => fn({ m1: machine1.state, m2: machine2.state }));
  };
  
  machine1.subscribe(notify);
  machine2.subscribe(notify);
  
  return {
    get state() {
      return { m1: machine1.state, m2: machine2.state };
    },
    
    send: (action) => {
      if (action.type === 'm1') {
        machine1.send(action.action);
      } else {
        machine2.send(action.action);
      }
    },
    
    subscribe: (fn) => {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    }
  };
};
