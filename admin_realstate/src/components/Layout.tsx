import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Image,
  BarChart3,
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/houses', icon: Home, label: 'Properties' },
  { path: '/panoramas', icon: Image, label: 'Panoramas' },
  { path: '/submissions', icon: MessageSquare, label: 'Inquiries' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/websetting', icon: Settings, label: 'WebSettings' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const user = JSON.parse(localStorage.getItem('admin_user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-dark-400">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-dark-300 border-r border-gray-800 transition-all duration-300 flex flex-col`}>
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          {sidebarOpen && <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">VRTX Admin</span>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="flex-1 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-5 py-3 transition-all ${
                  isActive
                    ? 'bg-white/10 border-l-2 border-white'
                    : 'hover:bg-white/5'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-white' : 'text-gray-400'} />
                {sidebarOpen && (
                  <span className={isActive ? 'text-white font-medium' : 'text-gray-400'}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-5 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">{user.name?.[0] || 'A'}</span>
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-sm font-medium">{user.name || 'Admin'}</p>
                <p className="text-xs text-gray-500">{user.email || 'admin@vrtx.com'}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors text-red-400"
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}