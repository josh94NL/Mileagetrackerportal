import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { User, Building2, LogOut, Download, Smartphone, Shield, ChevronRight } from 'lucide-react';
import { apiRequest } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export default function Settings() {
  const navigate = useNavigate();
  const { profile, session, signOut, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
    }
    const saved = localStorage.getItem('companyName');
    if (saved) setCompanyName(saved);
  }, [profile]);

  const saveProfile = async () => {
    if (!session) return;
    setSaving(true);
    try {
      await apiRequest('/profile', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ name }),
      });
      await refreshProfile();
      toast.success('Profile updated');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const saveCompanyInfo = () => {
    localStorage.setItem('companyName', companyName);
    toast.success('Company info saved');
  };

  const exportAllData = async () => {
    if (!session) return;
    try {
      const [tripsResponse, vehiclesResponse] = await Promise.all([
        apiRequest('/trips', { headers: { Authorization: `Bearer ${session.access_token}` } }),
        apiRequest('/vehicles', { headers: { Authorization: `Bearer ${session.access_token}` } })
      ]);

      const exportData = {
        profile: profile,
        trips: tripsResponse.trips || [],
        vehicles: vehiclesResponse.vehicles || [],
        exported_at: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mileage-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };

  const deleteAccount = async () => {
    const confirmed = confirm(
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.'
    );
    if (!confirmed) return;

    const doubleConfirm = prompt('Type "DELETE" to confirm account deletion:');
    if (doubleConfirm !== 'DELETE') {
      toast.error('Account deletion cancelled');
      return;
    }
    toast.error('Account deletion is not yet implemented. Please contact support.');
  };

  const installPWA = () => {
    toast.info('To install: Open browser menu > "Add to Home Screen"');
  };

  return (
    <div className="p-5 md:p-8 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-sm text-[#8888a4] mt-0.5">Manage your account and preferences</p>
      </motion.div>

      {/* Profile */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-4"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E5A0]/15 to-[#8B5CF6]/15 border border-white/[0.06] flex items-center justify-center">
            <User className="w-5 h-5 text-[#00E5A0]" />
          </div>
          <div>
            <h2 className="font-bold text-white">Profile</h2>
            <p className="text-xs text-[#8888a4]">{profile?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-[#8888a4] font-medium">Email</label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full h-12 px-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[#4a4a66] cursor-not-allowed"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-[#8888a4] font-medium">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-[#4a4a66] focus:outline-none focus:border-[#00E5A0]/30 transition-all"
            />
          </div>
          <button
            onClick={saveProfile}
            disabled={saving}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-[#00E5A0] to-[#00CC8E] text-[#07070e] font-semibold text-sm hover:shadow-[0_0_20px_rgba(0,229,160,0.2)] transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </motion.div>

      {/* Company Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-4"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6]/15 to-[#EC4899]/15 border border-white/[0.06] flex items-center justify-center">
            <Building2 className="w-5 h-5 text-[#8B5CF6]" />
          </div>
          <div>
            <h2 className="font-bold text-white">Company Info</h2>
            <p className="text-xs text-[#8888a4]">Used in export headers</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-[#8888a4] font-medium">Company Name (optional)</label>
            <input
              type="text"
              placeholder="Your company name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-[#4a4a66] focus:outline-none focus:border-[#00E5A0]/30 transition-all"
            />
          </div>
          <button
            onClick={saveCompanyInfo}
            className="w-full h-11 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white font-medium text-sm hover:bg-white/[0.06] transition-all"
          >
            Save Company Info
          </button>
        </div>
      </motion.div>

      {/* Install App */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-5 rounded-2xl bg-gradient-to-br from-[#00E5A0]/[0.07] to-[#8B5CF6]/[0.07] border border-white/[0.06] mb-4"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#00E5A0]/10 border border-[#00E5A0]/20 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-[#00E5A0]" />
          </div>
          <div>
            <h2 className="font-bold text-white">Install App</h2>
            <p className="text-xs text-[#8888a4]">Native app experience</p>
          </div>
        </div>
        <p className="text-sm text-[#8888a4] mb-4">
          Install Mileage Tracker on your home screen for quick access and offline capability.
        </p>
        <button
          onClick={installPWA}
          className="w-full h-11 rounded-xl border border-[#00E5A0]/20 bg-[#00E5A0]/10 text-[#00E5A0] font-semibold text-sm hover:bg-[#00E5A0]/15 transition-all flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Add to Home Screen
        </button>
      </motion.div>

      {/* Data Management */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center">
            <Download className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <div>
            <h2 className="font-bold text-white">Data Management</h2>
            <p className="text-xs text-[#8888a4]">Export or manage your data</p>
          </div>
        </div>
        <button
          onClick={exportAllData}
          className="w-full h-11 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white font-medium text-sm hover:bg-white/[0.06] transition-all flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export All Data (JSON)
        </button>
      </motion.div>

      {/* Divider */}
      <div className="border-t border-white/[0.06] my-6" />

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <button
          onClick={handleLogout}
          className="w-full h-12 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white font-medium flex items-center justify-center gap-2 hover:bg-white/[0.06] transition-all"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>

        <button
          onClick={deleteAccount}
          className="w-full h-12 rounded-xl border border-[#ff4466]/15 bg-[#ff4466]/[0.05] text-[#ff4466] font-medium flex items-center justify-center gap-2 hover:bg-[#ff4466]/[0.08] transition-all"
        >
          <Shield className="w-4 h-4" />
          Delete Account
        </button>
      </motion.div>

      <div className="mt-10 text-center text-xs text-[#4a4a66]">
        Mileage Tracker v1.0.0
      </div>
    </div>
  );
}
