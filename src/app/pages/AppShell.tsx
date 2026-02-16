import { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router';
import { Car, Plus, FileText, BarChart3, Settings, Menu, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../lib/AuthContext';

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-teal-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const navItems = [
    { to: '/app/trips', icon: FileText, label: 'Trips' },
    { to: '/app/add-trip', icon: Plus, label: 'Add Trip', highlight: true },
    { to: '/app/vehicles', icon: Car, label: 'Vehicles' },
    { to: '/app/reports', icon: BarChart3, label: 'Reports' },
    { to: '/app/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/app/trips' && location.pathname === '/app') return true;
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <Link to="/app" className="flex items-center gap-2">
            <div className="bg-teal-600 p-2 rounded-lg">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">Mileage Tracker</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r flex-col">
        <div className="p-6">
          <Link to="/app" className="flex items-center gap-2">
            <div className="bg-teal-600 p-2 rounded-lg">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl">Mileage Tracker</span>
          </Link>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                  active
                    ? 'bg-teal-50 text-teal-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                } ${item.highlight ? 'font-semibold' : ''}`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        >
          <aside
            className="fixed left-0 top-0 bottom-0 w-64 bg-white flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <Link to="/app" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
                <div className="bg-teal-600 p-2 rounded-lg">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-xl">Mileage Tracker</span>
              </Link>
            </div>
            <nav className="flex-1 px-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                      active
                        ? 'bg-teal-50 text-teal-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    } ${item.highlight ? 'font-semibold' : ''}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="md:ml-64">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-30">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-1 py-2 px-4 flex-1 ${
                  active ? 'text-teal-600' : 'text-gray-600'
                } ${item.highlight ? 'relative' : ''}`}
              >
                {item.highlight ? (
                  <div className="absolute -top-4 bg-teal-600 p-3 rounded-full shadow-lg">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                ) : (
                  <Icon className="w-5 h-5" />
                )}
                <span className={`text-xs ${item.highlight ? 'mt-4' : ''}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}