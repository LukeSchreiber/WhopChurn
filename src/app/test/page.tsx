'use client';

import { useState, useEffect } from 'react';
import '@/app/globals.css'; // Standard path for Next.js app dir

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
    <div className="font-sans max-w-5xl mx-auto p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold text-gray-200 text-center mb-8">
        🚀 ChurnGuard Dashboard - FitnessMaster Pro
      </h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center border-l-4 border-blue-600 hover:shadow-lg transition">
          <div className="text-4xl font-bold text-blue-400 mb-1">{data.total}</div>
          <div className="text-gray-400 text-sm">Total Members</div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center border-l-4 border-green-600 hover:shadow-lg transition">
          <div className="text-4xl font-bold text-green-400 mb-1">{data.active}</div>
          <div className="text-gray-400 text-sm">Active Members</div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center border-l-4 border-yellow-600 hover:shadow-lg transition">
          <div className="text-4xl font-bold text-yellow-400 mb-1">{data.atRisk}</div>
          <div className="text-gray-400 text-sm">At Risk</div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center border-l-4 border-red-600 hover:shadow-lg transition">
          <div className="text-4xl font-bold text-red-400 mb-1">{data.churned}</div>
          <div className="text-gray-400 text-sm">Churned</div>
        </div>
      </div>

      {/* At-Risk Members */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-200 mb-4 border-b-2 border-yellow-600 pb-2">
          🚨 At-Risk Members
        </h3>
        {data.atRiskMembers.length > 0 ? (
          <div className="space-y-4">
            {data.atRiskMembers.map((member, index) => (
              <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-md border-l-4 border-yellow-600 hover:bg-gray-700 transition">
                <strong className="text-gray-200">{member.name || 'Unknown'}</strong> ({member.email || 'No email'})<br />
                <small className="text-gray-400">Risk: {member.riskReason || 'Unknown'}</small>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No at-risk members</p>
        )}
      </div>

      {/* Recent Cancellations */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-200 mb-4 border-b-2 border-red-600 pb-2">
          📋 Recent Cancellations
        </h3>
        {data.recentCancellations.length > 0 ? (
          <div className="space-y-4">
            {data.recentCancellations.map((cancel, index) => (
              <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-md border-l-4 border-red-600 hover:bg-gray-700 transition">
                <strong className="text-gray-200">{cancel.name || 'Unknown'}</strong> ({cancel.email || 'No email'})<br />
                <small className="text-gray-400">
                  Reason: {cancel.exitSurveyReason || 'No reason provided'}
                </small>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No recent cancellations</p>
        )}
      </div>

      {/* Survey Results */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-200 mb-4 border-b-2 border-blue-600 pb-2">
          📊 Exit Survey Results
        </h3>
        {data.surveyReasons.length > 0 ? (
          <div className="space-y-4">
            {data.surveyReasons.map((reason, index) => (
              <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-md border-l-4 border-blue-600 hover:bg-gray-700 transition">
                <strong className="text-gray-200">{reason.exitSurveyReason}</strong> ({reason._count} member{reason._count > 1 ? 's' : ''})
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No survey responses yet</p>
        )}
      </div>

      {/* Demo Info */}
      <div className="bg-gray-800 p-6 rounded-lg border border-blue-900 shadow-md">
        <h4 className="text-lg font-semibold text-blue-400 mb-2">🎭 Demo Scenario</h4>
        <p className="text-gray-300">
          This is FitnessMaster Pro, owned by Sarah Johnson. She has 7 members with a 43% churn rate. 
          ChurnGuard is helping her identify at-risk members and collect feedback from those who leave.
        </p>
      </div>
    </div>
  );
}
