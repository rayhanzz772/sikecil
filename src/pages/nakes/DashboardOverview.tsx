import React, { useState, useEffect, useRef } from 'react';
import { dashboardService } from '../../services/dashboardService';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import {
  Users,
  Activity,
  Heart,
  AlertTriangle,
  Building,
  User,
  Bell,
  BarChart2,
  PieChart as PieIcon,
  LineChart as LineIcon,
  Download,
  Printer
} from 'lucide-react';
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
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [summary, setSummary] = useState<any>(null);
  const [nutrition, setNutrition] = useState<any>(null);
  const [alerts, setAlerts] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [genderData, setGenderData] = useState<any>(null);
  const [posyanduStats, setPosyanduStats] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Chart View Modes
  const [globalChartMode, setGlobalChartMode] = useState<'kombinasi' | 'bar' | 'pie'>('kombinasi');
  const [hazChartType, setHazChartType] = useState<'bar' | 'pie'>('bar');
  const [wazChartType, setWazChartType] = useState<'bar' | 'pie'>('bar');
  const [hcazChartType, setHcazChartType] = useState<'bar' | 'pie'>('pie');
  const [genderChartType, setGenderChartType] = useState<'bar' | 'pie'>('pie');
  const [trendChartType, setTrendChartType] = useState<'bar' | 'line'>('bar');

  const handleGlobalModeChange = (mode: 'kombinasi' | 'bar' | 'pie') => {
    setGlobalChartMode(mode);
    if (mode === 'bar') {
      setHazChartType('bar');
      setWazChartType('bar');
      setHcazChartType('bar');
      setGenderChartType('bar');
    } else if (mode === 'pie') {
      setHazChartType('pie');
      setWazChartType('pie');
      setHcazChartType('pie');
      setGenderChartType('pie');
    } else {
      setHazChartType('bar');
      setWazChartType('bar');
      setHcazChartType('pie');
      setGenderChartType('pie');
    }
  };

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

  // PDF Export Handler (Menggunakan html-to-image yang kompatibel penuh dengan Tailwind 4 & oklch)
  const handleDownloadPDF = async () => {
    if (!dashboardRef.current) return;
    setIsGeneratingPDF(true);

    try {
      const element = dashboardRef.current;
      
      const dataUrl = await toPng(element, {
        cacheBust: true,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        filter: (node) => {
          if (node instanceof HTMLElement && node.classList.contains('print:hidden')) {
            return false;
          }
          return true;
        }
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const imgWidth = pdfWidth - 16; // 8mm margin
      const imgHeight = (img.height * imgWidth) / img.width;

      let heightLeft = imgHeight;
      let position = 8;

      pdf.addImage(dataUrl, 'PNG', 8, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 16);

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 8;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 8, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 16);
      }

      const todayStr = new Date().toISOString().slice(0, 10);
      pdf.save(`Laporan_Dashboard_SiKecil_${todayStr}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Gagal mengunduh laporan PDF secara langsung. Membuka dialog cetak browser...');
      window.print();
    } finally {
      setIsGeneratingPDF(false);
    }
  };



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

  // Render label persentase di dalam Pie Chart (solid pie chart, bukan donut)
  const renderPiePercentLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (!percent || percent <= 0.03) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#ffffff"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontWeight: 'bold', fontSize: '11px', pointerEvents: 'none' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const itemName = item.payload?.name || label || (item.name === 'count' ? 'Jumlah' : item.name);
      const val = item.value;
      const total = item.payload?.total || payload.reduce((sum: number, p: any) => sum + (p.value || 0), 0);
      const pct = item.payload?.percentFormatted || (total > 0 ? `${((val / total) * 100).toFixed(1)}%` : '');
      const isCount = item.name === 'Jumlah' || item.dataKey === 'count' || item.name === 'count';

      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-100 text-sm z-50">
          <p className="font-bold text-slate-700">{itemName}</p>
          <p className="text-slate-600 font-semibold">{val} {isCount ? 'Pengukuran' : 'Anak'}</p>
          {pct && <p className="text-xs text-sky-600 font-medium mt-0.5">Persentase: {pct}</p>}
        </div>
      );
    }
    return null;
  };

  // Render Card dengan Bar Chart (Jumlah Kasus) dan Pie Chart Solid (Persentase %)
  const renderNutritionCard = (title: string, data: any[]) => {
    const totalCases = data.reduce((acc, item) => acc + item.value, 0);

    return (
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            {title}
          </h3>
          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Total: <strong>{totalCases}</strong> Anak
          </span>
        </div>

        {data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* SISI KIRI: Bar Chart (Jumlah Kasus) */}
            <div className="flex flex-col border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-4">
              <p className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                <BarChart2 size={15} className="text-sky-600" />
                Jumlah Kasus
              </p>
              <div className="w-full h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 15, right: 15, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* SISI KANAN: Pie Chart Solid (Persentase %) */}
            <div className="flex flex-col">
              <p className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                <PieIcon size={15} className="text-emerald-600" />
                Persentase (%)
              </p>
              <div className="w-full h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={0}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="#ffffff"
                      strokeWidth={2}
                      label={renderPiePercentLabel}
                      labelLine={false}
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400 py-8 text-center">Belum ada data status gizi.</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* HEADER BAR WITH DOWNLOAD PDF BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Dashboard Ringkasan</h1>
          <p className="text-sm text-slate-500 mt-0.5">Pantau status gizi dan metrik penting posyandu secara real-time.</p>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isGeneratingPDF ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Membuat PDF...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Download Laporan PDF</span>
              </>
            )}
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 font-medium px-3 py-2 rounded-lg text-sm transition-all border border-slate-200 cursor-pointer shadow-sm"
            title="Cetak Halaman"
          >
            <Printer size={16} />
            <span className="hidden md:inline">Cetak</span>
          </button>
        </div>
      </div>

      {/* DASHBOARD CONTENT WRAPPER FOR PDF GENERATION */}
      <div id="dashboard-pdf-content" ref={dashboardRef} className="space-y-6 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
        {/* HEADER LAPORAN KHUSUS CETAK/PDF */}
        <div className="border-b-2 border-sky-600 pb-3 mb-2 flex justify-between items-end">
          <div>
            <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">Laporan Ringkasan Dashboard Status Gizi Anak</h2>
            <p className="text-xs text-slate-500">Sistem Informasi Antropometri & Posyandu SiKecil</p>
          </div>
          <div className="text-right text-[11px] text-slate-500">
            <p><strong>Dicetak:</strong> {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        {/* METRIC CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Total Children */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shadow-sm">
                <Users className="text-white w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Anak</p>
                <h3 className="text-xl font-bold text-slate-800">{summary?.total_children || 0}</h3>
              </div>
            </div>
          </div>

          {/* Measurements This Month */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm">
                <Activity className="text-white w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Diukur Bulan Ini</p>
                <h3 className="text-xl font-bold text-slate-800">{summary?.total_measurements_this_month || 0}</h3>
              </div>
            </div>
          </div>

          {/* Total Stunting */}
          {summary?.total_stunting !== undefined && (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center shadow-sm">
                  <AlertTriangle className="text-white w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider">Total Stunting</p>
                  <h3 className="text-xl font-bold text-slate-800">{summary?.total_stunting || 0}</h3>
                </div>
              </div>
            </div>
          )}

          {/* Total Underweight */}
          {summary?.total_underweight !== undefined && (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm">
                  <AlertTriangle className="text-white w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider">Total Underweight</p>
                  <h3 className="text-xl font-bold text-slate-800">{summary?.total_underweight || 0}</h3>
                </div>
              </div>
            </div>
          )}

          {/* Total Posyandu */}
          {summary?.total_posyandu !== undefined && (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-sm">
                  <Building className="text-white w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Posyandu</p>
                  <h3 className="text-xl font-bold text-slate-800">{summary?.total_posyandu || 0}</h3>
                </div>
              </div>
            </div>
          )}

          {/* Total Parents */}
          {summary?.total_parents !== undefined && (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center shadow-sm">
                  <Heart className="text-white w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Orang Tua</p>
                  <h3 className="text-xl font-bold text-slate-800">{summary?.total_parents || 0}</h3>
                </div>
              </div>
            </div>
          )}

          {/* Total Nakes */}
          {summary?.total_nakes !== undefined && (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm">
                  <User className="text-white w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Kader / Nakes</p>
                  <h3 className="text-xl font-bold text-slate-800">{summary?.total_nakes || 0}</h3>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CHARTS SECTION */}
        <div>
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
            <Activity size={16} className="text-sky-600" />
            Metrik & Distribusi Anak
          </h2>

          {/* Trend and Gender */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Trend Chart */}
            <div className="lg:col-span-2 bg-slate-50/70 p-5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-800 text-xs">Tren Pengukuran (6 Bulan Terakhir)</h3>
                <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200 print:hidden">
                  <button
                    onClick={() => setTrendChartType('bar')}
                    className={`p-1 rounded text-xs transition-colors ${trendChartType === 'bar' ? 'bg-white text-sky-600 shadow-sm font-semibold' : 'text-slate-400 hover:text-slate-600'}`}
                    title="Bar Chart"
                  >
                    <BarChart2 size={13} />
                  </button>
                  <button
                    onClick={() => setTrendChartType('line')}
                    className={`p-1 rounded text-xs transition-colors ${trendChartType === 'line' ? 'bg-white text-sky-600 shadow-sm font-semibold' : 'text-slate-400 hover:text-slate-600'}`}
                    title="Line Chart"
                  >
                    <LineIcon size={13} />
                  </button>
                </div>
              </div>
              {trend.length > 0 ? (
                <div className="w-full h-[230px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {trendChartType === 'bar' ? (
                      <BarChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" name="Jumlah" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    ) : (
                      <LineChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="count" name="Jumlah" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-slate-400 mt-10 text-center">Belum ada data tren.</p>
              )}
            </div>

            {/* Gender Chart */}
            <div className="bg-slate-50/70 p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
              <h3 className="font-bold text-slate-800 text-xs mb-2">Distribusi Jenis Kelamin</h3>
              {genderPieData.length > 0 ? (
                <div className="w-full h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genderPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={0}
                        outerRadius={75}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="#ffffff"
                        strokeWidth={2}
                        label={renderPiePercentLabel}
                        labelLine={false}
                      >
                        {genderPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-slate-400 mt-10 text-center">Data belum cukup</p>
              )}
            </div>
          </div>

          {/* DISTRIBUSI STATUS GIZI (CARDS DENGAN BAR CHART KASUS & SOLID PIE CHART PERSENTASE) */}
          <h3 className="font-bold text-slate-800 text-sm mb-3">Distribusi Status Gizi</h3>
          <div className="space-y-5">
            {renderNutritionCard('Tinggi Badan (Stunting - HAZ)', hazData)}
            {renderNutritionCard('Berat Badan (Underweight - WAZ)', wazData)}
            {renderNutritionCard('Lingkar Kepala (HC-AZ)', hcazData)}
          </div>
        </div>

        {/* ALERTS SECTION */}
        <div>
          <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Bell size={16} className="text-red-500" />
            Peringatan & Perhatian Khusus
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Stunting Alerts */}
            <div className="bg-white rounded-lg shadow-sm border border-rose-200 overflow-hidden">
              <div className="bg-rose-50 px-4 py-2.5 border-b border-rose-100 flex items-center justify-between">
                <h3 className="font-semibold text-rose-700 text-xs flex items-center gap-1.5">
                  <AlertTriangle size={14} /> Indikasi Stunting
                </h3>
                <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{alerts?.stunting?.length || 0}</span>
              </div>
              <div className="p-0 max-h-[250px] overflow-y-auto">
                {alerts?.stunting?.length > 0 ? (
                  <ul className="divide-y divide-slate-100">
                    {alerts.stunting.map((child: any) => (
                      <li key={child.id} className="px-4 py-2.5 hover:bg-slate-50">
                        <p className="font-medium text-slate-800 text-sm">{child.name}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5 text-xs text-slate-500">
                          <span>{child.age_months} Bulan</span>
                          <span>HAZ: <strong className="text-rose-600">{child.haz}</strong></span>
                          <span>Orang Tua: {child.parent_name || '-'}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-5 text-center text-sm text-slate-400">Tidak ada peringatan stunting.</div>
                )}
              </div>
            </div>

            {/* Underweight Alerts */}
            <div className="bg-white rounded-lg shadow-sm border border-amber-200 overflow-hidden">
              <div className="bg-amber-50 px-4 py-2.5 border-b border-amber-100 flex items-center justify-between">
                <h3 className="font-semibold text-amber-700 text-xs flex items-center gap-1.5">
                  <AlertTriangle size={14} /> Indikasi Underweight
                </h3>
                <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{alerts?.underweight?.length || 0}</span>
              </div>
              <div className="p-0 max-h-[250px] overflow-y-auto">
                {alerts?.underweight?.length > 0 ? (
                  <ul className="divide-y divide-slate-100">
                    {alerts.underweight.map((child: any) => (
                      <li key={child.id} className="px-4 py-2.5 hover:bg-slate-50">
                        <p className="font-medium text-slate-800 text-sm">{child.name}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5 text-xs text-slate-500">
                          <span>{child.age_months} Bulan</span>
                          <span>WAZ: <strong className="text-amber-600">{child.waz}</strong></span>
                          <span>Orang Tua: {child.parent_name || '-'}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-5 text-center text-sm text-slate-400">Tidak ada peringatan underweight.</div>
                )}
              </div>
            </div>

            {/* Not Measured Recently */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-semibold text-slate-700 text-xs">Belum Diukur {'>'} 30 Hari</h3>
                <span className="bg-slate-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{alerts?.not_measured_recently?.length || 0}</span>
              </div>
              <div className="p-0 max-h-[250px] overflow-y-auto">
                {alerts?.not_measured_recently?.length > 0 ? (
                  <ul className="divide-y divide-slate-100">
                    {alerts.not_measured_recently.map((child: any) => (
                      <li key={child.id} className="px-4 py-2.5 hover:bg-slate-50">
                        <p className="font-medium text-slate-800 text-sm">{child.name}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5 text-xs text-slate-500">
                          <span>Terakhir: {new Date(child.last_measurement_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                          <span>Usia: {child.age_months} Bln</span>
                          <span>Orang Tua: {child.parent_name || '-'}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-5 text-center text-sm text-slate-400">Semua anak aktif diukur.</div>
                )}
              </div>
            </div>

            {/* Never Measured */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-semibold text-slate-700 text-xs">Belum Pernah Diukur</h3>
                <span className="bg-slate-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{alerts?.never_measured?.length || 0}</span>
              </div>
              <div className="p-0 max-h-[250px] overflow-y-auto">
                {alerts?.never_measured?.length > 0 ? (
                  <ul className="divide-y divide-slate-100">
                    {alerts.never_measured.map((child: any) => (
                      <li key={child.id} className="px-4 py-2.5 hover:bg-slate-50">
                        <p className="font-medium text-slate-800 text-sm">{child.name}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5 text-xs text-slate-500">
                          <span>Lahir: {new Date(child.birth_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                          <span>Orang Tua: {child.parent_name || '-'}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-5 text-center text-sm text-slate-400">Tidak ada anak yang belum diukur.</div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* POSYANDU STATS (ADMIN ONLY) */}
        {posyanduStats && posyanduStats.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Building size={16} className="text-indigo-600" />
              Statistik Posyandu
            </h2>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Nama Posyandu</th>
                      <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Desa</th>
                      <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 text-center">Total Anak</th>
                      <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 text-center">Total Nakes</th>
                      <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 text-center">Total Ortu</th>
                      <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 text-center">Indikasi Stunting</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {posyanduStats.map((pos) => (
                      <tr key={pos.id} className="hover:bg-slate-50/60">
                        <td className="px-3 py-1.5 text-slate-800 font-medium">{pos.name}</td>
                        <td className="px-3 py-1.5 text-slate-600">{pos.desa || '-'}</td>
                        <td className="px-3 py-1.5 text-slate-600 text-center">{pos.total_children}</td>
                        <td className="px-3 py-1.5 text-slate-600 text-center">{pos.total_nakes}</td>
                        <td className="px-3 py-1.5 text-slate-600 text-center">{pos.total_parents}</td>
                        <td className="px-3 py-1.5 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${pos.stunting_count > 0 ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                            {pos.stunting_count} Kasus
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
