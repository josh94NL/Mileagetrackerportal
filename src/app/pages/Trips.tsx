import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Plus, Calendar, Filter, Edit, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card } from '../components/ui/card';
import { apiRequest, supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { format } from 'date-fns';

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
    return vehicle?.name || 'Unknown vehicle';
  };

  // Filter trips
  const filteredTrips = trips.filter(trip => {
    const matchesPurpose = filterPurpose === 'all' || trip.purpose === filterPurpose;
    const matchesVehicle = filterVehicle === 'all' || trip.vehicle_id === filterVehicle;
    const matchesSearch = 
      searchQuery === '' ||
      trip.start_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.end_location.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesPurpose && matchesVehicle && matchesSearch;
  });

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="text-center py-12 text-gray-500">Loading trips...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Trips</h1>
        <Link to="/app/add-trip" className="hidden md:block">
          <Button className="bg-teal-600 hover:bg-teal-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Trip
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </div>
        
        <Input
          placeholder="Search locations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10"
        />

        <div className="grid grid-cols-2 gap-3">
          <Select value={filterPurpose} onValueChange={setFilterPurpose}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Purpose" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All purposes</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterVehicle} onValueChange={setFilterVehicle}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Vehicle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All vehicles</SelectItem>
              {vehicles.map(vehicle => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Trips List */}
      {filteredTrips.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <Calendar className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-600 mb-4">
            {trips.length === 0 
              ? "No trips yet — add your first trip in seconds."
              : "No trips match your filters."}
          </p>
          <Link to="/app/add-trip">
            <Button className="bg-teal-600 hover:bg-teal-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Trip
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTrips.map((trip) => (
            <Card key={trip.id} className="p-4">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {format(new Date(trip.date), 'MMM d, yyyy')} • {trip.time}
                    </span>
                  </div>
                  
                  <div className="font-medium text-gray-900 mb-1">
                    {trip.start_location} → {trip.end_location}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-bold text-teal-600">
                      {trip.distance_km} km
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      trip.purpose === 'business' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {trip.purpose}
                    </span>
                    <span className="text-gray-500">
                      {getVehicleName(trip.vehicle_id)}
                    </span>
                  </div>
                  
                  {trip.notes && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {trip.notes}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link to={`/app/edit-trip/${trip.id}`}>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => deleteTrip(trip.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Mobile FAB */}
      <Link to="/app/add-trip" className="md:hidden fixed bottom-20 right-4 z-20">
        <Button size="icon" className="h-14 w-14 rounded-full shadow-lg bg-teal-600 hover:bg-teal-700">
          <Plus className="w-6 h-6" />
        </Button>
      </Link>
    </div>
  );
}
