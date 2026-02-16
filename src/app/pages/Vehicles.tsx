import { useState, useEffect } from 'react';
import { Plus, Car, Edit, Trash2, Gauge, X } from 'lucide-react';
import { apiRequest } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

interface Vehicle {
  id: string;
  name: string;
  license_plate: string;
  current_odometer: number;
}

export default function Vehicles() {
  const { session } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [currentOdometer, setCurrentOdometer] = useState('');

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    if (!session) {
      setLoading(false);
      return;
    }
    try {
      const response = await apiRequest('/vehicles', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (response.error) {
        toast.error(response.error);
      } else {
        setVehicles(response.vehicles || []);
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setName(vehicle.name);
      setLicensePlate(vehicle.license_plate);
      setCurrentOdometer(vehicle.current_odometer.toString());
    } else {
      setEditingVehicle(null);
      setName('');
      setLicensePlate('');
      setCurrentOdometer('');
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingVehicle(null);
    setName('');
    setLicensePlate('');
    setCurrentOdometer('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) { toast.error('Not authenticated'); return; }
    setSaving(true);

    try {
      const vehicleData = {
        name,
        license_plate: licensePlate,
        current_odometer: parseFloat(currentOdometer) || 0,
      };

      if (editingVehicle) {
        const response = await apiRequest(`/vehicles/${editingVehicle.id}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify(vehicleData),
        });
        if (response.error) { toast.error(response.error); setSaving(false); return; }
        toast.success('Vehicle updated');
      } else {
        const response = await apiRequest('/vehicles', {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify(vehicleData),
        });
        if (response.error) { toast.error(response.error); setSaving(false); return; }
        toast.success('Vehicle added');
      }

      await loadVehicles();
      closeDialog();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save vehicle');
    } finally {
      setSaving(false);
    }
  };

  const deleteVehicle = async (id: string) => {
    if (!confirm('Delete this vehicle?')) return;
    if (!session) { toast.error('Not authenticated'); return; }

    try {
      await apiRequest(`/vehicles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      setVehicles(vehicles.filter(v => v.id !== id));
      toast.success('Vehicle deleted');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete vehicle');
    }
  };

  if (loading) {
    return (
      <div className="p-5 md:p-8">
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-2 border-[#00E5A0]/30 border-t-[#00E5A0] rounded-full animate-spin" />
          <span className="text-[#8888a4] text-sm">Loading vehicles...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Vehicles</h1>
          <p className="text-sm text-[#8888a4] mt-0.5">{vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => openDialog()}
          className="h-10 px-5 rounded-xl bg-gradient-to-r from-[#00E5A0] to-[#00CC8E] text-[#07070e] font-semibold text-sm flex items-center gap-2 hover:shadow-[0_0_20px_rgba(0,229,160,0.25)] transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Vehicle
        </button>
      </div>

      {vehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
            <Car className="w-7 h-7 text-[#4a4a66]" />
          </div>
          <p className="text-[#8888a4] mb-1 font-medium">No vehicles yet</p>
          <p className="text-[#4a4a66] text-sm mb-6">Add your first vehicle to start tracking</p>
          <button
            onClick={() => openDialog()}
            className="h-10 px-5 rounded-xl bg-gradient-to-r from-[#00E5A0] to-[#00CC8E] text-[#07070e] font-semibold text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Vehicle
          </button>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {vehicles.map((vehicle, index) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="group p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.10] transition-all duration-200"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E5A0]/15 to-[#8B5CF6]/15 border border-white/[0.06] flex items-center justify-center">
                      <Car className="w-5 h-5 text-[#00E5A0]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{vehicle.name}</h3>
                      {vehicle.license_plate && (
                        <p className="text-xs text-[#8888a4]">{vehicle.license_plate}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03]">
                    <Gauge className="w-3.5 h-3.5 text-[#8888a4]" />
                    <span className="text-xs text-[#8888a4]">Odometer:</span>
                    <span className="text-sm font-semibold text-[#00E5A0]">{vehicle.current_odometer.toLocaleString()} km</span>
                  </div>
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openDialog(vehicle)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.06] text-[#8888a4] hover:text-white transition-all"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteVehicle(vehicle.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#ff4466]/10 text-[#8888a4] hover:text-[#ff4466] transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Dialog */}
      <AnimatePresence>
        {dialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4"
            onClick={closeDialog}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="w-full max-w-md rounded-2xl bg-[#12121a] border border-white/[0.08] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
                <h2 className="text-lg font-bold text-white">
                  {editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
                </h2>
                <button
                  onClick={closeDialog}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.06] text-[#8888a4] transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-[#8888a4] font-medium">Vehicle Name</label>
                  <input
                    placeholder="e.g., Honda Civic"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full h-12 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-[#4a4a66] focus:outline-none focus:border-[#00E5A0]/30 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-[#8888a4] font-medium">License Plate</label>
                  <input
                    placeholder="ABC-123"
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-[#4a4a66] focus:outline-none focus:border-[#00E5A0]/30 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-[#8888a4] font-medium">Current Odometer (km)</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    value={currentOdometer}
                    onChange={(e) => setCurrentOdometer(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-[#4a4a66] focus:outline-none focus:border-[#00E5A0]/30 transition-all"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeDialog}
                    disabled={saving}
                    className="flex-1 h-12 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white font-medium hover:bg-white/[0.06] transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-[#00E5A0] to-[#00CC8E] text-[#07070e] font-semibold hover:shadow-[0_0_20px_rgba(0,229,160,0.25)] transition-all disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : editingVehicle ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
