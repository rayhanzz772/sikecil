import React, { useState, useEffect } from 'react';
import { reportService, ReportFilter } from '../services/reportService';
import { FileText, Filter, Activity, Search, X } from 'lucide-react';
import { Pagination } from './Pagination';

export const ReportsOverview: React.FC = () => {
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [atRiskData, setAtRiskData] = useState<any[]>([]);
  const [posyanduActivity, setPosyanduActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'detail' | 'berisiko' | 'aktivitas'>('ringkasan');

  const [selectedChildGrowth, setSelectedChildGrowth] = useState<any>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const currentDate = new Date();
  const [filter, setFilter] = useState<ReportFilter>({
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear()
  });

  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 10;

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const [measRes, sumRes, riskRes, actRes] = await Promise.all([
        reportService.getMeasurements({ ...filter, page, per_page: perPage } as any),
        reportService.getNutritionSummary(filter),
        reportService.getAtRisk({ ...filter, page, per_page: perPage } as any),
        reportService.getPosyanduActivity(filter)
      ]);

      setMeasurements(measRes?.data || measRes || []);
      setSummary(sumRes?.data || sumRes);

      // Handle at risk data which is inside data.at_risk
      const riskPayload = riskRes?.data || riskRes;
      setAtRiskData(riskPayload?.at_risk || []);

      setPosyanduActivity(actRes?.data || actRes || []);

      // We'll use the same page state for both paginated endpoints for simplicity,
      // but ideally we'd separate them if we want to retain page number per tab.
      if (activeTab === 'berisiko') {
        setTotalPages(riskRes?.metadata?.total_page || 1);
      } else {
        setTotalPages(measRes?.metadata?.total_page || 1);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filter.month, filter.year, filter.q, page, activeTab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilter(prev => ({ ...prev, q: search || undefined }));
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value ? parseInt(value) : undefined }));
    setPage(1); // Reset page on filter change
  };

  const handleViewChild = async (childId: string) => {
    setIsModalLoading(true);
    try {
      const data = await reportService.getChildGrowth(childId);
      setSelectedChildGrowth(data?.data || data);
    } catch (error) {
      console.error('Failed to fetch child growth', error);
    } finally {
      setIsModalLoading(false);
    }
  };

  const closeModal = () => setSelectedChildGrowth(null);

  const months = [
    { value: 1, label: 'Januari' }, { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' }, { value: 4, label: 'April' },
    { value: 5, label: 'Mei' }, { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' }, { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' }, { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' }, { value: 12, label: 'Desember' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
            Laporan & Rekapitulasi Data
          </h1>
          <p className="text-slate-500 text-sm mt-1">Laporan hasil pengukuran dan sebaran status gizi anak.</p>
        </div>

        {/* FILTERS */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 px-2">
            <Filter size={16} className="text-slate-400" />
            <span className="text-sm font-bold text-slate-600">Filter:</span>
          </div>
          <select
            name="month"
            value={filter.month || ''}
            onChange={handleFilterChange}
            className="text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none p-1.5 bg-slate-50 font-medium text-slate-700"
          >
            <option value="">Semua Bulan</option>
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <div className="h-6 w-px bg-slate-200 mx-1"></div>
          <select
            name="year"
            value={filter.year || ''}
            onChange={handleFilterChange}
            className="text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none p-1.5 bg-slate-50 font-medium text-slate-700"
          >
            <option value="">Semua Tahun</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <div className="ml-auto hidden sm:flex items-center border border-slate-200 bg-slate-50 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
            <Search size={16} className="text-slate-400 mr-2" />
            <input
              type="text"
              placeholder={activeTab === 'aktivitas' ? "Cari Posyandu..." : "Cari Anak..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-slate-700 placeholder-slate-400 w-48 sm:w-64"
            />
          </div>
        </div>

        {/* Mobile Search - shown below filters on small screens */}
        <div className="sm:hidden flex items-center border border-slate-200 bg-white shadow-sm rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all w-full">
          <Search size={18} className="text-slate-400 mr-2" />
          <input
            type="text"
            placeholder={activeTab === 'aktivitas' ? "Cari Posyandu..." : "Cari Anak..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-slate-700 placeholder-slate-400 w-full"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl w-max mb-6 gap-1">
            <button
              onClick={() => { setActiveTab('ringkasan'); setPage(1); }}
              className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'ringkasan' ? 'bg-white shadow-sm text-black' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              Ringkasan Status Gizi
            </button>
            <button
              onClick={() => { setActiveTab('detail'); setPage(1); }}
              className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'detail' ? 'bg-white shadow-sm text-black' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              Detail Pengukuran
            </button>
            <button
              onClick={() => { setActiveTab('berisiko'); setPage(1); }}
              className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'berisiko' ? 'bg-white shadow-sm text-rose-700' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              Anak Berisiko
            </button>
            <button
              onClick={() => { setActiveTab('aktivitas'); setPage(1); }}
              className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'aktivitas' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              Aktivitas Posyandu
            </button>
          </div>

          {/* NUTRITION SUMMARY TABLE */}
          {activeTab === 'ringkasan' && summary && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-indigo-50/50 px-5 py-4 border-b border-slate-200 flex items-center gap-2">
                <Activity size={18} className="text-indigo-600" />
                <h2 className="font-bold text-slate-800">Ringkasan Status Gizi</h2>
                <span className="ml-auto text-sm text-slate-500">
                  Total Anak: <strong className="text-indigo-600">{summary.total_children}</strong> |
                  Diukur: <strong className="text-emerald-600">{summary.total_measured}</strong>
                </span>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* HAZ */}
                  <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 border-b border-slate-100 text-center">
                      Tinggi Badan (Stunting)
                    </div>
                    <ul className="divide-y divide-slate-50 text-sm">
                      <li className="flex justify-between px-4 py-2 text-slate-600">Normal <span className="font-bold text-slate-800">{summary.haz_distribution?.normal || 0}</span></li>
                      <li className="flex justify-between px-4 py-2 text-rose-600 font-medium">Stunting <span className="font-bold">{summary.haz_distribution?.stunting || 0}</span></li>
                      <li className="flex justify-between px-4 py-2 text-rose-700 font-bold">Sev. Stunting <span>{summary.haz_distribution?.severe_stunting || 0}</span></li>
                      <li className="flex justify-between px-4 py-2 text-sky-600">Tinggi <span className="font-bold">{summary.haz_distribution?.tinggi || 0}</span></li>
                    </ul>
                  </div>

                  {/* WAZ */}
                  <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 border-b border-slate-100 text-center">
                      Berat Badan (Underweight)
                    </div>
                    <ul className="divide-y divide-slate-50 text-sm">
                      <li className="flex justify-between px-4 py-2 text-slate-600">Normal <span className="font-bold text-slate-800">{summary.waz_distribution?.normal || 0}</span></li>
                      <li className="flex justify-between px-4 py-2 text-amber-600 font-medium">Underweight <span className="font-bold">{summary.waz_distribution?.underweight || 0}</span></li>
                      <li className="flex justify-between px-4 py-2 text-rose-600 font-bold">Sev. Underweight <span>{summary.waz_distribution?.severe_underweight || 0}</span></li>
                      <li className="flex justify-between px-4 py-2 text-orange-500">Risiko Lebih <span className="font-bold">{summary.waz_distribution?.overweight || 0}</span></li>
                    </ul>
                  </div>

                  {/* HCAZ */}
                  <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 border-b border-slate-100 text-center">
                      Lingkar Kepala
                    </div>
                    <ul className="divide-y divide-slate-50 text-sm">
                      <li className="flex justify-between px-4 py-2 text-slate-600">Normal <span className="font-bold text-slate-800">{summary.hcaz_distribution?.normal || 0}</span></li>
                      <li className="flex justify-between px-4 py-2 text-amber-600 font-medium">Mikrosefali <span className="font-bold">{summary.hcaz_distribution?.mikrosefali || 0}</span></li>
                      <li className="flex justify-between px-4 py-2 text-rose-600 font-bold">Sev. Mikrosefali <span>{summary.hcaz_distribution?.severe_mikrosefali || 0}</span></li>
                      <li className="flex justify-between px-4 py-2 text-violet-600">Makrosefali <span className="font-bold">{summary.hcaz_distribution?.makrosefali || 0}</span></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MEASUREMENTS DETAIL TABLE */}
          {activeTab === 'detail' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
              <div className="bg-sky-50/50 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                <Search size={16} className="text-sky-600" />
                <h2 className="font-bold text-slate-800 text-sm">Detail Pengukuran</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm" style={{ minWidth: '900px' }}>
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80">
                      <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 w-12 text-center">No</th>
                      <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Nama Anak</th>
                      <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Tanggal Ukur</th>
                      <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Usia (Bln)</th>
                      <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 text-center">Tinggi (cm)</th>
                      <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 text-center">Berat (kg)</th>
                      <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Status HAZ</th>
                      <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Status WAZ</th>
                      <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Status HCAZ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {measurements.length > 0 ? (
                      measurements.map((m: any, index: number) => (
                        <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-3 py-2 text-center text-slate-500 font-medium">
                            {(page - 1) * perPage + index + 1}
                          </td>
                          <td className="px-3 py-2">
                            <button onClick={() => handleViewChild(m.child?.id)} className="text-left group">
                              <p className="font-semibold text-sky-600 group-hover:text-sky-700 group-hover:underline">{m.child?.name || 'N/A'}</p>
                              <p className="text-[11px] text-slate-400">{m.child?.user?.posyandu?.name || '-'}</p>
                            </button>
                          </td>
                          <td className="px-3 py-2 text-slate-600">
                            {new Date(m.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-3 py-2 text-slate-700 font-medium">{m.age_months}</td>
                          <td className="px-3 py-2 text-slate-700 text-center font-mono">{m.height}</td>
                          <td className="px-3 py-2 text-slate-700 text-center font-mono">{m.weight}</td>
                          <td className="px-3 py-2">
                            <span className={`px-1.5 py-0.5 text-[11px] font-bold rounded ${m.status_haz?.toLowerCase().includes('stunting')
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-700'
                              }`}>
                              {m.status_haz || '-'}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span className={`px-1.5 py-0.5 text-[11px] font-bold rounded ${m.status_waz?.toLowerCase().includes('underweight')
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                              }`}>
                              {m.status_waz || '-'}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span className={`px-1.5 py-0.5 text-[11px] font-bold rounded ${(m.status_hcaz?.toLowerCase().includes('mikro') || m.status_hcaz?.toLowerCase().includes('makro'))
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-700'
                              }`}>
                              {m.status_hcaz || '-'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-400 text-sm">
                          Tidak ada data pengukuran untuk filter ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {measurements.length > 0 && totalPages > 1 && (
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              )}
            </div>
          )}

          {/* ANAK BERISIKO TABLE */}
          {activeTab === 'berisiko' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
              <div className="bg-rose-50/50 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                <Activity size={16} className="text-rose-600" />
                <h2 className="font-bold text-slate-800 text-sm">Daftar Anak Berisiko</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm" style={{ minWidth: '800px' }}>
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80">
                      <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 w-12 text-center">No</th>
                      <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Nama Anak</th>
                      <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Tgl Ukur</th>
                      <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Usia (Bln)</th>
                      <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 text-center">TB (cm)</th>
                      <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 text-center">BB (kg)</th>
                      <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Risiko / Indikasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {atRiskData.length > 0 ? (
                      atRiskData.map((riskItem: any, index: number) => (
                        <tr key={riskItem.child?.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-3 py-2 text-center text-slate-500">
                            {(page - 1) * perPage + index + 1}
                          </td>
                          <td className="px-3 py-2">
                            <button onClick={() => handleViewChild(riskItem.child?.id)} className="text-left group">
                              <p className="font-semibold text-sky-600 group-hover:text-sky-700 group-hover:underline">{riskItem.child?.name || 'N/A'}</p>
                              <p className="text-[11px] text-slate-400">{riskItem.child?.posyandu?.name || '-'}</p>
                            </button>
                          </td>
                          <td className="px-3 py-2 text-slate-600">
                            {riskItem.latest_measurement?.date ? new Date(riskItem.latest_measurement.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                          </td>
                          <td className="px-3 py-2 text-slate-700 font-medium">{riskItem.latest_measurement?.age_months ?? '-'}</td>
                          <td className="px-3 py-2 text-slate-700 text-center font-mono">{riskItem.latest_measurement?.height ?? '-'}</td>
                          <td className="px-3 py-2 text-slate-700 text-center font-mono">{riskItem.latest_measurement?.weight ?? '-'}</td>
                          <td className="px-3 py-2">
                            <div className="flex flex-wrap gap-1">
                              {riskItem.risks?.map((r: any, idx: number) => (
                                <span key={idx} className="px-1.5 py-0.5 text-[11px] font-bold rounded bg-rose-100 text-rose-700">
                                  {r.status}
                                </span>
                              ))}
                              {(!riskItem.risks || riskItem.risks.length === 0) && (
                                <span className="text-slate-400 text-xs">-</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400 text-sm">
                          Tidak ada anak berisiko untuk filter ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {atRiskData.length > 0 && totalPages > 1 && (
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              )}
            </div>
          )}

          {/* POSYANDU ACTIVITY TABLE */}
          {activeTab === 'aktivitas' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
              <div className="bg-emerald-50/50 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                <FileText size={16} className="text-emerald-600" />
                <h2 className="font-bold text-slate-800 text-sm">Aktivitas & Cakupan Posyandu</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200">
                      <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 w-12 text-center">No</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Nama Posyandu</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 text-center">Total Anak</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 text-center">Total Pengukuran</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 text-center">Selesai Diukur</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 text-center">Belum Diukur</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 text-center">Cakupan (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {posyanduActivity.length > 0 ? (
                      posyanduActivity.map((activity: any, index: number) => (
                        <tr key={activity.posyandu?.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-3 py-2 text-center text-xs text-slate-500 font-medium">
                            {index + 1}
                          </td>
                          <td className="px-3 py-2">
                            <p className="font-semibold text-slate-800 text-sm">{activity.posyandu?.name || 'N/A'}</p>
                            <p className="text-[11px] text-slate-400">{activity.posyandu?.desa?.name || '-'}</p>
                          </td>
                          <td className="px-3 py-2 text-slate-700 text-xs text-center font-medium">{activity.total_children}</td>
                          <td className="px-3 py-2 text-slate-700 text-xs text-center font-medium">{activity.total_measurements}</td>
                          <td className="px-3 py-2 text-emerald-600 text-xs text-center font-semibold">{activity.children_measured}</td>
                          <td className="px-3 py-2 text-amber-600 text-xs text-center font-semibold">{activity.children_not_measured}</td>
                          <td className="px-3 py-2 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span className={`text-xs font-semibold ${activity.coverage_percentage >= 80 ? 'text-emerald-600' :
                                activity.coverage_percentage >= 50 ? 'text-amber-600' : 'text-rose-600'
                                }`}>
                                {activity.coverage_percentage}%
                              </span>
                              <div className="w-14 h-1.5 rounded-full bg-slate-100 overflow-hidden hidden sm:block">
                                <div
                                  className={`h-full rounded-full ${activity.coverage_percentage >= 80 ? 'bg-emerald-500' :
                                    activity.coverage_percentage >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                                    }`}
                                  style={{ width: `${Math.min(activity.coverage_percentage, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-3 py-6 text-center text-slate-500 text-xs">
                          Tidak ada data aktivitas untuk filter ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* CHILD GROWTH MODAL */}
      {(selectedChildGrowth || isModalLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-extrabold text-slate-800">
                  {selectedChildGrowth?.child?.name || 'Memuat...'}
                </h2>
                {selectedChildGrowth?.child && (
                  <p className="text-sm text-slate-500 mt-1">
                    Lahir: {new Date(selectedChildGrowth.child.birth_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} •
                    Gender: {selectedChildGrowth.child.gender === 'L' ? 'Laki-laki' : 'Perempuan'} •
                    Ortu: {selectedChildGrowth.child.parent?.name || '-'}
                  </p>
                )}
              </div>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              {isModalLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <>
                  {/* Measurements */}
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm mb-3">Riwayat Pengukuran Aktual</h3>
                    <div className="border border-slate-200 rounded-lg overflow-hidden overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/80 border-b border-slate-200">
                          <tr>
                            <th className="px-2.5 py-2 font-semibold text-slate-500 uppercase tracking-wide text-[10px]">Tanggal</th>
                            <th className="px-2.5 py-2 font-semibold text-slate-500 uppercase tracking-wide text-[10px]">Usia</th>
                            <th className="px-2.5 py-2 font-semibold text-slate-500 uppercase tracking-wide text-[10px]">TB (cm)</th>
                            <th className="px-2.5 py-2 font-semibold text-slate-500 uppercase tracking-wide text-[10px]">BB (kg)</th>
                            <th className="px-2.5 py-2 font-semibold text-slate-500 uppercase tracking-wide text-[10px]">LK (cm)</th>
                            <th className="px-2.5 py-2 font-semibold text-slate-500 uppercase tracking-wide text-[10px]">HAZ</th>
                            <th className="px-2.5 py-2 font-semibold text-slate-500 uppercase tracking-wide text-[10px]">WAZ</th>
                            <th className="px-2.5 py-2 font-semibold text-slate-500 uppercase tracking-wide text-[10px]">HCAZ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedChildGrowth?.measurements?.length > 0 ? (
                            selectedChildGrowth.measurements.map((m: any) => (
                              <tr key={m.id} className="hover:bg-slate-50/60">
                                <td className="px-2.5 py-1.5 text-slate-600">{new Date(m.date).toLocaleDateString('id-ID')}</td>
                                <td className="px-2.5 py-1.5 font-medium text-slate-700">{m.age_months}</td>
                                <td className="px-2.5 py-1.5 text-slate-600">{m.height}</td>
                                <td className="px-2.5 py-1.5 text-slate-600">{m.weight}</td>
                                <td className="px-2.5 py-1.5 text-slate-600">{m.head_circ || '-'}</td>
                                <td className="px-2.5 py-1.5">
                                  <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${m.status_haz?.toLowerCase().includes('stunting') ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                                    }`}>{m.status_haz || '-'}</span>
                                </td>
                                <td className="px-2.5 py-1.5">
                                  <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${m.status_waz?.toLowerCase().includes('underweight') ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                    }`}>{m.status_waz || '-'}</span>
                                </td>
                                <td className="px-2.5 py-1.5">
                                  <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${(m.status_hcaz?.toLowerCase().includes('mikro') || m.status_hcaz?.toLowerCase().includes('makro'))
                                    ? 'bg-rose-100 text-rose-700'
                                    : 'bg-emerald-100 text-emerald-700'
                                    }`}>{m.status_hcaz || '-'}</span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr><td colSpan={8} className="p-4 text-center text-slate-500">Belum ada pengukuran</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Predictions */}
                  {selectedChildGrowth?.latest_prediction?.prediction && (
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm mb-3">Prediksi Pertumbuhan (AI - {selectedChildGrowth.latest_prediction.selected_model})</h3>
                      <div className="border border-indigo-100 rounded-lg overflow-hidden overflow-x-auto shadow-sm shadow-indigo-100/50">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-indigo-50/80 border-b border-indigo-100">
                            <tr>
                              <th className="px-2.5 py-2 font-semibold text-indigo-800 text-[10px] uppercase tracking-wide">Usia</th>
                              <th className="px-2.5 py-2 font-semibold text-indigo-800 text-[10px] uppercase tracking-wide">Est. TB</th>
                              <th className="px-2.5 py-2 font-semibold text-indigo-800 text-[10px] uppercase tracking-wide">Est. BB</th>
                              <th className="px-2.5 py-2 font-semibold text-indigo-800 text-[10px] uppercase tracking-wide">Est. LK</th>
                              <th className="px-2.5 py-2 font-semibold text-indigo-800 text-[10px] uppercase tracking-wide">Risiko TB</th>
                              <th className="px-2.5 py-2 font-semibold text-indigo-800 text-[10px] uppercase tracking-wide">Risiko BB</th>
                              <th className="px-2.5 py-2 font-semibold text-indigo-800 text-[10px] uppercase tracking-wide">Risiko LK</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-indigo-50">
                            {selectedChildGrowth.latest_prediction.prediction.map((p: any, idx: number) => (
                              <tr key={idx} className="hover:bg-indigo-50/40">
                                <td className="px-2.5 py-1.5 font-medium text-indigo-700">{p.age}</td>
                                <td className="px-2.5 py-1.5 text-slate-600">{p.height?.value?.toFixed(1) || '-'} <span className="text-[10px] text-slate-400">±{p.height?.uncertainty_band?.toFixed(1) || 0}</span></td>
                                <td className="px-2.5 py-1.5 text-slate-600">{p.weight?.value?.toFixed(1) || '-'} <span className="text-[10px] text-slate-400">±{p.weight?.uncertainty_band?.toFixed(1) || 0}</span></td>
                                <td className="px-2.5 py-1.5 text-slate-600">{p.head_circ?.value?.toFixed(1) || '-'}</td>
                                <td className="px-2.5 py-1.5">
                                  <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${(p.height?.status || '').toLowerCase().includes('risk') || (p.height?.status || '').toLowerCase().includes('stunting')
                                    ? 'bg-rose-100 text-rose-700'
                                    : 'bg-emerald-100 text-emerald-700'
                                    }`}>{p.height?.status || '-'}</span>
                                </td>
                                <td className="px-2.5 py-1.5">
                                  <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${(p.weight?.status || '').toLowerCase().includes('buruk') || (p.weight?.status || '').toLowerCase().includes('kurang')
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-emerald-100 text-emerald-700'
                                    }`}>{p.weight?.status || '-'}</span>
                                </td>
                                <td className="px-2.5 py-1.5">
                                  <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${(p.head_circ?.status || '').toLowerCase().includes('mikro') || (p.head_circ?.status || '').toLowerCase().includes('makro')
                                    ? 'bg-rose-100 text-rose-700'
                                    : 'bg-emerald-100 text-emerald-700'
                                    }`}>{p.head_circ?.status || '-'}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="text-xs text-slate-400 mt-2 italic">{selectedChildGrowth.latest_prediction.description}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end rounded-b-2xl">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-colors text-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
