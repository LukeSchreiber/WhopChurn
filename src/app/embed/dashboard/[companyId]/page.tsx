'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

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

export default function EmbeddedDashboardByCompanyId() {
  const params = useParams<{ companyId?: string }>();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [recentCancels, setRecentCancels] = useState<RecentCancel[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState('');
  const [embedError, setEmbedError] = useState('');

  useEffect(() => {
    async function init() {
      try {
        const pathId = (params?.companyId as string) || '';
        const qs = new URLSearchParams(window.location.search);
        const qsBiz = qs.get('businessId') || '';
        const token = qs.get('token') || '';

        let resolved = pathId || qsBiz;

        if (!resolved && token) {
          try {
            const r = await fetch('/api/session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token })
            });
            const j = await r.json();
            if (r.ok && j?.businessId) {
              resolved = j.businessId as string;
            }
          } catch {
            // ignore token errors; fall through to friendly embed error
          }
        }

        if (!resolved) {
          setEmbedError('Not embedded correctly: missing tenant id.');
          setLoading(false);
          return;
        }

        setBusinessId(resolved);

        const [dashboardRes, cancelsRes] = await Promise.all([
          fetch(`/api/dashboard?businessId=${resolved}`),
          fetch(`/api/recent-cancels?businessId=${resolved}`)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.companyId]);

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-200">ChurnGuard Dashboard</h1>
          <p className="text-gray-400">Business: {businessId}</p>
        </div>

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
