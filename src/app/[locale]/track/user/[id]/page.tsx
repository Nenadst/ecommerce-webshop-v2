'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_USER_ACTIVITY_LOGS } from '@/shared/graphql/queries/activity.queries';
import { Download, Activity, Calendar, X } from 'lucide-react';
import Button from '@/shared/components/elements/Button';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useEffect, useState } from 'react';

interface ActivityLog {
  id: string;
  userId: string | null;
  userName: string | null;
  user: {
    id: string;
    email: string;
    name: string | null;
  } | null;
  action: string;
  description: string;
  ipAddress: string | null;
  userAgent: string | null;
  path: string | null;
  metadata: string | null;
  createdAt: string;
}

const actionColors: Record<string, string> = {
  LOGIN: 'bg-green-50 text-green-700 border-green-100',
  LOGOUT: 'bg-slate-50 text-slate-600 border-slate-200',
  VIEW_PRODUCT: 'bg-blue-50 text-blue-700 border-blue-100',
  ADD_TO_CART: 'bg-amber-50 text-amber-700 border-amber-100',
  CHECKOUT: 'bg-purple-50 text-purple-700 border-purple-100',
  ORDER: 'bg-emerald-50 text-emerald-700 border-emerald-100',
};

export default function TrackUserPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const { isAuthenticated, isAdmin } = useAuth();

  const getDefaultDates = () => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    return {
      from: sevenDaysAgo.toISOString().split('T')[0],
      to: today.toISOString().split('T')[0],
    };
  };

  const [dateRange, setDateRange] = useState(getDefaultDates());

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (!isAdmin) {
      router.push('/');
    }
  }, [isAuthenticated, isAdmin, router]);

  const { data, loading, error } = useQuery(GET_USER_ACTIVITY_LOGS, {
    variables: {
      userId,
      limit: 10000,
      fromDate: dateRange.from,
      toDate: dateRange.to,
    },
    skip: !isAuthenticated || !isAdmin,
  });

  const handleDateChange = (type: 'from' | 'to', value: string) => {
    setDateRange((prev) => ({ ...prev, [type]: value }));
  };

  const handleClearFilter = () => {
    setDateRange({ from: '', to: '' });
  };

  const handleQuickFilter = (
    type: 'today' | 'yesterday' | 'week' | '30days' | 'month' | 'year'
  ) => {
    const today = new Date();
    const to = today.toISOString().split('T')[0];
    let from = '';

    switch (type) {
      case 'today':
        from = to;
        break;
      case 'yesterday': {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        from = yesterday.toISOString().split('T')[0];
        setDateRange({ from, to: from });
        return;
      }
      case 'week': {
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        from = weekAgo.toISOString().split('T')[0];
        break;
      }
      case '30days': {
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        from = thirtyDaysAgo.toISOString().split('T')[0];
        break;
      }
      case 'month': {
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        from = firstDayOfMonth.toISOString().split('T')[0];
        break;
      }
      case 'year': {
        const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
        from = firstDayOfYear.toISOString().split('T')[0];
        break;
      }
    }

    setDateRange({ from, to });
  };

  const downloadAsText = () => {
    if (!data?.userActivityLogs) return;

    const logs: ActivityLog[] = data.userActivityLogs;
    let textContent = `Activity Log for User ID: ${userId}\n`;
    textContent += `User: ${logs[0]?.user?.name || 'Unknown'} (${logs[0]?.user?.email || 'N/A'})\n`;
    if (dateRange.from && dateRange.to) {
      textContent += `Date Range: ${new Date(dateRange.from).toLocaleDateString()} to ${new Date(dateRange.to).toLocaleDateString()}\n`;
    } else {
      textContent += `Date Range: All time\n`;
    }
    textContent += `Total Activities: ${logs.length}\n`;
    textContent += `Generated: ${new Date().toLocaleString()}\n`;
    textContent += `\n${'='.repeat(100)}\n\n`;

    logs.forEach((log, index) => {
      textContent += `[${index + 1}] ${log.action}\n`;
      textContent += `${'-'.repeat(80)}\n`;
      textContent += `ID: ${log.id}\n`;
      textContent += `User: ${log.userName || log.user?.name || 'Guest'}\n`;
      textContent += `Description: ${log.description}\n`;
      textContent += `Date/Time: ${new Date(log.createdAt).toLocaleString()}\n`;
      if (log.path) textContent += `Path: ${log.path}\n`;
      if (log.ipAddress) textContent += `IP: ${log.ipAddress}\n`;
      if (log.metadata) textContent += `Metadata: ${log.metadata}\n`;
      textContent += `\n`;
    });

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-log-${userId}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const quickFilters = [
    { key: 'today', label: 'Today' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: 'week', label: 'Last 7 Days' },
    { key: '30days', label: '30 Days' },
    { key: 'month', label: 'This Month' },
    { key: 'year', label: 'This Year' },
  ] as const;

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading activity logs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-red-100 p-8 text-center max-w-md">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <X className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-slate-900 font-bold text-lg mb-2">Error Loading Logs</h2>
          <p className="text-slate-500 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  const logs: ActivityLog[] = data?.userActivityLogs || [];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 lg:px-16 py-8">
        {/* Header card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20 flex-shrink-0">
                <Activity className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h1 className="text-slate-900 text-xl font-bold">User Activity Tracker</h1>
                {logs[0]?.user && (
                  <p className="text-slate-500 text-sm mt-0.5">
                    <span className="font-semibold text-slate-700">
                      {logs[0].user.name || 'Unknown'}
                    </span>{' '}
                    · {logs[0].user.email}
                  </p>
                )}
                <p className="text-slate-400 text-xs mt-0.5">ID: {userId}</p>
              </div>
            </div>
            <Button
              onClick={downloadAsText}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
              disabled={logs.length === 0}
            >
              <Download className="w-4 h-4" />
              Download Log
            </Button>
          </div>

          {/* Filters */}
          <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600 text-sm font-semibold">Filter by Date Range</span>
            </div>

            <div className="flex flex-wrap gap-3 mb-3">
              <div className="flex-1 min-w-[140px]">
                <label className="block text-xs text-slate-500 font-medium mb-1">From</label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => handleDateChange('from', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div className="flex-1 min-w-[140px]">
                <label className="block text-xs text-slate-500 font-medium mb-1">To</label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => handleDateChange('to', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {quickFilters.map((f) => (
                <Button
                  key={f.key}
                  onClick={() => handleQuickFilter(f.key)}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:border-amber-400 hover:text-amber-600 text-slate-600 rounded-lg text-xs font-medium transition-colors"
                >
                  {f.label}
                </Button>
              ))}
              <Button
                onClick={handleClearFilter}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:border-red-300 hover:text-red-500 text-slate-500 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear
              </Button>
            </div>

            {(dateRange.from || dateRange.to) && (
              <p className="text-xs text-slate-400 mt-3">
                {dateRange.from && dateRange.to
                  ? `${new Date(dateRange.from).toLocaleDateString()} → ${new Date(dateRange.to).toLocaleDateString()}`
                  : dateRange.from
                    ? `From ${new Date(dateRange.from).toLocaleDateString()}`
                    : `Until ${new Date(dateRange.to).toLocaleDateString()}`}
              </p>
            )}
          </div>

          {/* Total count */}
          <div className="mt-4 flex items-center gap-3">
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5 inline-flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-500" />
              <span className="text-amber-800 text-sm font-semibold">
                {logs.length} activities found
              </span>
            </div>
          </div>
        </div>

        {/* Table */}
        {logs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Activity className="w-7 h-7 text-slate-300" />
            </div>
            <h2 className="text-slate-700 font-semibold mb-1">No Activity Logs Found</h2>
            <p className="text-slate-400 text-sm">
              This user has no recorded activities for the selected period.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                      Date / Time
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                      Path
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log, index) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-slate-400 font-medium">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-slate-900 font-medium">
                        {log.userName || log.user?.name || 'Guest'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${actionColors[log.action] || 'bg-slate-50 text-slate-600 border-slate-200'}`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">
                        {log.description}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-400 max-w-xs truncate">
                        {log.path || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-400">{log.ipAddress || '—'}</td>
                      <td className="px-4 py-3 text-sm">
                        {log.metadata && (
                          <details className="cursor-pointer">
                            <summary className="text-amber-500 hover:text-amber-600 font-semibold text-xs">
                              View
                            </summary>
                            <div className="mt-2 p-2 bg-slate-50 rounded-lg text-xs max-w-xs overflow-auto text-slate-600 border border-slate-100">
                              {log.metadata}
                            </div>
                          </details>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
