'use client';

import { useState } from 'react';

type DashboardData = {
  total: number;
  active: number;
  canceled: number;
  churned: number;
};

export default function Dashboard() {
  const [businessId, setBusinessId] = useState('');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    if (!businessId) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/dashboard?businessId=${businessId}`);
      const result = await response.json();
      
      if (response.ok) {
        setData(result);
      } else {
        setError(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      maxWidth: '800px', 
      margin: '50px auto', 
      padding: '20px' 
    }}>
      <h1 style={{ color: '#333', textAlign: 'center' }}>
        🚀 ChurnGuard Dashboard
      </h1>
      
      <div style={{ 
        background: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <h3>Enter Your Business ID:</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={businessId}
            onChange={(e) => setBusinessId(e.target.value)}
            placeholder="Enter your Whop product/plan ID"
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
          <button
            onClick={fetchData}
            disabled={loading || !businessId}
            style={{
              padding: '10px 20px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            {loading ? 'Loading...' : 'Get Stats'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ 
          background: '#ffebee', 
          color: '#c62828', 
          padding: '15px', 
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          ❌ {error}
        </div>
      )}

      {data && (
        <div>
          <h2 style={{ color: '#333' }}>Your Member Stats:</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
            gap: '20px' 
          }}>
            <div style={{ 
              background: 'white', 
              padding: '20px', 
              borderRadius: '8px', 
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#007bff' }}>
                {data.total}
              </div>
              <div style={{ color: '#666' }}>Total Members</div>
            </div>

            <div style={{ 
              background: 'white', 
              padding: '20px', 
              borderRadius: '8px', 
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#28a745' }}>
                {data.active}
              </div>
              <div style={{ color: '#666' }}>Active Members</div>
            </div>

            <div style={{ 
              background: 'white', 
              padding: '20px', 
              borderRadius: '8px', 
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ffc107' }}>
                {data.canceled}
              </div>
              <div style={{ color: '#666' }}>Canceled</div>
            </div>

            <div style={{ 
              background: 'white', 
              padding: '20px', 
              borderRadius: '8px', 
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#dc3545' }}>
                {data.churned}
              </div>
              <div style={{ color: '#666' }}>Churned</div>
            </div>
          </div>

          <div style={{ 
            marginTop: '30px', 
            padding: '20px', 
            background: '#e9ecef', 
            borderRadius: '8px' 
          }}>
            <h3>📊 Summary:</h3>
            <p>You have <strong>{data.total}</strong> total members.</p>
            <p><strong>{data.active}</strong> are currently active ({data.total > 0 ? Math.round((data.active / data.total) * 100) : 0}%).</p>
            <p><strong>{data.churned}</strong> have churned ({data.total > 0 ? Math.round((data.churned / data.total) * 100) : 0}%).</p>
          </div>
        </div>
      )}
    </div>
  );
}
