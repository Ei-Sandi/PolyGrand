import { useQuery } from '@tanstack/react-query';
import { getMarkets, getPlatformStats } from '../services/api';

export default function Home() {
  const { data: markets, isLoading } = useQuery({
    queryKey: ['markets'],
    queryFn: getMarkets,
  });

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: getPlatformStats,
  });

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '20px' }}>
        PolyGrand Prediction Markets
      </h1>
      
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '15px' }}>Platform Stats</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats?.totalMarkets || 0}</div>
            <div style={{ color: '#666' }}>Total Markets</div>
          </div>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>${stats?.totalVolume ? (stats.totalVolume / 1000000).toFixed(1) : 0}M</div>
            <div style={{ color: '#666' }}>Total Volume</div>
          </div>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats?.activeUsers || 0}</div>
            <div style={{ color: '#666' }}>Active Users</div>
          </div>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats?.resolvedMarkets || 0}</div>
            <div style={{ color: '#666' }}>Resolved Markets</div>
          </div>
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: '24px', marginBottom: '15px' }}>Markets</h2>
        {isLoading ? (
          <div>Loading markets...</div>
        ) : markets && markets.length > 0 ? (
          <div>Found {markets.length} markets</div>
        ) : (
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>No markets yet</h3>
            <p style={{ color: '#666' }}>Create the first prediction market!</p>
          </div>
        )}
      </div>
    </div>
  );
}
