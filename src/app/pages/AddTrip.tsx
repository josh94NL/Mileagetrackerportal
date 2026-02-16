import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, MapPin, Gauge, Repeat, Copy, Briefcase, User as UserIcon, Navigation } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { apiRequest, supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { motion } from 'motion/react';

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
    startLocationRef.current?.focus();
  }, []);

  useEffect(() => {
    if (vehicles.length === 1 && !vehicleId) {
      setVehicleId(vehicles[0].id);
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
        apiRequest('/vehicles', { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest('/trips', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setVehicles(vehiclesResponse.vehicles || []);
      const trips = tripsResponse.trips || [];
      if (trips.length > 0) setLastTrip(trips[0]);
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
      () => toast.error('Location permission denied')
    );
  };

  const useSameAsLastTrip = () => {
    if (!lastTrip) { toast.error('No previous trip'); return; }
    setStartLocation(lastTrip.end_location);
    if (lastTrip.odometer_end) setOdometerStart(lastTrip.odometer_end.toString());
    toast.success('Filled from last trip');
  };

  const duplicateLastTrip = () => {
    if (!lastTrip) { toast.error('No previous trip'); return; }
    setStartLocation(lastTrip.start_location);
    setEndLocation(lastTrip.end_location);
    setOdometerStart(lastTrip.odometer_start.toString());
    setOdometerEnd(lastTrip.odometer_end.toString());
    if (lastTrip.vehicle_id) setVehicleId(lastTrip.vehicle_id);
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
    const start = parseFloat(odometerStart);
    const end = parseFloat(odometerEnd);
    if (isNaN(start) || isNaN(end)) { toast.error('Enter valid km values'); return; }
    if (end <= start) { toast.error('End must be greater than start'); return; }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await apiRequest('/trips', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          date, time, vehicle_id: vehicleId || undefined,
          start_location: startLocation, end_location: endLocation,
          odometer_start: start, odometer_end: end, purpose, notes,
        }),
      });
      toast.success('Trip saved!');
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
    <div className="p-5 md:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#8888a4] hover:text-white hover:bg-white/[0.06] transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-white tracking-tight">Add Trip</h1>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-2.5 mb-6"
      >
        <button
          type="button"
          onClick={useSameAsLastTrip}
          disabled={!lastTrip}
          className="flex items-center justify-center gap-2 h-11 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-[#A78BFA] text-xs font-semibold hover:bg-[#8B5CF6]/15 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Repeat className="w-3.5 h-3.5" />
          Continue last trip
        </button>
        <button
          type="button"
          onClick={duplicateLastTrip}
          disabled={!lastTrip}
          className="flex items-center justify-center gap-2 h-11 rounded-xl bg-[#06B6D4]/10 border border-[#06B6D4]/20 text-[#22D3EE] text-xs font-semibold hover:bg-[#06B6D4]/15 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Copy className="w-3.5 h-3.5" />
          Duplicate last trip
        </button>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Date & Time */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-[#8888a4] font-medium">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full h-12 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-[#00E5A0]/30 transition-all [color-scheme:dark]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-[#8888a4] font-medium">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="w-full h-12 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-[#00E5A0]/30 transition-all [color-scheme:dark]"
            />
          </div>
        </motion.div>

        {/* Vehicle */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-1.5">
          <label className="text-xs text-[#8888a4] font-medium">Vehicle</label>
          {vehicles.length === 0 ? (
            <p className="text-sm text-[#4a4a66]">
              No vehicles yet.{' '}
              <button type="button" onClick={() => navigate('/app/vehicles')} className="text-[#00E5A0] underline">Add one</button>
            </p>
          ) : (
            <Select value={vehicleId} onValueChange={setVehicleId}>
              <SelectTrigger className="h-12 rounded-xl bg-white/[0.04] border-white/[0.08] text-white">
                <SelectValue placeholder="Select vehicle" />
              </SelectTrigger>
              <SelectContent className="bg-[#151524] border-white/[0.08] text-white">
                {vehicles.map(v => (
                  <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </motion.div>

        {/* Locations */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#00E5A0]">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-semibold text-white">Locations</span>
            </div>
            <button
              type="button"
              onClick={reverseLocations}
              className="flex items-center gap-1 text-xs text-[#8888a4] hover:text-white transition-colors"
            >
              <Repeat className="w-3 h-3" />
              Reverse
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-[#8888a4] font-medium">Start</label>
            <input
              ref={startLocationRef}
              placeholder="Enter start location"
              value={startLocation}
              onChange={(e) => setStartLocation(e.target.value)}
              required
              className="w-full h-12 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-[#4a4a66] focus:outline-none focus:border-[#00E5A0]/30 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs text-[#8888a4] font-medium">End</label>
              <button
                type="button"
                onClick={useCurrentLocation}
                className="flex items-center gap-1 text-xs text-[#8B5CF6] hover:text-[#A78BFA] transition-colors"
              >
                <Navigation className="w-3 h-3" />
                Current location
              </button>
            </div>
            <input
              placeholder="Enter end location"
              value={endLocation}
              onChange={(e) => setEndLocation(e.target.value)}
              required
              className="w-full h-12 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-[#4a4a66] focus:outline-none focus:border-[#00E5A0]/30 transition-all"
            />
          </div>
        </motion.div>

        {/* Odometer */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4"
        >
          <div className="flex items-center gap-2 text-[#00E5A0]">
            <Gauge className="w-4 h-4" />
            <span className="text-sm font-semibold text-white">Odometer</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-[#8888a4] font-medium">Start (km)</label>
              <input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={odometerStart}
                onChange={(e) => setOdometerStart(e.target.value)}
                required
                className="w-full h-14 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xl font-bold text-center placeholder:text-[#4a4a66] focus:outline-none focus:border-[#00E5A0]/30 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-[#8888a4] font-medium">End (km)</label>
              <input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={odometerEnd}
                onChange={(e) => setOdometerEnd(e.target.value)}
                required
                className="w-full h-14 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xl font-bold text-center placeholder:text-[#4a4a66] focus:outline-none focus:border-[#00E5A0]/30 transition-all"
              />
            </div>
          </div>

          {/* Distance Display */}
          <div className="relative rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00E5A0]/10 to-[#8B5CF6]/10" />
            <div className="relative p-4 text-center">
              <div className="text-xs text-[#8888a4] mb-1 uppercase tracking-wider font-medium">Distance</div>
              <div className="text-4xl font-bold bg-gradient-to-r from-[#00E5A0] to-[#06D6A0] bg-clip-text text-transparent">
                {distance.toFixed(1)} km
              </div>
            </div>
          </div>
        </motion.div>

        {/* Purpose */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="space-y-2">
          <label className="text-xs text-[#8888a4] font-medium">Purpose</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPurpose('business')}
              className={`h-12 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                purpose === 'business'
                  ? 'bg-[#8B5CF6]/15 border-2 border-[#8B5CF6]/40 text-[#A78BFA]'
                  : 'bg-white/[0.03] border border-white/[0.08] text-[#8888a4] hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Business
            </button>
            <button
              type="button"
              onClick={() => setPurpose('private')}
              className={`h-12 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                purpose === 'private'
                  ? 'bg-white/[0.08] border-2 border-white/[0.20] text-white'
                  : 'bg-white/[0.03] border border-white/[0.08] text-[#8888a4] hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              Private
            </button>
          </div>
        </motion.div>

        {/* Notes */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-1.5">
          <label className="text-xs text-[#8888a4] font-medium">Notes (optional)</label>
          <textarea
            placeholder="Add any notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-[#4a4a66] focus:outline-none focus:border-[#00E5A0]/30 transition-all resize-none text-sm"
          />
        </motion.div>

        {/* Submit */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <button
            type="submit"
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#00E5A0] to-[#00CC8E] text-[#07070e] font-bold text-lg flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(0,229,160,0.3)] transition-all duration-300 active:scale-[0.98] disabled:opacity-50 sticky bottom-4"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Trip'}
          </button>
        </motion.div>
      </form>
    </div>
  );
}
