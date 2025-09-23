'use client';

import { useState, useEffect } from 'react';

type DashboardData = {
  total: number;
  active: number;
  canceled: number;
  churned: number;
  atRisk: number;
  atRiskMembers: any[];
  recentCancellations: any[];
  surveyReasons: any[];
};

export default function EmbeddedDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('businessId') || 'fitness_pro_123';
    setBusinessId(id);

    async function loadDashboard() {
      try {
        const response = await fetch(`/api/dashboard?businessId=${id}`);
        const dashboardData = await response.json();
        setData(dashboardData);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-2xl mb-4">Loading...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-2xl mb-4">No data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            ChurnGuard Dashboard
          </h1>
          <p className="text-gray-400 text-sm">
            Business: {businessId}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Active */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-3xl font-bold text-green-400 mb-1">{data.active}</div>
            <div className="text-gray-400 text-sm">Active Members</div>
            <div className="text-xs text-gray-500 mt-1">Currently subscribed</div>
          </div>

          {/* Canceled */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-3xl font-bold text-yellow-400 mb-1">{data.canceled}</div>
            <div className="text-gray-400 text-sm">Scheduled Cancel</div>
            <div className="text-xs text-gray-500 mt-1">Will end soon</div>
          </div>

          {/* Churned */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-3xl font-bold text-red-400 mb-1">{data.churned}</div>
            <div className="text-gray-400 text-sm">Churned</div>
            <div className="text-xs text-gray-500 mt-1">Lost customers</div>
          </div>

          {/* Total */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-3xl font-bold text-blue-400 mb-1">{data.total}</div>
            <div className="text-gray-400 text-sm">Total Members</div>
            <div className="text-xs text-gray-500 mt-1">All time</div>
          </div>
        </div>

        {/* Churn Rate */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-lg font-bold text-white">Churn Rate</div>
              <div className="text-gray-400 text-sm">Percentage of members lost</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-400">
                {data.total > 0 ? Math.round((data.churned / data.total) * 100) : 0}%
              </div>
              <div className="text-xs text-gray-500">
                {data.churned} of {data.total} members
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* At Risk Section */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <span className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></span>
              At-Risk Members ({data.atRiskMembers?.length || 0})
            </h2>
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              {data.atRiskMembers && data.atRiskMembers.length > 0 ? (
                data.atRiskMembers.slice(0, 5).map((member, index) => (
                  <div key={index} className="p-4 border-b border-gray-700 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-white font-medium">
                          {member.name || member.email || 'Unknown'}
                        </div>
                        <div className="text-gray-400 text-sm mt-1">
                          {member.riskReason || 'At Risk'}
                        </div>
                      </div>
                      <span className="text-yellow-400 text-xs bg-yellow-400 bg-opacity-20 px-2 py-1 rounded-full">
                        Risk
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400">
                  No at-risk members
                </div>
              )}
            </div>
          </div>

          {/* Recent Cancellations */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <span className="w-3 h-3 bg-red-400 rounded-full mr-3"></span>
              Recent Cancellations ({data.recentCancellations?.length || 0})
            </h2>
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              {data.recentCancellations && data.recentCancellations.length > 0 ? (
                data.recentCancellations.slice(0, 5).map((cancel, index) => (
                  <div key={index} className="p-4 border-b border-gray-700 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-white font-medium">
                          {cancel.name || cancel.email || 'Unknown'}
                        </div>
                        {cancel.exitSurveyReason && (
                          <div className="text-gray-400 text-sm mt-1">
                            "{cancel.exitSurveyReason}"
                          </div>
                        )}
                      </div>
                      <span className="text-red-400 text-xs bg-red-400 bg-opacity-20 px-2 py-1 rounded-full">
                        Canceled
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400">
                  No recent cancellations
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Survey Results */}
        {data.surveyReasons && data.surveyReasons.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <span className="w-3 h-3 bg-blue-400 rounded-full mr-3"></span>
              Exit Survey Results
            </h2>
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              {data.surveyReasons.map((reason, index) => (
                <div key={index} className="p-4 border-b border-gray-700 last:border-b-0">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="text-white font-medium">"{reason.exitSurveyReason}"</div>
                      <div className="text-gray-400 text-sm mt-1">Common reason for cancellation</div>
                    </div>
                    <div className="text-right">
                      <span className="text-blue-400 text-sm bg-blue-400 bg-opacity-20 px-3 py-1 rounded-full">
                        {reason._count} member{reason._count > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          ChurnGuard Dashboard
        </div>
      </div>
    </div>
  );
}