import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Plus, Calendar, Search, Edit, Trash2, MapPin, ArrowRight, Briefcase, User as UserIcon, SlidersHorizontal } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { apiRequest, supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion } from 'motion/react';

interface Trip {
  id: string;
  date: string;
  time: string;
  start_location: string;
  end_location: string;
  distance_km: number;
  purpose: string;
  vehicle_id?: string;
  notes?: string;
}

interface Vehicle {
  id: string;
  name: string;
}

export default function Trips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPurpose, setFilterPurpose] = useState<string>('all');
  const [filterVehicle, setFilterVehicle] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const token = session.access_token;

      const [tripsResponse, vehiclesResponse] = await Promise.all([
        apiRequest('/trips', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        apiRequest('/vehicles', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setTrips(tripsResponse.trips || []);
      setVehicles(vehiclesResponse.vehicles || []);
    } catch (error) {
      console.error('Error loading trips:', error);
      toast.error('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const deleteTrip = async (id: string) => {
    if (!confirm('Delete this trip?')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await apiRequest(`/trips/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      setTrips(trips.filter(t => t.id !== id));
      toast.success('Trip deleted');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete trip');
    }
  };

  const getVehicleName = (vehicleId?: string) => {
    if (!vehicleId) return 'No vehicle';
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle?.name || 'Unknown';
  };

  const filteredTrips = trips.filter(trip => {
    const matchesPurpose = filterPurpose === 'all' || trip.purpose === filterPurpose;
    const matchesVehicle = filterVehicle === 'all' || trip.vehicle_id === filterVehicle;
    const matchesSearch =
      searchQuery === '' ||
      trip.start_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.end_location.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesPurpose && matchesVehicle && matchesSearch;
  });

  const totalDistance = filteredTrips.reduce((sum, t) => sum + t.distance_km, 0);

  if (loading) {
    return (
      <div className="p-5 md:p-8">
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-2 border-[#00E5A0]/30 border-t-[#00E5A0] rounded-full animate-spin" />
          <span className="text-[#8888a4] text-sm">Loading trips...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Trips</h1>
          <p className="text-sm text-[#8888a4] mt-0.5">{filteredTrips.length} trips &middot; {totalDistance.toFixed(1)} km total</p>
        </div>
        <Link to="/app/add-trip" className="hidden md:flex">
          <button className="h-10 px-5 rounded-xl bg-gradient-to-r from-[#00E5A0] to-[#00CC8E] text-[#07070e] font-semibold text-sm flex items-center gap-2 hover:shadow-[0_0_20px_rgba(0,229,160,0.25)] transition-all">
            <Plus className="w-4 h-4" />
            Add Trip
          </button>
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="mb-5 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a4a66]" />
            <input
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-[#4a4a66] focus:outline-none focus:border-[#00E5A0]/30 transition-all text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`h-11 w-11 rounded-xl border flex items-center justify-center transition-all ${
              showFilters ? 'bg-[#00E5A0]/10 border-[#00E5A0]/30 text-[#00E5A0]' : 'bg-white/[0.04] border-white/[0.08] text-[#8888a4]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="grid grid-cols-2 gap-3 overflow-hidden"
          >
            <Select value={filterPurpose} onValueChange={setFilterPurpose}>
              <SelectTrigger className="h-10 rounded-xl bg-white/[0.04] border-white/[0.08] text-white text-sm">
                <SelectValue placeholder="Purpose" />
              </SelectTrigger>
              <SelectContent className="bg-[#151524] border-white/[0.08] text-white">
                <SelectItem value="all">All purposes</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterVehicle} onValueChange={setFilterVehicle}>
              <SelectTrigger className="h-10 rounded-xl bg-white/[0.04] border-white/[0.08] text-white text-sm">
                <SelectValue placeholder="Vehicle" />
              </SelectTrigger>
              <SelectContent className="bg-[#151524] border-white/[0.08] text-white">
                <SelectItem value="all">All vehicles</SelectItem>
                {vehicles.map(vehicle => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
        )}
      </div>

      {/* Trips List */}
      {filteredTrips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
            <Calendar className="w-7 h-7 text-[#4a4a66]" />
          </div>
          <p className="text-[#8888a4] mb-1 font-medium">
            {trips.length === 0 ? 'No trips yet' : 'No matching trips'}
          </p>
          <p className="text-[#4a4a66] text-sm mb-6">
            {trips.length === 0 ? 'Add your first trip in seconds.' : 'Try adjusting your filters.'}
          </p>
          <Link to="/app/add-trip">
            <button className="h-10 px-5 rounded-xl bg-gradient-to-r from-[#00E5A0] to-[#00CC8E] text-[#07070e] font-semibold text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Trip
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTrips.map((trip, index) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
              className="group p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.10] transition-all duration-200"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-[#8888a4] mb-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{format(new Date(trip.date), 'MMM d, yyyy')}</span>
                    <span className="text-[#4a4a66]">&middot;</span>
                    <span>{trip.time}</span>
                  </div>

                  <div className="flex items-center gap-2 text-white mb-2.5">
                    <MapPin className="w-3.5 h-3.5 text-[#00E5A0] shrink-0" />
                    <span className="text-sm font-medium truncate">{trip.start_location}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#4a4a66] shrink-0" />
                    <span className="text-sm font-medium truncate">{trip.end_location}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-[#00E5A0]">
                      {trip.distance_km} km
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider ${
                      trip.purpose === 'business'
                        ? 'bg-[#8B5CF6]/15 text-[#A78BFA]'
                        : 'bg-white/[0.06] text-[#8888a4]'
                    }`}>
                      {trip.purpose === 'business' ? <Briefcase className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                      {trip.purpose}
                    </span>
                    <span className="text-xs text-[#4a4a66]">
                      {getVehicleName(trip.vehicle_id)}
                    </span>
                  </div>

                  {trip.notes && (
                    <p className="text-xs text-[#8888a4] mt-2 line-clamp-1">{trip.notes}</p>
                  )}
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link to={`/app/edit-trip/${trip.id}`}>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.06] text-[#8888a4] hover:text-white transition-all">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                  <button
                    onClick={() => deleteTrip(trip.id)}
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

      {/* Mobile FAB */}
      <Link to="/app/add-trip" className="md:hidden fixed bottom-24 right-5 z-20">
        <button className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00E5A0] to-[#00B880] text-[#07070e] flex items-center justify-center shadow-[0_0_30px_rgba(0,229,160,0.3)] hover:shadow-[0_0_40px_rgba(0,229,160,0.4)] active:scale-95 transition-all">
          <Plus className="w-6 h-6" />
        </button>
      </Link>
    </div>
  );
}
