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
    <div className="bg-gray-900 min-h-screen text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                ChurnGuard Dashboard
              </h1>
              <p className="text-gray-400">
                Business: <span className="font-mono text-gray-300">{businessId}</span>
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Last updated</div>
              <div className="text-xs text-gray-500">{new Date().toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Active */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-400 mb-1">{data.active}</div>
                <div className="text-gray-400 text-sm font-medium">Active Members</div>
                <div className="text-xs text-gray-500 mt-1">Currently subscribed</div>
              </div>
              <div className="bg-green-400 bg-opacity-20 p-3 rounded-lg">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Canceled */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-yellow-400 mb-1">{data.canceled}</div>
                <div className="text-gray-400 text-sm font-medium">Scheduled Cancel</div>
                <div className="text-xs text-gray-500 mt-1">Will end soon</div>
              </div>
              <div className="bg-yellow-400 bg-opacity-20 p-3 rounded-lg">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Churned */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-red-400 mb-1">{data.churned}</div>
                <div className="text-gray-400 text-sm font-medium">Churned</div>
                <div className="text-xs text-gray-500 mt-1">Lost customers</div>
              </div>
              <div className="bg-red-400 bg-opacity-20 p-3 rounded-lg">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-blue-400 mb-1">{data.total}</div>
                <div className="text-gray-400 text-sm font-medium">Total Members</div>
                <div className="text-xs text-gray-500 mt-1">All time</div>
              </div>
              <div className="bg-blue-400 bg-opacity-20 p-3 rounded-lg">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Churn Rate */}
        <div className="bg-gradient-to-r from-red-900 to-red-800 rounded-xl p-6 border border-red-700 mb-8 shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xl font-bold text-white flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
                Churn Rate Alert
              </div>
              <div className="text-red-200 text-sm mt-1">Percentage of members lost</div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-white">
                {data.total > 0 ? Math.round((data.churned / data.total) * 100) : 0}%
              </div>
              <div className="text-red-200 text-sm">
                {data.churned} of {data.total} members churned
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* At Risk Section */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <div className="w-8 h-8 bg-yellow-400 bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              At-Risk Members
              <span className="ml-2 bg-yellow-400 bg-opacity-20 text-yellow-400 px-2 py-1 rounded-full text-sm">
                {data.atRiskMembers?.length || 0}
              </span>
            </h2>
            <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg">
              {data.atRiskMembers && data.atRiskMembers.length > 0 ? (
                data.atRiskMembers.slice(0, 5).map((member, index) => (
                  <div key={index} className="p-4 border-b border-gray-700 last:border-b-0 hover:bg-gray-750 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-white font-medium">
                          {member.name || member.email || 'Unknown Member'}
                        </div>
                        <div className="text-gray-400 text-sm mt-1">
                          {member.email && member.name ? member.email : ''}
                        </div>
                        <div className="text-yellow-400 text-xs mt-1 font-medium">
                          {member.riskReason || 'At Risk'}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-yellow-400 text-xs bg-yellow-400 bg-opacity-20 px-3 py-1 rounded-full font-medium">
                          Action Needed
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="font-medium">No at-risk members</div>
                  <div className="text-sm">All members are currently stable</div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Cancellations */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <div className="w-8 h-8 bg-red-400 bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              Recent Cancellations
              <span className="ml-2 bg-red-400 bg-opacity-20 text-red-400 px-2 py-1 rounded-full text-sm">
                {data.recentCancellations?.length || 0}
              </span>
            </h2>
            <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg">
              {data.recentCancellations && data.recentCancellations.length > 0 ? (
                data.recentCancellations.slice(0, 5).map((cancel, index) => (
                  <div key={index} className="p-4 border-b border-gray-700 last:border-b-0 hover:bg-gray-750 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-white font-medium">
                          {cancel.name || cancel.email || 'Unknown Member'}
                        </div>
                        <div className="text-gray-400 text-sm mt-1">
                          {cancel.email && cancel.name ? cancel.email : ''}
                        </div>
                        {cancel.exitSurveyReason && (
                          <div className="text-blue-400 text-sm mt-2 italic">
                            "{cancel.exitSurveyReason}"
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-red-400 text-xs bg-red-400 bg-opacity-20 px-3 py-1 rounded-full font-medium">
                          Churned
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="font-medium">No recent cancellations</div>
                  <div className="text-sm">Great job retaining members!</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Survey Results */}
        {data.surveyReasons && data.surveyReasons.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <div className="w-8 h-8 bg-blue-400 bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              Exit Survey Insights
              <span className="ml-2 bg-blue-400 bg-opacity-20 text-blue-400 px-2 py-1 rounded-full text-sm">
                {data.surveyReasons.length} reason{data.surveyReasons.length > 1 ? 's' : ''}
              </span>
            </h2>
            <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg">
              {data.surveyReasons.map((reason, index) => (
                <div key={index} className="p-4 border-b border-gray-700 last:border-b-0 hover:bg-gray-750 transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="text-white font-medium text-lg">"{reason.exitSurveyReason}"</div>
                      <div className="text-gray-400 text-sm mt-1">Most common reason for cancellation</div>
                    </div>
                    <div className="text-right">
                      <span className="text-blue-400 text-sm bg-blue-400 bg-opacity-20 px-4 py-2 rounded-full font-medium">
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
        <div className="border-t border-gray-700 pt-6 mt-8">
          <div className="flex justify-between items-center">
            <div className="text-gray-500 text-sm">
              ChurnGuard Dashboard • Real-time churn prevention
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}