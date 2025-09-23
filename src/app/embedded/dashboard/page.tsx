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

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('businessId');
    
    if (!id) {
      setLoading(false);
      return;
    }
    
    setBusinessId(id);

    async function loadData() {
      try {
        const [dashboardRes, cancelsRes] = await Promise.all([
          fetch(`/api/dashboard?businessId=${id}`),
          fetch(`/api/recent-cancels?businessId=${id}`)
        ]);
        
        const dashboard = await dashboardRes.json();
        const cancels = await cancelsRes.json();
        
        setDashboardData(dashboard);
        setRecentCancels(cancels.recentCancels || []);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!businessId) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl mb-4">Missing Business ID</h1>
          <p className="text-gray-400">Add ?businessId=your_id to the URL</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl mb-4">Error Loading Dashboard</h1>
          <p className="text-gray-400">Check your business ID and try again</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">ChurnGuard Dashboard</h1>
          <p className="text-gray-400">Business: {businessId}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-3xl font-bold text-blue-400 mb-1">{dashboardData.total}</div>
            <div className="text-gray-400 text-sm">Total Members</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-3xl font-bold text-green-400 mb-1">{dashboardData.active}</div>
            <div className="text-gray-400 text-sm">Active</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-3xl font-bold text-yellow-400 mb-1">{dashboardData.canceled}</div>
            <div className="text-gray-400 text-sm">Canceled</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-3xl font-bold text-red-400 mb-1">{dashboardData.churned}</div>
            <div className="text-gray-400 text-sm">Churned</div>
          </div>
        </div>

        {/* Recent Cancellations */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold">Recent Cancellations</h2>
          </div>
          
          {recentCancels.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <div className="text-lg mb-2">No recent cancellations</div>
              <div className="text-sm">Great job retaining members!</div>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {recentCancels.map((cancel, index) => (
                <div key={index} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">
                        {cancel.name || cancel.email || cancel.whopUserId}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {new Date(cancel.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-red-400 text-sm">Canceled</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}