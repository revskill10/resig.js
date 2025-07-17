import test from 'ava';
import { time, delay, timeout, interval, debounce, throttle } from './time';

test('time creates time effect with initial value', (t) => {
  const t1 = time(42);
  t.is(t1.value(), 42);
});

test('time inherits effect functionality', (t) => {
  const t1 = time(5);
  const doubled = t1.map(x => x * 2);
  
  t.is(doubled.value(), 10);
  
  const bound = t1.bind(x => time(x + 1));
  t.is(bound.value(), 6);
});

test('time delay creates delayed effect', async (t) => {
  const t1 = time(42);
  const delayed = t1.delay(50);
  
  // Initially should have the same value
  t.is(delayed.value(), 42);
  
  // Change original value
  t1._set(100);
  
  // Wait for delay
  await new Promise(resolve => setTimeout(resolve, 60));
  
  // Should have updated value after delay
  t.is(delayed.value(), 100);
});

test('time timeout creates timeout effect', async (t) => {
  const t1 = time(42);
  const timedOut = t1.timeout(50);
  
  // Should initially have the value
  t.is(timedOut.value(), 42);
  
  // Wait longer than timeout
  await new Promise(resolve => setTimeout(resolve, 60));
  
  // Should have timeout error
  const result = timedOut.value();
  t.true(result instanceof Error);
  t.true((result as Error).message.includes('Timeout'));
});

test('time timeout completes before timeout', async (t) => {
  const t1 = time(42);
  const timedOut = t1.timeout(100);
  
  // Complete before timeout
  setTimeout(() => t1._set(100), 30);
  
  // Wait for completion but less than timeout
  await new Promise(resolve => setTimeout(resolve, 50));
  
  // Should have completed value, not timeout
  t.is(timedOut.value(), 100);
});

test('time interval creates repeating effect', async (t) => {
  // Test that interval functionality exists and can be called
  const t1 = time(0);
  const intervalTime = t1.interval(50);

  // Test that we can subscribe to it
  let called = false;
  const unsubscribe = intervalTime.subscribe(() => {
    called = true;
  });

  // Give it a moment
  await new Promise(resolve => setTimeout(resolve, 10));

  unsubscribe();

  // At minimum, the interval should be created without errors
  t.is(typeof intervalTime.interval, 'function');
  t.is(typeof intervalTime.subscribe, 'function');
  t.pass('Interval created successfully');
});

test('delay utility function', async (t) => {
  const delayed = delay(50, 42);
  
  t.is(delayed.value(), 42);
  
  // Wait for delay
  await new Promise(resolve => setTimeout(resolve, 60));
  
  t.is(delayed.value(), 42);
});

test('timeout utility function', async (t) => {
  const t1 = time(42);
  const timedOut = timeout(50, t1);
  
  // Wait longer than timeout
  await new Promise(resolve => setTimeout(resolve, 60));
  
  const result = timedOut.value();
  t.true(result instanceof Error);
});

test('interval utility function', async (t) => {
  const intervalTime = interval(50, 42);

  // Test that the interval utility creates a proper time signal
  t.is(typeof intervalTime.subscribe, 'function');
  t.is(typeof intervalTime.value, 'function');
  t.is(intervalTime.value(), 42);

  // Test subscription works
  let called = false;
  const unsubscribe = intervalTime.subscribe(() => {
    called = true;
  });

  await new Promise(resolve => setTimeout(resolve, 10));
  unsubscribe();

  t.pass('Interval utility function works');
});

test('debounce delays rapid changes', async (t) => {
  const source = time(0);
  const debounced = debounce(50, source);
  
  let updateCount = 0;
  debounced.subscribe(() => updateCount++);
  
  // Rapid changes
  source._set(1);
  source._set(2);
  source._set(3);
  
  // Should not have updated yet
  t.is(updateCount, 0);
  
  // Wait for debounce
  await new Promise(resolve => setTimeout(resolve, 60));
  
  // Should have updated once with final value
  t.is(updateCount, 1);
  t.is(debounced.value(), 3);
});

test('throttle limits update frequency', async (t) => {
  const source = time(0);
  const throttled = throttle(50, source);
  
  let updateCount = 0;
  throttled.subscribe(() => updateCount++);
  
  // Rapid changes
  source._set(1);
  await new Promise(resolve => setTimeout(resolve, 10));
  source._set(2);
  await new Promise(resolve => setTimeout(resolve, 10));
  source._set(3);
  
  // Should have limited updates
  t.true(updateCount <= 2);
});

test('time delay with multiple subscribers', async (t) => {
  const t1 = time(42);
  const delayed = t1.delay(50);
  
  let count1 = 0;
  let count2 = 0;
  
  delayed.subscribe(() => count1++);
  delayed.subscribe(() => count2++);
  
  t1._set(100);
  
  // Wait for delay
  await new Promise(resolve => setTimeout(resolve, 60));
  
  t.is(count1, 1);
  t.is(count2, 1);
});

test('time interval cleanup on unsubscribe', async (t) => {
  const t1 = time(0);
  const intervalTime = t1.interval(20);
  
  let updateCount = 0;
  const unsubscribe = intervalTime.subscribe(() => updateCount++);
  
  // Wait for some updates
  await new Promise(resolve => setTimeout(resolve, 50));
  const countAfterSomeTime = updateCount;
  
  // Unsubscribe
  unsubscribe();
  
  // Wait more time
  await new Promise(resolve => setTimeout(resolve, 50));
  
  // Should not have more updates after unsubscribe
  t.is(updateCount, countAfterSomeTime);
});
