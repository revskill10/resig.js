import { useFetch, useSignal, useComputed } from '../../../../src/react/hooks';

// Mock API functions
const mockApi = {
  getUser: async (id: number) => {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    if (Math.random() > 0.8) throw new Error('Network error');
    return { id, name: `User ${id}`, email: `user${id}@example.com`, posts: Math.floor(Math.random() * 10) };
  },
  
  getPosts: async (userId: number) => {
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 800));
    if (Math.random() > 0.9) throw new Error('Posts service unavailable');
    return Array.from({ length: 3 }, (_, i) => ({
      id: i + 1,
      title: `Post ${i + 1} by User ${userId}`,
      content: `This is the content of post ${i + 1}...`
    }));
  }
};

function FetchDemo() {
  const [userId, setUserId] = useSignal(1);
  
  // Fetch user data - React Query replacement!
  const [userState, refetchUser, retryUser] = useFetch(() => mockApi.getUser(userId));
  
  // Fetch posts data - depends on userId automatically
  const [postsState, refetchPosts, retryPosts] = useFetch(() => mockApi.getPosts(userId));
  
  // Computed status messages - NO dependency arrays!
  const userStatus = useComputed(() => {
    if (userState.loading) return 'Loading user...';
    if (userState.error) return `Error: ${userState.error.message}`;
    if (userState.data) return `Loaded: ${userState.data.name}`;
    return 'No data';
  });
  
  const postsStatus = useComputed(() => {
    if (postsState.loading) return 'Loading posts...';
    if (postsState.error) return `Error: ${postsState.error.message}`;
    if (postsState.data) return `Loaded ${postsState.data.length} posts`;
    return 'No data';
  });
  
  const getStatusClass = (state: { loading: boolean; error?: Error }) => {
    if (state.loading) return 'loading';
    if (state.error) return 'error';
    return 'success';
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
            value={userId} 
            onChange={(e) => setUserId(Number(e.target.value))}
            min="1"
            max="10"
          />
        </div>
        <button onClick={() => setUserId(1)}>User 1</button>
        <button onClick={() => setUserId(2)}>User 2</button>
        <button onClick={() => setUserId(3)}>User 3</button>
        <button onClick={() => setUserId(Math.floor(Math.random() * 10) + 1)}>Random User</button>
      </div>
      
      <div>
        <h3>Fetch Status</h3>
        <div className={`status ${getStatusClass(userState)}`}>
          User: {userStatus}
        </div>
        <div className={`status ${getStatusClass(postsState)}`}>
          Posts: {postsStatus}
        </div>
      </div>
      
      <div>
        <h3>User Data</h3>
        {userState.data && (
          <div style={{ 
            padding: '15px', 
            border: '1px solid #ddd', 
            borderRadius: '8px',
            background: '#f8f9fa'
          }}>
            <p><strong>ID:</strong> {userState.data.id}</p>
            <p><strong>Name:</strong> {userState.data.name}</p>
            <p><strong>Email:</strong> {userState.data.email}</p>
            <p><strong>Posts Count:</strong> {userState.data.posts}</p>
          </div>
        )}
        {userState.error && (
          <div style={{ 
            padding: '15px', 
            border: '1px solid #dc3545', 
            borderRadius: '8px',
            background: '#f8d7da',
            color: '#721c24'
          }}>
            <strong>Error:</strong> {userState.error.message}
          </div>
        )}
      </div>
      
      <div>
        <h3>Posts Data</h3>
        {postsState.data && (
          <div>
            {postsState.data.map(post => (
              <div key={post.id} style={{ 
                margin: '10px 0', 
                padding: '15px', 
                border: '1px solid #ddd',
                borderRadius: '8px',
                background: '#f8f9fa'
              }}>
                <h4>{post.title}</h4>
                <p>{post.content}</p>
              </div>
            ))}
          </div>
        )}
        {postsState.error && (
          <div style={{ 
            padding: '15px', 
            border: '1px solid #dc3545', 
            borderRadius: '8px',
            background: '#f8d7da',
            color: '#721c24'
          }}>
            <strong>Error:</strong> {postsState.error.message}
          </div>
        )}
      </div>
      
      <div>
        <h3>Network Operations</h3>
        <button onClick={refetchUser} disabled={userState.loading}>
          Refetch User
        </button>
        <button onClick={refetchPosts} disabled={postsState.loading}>
          Refetch Posts
        </button>
        <button onClick={() => retryUser(3)} disabled={userState.loading}>
          Retry User (3x)
        </button>
        <button onClick={() => retryPosts(3)} disabled={postsState.loading}>
          Retry Posts (3x)
        </button>
        <button onClick={() => { refetchUser(); refetchPosts(); }}>
          Refetch All
        </button>
      </div>
      
      <div>
        <h3>Automatic Dependency Tracking</h3>
        <p>
          Notice how changing the User ID automatically triggers both user and posts fetches.
          This happens without any manual dependency management or useEffect hooks!
        </p>
      </div>
      
      <div>
        <h4>✅ Demonstrates:</h4>
        <ul>
          <li>✨ <strong>React-Query replacement with NO dependency arrays!</strong></li>
          <li>Automatic data fetching with dependency tracking</li>
          <li>Loading, error, and success states</li>
          <li>Retry logic with exponential backoff</li>
          <li>Manual refetch capabilities</li>
          <li>Automatic re-fetching when dependencies change</li>
          <li>Network algebra: fetch, retry, cache operations</li>
        </ul>
      </div>
    </div>
  );
}

export default FetchDemo;
