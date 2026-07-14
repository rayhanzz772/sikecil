import React from 'react';
import { ArrowLeft, History, Edit2, Trash2 } from 'lucide-react';
import { Child, Measurement } from '../types';
import { getStuntingStatus, getWeightStatus } from '../utils/whoStandards';

interface RiwayatSectionProps {
  child: Child;
  measurements: Measurement[]; // sudah terurut & sudah difilter untuk child ini
  onBack: () => void;
  onEdit: (m: Measurement) => void;
  onDelete: (id: string) => void;
}

export default function RiwayatSection({ child, measurements, onBack, onEdit, onDelete }: RiwayatSectionProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-sky-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>
        <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
          Total: {measurements.length} Entri
        </span>
      </div>

      <h3 className="font-extrabold text-slate-800 flex items-center gap-1.5 font-display text-base">
        <History className="w-5 h-5 text-sky-600" />
        Riwayat {child.name}
      </h3>

      {measurements.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-6">Belum ada riwayat tercatat untuk profil ini.</p>
      ) : (
        <div className="space-y-3">
          {measurements.slice().reverse().map(m => {
            const hStat = getStuntingStatus(m.height, m.ageMonths, child.gender);
            const wStat = getWeightStatus(m.weight, m.ageMonths, child.gender);

            return (
              <div key={m.id} className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 flex items-center justify-between gap-3 transition-all text-xs group">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-850 text-sm">
                      {new Date(m.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-[10px] text-sky-700 font-bold bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100">
                      {m.ageMonths === 0 ? 'Lahir' : `${m.ageMonths.toFixed(1)} bln`}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-slate-600 font-semibold">
                    <span>Tinggi: <strong className="text-slate-800">{m.height} cm</strong> ({hStat.status})</span>
                    <span>Berat: <strong className="text-slate-800">{m.weight} kg</strong> ({wStat.status})</span>
                    {m.headCircumference && <span>L. Kepala: <strong className="text-slate-800">{m.headCircumference} cm</strong></span>}
                  </div>
                  {m.notes && (
                    <p className="text-[10px] text-slate-500 italic bg-white px-2.5 py-1.5 rounded-lg border border-slate-100 leading-relaxed mt-1">
                      Catatan: {m.notes}
                    </p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-1">
                  <button onClick={() => onEdit(m)} className="p-2 text-slate-300 hover:text-sky-600 rounded-xl hover:bg-white transition-colors" title="Edit Catatan">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(m.id)} className="p-2 text-slate-300 hover:text-red-500 rounded-xl hover:bg-white transition-colors" title="Hapus Catatan">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}