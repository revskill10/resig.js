import {
  useSignal,
  useComputed,
  useDebouncedSignal,
  useValidatedSignal,
  usePersistentSignal
} from '../../../../src/react/hooks';

function AdvancedDemo() {
  // Debounced signal for search
  const [searchImmediate, setSearch, searchDebounced] = useDebouncedSignal('', 300);
  
  // Validated signal for email
  const [email, setEmail, isEmailValid] = useValidatedSignal(
    '',
    (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    (invalidEmail) => console.log('Invalid email:', invalidEmail)
  );
  
  // Persistent signal for user preferences
  const [theme, setTheme] = usePersistentSignal('theme', 'light');
  const [fontSize, setFontSize] = usePersistentSignal('fontSize', 16);
  
  // Multiple signals for combination
  const [firstName, setFirstName] = useSignal('John');
  const [lastName, setLastName] = useSignal('Doe');
  const [age, setAge] = useSignal(25);
  
  // Combined signal - automatically tracks all dependencies
  const userProfile = useComputed(() => [firstName, lastName, age] as const);
  
  // Complex computed signal
  const searchResults = useComputed(() => {
    if (!searchDebounced) return [];
    
    const mockData = [
      'Apple', 'Banana', 'Cherry', 'Date', 'Elderberry',
      'Fig', 'Grape', 'Honeydew', 'Kiwi', 'Lemon'
    ];
    
    return mockData.filter(item => 
      item.toLowerCase().includes(searchDebounced.toLowerCase())
    );
  });
  
  // Computed validation status
  const formValid = useComputed(() => {
    return isEmailValid && firstName.length > 0 && lastName.length > 0;
  });
  
  // Theme styles
  const themeStyles = useComputed(() => ({
    backgroundColor: theme === 'dark' ? '#2d3748' : '#ffffff',
    color: theme === 'dark' ? '#ffffff' : '#000000',
    fontSize: `${fontSize}px`,
    padding: '20px',
    borderRadius: '8px',
    border: `1px solid ${theme === 'dark' ? '#4a5568' : '#e2e8f0'}`
  }));
  
  return (
    <div className="demo-section">
      <h2>🚀 Advanced Signal Features</h2>
      
      <div style={themeStyles}>
        <h3>Theme & Persistence Demo</h3>
        <p>This section uses persistent signals that save to localStorage!</p>
        
        <div>
          <label>Theme: </label>
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        
        <div>
          <label>Font Size: </label>
          <input 
            type="range" 
            min="12" 
            max="24" 
            value={fontSize} 
            onChange={(e) => setFontSize(Number(e.target.value))}
          />
          <span> {fontSize}px</span>
        </div>
      </div>
      
      <div>
        <h3>Debounced Search</h3>
        <input 
          type="text"
          value={searchImmediate}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search fruits..."
          style={{ width: '100%', padding: '8px' }}
        />
        <p>Immediate: <strong>{searchImmediate}</strong></p>
        <p>Debounced (300ms): <strong>{searchDebounced}</strong></p>
        
        <div>
          <h4>Search Results:</h4>
          {searchResults.length > 0 ? (
            <ul>
              {searchResults.map(result => (
                <li key={result}>{result}</li>
              ))}
            </ul>
          ) : (
            <p><em>No results found</em></p>
          )}
        </div>
      </div>
      
      <div>
        <h3>Validated Email Input</h3>
        <input 
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email..."
          style={{ 
            width: '100%', 
            padding: '8px',
            border: `2px solid ${isEmailValid ? '#28a745' : '#dc3545'}`,
            borderRadius: '4px'
          }}
        />
        <p>
          Status: 
          <span style={{ 
            color: isEmailValid ? '#28a745' : '#dc3545',
            fontWeight: 'bold'
          }}>
            {isEmailValid ? ' ✓ Valid' : ' ✗ Invalid'}
          </span>
        </p>
      </div>
      
      <div>
        <h3>Combined Signals</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          <div>
            <label>First Name:</label>
            <input 
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <label>Last Name:</label>
            <input 
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div>
            <label>Age:</label>
            <input 
              type="number"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
            />
          </div>
        </div>
        
        <div style={{ 
          marginTop: '15px',
          padding: '15px',
          background: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <h4>Combined Profile:</h4>
          <p><strong>Name:</strong> {userProfile[0]} {userProfile[1]}</p>
          <p><strong>Age:</strong> {userProfile[2]}</p>
          <p><strong>Full:</strong> {userProfile[0]} {userProfile[1]}, {userProfile[2]} years old</p>
        </div>
      </div>
      
      <div>
        <h3>Form Validation</h3>
        <div style={{ 
          padding: '15px',
          background: formValid ? '#d4edda' : '#f8d7da',
          color: formValid ? '#155724' : '#721c24',
          borderRadius: '8px'
        }}>
          <p>
            <strong>Form Status:</strong> {formValid ? '✓ Valid' : '✗ Invalid'}
          </p>
          <p>
            All fields must be filled and email must be valid.
          </p>
        </div>
      </div>
      
      <div>
        <h4>✅ Demonstrates:</h4>
        <ul>
          <li>✨ <strong>Debounced signals</strong> - Automatic delay without useEffect</li>
          <li>✨ <strong>Validated signals</strong> - Real-time validation</li>
          <li>✨ <strong>Persistent signals</strong> - Automatic localStorage sync</li>
          <li>✨ <strong>Combined signals</strong> - Multiple signal composition</li>
          <li>Complex computed values with multiple dependencies</li>
          <li>Real-time form validation</li>
          <li>Theme switching with persistence</li>
          <li>Search with debouncing</li>
        </ul>
      </div>
    </div>
  );
}

export default AdvancedDemo;
