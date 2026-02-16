import { useState, useEffect } from 'react';
import { FileDown, TrendingUp, Car as CarIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { apiRequest, supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ReportData {
  total_km: number;
  business_km: number;
  private_km: number;
  monthly_km: number;
  monthly_business: number;
  monthly_private: number;
  monthly_data: { [key: string]: { business: number; private: number } };
  trip_count: number;
}

export default function Reports() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await apiRequest('/reports', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      setData(response);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await apiRequest('/trips', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      const trips = response.trips || [];

      // Create CSV
      const headers = ['Date', 'Time', 'Start', 'End', 'Distance (km)', 'Purpose', 'Notes'];
      const rows = trips.map((trip: any) => [
        trip.date,
        trip.time,
        trip.start_location,
        trip.end_location,
        trip.distance_km,
        trip.purpose,
        trip.notes || ''
      ]);

      const csv = [
        headers.join(','),
        ...rows.map((row: any[]) => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mileage-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('CSV exported');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export CSV');
    }
  };

  const exportPDF = () => {
    toast.info('PDF export coming soon');
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="text-center py-12 text-gray-500">Loading reports...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 md:p-6">
        <div className="text-center py-12 text-gray-500">No data available</div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = Object.entries(data.monthly_data)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6) // Last 6 months
    .map(([month, values]) => ({
      month: month.substring(5), // Get MM part
      Business: Math.round(values.business * 10) / 10,
      Private: Math.round(values.private * 10) / 10,
    }));

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Reports</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportCSV}
            className="hidden md:flex"
          >
            <FileDown className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={exportPDF}
            className="hidden md:flex"
          >
            <FileDown className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Total Trips</div>
            <CarIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold">{data.trip_count}</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Total Distance</div>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold">{data.total_km} km</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">This Month</div>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold">{data.monthly_km} km</div>
        </Card>
      </div>

      {/* Current Month Breakdown */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">This Month Breakdown</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Business</span>
              <span className="font-bold text-blue-600">{data.monthly_business} km</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{
                  width: `${data.monthly_km > 0 ? (data.monthly_business / data.monthly_km) * 100 : 0}%`
                }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Private</span>
              <span className="font-bold text-gray-600">{data.monthly_private} km</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-600 rounded-full"
                style={{
                  width: `${data.monthly_km > 0 ? (data.monthly_private / data.monthly_km) * 100 : 0}%`
                }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Chart */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Last 6 Months</h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Business" fill="#2563eb" />
              <Bar dataKey="Private" fill="#6b7280" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No data for chart yet
          </div>
        )}
      </Card>

      {/* All Time Stats */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">All Time</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Business</span>
              <span className="font-bold text-blue-600">{data.business_km} km</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{
                  width: `${data.total_km > 0 ? (data.business_km / data.total_km) * 100 : 0}%`
                }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Private</span>
              <span className="font-bold text-gray-600">{data.private_km} km</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-600 rounded-full"
                style={{
                  width: `${data.total_km > 0 ? (data.private_km / data.total_km) * 100 : 0}%`
                }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Mobile Export Buttons */}
      <div className="md:hidden fixed bottom-20 right-4 flex flex-col gap-2">
        <Button
          onClick={exportCSV}
          className="h-12 w-12 rounded-full shadow-lg bg-teal-600 hover:bg-teal-700"
          size="icon"
        >
          <FileDown className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
