import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Gauge, Trash2, Briefcase, User as UserIcon, MapPin } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { apiRequest, supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { motion } from 'motion/react';

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
        apiRequest('/vehicles', { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest('/trips', { headers: { Authorization: `Bearer ${token}` } })
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
    if (isNaN(start) || isNaN(end)) { toast.error('Enter valid km values'); return; }
    if (end <= start) { toast.error('End must be greater than start'); return; }

    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await apiRequest(`/trips/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          date, time, vehicle_id: vehicleId || undefined,
          start_location: startLocation, end_location: endLocation,
          odometer_start: start, odometer_end: end, purpose, notes,
        }),
      });
      toast.success('Trip updated');
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
      <div className="p-5 md:p-8">
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-2 border-[#00E5A0]/30 border-t-[#00E5A0] rounded-full animate-spin" />
          <span className="text-[#8888a4] text-sm">Loading trip...</span>
        </div>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold text-white tracking-tight flex-1">Edit Trip</h1>
        <button
          onClick={handleDelete}
          className="w-10 h-10 rounded-xl bg-[#ff4466]/10 border border-[#ff4466]/20 flex items-center justify-center text-[#ff4466] hover:bg-[#ff4466]/15 transition-all"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
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
        </div>

        {/* Vehicle */}
        <div className="space-y-1.5">
          <label className="text-xs text-[#8888a4] font-medium">Vehicle</label>
          {vehicles.length === 0 ? (
            <p className="text-sm text-[#4a4a66]">No vehicles available</p>
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
        </div>

        {/* Locations */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4">
          <div className="flex items-center gap-2 text-[#00E5A0]">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-semibold text-white">Locations</span>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-[#8888a4] font-medium">Start</label>
            <input
              placeholder="Start location"
              value={startLocation}
              onChange={(e) => setStartLocation(e.target.value)}
              required
              className="w-full h-12 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-[#4a4a66] focus:outline-none focus:border-[#00E5A0]/30 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-[#8888a4] font-medium">End</label>
            <input
              placeholder="End location"
              value={endLocation}
              onChange={(e) => setEndLocation(e.target.value)}
              required
              className="w-full h-12 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-[#4a4a66] focus:outline-none focus:border-[#00E5A0]/30 transition-all"
            />
          </div>
        </div>

        {/* Odometer */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4">
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
          <div className="relative rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00E5A0]/10 to-[#8B5CF6]/10" />
            <div className="relative p-4 text-center">
              <div className="text-xs text-[#8888a4] mb-1 uppercase tracking-wider font-medium">Distance</div>
              <div className="text-4xl font-bold bg-gradient-to-r from-[#00E5A0] to-[#06D6A0] bg-clip-text text-transparent">
                {distance.toFixed(1)} km
              </div>
            </div>
          </div>
        </div>

        {/* Purpose */}
        <div className="space-y-2">
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
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-xs text-[#8888a4] font-medium">Notes (optional)</label>
          <textarea
            placeholder="Add any notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-[#4a4a66] focus:outline-none focus:border-[#00E5A0]/30 transition-all resize-none text-sm"
          />
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="h-12 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white font-medium hover:bg-white/[0.06] transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-12 rounded-xl bg-gradient-to-r from-[#00E5A0] to-[#00CC8E] text-[#07070e] font-semibold hover:shadow-[0_0_20px_rgba(0,229,160,0.25)] transition-all disabled:opacity-50"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Update Trip'}
          </button>
        </div>
      </form>
    </div>
  );
}
