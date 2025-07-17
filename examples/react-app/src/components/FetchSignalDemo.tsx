import { use, fetch$, computed } from 'resig.js';

// Mock API functions for demonstration
const mockApi = {
  getUser: async (id: number) => {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    if (Math.random() > 0.8) throw new Error('Network error');
    return { id, name: `User ${id}`, email: `user${id}@example.com` };
  },
  
  getPosts: async (userId: number) => {
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 800));
    if (Math.random() > 0.9) throw new Error('Posts service unavailable');
    return [
      { id: 1, title: `Post 1 by User ${userId}`, content: 'Lorem ipsum...' },
      { id: 2, title: `Post 2 by User ${userId}`, content: 'Dolor sit amet...' }
    ];
  }
};

function FetchSignalDemo() {
  const userId = use(1);

  // Fetch user data - NO dependency arrays!
  const userFetch = fetch$(() => mockApi.getUser(userId.value()));

  // Fetch posts data - automatic dependency tracking
  const postsFetch = fetch$(() => mockApi.getPosts(userId.value()));

  // Computed signals for display - NO dependency arrays!
  const userStatus = computed(() => {
    const state = userFetch.value();
    if (state.loading) return 'Loading user...';
    if (state.error) return `Error: ${state.error.message}`;
    if (state.data) return `Loaded: ${state.data.name}`;
    return 'No data';
  });

  const postsStatus = computed(() => {
    const state = postsFetch.value();
    if (state.loading) return 'Loading posts...';
    if (state.error) return `Error: ${state.error.message}`;
    if (state.data) return `Loaded ${state.data.length} posts`;
    return 'No data';
  });
  
  const retryUser = () => {
    const retryFetch = userFetch.retry(3);
    retryFetch.subscribe((state) => {
      console.log('Retry attempt:', state);
    });
  };
  
  const cacheUser = () => {
    const cachedFetch = userFetch.cache(`user_${userId.value()}`, 30000); // 30s cache
    cachedFetch.subscribe((state) => {
      console.log('Cached result:', state);
    });
  };
  
  const refetchData = () => {
    userFetch.refetch();
    postsFetch.refetch();
  };
  
  return (
    <div className="demo-section">
      <h2>🌐 Network Algebra (React-Query replacement)</h2>
      
      <div>
        <h3>User Selection</h3>
        <div>
          <label>User ID: </label>
          <input 
            type="number" 
            value={userId.value()} 
            onChange={(e) => userId.set(Number(e.target.value))}
            min="1"
            max="10"
          />
        </div>
        <button onClick={() => userId.set(1)}>User 1</button>
        <button onClick={() => userId.set(2)}>User 2</button>
        <button onClick={() => userId.set(3)}>User 3</button>
      </div>
      
      <div>
        <h3>Fetch Status</h3>
        <div className={`status ${userFetch.value().loading ? 'loading' : userFetch.value().error ? 'error' : 'success'}`}>
          User: {userStatus.value()}
        </div>
        <div className={`status ${postsFetch.value().loading ? 'loading' : postsFetch.value().error ? 'error' : 'success'}`}>
          Posts: {postsStatus.value()}
        </div>
      </div>
      
      <div>
        <h3>User Data</h3>
        {userFetch.value().data && (
          <div>
            <p><strong>Name:</strong> {userFetch.value().data!.name}</p>
            <p><strong>Email:</strong> {userFetch.value().data!.email}</p>
          </div>
        )}
      </div>
      
      <div>
        <h3>Posts Data</h3>
        {postsFetch.value().data && (
          <div>
            {postsFetch.value().data!.map(post => (
              <div key={post.id} style={{ margin: '10px 0', padding: '10px', border: '1px solid #ddd' }}>
                <h4>{post.title}</h4>
                <p>{post.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div>
        <h3>Network Operations</h3>
        <button onClick={retryUser}>Retry User (3x)</button>
        <button onClick={cacheUser}>Cache User (30s)</button>
        <button onClick={refetchData}>Refetch All</button>
        <p><em>Check console for operation details</em></p>
      </div>
      
      <div>
        <h4>✅ Demonstrates:</h4>
        <ul>
          <li>✨ <strong>NO dependency arrays!</strong> - Pure network algebra</li>
          <li>Automatic data fetching with dependency tracking</li>
          <li>Loading, error, and success states</li>
          <li>Retry logic with exponential backoff</li>
          <li>Caching with TTL (time-to-live)</li>
          <li>Manual refetch capabilities</li>
          <li>Network algebra: fetch, retry, cache operations</li>
        </ul>
      </div>
    </div>
  );
}

export default FetchSignalDemo;
