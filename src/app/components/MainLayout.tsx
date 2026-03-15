import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router';
import { Home, TrendingUp, PlusCircle, Bell, User } from 'lucide-react';
import { useAuth } from '../../lib/contexts';

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (!loading && user && !profile) {
      navigate('/setup-nickname');
    }
  }, [user, profile, loading, navigate]);

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { path: '/app/feed', icon: Home, label: 'Feed' },
    { path: '/app/leaderboard', icon: TrendingUp, label: 'Leaderboard' },
    { path: '/app/create', icon: PlusCircle, label: 'Post' },
    { path: '/app/notifications', icon: Bell, label: 'Notifications' },
    { path: `/app/profile/${user.id}`, icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-20 md:pb-0">
      <div className="max-w-2xl mx-auto">
        <Outlet />
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-lg border-t border-white/10 md:hidden z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive
                    ? 'text-purple-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar (optional enhancement) */}
      <div className="hidden md:block fixed left-0 top-0 bottom-0 w-64 bg-black border-r border-white/10 p-6">
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              ✨
            </div>
            <span className="text-2xl font-bold">Aura</span>
          </div>
        </div>
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-purple-500/20 text-purple-500'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
