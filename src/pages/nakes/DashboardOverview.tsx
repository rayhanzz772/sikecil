import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboardService';
import { Users, Activity, Heart, AlertTriangle, Building, User, Bell } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from 'recharts';

export const DashboardOverview: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [nutrition, setNutrition] = useState<any>(null);
  const [alerts, setAlerts] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [genderData, setGenderData] = useState<any>(null);
  const [posyanduStats, setPosyanduStats] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, nutRes, alertRes, trendRes, genderRes] = await Promise.all([
          dashboardService.getSummary(),
          dashboardService.getNutritionStatus(),
          dashboardService.getAlerts(),
          dashboardService.getMeasurementTrend(),
          dashboardService.getGenderDistribution()
        ]);
        setSummary(sumRes?.data || sumRes);
        setNutrition(nutRes?.data || nutRes);
        setAlerts(alertRes?.data || alertRes);
        setTrend(trendRes?.data || trendRes);
        setGenderData(genderRes?.data || genderRes);

        try {
          const posRes = await dashboardService.getPosyanduStats();
          setPosyanduStats(posRes?.data || posRes);
        } catch (e) {
          // ignore if user is not admin
          setPosyanduStats(null);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  // --- Process Nutrition Data for Recharts ---
  // HAZ
  const hazData = nutrition?.haz ? [
    { name: 'Normal', value: nutrition.haz.normal, color: '#10b981' }, // Emerald-500
    { name: 'Stunting', value: nutrition.haz.stunting, color: '#eab308' }, // Yellow-500
    { name: 'Severe Stunting', value: nutrition.haz.severe_stunting, color: '#ef4444' }, // Red-500
    { name: 'Tinggi', value: nutrition.haz.tinggi, color: '#3b82f6' }, // Blue-500
  ].filter(item => item.value > 0) : [];

  // WAZ
  const wazData = nutrition?.waz ? [
    { name: 'Normal', value: nutrition.waz.normal, color: '#10b981' },
    { name: 'Underweight', value: nutrition.waz.underweight, color: '#eab308' },
    { name: 'Severe Underweight', value: nutrition.waz.severe_underweight, color: '#ef4444' },
    { name: 'Risiko Lebih', value: nutrition.waz.berat_badan_tinggi, color: '#f97316' }, // Orange-500
  ].filter(item => item.value > 0) : [];

  // HCAZ
  const hcazData = nutrition?.hcaz ? [
    { name: 'Normal', value: nutrition.hcaz.normal, color: '#10b981' },
    { name: 'Mikrosefali', value: nutrition.hcaz.mikrosefali, color: '#eab308' },
    { name: 'Sev. Microcephaly', value: nutrition.hcaz.severe_microcephaly, color: '#ef4444' },
    { name: 'Makrosefali', value: nutrition.hcaz.makrosefali, color: '#8b5cf6' }, // Violet-500
  ].filter(item => item.value > 0) : [];

  // Gender
  const genderPieData = genderData ? [
    { name: 'Laki-laki', value: genderData.laki_laki, color: '#3b82f6' }, // Blue
    { name: 'Perempuan', value: genderData.perempuan, color: '#ec4899' }, // Pink
  ].filter(item => item.value > 0) : [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-100 text-sm">
          {label && <p className="font-bold text-slate-700 mb-1">{label}</p>}
          <p className="font-bold text-slate-700">{payload[0].name === 'count' ? 'Jumlah' : payload[0].name}</p>
          <p className="text-slate-500">{payload[0].value} {payload[0].name === 'count' ? 'Pengukuran' : 'Anak'}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Dashboard Ringkasan</h1>
        <p className="text-slate-500 mt-1">Pantau status gizi dan metrik penting posyandu secara real-time.</p>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Children */}
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Users className="text-white w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Anak</p>
              <h3 className="text-2xl font-black text-slate-800">{summary?.total_children || 0}</h3>
            </div>
          </div>
        </div>

        {/* Measurements This Month */}
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Activity className="text-white w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Diukur Bulan Ini</p>
              <h3 className="text-2xl font-black text-slate-800">{summary?.total_measurements_this_month || 0}</h3>
            </div>
          </div>
        </div>

        {/* Total Stunting */}
        {summary?.total_stunting !== undefined && (
          <div className="bg-white/80 backdrop-blur-md border border-rose-200/60 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform">
                <AlertTriangle className="text-white w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Total Stunting</p>
                <h3 className="text-2xl font-black text-slate-800">{summary?.total_stunting || 0}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Total Underweight */}
        {summary?.total_underweight !== undefined && (
          <div className="bg-white/80 backdrop-blur-md border border-amber-200/60 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <AlertTriangle className="text-white w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">Total Underweight</p>
                <h3 className="text-2xl font-black text-slate-800">{summary?.total_underweight || 0}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Total Posyandu (Admin only typically, but we display if present) */}
        {summary?.total_posyandu !== undefined && (
          <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Building className="text-white w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Posyandu</p>
                <h3 className="text-2xl font-black text-slate-800">{summary?.total_posyandu || 0}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Total Parents */}
        {summary?.total_parents !== undefined && (
          <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:scale-105 transition-transform">
                <Heart className="text-white w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Orang Tua</p>
                <h3 className="text-2xl font-black text-slate-800">{summary?.total_parents || 0}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Total Nakes */}
        {summary?.total_nakes !== undefined && (
          <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <User className="text-white w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kader / Nakes</p>
                <h3 className="text-2xl font-black text-slate-800">{summary?.total_nakes || 0}</h3>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CHARTS SECTION */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Activity size={20} className="text-sky-600" />
          Metrik & Distribusi Anak
        </h2>

        {/* Trend and Gender */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Trend Line Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-700 text-sm mb-4">Tren Pengukuran (6 Bulan Terakhir)</h3>
            {trend.length > 0 ? (
              <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="count" name="Jumlah" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-slate-400 mt-10 text-center">Belum ada data tren.</p>
            )}
          </div>

          {/* Gender Pie Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center">
            <h3 className="font-bold text-slate-700 text-sm mb-4">Distribusi Jenis Kelamin</h3>
            {genderPieData.length > 0 ? (
              <div className="w-full h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderPieData}
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {genderPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-slate-400 mt-10">Data belum cukup</p>
            )}
          </div>
        </div>

        <h3 className="font-bold text-slate-700 text-sm mb-4">Distribusi Status Gizi (Pengukuran Terakhir)</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart HAZ */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center">
            <h3 className="font-bold text-slate-700 text-sm mb-4">Tinggi Badan (Stunting)</h3>
            {hazData.length > 0 ? (
              <div className="w-full h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={hazData}
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {hazData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-slate-400 mt-10">Data belum cukup</p>
            )}
          </div>

          {/* Chart WAZ */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center">
            <h3 className="font-bold text-slate-700 text-sm mb-4">Berat Badan (Underweight)</h3>
            {wazData.length > 0 ? (
              <div className="w-full h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={wazData}
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {wazData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-slate-400 mt-10">Data belum cukup</p>
            )}
          </div>

          {/* Chart HCAZ */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center">
            <h3 className="font-bold text-slate-700 text-sm mb-4">Lingkar Kepala</h3>
            {hcazData.length > 0 ? (
              <div className="w-full h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={hcazData}
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {hcazData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-slate-400 mt-10">Data belum cukup</p>
            )}
          </div>
        </div>
      </div>

      {/* ALERTS SECTION */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Bell size={20} className="text-red-500" />
          Peringatan & Perhatian Khusus
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stunting Alerts */}
          <div className="bg-white rounded-2xl shadow-sm border border-rose-200 overflow-hidden">
            <div className="bg-rose-50 px-5 py-3 border-b border-rose-100 flex items-center justify-between">
              <h3 className="font-bold text-rose-700 text-sm flex items-center gap-2">
                <AlertTriangle size={16} /> Indikasi Stunting
              </h3>
              <span className="bg-rose-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{alerts?.stunting?.length || 0}</span>
            </div>
            <div className="p-0 max-h-[300px] overflow-y-auto">
              {alerts?.stunting?.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {alerts.stunting.map((child: any) => (
                    <li key={child.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <p className="font-bold text-slate-800 text-sm">{child.name}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                        <span>{child.age_months} Bulan</span>
                        <span>HAZ: <strong className="text-rose-600">{child.haz}</strong></span>
                        <span>Orang Tua: {child.parent_name || '-'}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-center text-sm text-slate-400">Tidak ada peringatan stunting.</div>
              )}
            </div>
          </div>

          {/* Underweight Alerts */}
          <div className="bg-white rounded-2xl shadow-sm border border-amber-200 overflow-hidden">
            <div className="bg-amber-50 px-5 py-3 border-b border-amber-100 flex items-center justify-between">
              <h3 className="font-bold text-amber-700 text-sm flex items-center gap-2">
                <AlertTriangle size={16} /> Indikasi Underweight
              </h3>
              <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{alerts?.underweight?.length || 0}</span>
            </div>
            <div className="p-0 max-h-[300px] overflow-y-auto">
              {alerts?.underweight?.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {alerts.underweight.map((child: any) => (
                    <li key={child.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <p className="font-bold text-slate-800 text-sm">{child.name}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                        <span>{child.age_months} Bulan</span>
                        <span>WAZ: <strong className="text-amber-600">{child.waz}</strong></span>
                        <span>Orang Tua: {child.parent_name || '-'}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-center text-sm text-slate-400">Tidak ada peringatan underweight.</div>
              )}
            </div>
          </div>

          {/* Not Measured Recently */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-700 text-sm">Belum Diukur {'>'} 30 Hari</h3>
              <span className="bg-slate-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{alerts?.not_measured_recently?.length || 0}</span>
            </div>
            <div className="p-0 max-h-[300px] overflow-y-auto">
              {alerts?.not_measured_recently?.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {alerts.not_measured_recently.map((child: any) => (
                    <li key={child.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <p className="font-bold text-slate-800 text-sm">{child.name}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                        <span>Terakhir: {new Date(child.last_measurement_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                        <span>Usia: {child.age_months} Bln</span>
                        <span>Orang Tua: {child.parent_name || '-'}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-center text-sm text-slate-400">Semua anak aktif diukur.</div>
              )}
            </div>
          </div>

          {/* Never Measured */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-700 text-sm">Belum Pernah Diukur</h3>
              <span className="bg-slate-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{alerts?.never_measured?.length || 0}</span>
            </div>
            <div className="p-0 max-h-[300px] overflow-y-auto">
              {alerts?.never_measured?.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {alerts.never_measured.map((child: any) => (
                    <li key={child.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <p className="font-bold text-slate-800 text-sm">{child.name}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                        <span>Lahir: {new Date(child.birth_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                        <span>Orang Tua: {child.parent_name || '-'}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-center text-sm text-slate-400">Tidak ada anak yang belum diukur.</div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* POSYANDU STATS (ADMIN ONLY) */}
      {posyanduStats && posyanduStats.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Building size={20} className="text-indigo-600" />
            Statistik Posyandu
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 font-bold text-slate-600 text-sm">Nama Posyandu</th>
                  <th className="p-4 font-bold text-slate-600 text-sm">Desa</th>
                  <th className="p-4 font-bold text-slate-600 text-sm text-center">Total Anak</th>
                  <th className="p-4 font-bold text-slate-600 text-sm text-center">Total Nakes</th>
                  <th className="p-4 font-bold text-slate-600 text-sm text-center">Total Ortu</th>
                  <th className="p-4 font-bold text-slate-600 text-sm text-center">Indikasi Stunting</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {posyanduStats.map((pos) => (
                  <tr key={pos.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-slate-800 font-bold text-sm">{pos.name}</td>
                    <td className="p-4 text-slate-600 text-sm">{pos.desa || '-'}</td>
                    <td className="p-4 text-slate-600 text-sm text-center">{pos.total_children}</td>
                    <td className="p-4 text-slate-600 text-sm text-center">{pos.total_nakes}</td>
                    <td className="p-4 text-slate-600 text-sm text-center">{pos.total_parents}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${pos.stunting_count > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                        {pos.stunting_count} Kasus
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
