import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import Layout from './components/Layout.tsx';
import Home from './pages/Home.tsx';
// import Markets from './pages/Markets.tsx';
// import MarketDetail from './pages/MarketDetail.tsx';
// import Profile from './pages/Profile.tsx';
// import CreateMarket from './pages/CreateMarket.tsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  console.log('=== PolyGrand App Starting ===');
  
  try {
    return (
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </Router>
      </QueryClientProvider>
    );
  } catch (error) {
    console.error('App Error:', error);
    return <div style={{ padding: '20px', color: 'red' }}>Error loading app: {String(error)}</div>;
  }
}

export default App;

