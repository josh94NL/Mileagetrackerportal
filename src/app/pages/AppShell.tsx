import { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router';
import { Car, Plus, FileText, BarChart3, Settings, Menu, X } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '../components/Logo';

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
      <div className="min-h-screen bg-[#07070e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-pulse">
            <Logo size={40} />
          </div>
          <span className="text-[#8888a4] text-sm">Loading...</span>
        </div>
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
    <div className="min-h-screen bg-[#07070e] pb-20 md:pb-0">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-40 bg-[#07070e]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="flex items-center justify-between px-5 h-14">
          <Link to="/app" className="flex items-center gap-2.5">
            <Logo size={32} />
            <span className="font-semibold text-[15px] text-white tracking-tight">Mileage Tracker</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/[0.05] transition-colors text-[#8888a4]"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-[#0a0a14] border-r border-white/[0.06] flex-col">
        <div className="p-6">
          <Link to="/app" className="flex items-center gap-2.5">
            <Logo size={36} />
            <span className="font-semibold text-lg text-white tracking-tight">Mileage Tracker</span>
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  active
                    ? 'bg-[#00E5A0]/10 text-[#00E5A0]'
                    : 'text-[#8888a4] hover:text-white hover:bg-white/[0.04]'
                } ${item.highlight && !active ? 'text-[#00E5A0]' : ''}`}
              >
                <Icon className="w-[18px] h-[18px]" />
                <span className="text-sm font-medium">{item.label}</span>
                {item.highlight && !active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00E5A0]" />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 mx-3 mb-4 rounded-xl bg-gradient-to-br from-[#00E5A0]/10 to-[#8B5CF6]/10 border border-white/[0.06]">
          <p className="text-xs text-[#8888a4] leading-relaxed">Quick tip: Add a trip in under 10 seconds with smart defaults</p>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
          >
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-[#0a0a14] border-r border-white/[0.06] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <Link to="/app" className="flex items-center gap-2.5" onClick={() => setSidebarOpen(false)}>
                  <Logo size={36} />
                  <span className="font-semibold text-lg text-white tracking-tight">Mileage Tracker</span>
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
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                        active
                          ? 'bg-[#00E5A0]/10 text-[#00E5A0]'
                          : 'text-[#8888a4] hover:text-white hover:bg-white/[0.04]'
                      } ${item.highlight && !active ? 'text-[#00E5A0]' : ''}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="md:ml-64 min-h-screen">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0a0a14]/90 backdrop-blur-xl border-t border-white/[0.06]">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex flex-col items-center justify-center gap-1 flex-1 relative"
              >
                {item.highlight ? (
                  <div className={`absolute -top-3.5 w-10 h-10 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,229,160,0.25)] ${
                    active
                      ? 'bg-gradient-to-br from-[#00E5A0] to-[#00B880]'
                      : 'bg-gradient-to-br from-[#00E5A0] to-[#00B880]'
                  }`}>
                    <Icon className="w-4 h-4 text-[#07070e]" />
                  </div>
                ) : (
                  <Icon className={`w-5 h-5 transition-colors ${
                    active ? 'text-[#00E5A0]' : 'text-[#4a4a66]'
                  }`} />
                )}
                <span className={`text-[10px] font-medium ${
                  item.highlight ? 'mt-4' : ''
                } ${active ? 'text-[#00E5A0]' : 'text-[#4a4a66]'}`}>
                  {item.label}
                </span>
                {active && !item.highlight && (
                  <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-[#00E5A0]" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}