'use client';

import { useState, useEffect } from 'react';

type AtRiskMember = {
  whopUserId: string;
  email: string | null;
  name: string | null;
  riskReason: string | null;
  lastActiveAt: string | null;
};

type RecentCancellation = {
  whopUserId: string;
  email: string | null;
  name: string | null;
  exitSurveyReason: string | null;
  updatedAt: string;
};

type SurveyReason = {
  exitSurveyReason: string;
  _count: number;
};

type DashboardData = {
  total: number;
  active: number;
  canceled: number;
  churned: number;
  atRisk: number;
  atRiskMembers: AtRiskMember[];
  recentCancellations: RecentCancellation[];
  surveyReasons: SurveyReason[];
};

export default function Dashboard() {
  const [businessId, setBusinessId] = useState('');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-load businessId from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('businessId');
    if (id) {
      setBusinessId(id);
      fetchData(id);
    }
  }, []);

  const fetchData = async (id?: string) => {
    const targetId = id || businessId;
    if (!targetId) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/dashboard?businessId=${targetId}`);
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
      
      {!businessId && (
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
              onClick={() => fetchData()}
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
      )}

      {businessId && (
        <div style={{ 
          background: '#e8f5e8', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <strong>📊 Viewing Dashboard for Business ID: {businessId}</strong>
          <br />
          <small>Bookmark this page to access your dashboard anytime!</small>
        </div>
      )}

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

            <div style={{ 
              background: 'white', 
              padding: '20px', 
              borderRadius: '8px', 
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              textAlign: 'center',
              border: data.atRisk > 0 ? '3px solid #ffc107' : '1px solid #e0e0e0'
            }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ffc107' }}>
                {data.atRisk}
              </div>
              <div style={{ color: '#666' }}>🚨 At Risk</div>
            </div>
          </div>

          {data.atRisk > 0 && (
            <div style={{ 
              marginTop: '30px', 
              padding: '20px', 
              background: '#fff3cd', 
              border: '2px solid #ffc107',
              borderRadius: '8px' 
            }}>
              <h3 style={{ color: '#856404', marginTop: 0 }}>🚨 CHURN ALERTS - Action Required!</h3>
              <p style={{ color: '#856404', fontWeight: 'bold' }}>
                {data.atRisk} member{data.atRisk > 1 ? 's are' : ' is'} at risk of churning!
              </p>
              
              <div style={{ marginTop: '15px' }}>
                {data.atRiskMembers.map((member, index) => (
                  <div key={index} style={{ 
                    background: 'white', 
                    padding: '10px', 
                    margin: '5px 0', 
                    borderRadius: '4px',
                    border: '1px solid #ffc107'
                  }}>
                    <strong>{member.name || member.email || member.whopUserId}</strong>
                    <br />
                    <span style={{ color: '#dc3545' }}>⚠️ {member.riskReason}</span>
                    {member.lastActiveAt && (
                      <>
                        <br />
                        <small style={{ color: '#666' }}>
                          Last active: {new Date(member.lastActiveAt).toLocaleDateString()}
                        </small>
                      </>
                    )}
                  </div>
                ))}
              </div>
              
              <div style={{ 
                marginTop: '15px', 
                padding: '10px', 
                background: '#f8d7da', 
                borderRadius: '4px',
                border: '1px solid #f5c6cb'
              }}>
                <strong>💡 ACTION NEEDED:</strong> Reach out to these members immediately! 
                Send them retention emails, offer discounts, or personally contact them.
              </div>
            </div>
          )}

          {/* Recent Cancellations */}
          {data.recentCancellations.length > 0 && (
            <div style={{ 
              marginTop: '30px', 
              padding: '20px', 
              background: '#f8f9fa', 
              borderRadius: '8px' 
            }}>
              <h3>📋 Recent Cancellations (Last 10):</h3>
              <div style={{ marginTop: '15px' }}>
                {data.recentCancellations.map((member, index) => (
                  <div key={index} style={{ 
                    background: 'white', 
                    padding: '10px', 
                    margin: '5px 0', 
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}>
                    <strong>{member.name || member.email || member.whopUserId}</strong>
                    <br />
                    <small style={{ color: '#666' }}>
                      Canceled: {new Date(member.updatedAt).toLocaleDateString()}
                    </small>
                    {member.exitSurveyReason && (
                      <>
                        <br />
                        <span style={{ color: '#007bff' }}>
                          💬 Reason: {member.exitSurveyReason}
                        </span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Survey Reason Breakdown */}
          {data.surveyReasons.length > 0 && (
            <div style={{ 
              marginTop: '30px', 
              padding: '20px', 
              background: '#e8f5e8', 
              borderRadius: '8px' 
            }}>
              <h3>📊 Exit Survey Results:</h3>
              <p>Why members are leaving:</p>
              <div style={{ marginTop: '15px' }}>
                {data.surveyReasons.map((reason, index) => (
                  <div key={index} style={{ 
                    background: 'white', 
                    padding: '10px', 
                    margin: '5px 0', 
                    borderRadius: '4px',
                    border: '1px solid #28a745'
                  }}>
                    <strong>{reason.exitSurveyReason}</strong>
                    <span style={{ float: 'right', color: '#28a745', fontWeight: 'bold' }}>
                      {reason._count} member{reason._count > 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

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
            {data.atRisk > 0 && (
              <p style={{ color: '#ffc107', fontWeight: 'bold' }}>
                🚨 <strong>{data.atRisk}</strong> member{data.atRisk > 1 ? 's are' : ' is'} at risk - ACT NOW!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
