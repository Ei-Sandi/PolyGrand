import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function TestApp() {
  console.log('App component rendering...');
  
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>PolyGrand Test</h1>
      <p>If you see this, React is working!</p>
      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <h2>Debug Info:</h2>
        <ul>
          <li>React: ✓ Loaded</li>
          <li>Router: ✓ Loaded</li>
          <li>QueryClient: ✓ Loaded</li>
        </ul>
      </div>
    </div>
  );
}

function App() {
  console.log('App wrapper rendering...');
  
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<TestApp />} />
          <Route path="*" element={<TestApp />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
