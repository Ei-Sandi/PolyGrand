// Minimal test component
export default function MinimalTest() {
  console.log('MinimalTest component rendering');
  
  return (
    <div style={{
      padding: '40px',
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#00dc94', fontSize: '48px', marginBottom: '20px' }}>
        PolyGrand Is Working! ✅
      </h1>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2>Debug Information:</h2>
        <ul style={{ fontSize: '18px', lineHeight: '1.8' }}>
          <li>✓ React is rendering</li>
          <li>✓ Vite is serving files</li>
          <li>✓ TypeScript is compiling</li>
          <li>✓ Inline styles are working</li>
        </ul>
        <p style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
          <strong>Next step:</strong> Check browser console (F12) for any errors or warnings.
        </p>
      </div>
    </div>
  );
}
