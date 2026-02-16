import { useState, useEffect } from 'react';
import { Plus, Car, Edit, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Card } from '../components/ui/card';
import { apiRequest, supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface Vehicle {
  id: string;
  name: string;
  license_plate: string;
  current_odometer: number;
}

export default function Vehicles() {
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
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await apiRequest('/vehicles', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      setVehicles(response.vehicles || []);
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
    setSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const vehicleData = {
        name,
        license_plate: licensePlate,
        current_odometer: parseFloat(currentOdometer) || 0,
      };

      if (editingVehicle) {
        // Update
        await apiRequest(`/vehicles/${editingVehicle.id}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify(vehicleData),
        });
        toast.success('Vehicle updated');
      } else {
        // Create
        await apiRequest('/vehicles', {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify(vehicleData),
        });
        toast.success('Vehicle added');
      }

      loadVehicles();
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

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

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
      <div className="p-4 md:p-6">
        <div className="text-center py-12 text-gray-500">Loading vehicles...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Vehicles</h1>
        <Button
          onClick={() => openDialog()}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      {vehicles.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <Car className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-600 mb-4">
            No vehicles yet. Add your first vehicle to start tracking.
          </p>
          <Button
            onClick={() => openDialog()}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Vehicle
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="p-4">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Car className="w-5 h-5 text-teal-600" />
                    <h3 className="font-bold text-lg">{vehicle.name}</h3>
                  </div>
                  {vehicle.license_plate && (
                    <p className="text-sm text-gray-600 mb-2">
                      {vehicle.license_plate}
                    </p>
                  )}
                  <div className="text-sm">
                    <span className="text-gray-500">Current odometer: </span>
                    <span className="font-semibold">{vehicle.current_odometer.toLocaleString()} km</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openDialog(vehicle)}
                    className="h-9 w-9"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteVehicle(vehicle.id)}
                    className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Vehicle Name</Label>
              <Input
                id="name"
                placeholder="e.g., Honda Civic"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_plate">License Plate</Label>
              <Input
                id="license_plate"
                placeholder="ABC-123"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_odometer">Current Odometer (km)</Label>
              <Input
                id="current_odometer"
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={currentOdometer}
                onChange={(e) => setCurrentOdometer(e.target.value)}
                className="h-12 text-base"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700"
                disabled={saving}
              >
                {saving ? 'Saving...' : editingVehicle ? 'Update' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
