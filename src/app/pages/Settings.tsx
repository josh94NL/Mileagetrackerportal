import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { User, Building2, LogOut, Download, Smartphone } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { apiRequest } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { toast } from 'sonner';

export default function Settings() {
  const navigate = useNavigate();
  const { profile, session, signOut, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
    }
    loadCompanyInfo();
  }, [profile]);

  const loadCompanyInfo = () => {
    const saved = localStorage.getItem('companyName');
    if (saved) setCompanyName(saved);
  };

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
        apiRequest('/trips', {
          headers: { Authorization: `Bearer ${session.access_token}` }
        }),
        apiRequest('/vehicles', {
          headers: { Authorization: `Bearer ${session.access_token}` }
        })
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

    // Note: Account deletion would require backend endpoint
    toast.error('Account deletion is not yet implemented. Please contact support.');
  };

  const installPWA = () => {
    toast.info('To install: Open browser menu → "Add to Home Screen"');
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="text-center py-12 text-gray-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Settings</h1>

      {/* User Profile */}
      <Card className="p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-teal-600" />
          <h2 className="text-xl font-semibold">User Profile</h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile?.email || ''}
              disabled
              className="h-12 text-base bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 text-base"
            />
          </div>

          <Button
            onClick={saveProfile}
            disabled={saving}
            className="w-full bg-teal-600 hover:bg-teal-700"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </Card>

      {/* Company Info */}
      <Card className="p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="w-5 h-5 text-teal-600" />
          <h2 className="text-xl font-semibold">Company Info</h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company">Company Name (optional)</Label>
            <Input
              id="company"
              type="text"
              placeholder="Your company name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="h-12 text-base"
            />
            <p className="text-sm text-gray-500">
              Used in export headers
            </p>
          </div>

          <Button
            onClick={saveCompanyInfo}
            variant="outline"
            className="w-full"
          >
            Save Company Info
          </Button>
        </div>
      </Card>

      {/* PWA Installation */}
      <Card className="p-6 mb-4 bg-gradient-to-br from-teal-50 to-white">
        <div className="flex items-center gap-3 mb-4">
          <Smartphone className="w-5 h-5 text-teal-600" />
          <h2 className="text-xl font-semibold">Install App</h2>
        </div>

        <p className="text-gray-600 mb-4">
          Install Mileage Tracker on your home screen for a native app experience.
        </p>

        <Button
          onClick={installPWA}
          variant="outline"
          className="w-full border-teal-600 text-teal-600 hover:bg-teal-50"
        >
          <Download className="w-4 h-4 mr-2" />
          Add to Home Screen
        </Button>
      </Card>

      {/* Data Management */}
      <Card className="p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <Download className="w-5 h-5 text-teal-600" />
          <h2 className="text-xl font-semibold">Data Management</h2>
        </div>

        <div className="space-y-3">
          <Button
            onClick={exportAllData}
            variant="outline"
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Export All Data
          </Button>

          <p className="text-sm text-gray-500">
            Download all your trips, vehicles, and profile data as JSON.
          </p>
        </div>
      </Card>

      <Separator className="my-6" />

      {/* Actions */}
      <div className="space-y-3">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Log Out
        </Button>

        <Button
          onClick={deleteAccount}
          variant="outline"
          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
        >
          Delete Account
        </Button>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        Mileage Tracker v1.0.0
      </div>
    </div>
  );
}