'use client';

import { useState, useEffect } from 'react';
import '@/app/globals.css'; // Assuming a globals.css with @tailwind directives

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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <div className="font-sans max-w-5xl mx-auto p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 text-center mb-6">
        🚀 ChurnGuard Dashboard
      </h1>
      
      {!businessId && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">Enter Your Business ID:</h3>
          <form onSubmit={handleSubmit} className="flex gap-4">
            <input
              type="text"
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value)}
              placeholder="Enter your Whop product/plan ID"
              className="flex-1 p-3 border border-gray-600 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-gray-200"
            />
            <button
              type="submit"
              disabled={loading || !businessId}
              className="px-6 py-3 bg-blue-600 text-white rounded-md disabled:bg-gray-500 cursor-pointer text-base font-medium hover:bg-blue-700 transition"
            >
              {loading ? 'Loading...' : 'Get Stats'}
            </button>
          </form>
        </div>
      )}

      {businessId && (
        <div className="bg-gray-800 p-4 rounded-lg mb-6 text-center border border-gray-700">
          <strong className="text-blue-300">📊 Viewing Dashboard for Business ID: {businessId}</strong>
          <br />
          <small className="text-gray-400">Bookmark this page to access your dashboard anytime!</small>
        </div>
      )}

      {error && (
        <div className="bg-red-900 text-red-200 p-4 rounded-md mb-6 border border-red-700">
          ❌ {error}
        </div>
      )}

      {data && (
        <div>
          <h2 className="text-2xl font-bold text-gray-200 mb-6">Your Member Stats:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center border border-blue-900 hover:shadow-lg transition">
              <div className="text-4xl font-bold text-blue-400 mb-2">{data.total}</div>
              <div className="text-gray-400 text-sm">Total Members</div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center border border-green-900 hover:shadow-lg transition">
              <div className="text-4xl font-bold text-green-400 mb-2">{data.active}</div>
              <div className="text-gray-400 text-sm">Active Members</div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center border border-yellow-900 hover:shadow-lg transition">
              <div className="text-4xl font-bold text-yellow-400 mb-2">{data.canceled}</div>
              <div className="text-gray-400 text-sm">Canceled</div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center border border-red-900 hover:shadow-lg transition">
              <div className="text-4xl font-bold text-red-400 mb-2">{data.churned}</div>
              <div className="text-gray-400 text-sm">Churned</div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center border-2 border-yellow-700 hover:shadow-lg transition">
              <div className="text-4xl font-bold text-yellow-400 mb-2">{data.atRisk}</div>
              <div className="text-gray-400 text-sm">🚨 At Risk</div>
            </div>
          </div>

          {data.atRisk > 0 && (
            <div className="bg-gray-800 p-6 rounded-lg mb-8 border-2 border-yellow-700 shadow-md">
              <h3 className="text-xl font-bold text-yellow-300 mb-4">🚨 CHURN ALERTS - Action Required!</h3>
              <p className="text-yellow-300 font-semibold mb-4">
                {data.atRisk} member{data.atRisk > 1 ? 's are' : ' is'} at risk of churning!
              </p>
              
              <div className="space-y-2">
                {data.atRiskMembers.map((member, index) => (
                  <div key={index} className="bg-gray-700 p-4 rounded-md border border-yellow-600 hover:bg-gray-600 transition">
                    <div className="font-medium text-gray-200">{member.name || member.email || member.whopUserId}</div>
                    <div className="text-red-400 text-sm">⚠️ {member.riskReason}</div>
                    {member.lastActiveAt && (
                      <div className="text-gray-500 text-xs">
                        Last active: {new Date(member.lastActiveAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-4 bg-red-900 rounded-md border border-red-700 text-red-200 shadow-inner">
                <strong>💡 ACTION NEEDED:</strong> Reach out to these members immediately! 
                Send them retention emails, offer discounts, or personally contact them.
              </div>
            </div>
          )}

          {/* Recent Cancellations */}
          {data.recentCancellations.length > 0 && (
            <div className="bg-gray-800 p-6 rounded-lg mb-8 shadow-md">
              <h3 className="text-xl font-bold text-gray-200 mb-4">📋 Recent Cancellations (Last 10):</h3>
              <div className="space-y-2">
                {data.recentCancellations.map((member, index) => (
                  <div key={index} className="bg-gray-700 p-4 rounded-md border border-gray-600 hover:bg-gray-600 transition">
                    <div className="font-medium text-gray-200">{member.name || member.email || member.whopUserId}</div>
                    <div className="text-gray-400 text-sm">
                      Canceled: {new Date(member.updatedAt).toLocaleDateString()}
                    </div>
                    {member.exitSurveyReason && (
                      <div className="text-blue-400 text-sm mt-1">
                        💬 Reason: {member.exitSurveyReason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Survey Reason Breakdown */}
          {data.surveyReasons.length > 0 && (
            <div className="bg-gray-800 p-6 rounded-lg mb-8 shadow-md">
              <h3 className="text-xl font-bold text-green-300 mb-4">📊 Exit Survey Results:</h3>
              <p className="text-green-300 mb-4">Why members are leaving:</p>
              <div className="space-y-2">
                {data.surveyReasons.map((reason, index) => (
                  <div key={index} className="bg-gray-700 p-4 rounded-md border border-green-600 flex justify-between items-center hover:bg-gray-600 transition">
                    <strong className="text-gray-200">{reason.exitSurveyReason}</strong>
                    <span className="text-green-400 font-bold">
                      {reason._count} member{reason._count > 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-200 mb-4">📊 Summary:</h3>
            <p className="text-gray-300">You have <strong>{data.total}</strong> total members.</p>
            <p className="text-gray-300"><strong>{data.active}</strong> are currently active ({data.total > 0 ? Math.round((data.active / data.total) * 100) : 0}%).</p>
            <p className="text-gray-300"><strong>{data.churned}</strong> have churned ({data.total > 0 ? Math.round((data.churned / data.total) * 100) : 0}%).</p>
            {data.atRisk > 0 && (
              <p className="text-yellow-400 font-bold">
                🚨 <strong>{data.atRisk}</strong> member{data.atRisk > 1 ? 's are' : ' is'} at risk - ACT NOW!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
