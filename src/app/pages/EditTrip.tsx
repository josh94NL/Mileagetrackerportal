import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, MapPin, Gauge, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card } from '../components/ui/card';
import { apiRequest, supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface Vehicle {
  id: string;
  name: string;
}

interface Trip {
  id: string;
  date: string;
  time: string;
  vehicle_id?: string;
  start_location: string;
  end_location: string;
  odometer_start: number;
  odometer_end: number;
  purpose: string;
  notes?: string;
}

export default function EditTrip() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [odometerStart, setOdometerStart] = useState('');
  const [odometerEnd, setOdometerEnd] = useState('');
  const [purpose, setPurpose] = useState('business');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const token = session.access_token;

      const [vehiclesResponse, tripsResponse] = await Promise.all([
        apiRequest('/vehicles', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        apiRequest('/trips', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setVehicles(vehiclesResponse.vehicles || []);
      
      const trip = tripsResponse.trips?.find((t: Trip) => t.id === id);
      if (trip) {
        setDate(trip.date);
        setTime(trip.time);
        setVehicleId(trip.vehicle_id || '');
        setStartLocation(trip.start_location);
        setEndLocation(trip.end_location);
        setOdometerStart(trip.odometer_start.toString());
        setOdometerEnd(trip.odometer_end.toString());
        setPurpose(trip.purpose);
        setNotes(trip.notes || '');
      } else {
        toast.error('Trip not found');
        navigate('/app/trips');
      }
    } catch (error) {
      console.error('Error loading trip:', error);
      toast.error('Failed to load trip');
      navigate('/app/trips');
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = () => {
    const start = parseFloat(odometerStart);
    const end = parseFloat(odometerEnd);
    if (isNaN(start) || isNaN(end)) return 0;
    return Math.max(0, end - start);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const start = parseFloat(odometerStart);
    const end = parseFloat(odometerEnd);
    
    if (isNaN(start) || isNaN(end)) {
      toast.error('Enter a valid km value.');
      return;
    }
    
    if (end <= start) {
      toast.error('Odometer end must be greater than odometer start.');
      return;
    }

    setSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await apiRequest(`/trips/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          date,
          time,
          vehicle_id: vehicleId || undefined,
          start_location: startLocation,
          end_location: endLocation,
          odometer_start: start,
          odometer_end: end,
          purpose,
          notes,
        }),
      });

      toast.success('Trip updated.');
      navigate('/app/trips');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update trip');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this trip?')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await apiRequest(`/trips/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      toast.success('Trip deleted');
      navigate('/app/trips');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete trip');
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="text-center py-12 text-gray-500">Loading trip...</div>
      </div>
    );
  }

  const distance = calculateDistance();

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="h-10 w-10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold flex-1">Edit Trip</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          className="h-10 w-10 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-5 h-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="h-12 text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="h-12 text-base"
            />
          </div>
        </div>

        {/* Vehicle */}
        <div className="space-y-2">
          <Label htmlFor="vehicle">Vehicle</Label>
          {vehicles.length === 0 ? (
            <div className="text-sm text-gray-500">No vehicles available</div>
          ) : (
            <Select value={vehicleId} onValueChange={setVehicleId}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Select vehicle (optional)" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map(vehicle => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Locations */}
        <Card className="p-4 space-y-4 border-2 border-teal-100">
          <Label className="text-base">Locations</Label>

          <div className="space-y-2">
            <Label htmlFor="start_location">Start Location</Label>
            <Input
              id="start_location"
              placeholder="Enter start location"
              value={startLocation}
              onChange={(e) => setStartLocation(e.target.value)}
              required
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_location">End Location</Label>
            <Input
              id="end_location"
              placeholder="Enter end location"
              value={endLocation}
              onChange={(e) => setEndLocation(e.target.value)}
              required
              className="h-12 text-base"
            />
          </div>
        </Card>

        {/* Odometer */}
        <Card className="p-4 space-y-4 border-2 border-teal-100">
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-teal-600" />
            <Label className="text-base">Odometer</Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="odometer_start">Start (km)</Label>
              <Input
                id="odometer_start"
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={odometerStart}
                onChange={(e) => setOdometerStart(e.target.value)}
                required
                className="h-14 text-lg font-bold text-center"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="odometer_end">End (km)</Label>
              <Input
                id="odometer_end"
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={odometerEnd}
                onChange={(e) => setOdometerEnd(e.target.value)}
                required
                className="h-14 text-lg font-bold text-center"
              />
            </div>
          </div>

          <div className="bg-teal-50 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-600 mb-1">Distance</div>
            <div className="text-3xl font-bold text-teal-600">
              {distance.toFixed(1)} km
            </div>
          </div>
        </Card>

        {/* Purpose */}
        <div className="space-y-2">
          <Label>Purpose</Label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={purpose === 'business' ? 'default' : 'outline'}
              className={`h-12 ${purpose === 'business' ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
              onClick={() => setPurpose('business')}
            >
              Business
            </Button>
            <Button
              type="button"
              variant={purpose === 'private' ? 'default' : 'outline'}
              className={`h-12 ${purpose === 'private' ? 'bg-gray-600 hover:bg-gray-700' : ''}`}
              onClick={() => setPurpose('private')}
            >
              Private
            </Button>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            placeholder="Add any notes about this trip..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="text-base"
          />
        </div>

        {/* Submit */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            className="h-12 text-base"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="h-12 text-base bg-teal-600 hover:bg-teal-700"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Trip'}
          </Button>
        </div>
      </form>
    </div>
  );
}
