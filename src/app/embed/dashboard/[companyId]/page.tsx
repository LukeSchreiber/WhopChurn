'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';

type DashboardData = {
  total: number;
  active: number;
  canceled: number;
  churned: number;
};

type AtRiskMember = {
  whopUserId: string;
  email: string | null;
  name: string | null;
  riskReason: string | null;
  lastActiveAt: string | null;
};

type RecentCancel = {
  whopUserId: string;
  email: string | null;
  name: string | null;
  updatedAt: string;
  exitSurveyReason?: string | null;
};

export default function EmbeddedDashboardByCompanyId() {
  const params = useParams<{ companyId?: string }>();
  const companyId = useMemo(() => (params?.companyId as string) || '', [params]);

  // Get webhook URL from environment variable or construct from current origin
  const webhookUrl = useMemo(() => {
    const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL 
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : (typeof window !== 'undefined' ? window.location.origin : 'https://whop-churn.vercel.app');
    return `${baseUrl}/api/webhooks/whop`;
  }, []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const [stats, setStats] = useState<DashboardData | null>(null);
  const [atRisk, setAtRisk] = useState<AtRiskMember[]>([]);
  const [recentCancels, setRecentCancels] = useState<RecentCancel[]>([]);

  useEffect(() => {
    if (!companyId) {
      setError('No company ID provided in URL');
      return;
    }
    setLoading(true);
    setError('');
    setActionMsg('');

    async function load() {
      console.log(`[ChurnGuard] Loading dashboard for businessId: ${companyId}`);
      
      try {
        const [statsRes, riskRes, cancelsRes] = await Promise.all([
          fetch(`/api/dashboard?businessId=${companyId}`),
          fetch(`/api/at-risk?businessId=${companyId}&limit=10`),
          fetch(`/api/recent-cancels?businessId=${companyId}`),
        ]);
        
        console.log(`[ChurnGuard] API responses - stats: ${statsRes.status}, risk: ${riskRes.status}, cancels: ${cancelsRes.status}`);
        
        const statsJson = await statsRes.json();
        const riskJson = await riskRes.json();
        const cancelsJson = await cancelsRes.json();
        
        if (statsRes.ok) {
          console.log(`[ChurnGuard] Stats loaded:`, statsJson);
          setStats(statsJson);
          
          // Show helpful message if database is empty
          if (statsJson.total === 0) {
            setError(`No member data found. Make sure Whop webhooks are configured and pointing to this app. Webhook URL: ${webhookUrl}`);
          }
        } else {
          console.error(`[ChurnGuard] Stats error:`, statsJson);
          setError(statsJson.error || 'Failed to load stats');
        }
        
        if (riskRes.ok) {
          console.log(`[ChurnGuard] At-risk members:`, riskJson.atRiskMembers?.length || 0);
          setAtRisk(riskJson.atRiskMembers || []);
        } else {
          console.error(`[ChurnGuard] At-risk error:`, riskJson);
        }
        
        if (cancelsRes.ok) {
          console.log(`[ChurnGuard] Recent cancels:`, cancelsJson.recentCancels?.length || 0);
          setRecentCancels(cancelsJson.recentCancels || []);
        } else {
          console.error(`[ChurnGuard] Cancels error:`, cancelsJson);
        }
      } catch (e) {
        console.error('[ChurnGuard] Network error:', e);
        setError('Network error loading dashboard. Check console for details.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [companyId, webhookUrl]);

  const messageMember = async (memberId: string) => {
    try {
      const res = await fetch('/api/actions/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, businessId: companyId }),
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
        body: JSON.stringify({ memberId, businessId: companyId }),
      });
      const json = await res.json();
      if (res.ok && json.success) setActionMsg(`Recovery sent to ${memberId} at ${json.timestamp}`);
      else setActionMsg(json.error || 'Failed to send recovery');
    } catch {
      setActionMsg('Failed to send recovery');
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-200">ChurnGuard Dashboard</h1>
          <p className="text-gray-400">Business: {companyId || '—'}</p>
        </div>

        {actionMsg && (
          <div className="bg-gray-800 border border-gray-700 rounded-md p-3 mb-4 text-gray-300">{actionMsg}</div>
        )}
        {error && (
          <div className="bg-red-900 border border-red-700 rounded-md p-3 mb-4 text-red-100">{error}</div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-md">
            <div className="text-3xl font-bold text-blue-400 mb-1">{stats ? stats.total : '—'}</div>
            <div className="text-gray-400 text-sm">Total Members</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-md">
            <div className="text-3xl font-bold text-green-400 mb-1">{stats ? stats.active : '—'}</div>
            <div className="text-gray-400 text-sm">Active</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-md">
            <div className="text-3xl font-bold text-yellow-400 mb-1">{stats ? stats.canceled : '—'}</div>
            <div className="text-gray-400 text-sm">Canceled</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-md">
            <div className="text-3xl font-bold text-red-400 mb-1">{stats ? stats.churned : '—'}</div>
            <div className="text-gray-400 text-sm">At‑Risk</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* At-Risk */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-yellow-700">
            <h3 className="text-xl font-bold text-yellow-300 mb-4">🚨 At‑Risk Members</h3>
            {loading && !atRisk.length ? (
              <div className="space-y-2 text-gray-400">
                <div className="bg-gray-700 p-3 rounded">—</div>
                <div className="bg-gray-700 p-3 rounded">—</div>
                <div className="bg-gray-700 p-3 rounded">—</div>
              </div>
            ) : atRisk.length === 0 ? (
              <div className="text-gray-400">No at‑risk members</div>
            ) : (
              <div className="space-y-2">
                {atRisk.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-700 p-3 rounded border border-yellow-600">
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

          {/* Recent Cancellations */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
            <h3 className="text-xl font-bold text-gray-200 mb-4">📋 Recent Cancellations</h3>
            {loading && !recentCancels.length ? (
              <div className="space-y-2 text-gray-400">
                <div className="bg-gray-700 p-3 rounded">—</div>
                <div className="bg-gray-700 p-3 rounded">—</div>
                <div className="bg-gray-700 p-3 rounded">—</div>
              </div>
            ) : recentCancels.length === 0 ? (
              <div className="text-gray-400">No recent cancellations</div>
            ) : (
              <div className="space-y-2">
                {recentCancels.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-700 p-3 rounded border border-gray-600">
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
    </div>
  );
}
