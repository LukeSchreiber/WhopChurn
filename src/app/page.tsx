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

  const [atRiskMembers, setAtRiskMembers] = useState<AtRiskMember[]>([]);
  const [recentCancels, setRecentCancels] = useState<RecentCancellation[]>([]);
  const [actionMsg, setActionMsg] = useState('');

  // Auto-load businessId from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('businessId');
    if (id) {
      setBusinessId(id);
      // Require user to click Get Stats to load
    }
  }, []);

  const fetchData = async (id?: string) => {
    const targetId = id || businessId;
    if (!targetId) return;
    
    setLoading(true);
    setError('');
    setActionMsg('');
    
    try {
      const [statsRes, riskRes, cancelsRes] = await Promise.all([
        fetch(`/api/dashboard?businessId=${targetId}`),
        fetch(`/api/at-risk?businessId=${targetId}&limit=50`),
        fetch(`/api/recent-cancels?businessId=${targetId}`),
      ]);
      const statsJson = await statsRes.json();
      const riskJson = await riskRes.json();
      const cancelsJson = await cancelsRes.json();

      if (statsRes.ok) setData(statsJson); else setError(statsJson.error || 'Failed to fetch stats');
      if (riskRes.ok) setAtRiskMembers(riskJson.atRiskMembers || []);
      if (cancelsRes.ok) setRecentCancels(cancelsJson.recentCancels || []);
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

  const messageMember = async (memberId: string) => {
    try {
      const res = await fetch('/api/actions/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, businessId }),
      });
      const json = await res.json();
      if (res.ok && json.success) setActionMsg(`Messaged ${memberId} at ${json.timestamp}`);
      else setActionMsg(json.error || 'Failed to send message');
    } catch {
      setActionMsg('Failed to send message');
    }
  };

  const recoverMember = async (memberId: string) => {
    try {
      const res = await fetch('/api/actions/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, businessId }),
      });
      const json = await res.json();
      if (res.ok && json.success) setActionMsg(`Recovery sent to ${memberId} at ${json.timestamp}`);
      else setActionMsg(json.error || 'Failed to send recovery');
    } catch {
      setActionMsg('Failed to send recovery');
    }
  };

  return (
    <div className="font-sans max-w-5xl mx-auto p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 text-center mb-6">
        🚀 ChurnGuard Dashboard
      </h1>
      
      {/* Input is always visible; only fetch on submit */}
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

      {businessId && (
        <div className="bg-gray-800 p-4 rounded-lg mb-6 text-center border border-gray-700">
          <strong className="text-blue-300">📊 Viewing Dashboard for Business ID: {businessId}</strong>
          <br />
          <small className="text-gray-400">Click &quot;Get Stats&quot; to load data</small>
        </div>
      )}

      {actionMsg && (
        <div className="bg-gray-800 p-3 rounded-md mb-4 border border-gray-700 text-gray-300">{actionMsg}</div>
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
              <div className="text-4xl font-bold text-yellow-400 mb-2">{atRiskMembers.length}</div>
              <div className="text-gray-400 text-sm">🚨 At Risk</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: At-Risk Members */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-yellow-700">
              <h3 className="text-xl font-bold text-yellow-300 mb-4">🚨 At-Risk Members</h3>
              {atRiskMembers.length === 0 ? (
                <div className="text-gray-400">No at-risk members</div>
              ) : (
                <div className="space-y-2">
                  {atRiskMembers.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-700 p-3 rounded-md border border-yellow-600">
                      <div>
                        <div className="font-medium text-gray-200">{m.name || m.email || m.whopUserId}</div>
                        <div className="text-red-400 text-sm">{m.riskReason || 'At risk'}</div>
                      </div>
                      <button
                        onClick={() => messageMember(m.whopUserId)}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm"
                      >
                        Message
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Recent Cancellations */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
              <h3 className="text-xl font-bold text-gray-200 mb-4">📋 Recent Cancellations</h3>
              {recentCancels.length === 0 ? (
                <div className="text-gray-400">No recent cancellations</div>
              ) : (
                <div className="space-y-2">
                  {recentCancels.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-700 p-3 rounded-md border border-gray-600">
                      <div>
                        <div className="font-medium text-gray-200">{m.name || m.email || m.whopUserId}</div>
                        {m.exitSurveyReason && (
                          <div className="text-blue-400 text-sm">{m.exitSurveyReason}</div>
                        )}
                      </div>
                      <button
                        onClick={() => recoverMember(m.whopUserId)}
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-white text-sm"
                      >
                        Recover
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
