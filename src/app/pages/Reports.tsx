import { useState, useEffect } from 'react';
import { FileDown, TrendingUp, Car as CarIcon, Briefcase, User as UserIcon, Activity } from 'lucide-react';
import { apiRequest, supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';

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

      const headers = ['Date', 'Time', 'Start', 'End', 'Distance (km)', 'Purpose', 'Notes'];
      const rows = trips.map((trip: any) => [
        trip.date, trip.time, trip.start_location, trip.end_location,
        trip.distance_km, trip.purpose, trip.notes || ''
      ]);

      const csv = [
        headers.join(','),
        ...rows.map((row: any[]) => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

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

  if (loading) {
    return (
      <div className="p-5 md:p-8">
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-2 border-[#00E5A0]/30 border-t-[#00E5A0] rounded-full animate-spin" />
          <span className="text-[#8888a4] text-sm">Loading reports...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-5 md:p-8">
        <div className="flex flex-col items-center justify-center py-20">
          <Activity className="w-8 h-8 text-[#4a4a66] mb-3" />
          <p className="text-[#8888a4]">No data available</p>
        </div>
      </div>
    );
  }

  const chartData = Object.entries(data.monthly_data || {})
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, values]) => ({
      month: month.substring(5),
      Business: Math.round(values.business * 10) / 10,
      Private: Math.round(values.private * 10) / 10,
    }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
      <div className="bg-[#1a1a2e] border border-white/[0.08] rounded-xl p-3 shadow-xl">
        <p className="text-xs text-[#8888a4] mb-2 font-medium">Month {label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-[#8888a4]">{entry.name}:</span>
            <span className="font-semibold text-white">{entry.value} km</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-5 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Reports</h1>
          <p className="text-sm text-[#8888a4] mt-0.5">Your mileage analytics at a glance</p>
        </div>
        <button
          onClick={exportCSV}
          className="hidden md:flex h-10 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-medium items-center gap-2 hover:bg-white/[0.06] transition-all"
        >
          <FileDown className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Trips', value: data.trip_count.toString(), icon: CarIcon, color: '#00E5A0' },
          { label: 'Total Distance', value: `${data.total_km} km`, icon: TrendingUp, color: '#8B5CF6' },
          { label: 'This Month', value: `${data.monthly_km} km`, icon: Activity, color: '#F59E0B' },
          { label: 'Business km', value: `${data.business_km} km`, icon: Briefcase, color: '#EC4899' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#8888a4] font-medium">{stat.label}</span>
              <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Monthly Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-5"
      >
        <h2 className="text-lg font-bold text-white mb-4">This Month</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-[#8B5CF6]" />
                <span className="text-sm text-[#8888a4]">Business</span>
              </div>
              <span className="text-sm font-bold text-[#8B5CF6]">{data.monthly_business} km</span>
            </div>
            <div className="h-2.5 bg-white/[0.04] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] rounded-full transition-all duration-700"
                style={{ width: `${data.monthly_km > 0 ? (data.monthly_business / data.monthly_km) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <UserIcon className="w-3.5 h-3.5 text-[#8888a4]" />
                <span className="text-sm text-[#8888a4]">Private</span>
              </div>
              <span className="text-sm font-bold text-[#8888a4]">{data.monthly_private} km</span>
            </div>
            <div className="h-2.5 bg-white/[0.04] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#4a4a66] to-[#6a6a88] rounded-full transition-all duration-700"
                style={{ width: `${data.monthly_km > 0 ? (data.monthly_private / data.monthly_km) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-5"
      >
        <h2 className="text-lg font-bold text-white mb-4">Last 6 Months</h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#8888a4', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#8888a4', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Business" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Private" fill="#4a4a66" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Activity className="w-8 h-8 text-[#4a4a66] mb-3" />
            <p className="text-sm text-[#8888a4]">No chart data yet</p>
          </div>
        )}
        <div className="flex items-center gap-5 mt-3 justify-center">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#8B5CF6]" />
            <span className="text-xs text-[#8888a4]">Business</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#4a4a66]" />
            <span className="text-xs text-[#8888a4]">Private</span>
          </div>
        </div>
      </motion.div>

      {/* All Time */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
      >
        <h2 className="text-lg font-bold text-white mb-4">All Time</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-[#8B5CF6]" />
                <span className="text-sm text-[#8888a4]">Business</span>
              </div>
              <span className="text-sm font-bold text-[#8B5CF6]">{data.business_km} km</span>
            </div>
            <div className="h-2.5 bg-white/[0.04] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] rounded-full transition-all duration-700"
                style={{ width: `${data.total_km > 0 ? (data.business_km / data.total_km) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <UserIcon className="w-3.5 h-3.5 text-[#8888a4]" />
                <span className="text-sm text-[#8888a4]">Private</span>
              </div>
              <span className="text-sm font-bold text-[#8888a4]">{data.private_km} km</span>
            </div>
            <div className="h-2.5 bg-white/[0.04] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#4a4a66] to-[#6a6a88] rounded-full transition-all duration-700"
                style={{ width: `${data.total_km > 0 ? (data.private_km / data.total_km) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Export Button */}
      <div className="md:hidden fixed bottom-24 right-5 z-20">
        <button
          onClick={exportCSV}
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00E5A0] to-[#00B880] text-[#07070e] flex items-center justify-center shadow-[0_0_30px_rgba(0,229,160,0.3)] active:scale-95 transition-all"
        >
          <FileDown className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
