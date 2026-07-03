import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Home, Users, MessageSquare, Eye, TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { DashboardStats } from '../types';

const statCards = [
  { key: 'totalHouses', icon: Home, label: 'Properties', color: 'from-blue-500 to-cyan-500' },
  { key: 'totalRooms', icon: Eye, label: '360° Rooms', color: 'from-purple-500 to-pink-500' },
  { key: 'totalSubmissions', icon: MessageSquare, label: 'Inquiries', color: 'from-green-500 to-emerald-500' },
  { key: 'totalViews', icon: TrendingUp, label: 'Total Views', color: 'from-orange-500 to-red-500' },
];

const chartData = [
  { month: 'Jan', views: 4200, tours: 320 },
  { month: 'Feb', views: 5800, tours: 450 },
  { month: 'Mar', views: 7200, tours: 580 },
  { month: 'Apr', views: 6800, tours: 520 },
  { month: 'May', views: 8900, tours: 680 },
  { month: 'Jun', views: 10400, tours: 820 },
];

const pieData = [
  { name: 'Virtual Tour', value: 45, color: '#3b82f6' },
  { name: '360 Photography', value: 30, color: '#8b5cf6' },
  { name: 'Interactive', value: 25, color: '#10b981' },
];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStats().then((data) => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          const value = stats?.[card.key as keyof DashboardStats] || 0;
          return (
            <div key={card.key} className="bg-dark-300 rounded-xl p-5 border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 bg-gradient-to-r ${card.color} rounded-lg flex items-center justify-center`}>
                  <Icon size={20} />
                </div>
                <span className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : String(value)}</span>
              </div>
              <p className="text-gray-500 text-sm">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-dark-300 rounded-xl p-5 border border-gray-800">
          <h3 className="font-semibold mb-4">Platform Analytics</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="month" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="views" stroke="#3b82f6" fillOpacity={1} fill="url(#colorViews)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-dark-300 rounded-xl p-5 border border-gray-800">
          <h3 className="font-semibold mb-4">Service Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
                <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => {
                  const p = typeof percent === 'number' ? percent : 0;
                  return `${name} ${(p * 100).toFixed(0)}%`;
                }}
                labelLine={{ stroke: '#666' }}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="bg-dark-300 rounded-xl border border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800">
          <h3 className="font-semibold">Recent Inquiries</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
            {(stats?.recentSubmissions || []).map((submission) => (
                <tr key={submission.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3">
                    <div>
                      <p className="font-medium">{submission.name}</p>
                      <p className="text-xs text-gray-500">{submission.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-400">{submission.service}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      submission.status === 'unread' 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {submission.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-sm">
                    {new Date(submission.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}