'use client';

import { useParams } from 'next/navigation';

export default function EmbeddedDashboardByCompanyId() {
  const params = useParams<{ companyId?: string }>();
  const companyId = (params?.companyId as string) || '';

  return (
    <div className="bg-gray-900 min-h-screen text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-200">ChurnGuard Dashboard</h1>
          <p className="text-gray-400">Business: {companyId || '—'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-md">
            <div className="text-3xl font-bold text-blue-400 mb-1">—</div>
            <div className="text-gray-400 text-sm">Total Members</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-md">
            <div className="text-3xl font-bold text-green-400 mb-1">—</div>
            <div className="text-gray-400 text-sm">Active</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-md">
            <div className="text-3xl font-bold text-yellow-400 mb-1">—</div>
            <div className="text-gray-400 text-sm">Canceled</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-md">
            <div className="text-3xl font-bold text-red-400 mb-1">—</div>
            <div className="text-gray-400 text-sm">At‑Risk</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-yellow-700">
            <h3 className="text-xl font-bold text-yellow-300 mb-4">🚨 At‑Risk Members</h3>
            <div className="space-y-2 text-gray-400">
              <div className="bg-gray-700 p-3 rounded">—</div>
              <div className="bg-gray-700 p-3 rounded">—</div>
              <div className="bg-gray-700 p-3 rounded">—</div>
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
            <h3 className="text-xl font-bold text-gray-200 mb-4">📋 Recent Cancellations</h3>
            <div className="space-y-2 text-gray-400">
              <div className="bg-gray-700 p-3 rounded">—</div>
              <div className="bg-gray-700 p-3 rounded">—</div>
              <div className="bg-gray-700 p-3 rounded">—</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
