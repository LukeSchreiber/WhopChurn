'use client';

import { useState } from 'react';

export default function WebhookDebugPage() {
  const [businessId, setBusinessId] = useState('biz_kOK0VZBOoPrSIW');
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const checkStatus = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/webhook-test');
      const data = await res.json();
      setStatus(data);
    } catch (error) {
      setMessage('Error: ' + (error instanceof Error ? error.message : 'Unknown'));
    } finally {
      setLoading(false);
    }
  };

  const createTestData = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/webhook-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`✅ ${data.message}`);
        setTimeout(checkStatus, 500);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('Error: ' + (error instanceof Error ? error.message : 'Unknown'));
    } finally {
      setLoading(false);
    }
  };

  const clearTestData = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/webhook-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, action: 'clear' }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`✅ ${data.message}`);
        setTimeout(checkStatus, 500);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('Error: ' + (error instanceof Error ? error.message : 'Unknown'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">🔍 Webhook Debug Tool</h1>
        <p className="text-gray-400 mb-8">Test your ChurnGuard setup and webhooks</p>

        {/* Business ID Input */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <label className="block text-sm font-medium mb-2">Business ID</label>
          <input
            type="text"
            value={businessId}
            onChange={(e) => setBusinessId(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="biz_xxx"
          />
          <p className="text-sm text-gray-400 mt-2">
            This is the business/product ID from your Whop webhooks
          </p>
        </div>

        {/* Actions */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-y-3">
            <button
              onClick={checkStatus}
              disabled={loading}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-md font-medium transition"
            >
              {loading ? '⏳ Loading...' : '🔍 Check System Status'}
            </button>
            <button
              onClick={createTestData}
              disabled={loading || !businessId}
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-md font-medium transition"
            >
              {loading ? '⏳ Creating...' : '➕ Create Test Members'}
            </button>
            <button
              onClick={clearTestData}
              disabled={loading || !businessId}
              className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-md font-medium transition"
            >
              {loading ? '⏳ Clearing...' : '🗑️ Clear Test Members'}
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`rounded-lg p-4 mb-6 ${
            message.startsWith('✅') 
              ? 'bg-green-900/30 border border-green-700 text-green-100' 
              : 'bg-red-900/30 border border-red-700 text-red-100'
          }`}>
            {message}
          </div>
        )}

        {/* Status Display */}
        {status && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">📊 System Status</h2>
            
            {/* Status Badge */}
            <div className="mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                status.status === 'healthy' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-red-600 text-white'
              }`}>
                {status.status === 'healthy' ? '✓ Healthy' : '✗ Error'}
              </span>
            </div>

            {/* Message */}
            <div className="mb-6 p-4 bg-gray-700 rounded-md">
              <p className="text-gray-200">{status.message}</p>
            </div>

            {/* Database Info */}
            {status.database && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-blue-300">Database</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-700 p-3 rounded">
                    <div className="text-2xl font-bold text-white">{status.database.totalMembers}</div>
                    <div className="text-sm text-gray-400">Total Members</div>
                  </div>
                  <div className="bg-gray-700 p-3 rounded">
                    <div className="text-2xl font-bold text-white">{status.database.businesses?.length || 0}</div>
                    <div className="text-sm text-gray-400">Businesses</div>
                  </div>
                </div>

                {/* Business Breakdown */}
                {status.database.businesses && status.database.businesses.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Business Breakdown</h4>
                    <div className="space-y-2">
                      {status.database.businesses.map((biz: any, idx: number) => (
                        <div key={idx} className="flex justify-between bg-gray-700 p-2 rounded">
                          <span className="font-mono text-sm text-gray-300">{biz.businessId}</span>
                          <span className="text-sm text-gray-400">{biz.memberCount} members</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Members */}
                {status.database.recentMembers && status.database.recentMembers.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Recent Members</h4>
                    <div className="space-y-2">
                      {status.database.recentMembers.map((member: any, idx: number) => (
                        <div key={idx} className="bg-gray-700 p-2 rounded text-sm">
                          <div className="flex justify-between">
                            <span className="font-mono text-gray-300">{member.whopUserId}</span>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              member.status === 'valid' ? 'bg-green-600' :
                              member.status === 'canceled_at_period_end' ? 'bg-yellow-600' :
                              'bg-red-600'
                            }`}>
                              {member.status}
                            </span>
                          </div>
                          <div className="text-gray-500 text-xs mt-1">
                            Business: {member.businessId}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Webhook Info */}
            {status.webhook && (
              <div>
                <h3 className="text-lg font-medium mb-3 text-purple-300">Webhook Configuration</h3>
                <div className="bg-gray-700 p-3 rounded mb-2">
                  <div className="text-xs text-gray-400 mb-1">Webhook URL</div>
                  <div className="font-mono text-sm text-gray-200 break-all">
                    {status.webhook.url}
                  </div>
                </div>
                <div className="bg-gray-700 p-3 rounded">
                  <div className="text-xs text-gray-400 mb-1">Webhook Secret</div>
                  <div className="text-sm">
                    {status.webhook.secretConfigured ? (
                      <span className="text-green-400">✓ Configured</span>
                    ) : (
                      <span className="text-red-400">✗ Not configured</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-blue-900/20 border border-blue-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3 text-blue-300">📚 Setup Guide</h2>
          <div className="space-y-3 text-sm text-gray-300">
            <div>
              <strong className="text-white">1. Configure Webhooks in Whop</strong>
              <p className="mt-1 text-gray-400">
                Go to your Whop Developer Dashboard → Webhooks and add the webhook URL shown above.
              </p>
            </div>
            <div>
              <strong className="text-white">2. Enable Required Events</strong>
              <ul className="mt-1 list-disc list-inside text-gray-400">
                <li>membership_went_valid</li>
                <li>membership_went_invalid</li>
                <li>membership_cancel_at_period_end_changed</li>
                <li>payment_failed</li>
              </ul>
            </div>
            <div>
              <strong className="text-white">3. Test with Real or Mock Data</strong>
              <p className="mt-1 text-gray-400">
                Use the "Create Test Members" button above to populate your dashboard, or trigger a real webhook from Whop.
              </p>
            </div>
            <div>
              <strong className="text-white">4. View Your Dashboard</strong>
              <p className="mt-1 text-gray-400">
                Navigate to <code className="bg-gray-700 px-2 py-0.5 rounded">/embed/dashboard/{'{businessId}'}</code> to see your ChurnGuard dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

