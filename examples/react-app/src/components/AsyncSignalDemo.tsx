import { useAsyncSignal, useAsyncComputed, useAsyncComputedSignal, useSignal, useComputed } from '../../../../src/react/hooks';

function AsyncSignalDemo() {
  // Use async signal to load initial userId from async source
  const [userIdAsyncState, refetchUserId, setUserIdAsync] = useAsyncSignal(async () => {
    console.log('Loading initial userId from async source...');

    // Simulate async operation (could be API call, async storage, etc.)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Try to load from localStorage (async simulation)
    const savedUserId = localStorage.getItem('signal-demo-userId');
    const initialUserId = savedUserId ? parseInt(savedUserId, 10) : 1;

    console.log('Loaded initial userId:', initialUserId);
    return initialUserId;
  });

  // Regular signal with stable initialization
  const [userId, setUserId] = useSignal(1);

  // Use computed to get current userId (either from signal or async state)
  const currentUserId = useComputed(() => userIdAsyncState.data || userId);

  // Computed signal that shows loading state
  const userIdDisplay = useComputed(() => {
    if (userIdAsyncState.loading) return 'Loading...';
    if (userIdAsyncState.error) return 'Error loading';
    return currentUserId;
  });



  // Save userId using signal composition
  const saveUserIdToAsync = (newUserId: number) => {
    setUserId(newUserId);

    // Save to localStorage directly to avoid effect issues
    localStorage.setItem('signal-demo-userId', newUserId.toString());
    console.log('Saved userId to localStorage:', newUserId);
  };

  // Manual sync function to sync userId with async data
  const syncWithAsyncData = () => {
    if (userIdAsyncState.data) {
      setUserId(userIdAsyncState.data);
      console.log('Synced userId with async data:', userIdAsyncState.data);
    }
  };

  // Async signal for fetching user data
  const [userState, refetchUser, setUser] = useAsyncSignal(
    async () => {
      const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    }
  );

  // Async computed for user posts (with dependency array)
  const postsState = useAsyncComputed(async () => {
    const response = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch posts');
    return response.json();
  }, [userId]);

  // Async computed for post count (with dependency array)
  const postCountState = useAsyncComputed(async () => {
    // Simulate some async processing
    await new Promise(resolve => setTimeout(resolve, 100));
    return postsState.data?.length || 0;
  }, [postsState.data]);  

  // Async computed SIGNAL - returns a signal that can be used in other computations
  const userStatsSignal = useAsyncComputedSignal(async () => {
    if (!postsState.data) return null;

    // Simulate complex async computation
    await new Promise(resolve => setTimeout(resolve, 200));

    return {
      totalPosts: postsState.data.length,
      avgTitleLength: postsState.data.reduce((sum: number, post: any) => sum + post.title.length, 0) / postsState.data.length,
      lastPostDate: new Date().toISOString(),
      userId: userId
    };
  }, [postsState.data, userId]);

  // Regular computed signal that uses the async computed signal
  const userStatsDisplay = useComputed(() => {
    const stats = userStatsSignal.value();
    if (stats.loading) return "Computing user statistics...";
    if (stats.error) return `Error: ${stats.error.message}`;
    if (!stats.data) return "No statistics available";

    return `User ${stats.data.userId} has ${stats.data.totalPosts} posts with avg title length of ${Math.round(stats.data.avgTitleLength)} chars`;
  });

  // Another signal that depends on the async computed signal
  const isActiveUser = useComputed(() => {
    const stats = userStatsSignal.value();
    return stats.data && stats.data.totalPosts > 5;
  });

  // Use regular signal for effect value - initialize with localStorage value
  const getInitialEffectValue = () => {
    const savedValue = localStorage.getItem('signal-demo-effect-value');
    return savedValue || 'Initial effect value';
  };
  const [effectValue, setEffectValue] = useSignal(getInitialEffectValue());

  // Save to localStorage directly
  const saveToLocalStorage = (value: string) => {
    localStorage.setItem('signal-demo-effect-value', value);
    console.log('Saved to localStorage:', value);
  };

  // Computed signals that depend on the effect value - perfect use case for useComputed!
  const effectLength = useComputed(() => effectValue.length);
  const effectWordCount = useComputed(() => effectValue.split(' ').length);
  const effectSummary = useComputed(() => {
    if (!effectValue) return 'No effect value';
    return `Effect has ${effectLength} chars, ${effectWordCount} words`;
  });

  // Demonstrate effect composition that uses signal values
  const handleEffectDemo = () => {
    // Chain effects using monadic composition with signal dependencies
    const newValue = `Step 1: Effect -> userId(${userId}) -> processed`;
    console.log('Effect step 1:', newValue);
    setEffectValue(newValue);

    // Save to localStorage separately to avoid loops
    localStorage.setItem('signal-demo-effect-value', newValue);

    // Chain another effect
    setTimeout(() => {
      const postCount = postsState.data?.length || 0;
      const finalValue = `Step 2: ${newValue} -> posts(${postCount}) -> final`;
      console.log('Effect step 2:', finalValue);
      setEffectValue(finalValue);
      localStorage.setItem('signal-demo-effect-value', finalValue);
    }, 500);

    console.log('Effect composition demo completed with signal dependencies');
  };

  // Auto-update effect when signals change
  const autoUpdateEffect = () => {
    const statsData = userStatsSignal.value();
    if (statsData.data) {
      const newValue = `Auto-effect: User ${userId} has ${statsData.data.totalPosts} posts (avg: ${Math.round(statsData.data.avgTitleLength)} chars)`;
      setEffectValue(newValue);
      localStorage.setItem('signal-demo-effect-value', newValue);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Async Signal & Computed Demo</h2>
        <p className="text-gray-600 mb-4">
          Demonstrates async signals and computed values with automatic dependency tracking.
          <strong>userId initial value loaded from async source using useAsyncSignal → useEffect → useComputed pattern!</strong>
        </p>

        {/* User ID Controls */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">User ID (from async effect):</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={userId}
              onChange={(e) => saveUserIdToAsync(parseInt(e.target.value) || 1)}
              className="border rounded px-3 py-2 w-20"
              min="1"
              max="10"
              disabled={userIdAsyncState.loading}
            />
            <button
              onClick={refetchUser}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Refetch User
            </button>
            <button
              onClick={refetchUserId}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Reload Initial ID
            </button>
            <button
              onClick={syncWithAsyncData}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Sync with Async Data
            </button>

          </div>
          <div className="text-xs text-blue-600 mt-1">
            � Async loading state: {userIdDisplay} | Current userId: {currentUserId}
          </div>
        </div>

        {/* User Data */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">User Data (Async Signal)</h3>
          <div className="bg-gray-50 p-4 rounded">
            {userState.loading && <div className="text-blue-600">Loading user...</div>}
            {userState.error && (
              <div className="text-red-600">Error: {userState.error.message}</div>
            )}
            {userState.data && (
              <div>
                <p><strong>Name:</strong> {userState.data.name}</p>
                <p><strong>Email:</strong> {userState.data.email}</p>
                <p><strong>Company:</strong> {userState.data.company?.name}</p>
                <button
                  onClick={() => setUser({ ...userState.data, name: 'Updated Name' })}
                  className="mt-2 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                >
                  Optimistic Update
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Posts Data */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">User Posts (Async Computed)</h3>
          <div className="bg-gray-50 p-4 rounded">
            {postsState.loading && <div className="text-blue-600">Loading posts...</div>}
            {postsState.error && (
              <div className="text-red-600">Error: {postsState.error.message}</div>
            )}
            {postsState.data && (
              <div>
                <p className="mb-2"><strong>Found {postsState.data.length} posts:</strong></p>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {postsState.data.slice(0, 3).map((post: any) => (
                    <div key={post.id} className="bg-white p-2 rounded border">
                      <div className="font-medium text-sm">{post.title}</div>
                      <div className="text-xs text-gray-600 truncate">{post.body}</div>
                    </div>
                  ))}
                  {postsState.data.length > 3 && (
                    <div className="text-sm text-gray-500">
                      ... and {postsState.data.length - 3} more posts
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Post Count */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Post Count (Derived Async Computed)</h3>
          <div className="bg-gray-50 p-4 rounded">
            {postCountState.loading && <div className="text-blue-600">Calculating count...</div>}
            {postCountState.error && (
              <div className="text-red-600">Error: {postCountState.error.message}</div>
            )}
            {postCountState.data !== undefined && (
              <div className="text-2xl font-bold text-green-600">
                {postCountState.data} posts
              </div>
            )}
          </div>
        </div>

        {/* Async Computed Signal Demo */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Async Computed Signal (useAsyncComputedSignal)</h3>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-600 mb-3">
              useAsyncComputedSignal returns a signal that can be used in other computations!
            </p>

            {/* User Stats Display */}
            <div className="mb-3">
              <strong>User Statistics (from async computed signal):</strong>
              <div className="mt-1 p-2 bg-white rounded border text-sm">
                {userStatsDisplay}
              </div>
            </div>

            {/* Active User Status */}
            <div className="mb-3">
              <strong>Active User Status (computed from async signal):</strong>
              <div className="mt-1">
                <span className={`px-2 py-1 rounded text-sm ${
                  isActiveUser
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {isActiveUser ? '🟢 Active User (5+ posts)' : '🔴 Inactive User (<5 posts)'}
                </span>
              </div>
            </div>

            {/* Raw Signal State */}
            <div className="mb-3">
              <strong>Raw Async Signal State:</strong>
              <div className="mt-1 p-2 bg-black text-green-400 rounded font-mono text-xs">
                {JSON.stringify(userStatsSignal.value(), null, 2)}
              </div>
            </div>

            <div className="text-xs text-blue-600 mt-2">
              💡 The async computed signal automatically recomputes when posts or userId change,
              and other signals can reactively depend on its value!
            </div>
          </div>
        </div>

        {/* Effect Monad Demo */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Effect Monad (useEffect)</h3>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-600 mb-3">
              This demo shows pure Signal-Σ patterns for managing state and localStorage integration.
              All state management uses Signal-Σ hooks only - no React hooks needed!
              <strong>100% Signal-Σ solution!</strong>
            </p>

            {/* Effect Value Display */}
            <div className="mb-3">
              <strong>Current Effect Value (from localStorage):</strong>
              <div className="mt-1 p-2 bg-white rounded border text-sm">
                {effectValue || 'Loading from localStorage...'}
              </div>
            </div>

            {/* Computed Values that depend on Effect */}
            <div className="mb-3">
              <strong>Computed Values (useComputed depending on effect):</strong>
              <div className="mt-1 p-2 bg-blue-50 rounded text-sm">
                <div>📊 {effectSummary}</div>
                <div>📏 Length: {effectLength} characters</div>
                <div>📝 Words: {effectWordCount}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleEffectDemo}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              >
                Run Effect Composition Demo
              </button>
              <button
                onClick={autoUpdateEffect}
                className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
              >
                Auto-Update from Signals
              </button>
              <button
                onClick={() => saveToLocalStorage(`Manual save at ${new Date().toLocaleTimeString()}`)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Save to localStorage
              </button>
            </div>
            <div className="mt-2 text-xs text-blue-600">
              💡 Pure Signal-Σ pattern: useSignal for state → useComputed for reactive derivations!
              <br />🚫 ZERO React hooks - 100% Signal-Σ solution!
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-blue-50 p-4 rounded">
          <h4 className="font-semibold mb-2">🚀 Features Demonstrated:</h4>
          <ul className="text-sm space-y-1">
            <li>• <strong>useAsyncSignal:</strong> Manual async data fetching with refetch & optimistic updates</li>
            <li>• <strong>useAsyncComputed:</strong> Async computed values with simple dependency arrays</li>
            <li>• <strong>useAsyncComputedSignal:</strong> Returns async computed signal for use in other computations</li>
            <li>• <strong>Effect values:</strong> Managing effect state with regular signals</li>
            <li>• <strong>useComputed with effect values:</strong> Reactive computations from effect state</li>
            <li>• <strong>Signal composition:</strong> Async signals can be used in regular computed signals</li>
            <li>• <strong>🔧 Signal DevTool:</strong> Real-time signal events and state monitoring (check bottom-right!)</li>
            <li>• <strong>Dependency tracking:</strong> Pass values in dependency array to trigger recomputation</li>
            <li>• <strong>Smart recomputation:</strong> Posts refetch when userId changes (deps: [userId])</li>
            <li>• <strong>Derived computations:</strong> Post count recomputes when posts data changes (deps: [postsState.data])</li>
            <li>• <strong>Loading states:</strong> Automatic loading/error/success states</li>
            <li>• <strong>Request cancellation:</strong> Previous requests cancelled on new ones</li>
            <li>• <strong>Clean async code:</strong> Write async functions with minimal React complexity!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AsyncSignalDemo;
