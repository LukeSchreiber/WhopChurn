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

export default function TestDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await fetch('/api/dashboard?businessId=fitness_pro_123');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const dashboardData = await response.json();
        setData(dashboardData);
        setError('');
      } catch (err) {
        console.error('Error loading dashboard:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        fontFamily: 'Arial, sans-serif', 
        maxWidth: '800px', 
        margin: '50px auto', 
        padding: '20px',
        textAlign: 'center'
      }}>
        <h1>🚀 ChurnGuard Dashboard - FitnessMaster Pro</h1>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        fontFamily: 'Arial, sans-serif', 
        maxWidth: '800px', 
        margin: '50px auto', 
        padding: '20px'
      }}>
        <h1>🚀 ChurnGuard Dashboard - FitnessMaster Pro</h1>
        <div style={{
          color: '#dc3545',
          background: '#f8d7da',
          padding: '10px',
          borderRadius: '4px',
          border: '1px solid #f5c6cb'
        }}>
          Error: {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ 
        fontFamily: 'Arial, sans-serif', 
        maxWidth: '800px', 
        margin: '50px auto', 
        padding: '20px'
      }}>
        <h1>🚀 ChurnGuard Dashboard - FitnessMaster Pro</h1>
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      maxWidth: '800px', 
      margin: '50px auto', 
      padding: '20px',
      backgroundColor: '#f8f9fa'
    }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>
        🚀 ChurnGuard Dashboard - FitnessMaster Pro
      </h1>
      
      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '20px',
        margin: '20px 0'
      }}>
        <div style={{
          background: '#fff',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center',
          borderLeft: '4px solid #007bff'
        }}>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#007bff' }}>
            {data.total}
          </div>
          <div style={{ color: '#666', marginTop: '5px' }}>Total Members</div>
        </div>
        
        <div style={{
          background: '#fff',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center',
          borderLeft: '4px solid #28a745'
        }}>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#28a745' }}>
            {data.active}
          </div>
          <div style={{ color: '#666', marginTop: '5px' }}>Active Members</div>
        </div>
        
        <div style={{
          background: '#fff',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center',
          borderLeft: '4px solid #ffc107'
        }}>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#ffc107' }}>
            {data.atRisk}
          </div>
          <div style={{ color: '#666', marginTop: '5px' }}>At Risk</div>
        </div>
        
        <div style={{
          background: '#fff',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center',
          borderLeft: '4px solid #dc3545'
        }}>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#dc3545' }}>
            {data.churned}
          </div>
          <div style={{ color: '#666', marginTop: '5px' }}>Churned</div>
        </div>
      </div>

      {/* At-Risk Members */}
      <div style={{ margin: '30px 0' }}>
        <h3 style={{ color: '#333', borderBottom: '2px solid #ffc107', paddingBottom: '10px' }}>
          🚨 At-Risk Members
        </h3>
        {data.atRiskMembers.length > 0 ? (
          data.atRiskMembers.map((member, index) => (
            <div key={index} style={{
              background: '#fff',
              padding: '15px',
              borderRadius: '8px',
              margin: '10px 0',
              borderLeft: '4px solid #ffc107'
            }}>
              <strong>{member.name || 'Unknown'}</strong> ({member.email || 'No email'})<br />
              <small style={{ color: '#666' }}>Risk: {member.riskReason || 'Unknown'}</small>
            </div>
          ))
        ) : (
          <p>No at-risk members</p>
        )}
      </div>

      {/* Recent Cancellations */}
      <div style={{ margin: '30px 0' }}>
        <h3 style={{ color: '#333', borderBottom: '2px solid #dc3545', paddingBottom: '10px' }}>
          📋 Recent Cancellations
        </h3>
        {data.recentCancellations.length > 0 ? (
          data.recentCancellations.map((cancel, index) => (
            <div key={index} style={{
              background: '#fff',
              padding: '15px',
              borderRadius: '8px',
              margin: '10px 0',
              borderLeft: '4px solid #dc3545'
            }}>
              <strong>{cancel.name || 'Unknown'}</strong> ({cancel.email || 'No email'})<br />
              <small style={{ color: '#666' }}>
                Reason: {cancel.exitSurveyReason || 'No reason provided'}
              </small>
            </div>
          ))
        ) : (
          <p>No recent cancellations</p>
        )}
      </div>

      {/* Survey Results */}
      <div style={{ margin: '30px 0' }}>
        <h3 style={{ color: '#333', borderBottom: '2px solid #007bff', paddingBottom: '10px' }}>
          📊 Exit Survey Results
        </h3>
        {data.surveyReasons.length > 0 ? (
          data.surveyReasons.map((reason, index) => (
            <div key={index} style={{
              background: '#fff',
              padding: '15px',
              borderRadius: '8px',
              margin: '10px 0',
              borderLeft: '4px solid #007bff'
            }}>
              <strong>{reason.exitSurveyReason}</strong> ({reason._count} member{reason._count > 1 ? 's' : ''})
            </div>
          ))
        ) : (
          <p>No survey responses yet</p>
        )}
      </div>

      {/* Demo Info */}
      <div style={{
        background: '#e7f3ff',
        padding: '20px',
        borderRadius: '8px',
        margin: '30px 0',
        border: '1px solid #b3d9ff'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🎭 Demo Scenario</h4>
        <p style={{ margin: '0', color: '#333' }}>
          This is FitnessMaster Pro, owned by Sarah Johnson. She has 7 members with a 43% churn rate. 
          ChurnGuard is helping her identify at-risk members and collect feedback from those who leave.
        </p>
      </div>
    </div>
  );
}
