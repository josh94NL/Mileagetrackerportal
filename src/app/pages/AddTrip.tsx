import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, MapPin, Gauge, Repeat, Copy } from 'lucide-react';
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
  current_odometer: number;
}

interface Trip {
  id: string;
  start_location: string;
  end_location: string;
  odometer_start: number;
  odometer_end: number;
  vehicle_id?: string;
}

export default function AddTrip() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [lastTrip, setLastTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(false);
  const startLocationRef = useRef<HTMLInputElement>(null);

  // Form state with defaults
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toTimeString().slice(0, 5);
  
  const [date, setDate] = useState(today);
  const [time, setTime] = useState(now);
  const [vehicleId, setVehicleId] = useState('');
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [odometerStart, setOdometerStart] = useState('');
  const [odometerEnd, setOdometerEnd] = useState('');
  const [purpose, setPurpose] = useState('business');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Auto-focus first field
    startLocationRef.current?.focus();
  }, []);

  useEffect(() => {
    // Auto-select vehicle if only one exists
    if (vehicles.length === 1 && !vehicleId) {
      setVehicleId(vehicles[0].id);
      // Pre-fill odometer start from vehicle
      if (!odometerStart && vehicles[0].current_odometer > 0) {
        setOdometerStart(vehicles[0].current_odometer.toString());
      }
    }
  }, [vehicles, vehicleId, odometerStart]);

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
      
      // Get last trip
      const trips = tripsResponse.trips || [];
      if (trips.length > 0) {
        setLastTrip(trips[0]); // Already sorted by date desc
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const useCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Location not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
        setEndLocation(location);
        toast.success('Location captured');
      },
      (error) => {
        console.error('Location error:', error);
        toast.error('Location permission denied — enter manually.');
      }
    );
  };

  const useSameAsLastTrip = () => {
    if (!lastTrip) {
      toast.error('No previous trip found');
      return;
    }

    setStartLocation(lastTrip.end_location);
    if (lastTrip.odometer_end) {
      setOdometerStart(lastTrip.odometer_end.toString());
    }
    toast.success('Filled from last trip');
  };

  const duplicateLastTrip = () => {
    if (!lastTrip) {
      toast.error('No previous trip found');
      return;
    }

    setStartLocation(lastTrip.start_location);
    setEndLocation(lastTrip.end_location);
    setOdometerStart(lastTrip.odometer_start.toString());
    setOdometerEnd(lastTrip.odometer_end.toString());
    if (lastTrip.vehicle_id) {
      setVehicleId(lastTrip.vehicle_id);
    }
    toast.success('Trip duplicated');
  };

  const reverseLocations = () => {
    const temp = startLocation;
    setStartLocation(endLocation);
    setEndLocation(temp);
    toast.success('Locations reversed');
  };

  const calculateDistance = () => {
    const start = parseFloat(odometerStart);
    const end = parseFloat(odometerEnd);
    if (isNaN(start) || isNaN(end)) return 0;
    return Math.max(0, end - start);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
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

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await apiRequest('/trips', {
        method: 'POST',
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

      toast.success('Trip saved.');
      navigate('/app/trips');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save trip');
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-2xl md:text-3xl font-bold">Add Trip</h1>
      </div>

      {/* Quick Actions */}
      <Card className="p-4 mb-4">
        <div className="text-sm font-medium text-gray-700 mb-3">Quick actions</div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={useSameAsLastTrip}
            disabled={!lastTrip}
            className="text-xs h-9"
          >
            <Repeat className="w-3 h-3 mr-1" />
            Same as last trip
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={duplicateLastTrip}
            disabled={!lastTrip}
            className="text-xs h-9"
          >
            <Copy className="w-3 h-3 mr-1" />
            Duplicate last trip
          </Button>
        </div>
      </Card>

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
            <div className="text-sm text-gray-500">
              No vehicles yet. <button
                type="button"
                onClick={() => navigate('/app/vehicles')}
                className="text-teal-600 underline"
              >
                Add one
              </button>
            </div>
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
          <div className="flex items-center justify-between">
            <Label className="text-base">Locations</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={reverseLocations}
              className="text-xs"
            >
              <Repeat className="w-3 h-3 mr-1" />
              Reverse
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="start_location">Start Location</Label>
            <Input
              id="start_location"
              ref={startLocationRef}
              placeholder="Enter start location"
              value={startLocation}
              onChange={(e) => setStartLocation(e.target.value)}
              required
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="end_location">End Location</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={useCurrentLocation}
                className="text-xs"
              >
                <MapPin className="w-3 h-3 mr-1" />
                Use current location
              </Button>
            </div>
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

          {/* Distance Display */}
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
        <Button
          type="submit"
          className="w-full h-14 text-lg font-semibold bg-teal-600 hover:bg-teal-700 sticky bottom-4"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Trip'}
        </Button>
      </form>
    </div>
  );
}
