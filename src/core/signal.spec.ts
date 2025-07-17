import test from 'ava';
import { signal, id, compose, pure } from './signal';

test('signal creates basic signal with initial value', (t) => {
  const s = signal(42);
  t.is(s.value(), 42);
});

test('signal notifies subscribers on value change', (t) => {
  const s = signal(0);
  let notified = false;
  let receivedValue: number;
  
  s.subscribe((value) => {
    notified = true;
    receivedValue = value;
  });
  
  s._set(42);
  
  t.true(notified);
  t.is(receivedValue, 42);
  t.is(s.value(), 42);
});

test('signal unsubscribe works correctly', (t) => {
  const s = signal(0);
  let callCount = 0;
  
  const unsubscribe = s.subscribe(() => {
    callCount++;
  });
  
  s._set(1);
  t.is(callCount, 1);
  
  unsubscribe();
  s._set(2);
  t.is(callCount, 1); // Should not increment after unsubscribe
});

test('signal does not notify on same value', (t) => {
  const s = signal(42);
  let callCount = 0;
  
  s.subscribe(() => {
    callCount++;
  });
  
  s._set(42); // Same value
  t.is(callCount, 0);
  
  s._set(43); // Different value
  t.is(callCount, 1);
});

test('signal map follows functor identity law: map(id) ≡ id', (t) => {
  const s = signal(42);
  const mapped = s.map(id);
  
  t.is(mapped.value(), s.value());
  
  s._set(100);
  t.is(mapped.value(), s.value());
});

test('signal map follows functor composition law: map(f ∘ g) ≡ map(f) ∘ map(g)', (t) => {
  const s = signal(5);
  const double = (x: number) => x * 2;
  const addOne = (x: number) => x + 1;
  
  // map(f ∘ g)
  const composed = s.map(compose(double, addOne));
  
  // map(f) ∘ map(g)
  const chained = s.map(addOne).map(double);
  
  t.is(composed.value(), chained.value());
  
  s._set(10);
  t.is(composed.value(), chained.value());
});

test('signal map creates derived signal', (t) => {
  const s = signal(5);
  const doubled = s.map(x => x * 2);
  
  t.is(doubled.value(), 10);
  
  s._set(10);
  t.is(doubled.value(), 20);
});

test('signal map propagates changes correctly', (t) => {
  const s = signal(1);
  const doubled = s.map(x => x * 2);
  const quadrupled = doubled.map(x => x * 2);
  
  let doubledNotifications = 0;
  let quadrupledNotifications = 0;
  
  doubled.subscribe(() => doubledNotifications++);
  quadrupled.subscribe(() => quadrupledNotifications++);
  
  s._set(2);
  
  t.is(doubledNotifications, 1);
  t.is(quadrupledNotifications, 1);
  t.is(doubled.value(), 4);
  t.is(quadrupled.value(), 8);
});

test('pure creates signal with given value', (t) => {
  const s = pure(42);
  t.is(s.value(), 42);
});

test('compose function works correctly', (t) => {
  const addOne = (x: number) => x + 1;
  const double = (x: number) => x * 2;
  const composed = compose(double, addOne);
  
  t.is(composed(5), 12); // (5 + 1) * 2 = 12
});

test('id function returns input unchanged', (t) => {
  t.is(id(42), 42);
  t.is(id('hello'), 'hello');
  t.is(id(true), true);
});

test('multiple subscribers receive notifications', (t) => {
  const s = signal(0);
  let count1 = 0;
  let count2 = 0;
  
  s.subscribe(() => count1++);
  s.subscribe(() => count2++);
  
  s._set(1);
  
  t.is(count1, 1);
  t.is(count2, 1);
});

test('signal handles complex object values', (t) => {
  interface User {
    name: string;
    age: number;
  }
  
  const user = signal<User>({ name: 'Alice', age: 30 });
  let notificationCount = 0;
  
  user.subscribe(() => notificationCount++);
  
  user._set({ name: 'Bob', age: 25 });
  
  t.is(notificationCount, 1);
  t.is(user.value().name, 'Bob');
  t.is(user.value().age, 25);
});

test('signal map with type transformation', (t) => {
  const numberSignal = signal(42);
  const stringSignal = numberSignal.map(n => n.toString());
  
  t.is(stringSignal.value(), '42');
  
  numberSignal._set(100);
  t.is(stringSignal.value(), '100');
});
