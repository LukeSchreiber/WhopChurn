'use client';

import { useState, useEffect } from 'react';

type DashboardData = {
  total: number;
  active: number;
  canceled: number;
  churned: number;
};

type RecentCancel = {
  whopUserId: string;
  email: string | null;
  name: string | null;
  updatedAt: string;
};

export default function EmbeddedDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [recentCancels, setRecentCancels] = useState<RecentCancel[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState('');
  const [embedError, setEmbedError] = useState('');

  useEffect(() => {
    async function init() {
      try {
        // Expect Whop to provide an embed token (e.g., via query or postMessage/headers). For simplicity, read from ?token
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (!token) {
          setEmbedError('Not embedded correctly: missing token');
          setLoading(false);
          return;
        }
        const res = await fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        const json = await res.json();
        if (!res.ok || !json?.businessId) {
          setEmbedError('Not embedded correctly: invalid or expired token');
          setLoading(false);
          return;
        }
        const id = json.businessId as string;
        setBusinessId(id);

        const [dashboardRes, cancelsRes] = await Promise.all([
          fetch(`/api/dashboard?businessId=${id}`),
          fetch(`/api/recent-cancels?businessId=${id}`)
        ]);
        const dashboard = await dashboardRes.json();
        const cancels = await cancelsRes.json();
        setDashboardData(dashboard);
        setRecentCancels(cancels.recentCancels || []);
      } catch (err) {
        setEmbedError('Failed to load embedded dashboard');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (embedError) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center text-center">
        <div className="text-white">
          <h1 className="text-2xl mb-2">Cannot Load Dashboard</h1>
          <p className="text-gray-400">{embedError}</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center text-center">
        <div className="text-white">
          <h1 className="text-2xl mb-4">Error Loading Dashboard</h1>
          <p className="text-gray-400">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-200">ChurnGuard Dashboard</h1>
          <p className="text-gray-400">Business: {businessId}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-md hover:shadow-lg transition">
            <div className="text-3xl font-bold text-blue-400 mb-1">{dashboardData.total}</div>
            <div className="text-gray-400 text-sm">Total Members</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-md hover:shadow-lg transition">
            <div className="text-3xl font-bold text-green-400 mb-1">{dashboardData.active}</div>
            <div className="text-gray-400 text-sm">Active</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-md hover:shadow-lg transition">
            <div className="text-3xl font-bold text-yellow-400 mb-1">{dashboardData.canceled}</div>
            <div className="text-gray-400 text-sm">Canceled</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-md hover:shadow-lg transition">
            <div className="text-3xl font-bold text-red-400 mb-1">{dashboardData.churned}</div>
            <div className="text-gray-400 text-sm">Churned</div>
          </div>
        </div>

        {/* Recent Cancellations */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-md">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-gray-200">Recent Cancellations</h2>
          </div>
          
          {recentCancels.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <div className="text-lg mb-2">No recent cancellations</div>
              <div className="text-sm">Great job retaining members!</div>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {recentCancels.map((cancel, index) => (
                <div key={index} className="p-4 flex justify-between items-center hover:bg-gray-700 transition">
                  <div>
                    <div className="font-medium text-gray-200">
                      {cancel.name || cancel.email || cancel.whopUserId}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {new Date(cancel.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-red-400 text-sm">Canceled</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}