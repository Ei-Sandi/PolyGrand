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
  
  return (
    <div style={{ 
      padding: '40px', 
      backgroundColor: '#f0f0f0',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          color: '#00dc94', 
          fontSize: '48px',
          fontWeight: 'bold',
          marginBottom: '10px',
          borderBottom: '3px solid #00dc94',
          paddingBottom: '10px'
        }}>
          🎯 PolyGrand
        </h1>
        <p style={{ 
          color: '#666', 
          fontSize: '20px',
          marginBottom: '30px'
        }}>
          Prediction Markets on Algorand
        </p>
        
        <QueryClientProvider client={queryClient}>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
            </Routes>
          </Router>
        </QueryClientProvider>
      </div>
    </div>
  );
}

export default App;

