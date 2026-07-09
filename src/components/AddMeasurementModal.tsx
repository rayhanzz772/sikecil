import React, { useState, useEffect } from 'react';
import { X, Ruler, Scale, Heart, Calendar, Plus } from 'lucide-react';
import { Measurement, Child } from '../types';
import { calculateAge } from '../utils/whoStandards';

interface AddMeasurementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (measurement: Omit<Measurement, 'id' | 'ageMonths'> & { id?: string }) => void;
  selectedChild: Child;
  latestMeasurement?: Measurement | null;
}

export default function AddMeasurementModal({ isOpen, onClose, onSave, selectedChild, latestMeasurement }: AddMeasurementModalProps) {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [headCirc, setHeadCirc] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDate(new Date().toISOString().split('T')[0]);
      if (latestMeasurement) {
        setHeight(latestMeasurement.height.toString());
        setWeight(latestMeasurement.weight.toString());
        setHeadCirc(latestMeasurement.headCircumference ? latestMeasurement.headCircumference.toString() : '');
        setNotes('');
      } else {
        setHeight('');
        setWeight('');
        setHeadCirc('');
        setNotes('');
      }
      setError('');
    }
  }, [isOpen, latestMeasurement]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedHeight = parseFloat(height);
    const parsedWeight = parseFloat(weight);
    const parsedHeadCirc = headCirc ? parseFloat(headCirc) : undefined;

    if (isNaN(parsedHeight) || parsedHeight <= 0 || parsedHeight > 200) {
      setError('Masukkan tinggi badan yang valid (0 - 200 cm)');
      return;
    }

    if (isNaN(parsedWeight) || parsedWeight <= 0 || parsedWeight > 100) {
      setError('Masukkan berat badan yang valid (0 - 100 kg)');
      return;
    }

    if (headCirc && (isNaN(parsedHeadCirc!) || parsedHeadCirc! <= 0 || parsedHeadCirc! > 100)) {
      setError('Masukkan lingkar kepala yang valid (jika diisi)');
      return;
    }

    if (!date) {
      setError('Masukkan tanggal pengukuran');
      return;
    }

    // Verify measurement is not before birth date
    if (new Date(date) < new Date(selectedChild.birthDate)) {
      setError('Tanggal pengukuran tidak boleh sebelum tanggal lahir anak');
      return;
    }

    // Verify date is not in future
    if (new Date(date) > new Date()) {
      setError('Tanggal pengukuran tidak boleh di masa depan');
      return;
    }

    onSave({
      childId: selectedChild.id,
      date,
      height: parsedHeight,
      weight: parsedWeight,
      headCircumference: parsedHeadCirc,
      notes: notes.trim() || undefined
    });

    onClose();
  };

  // Live age calculator based on chosen date
  const chosenAgeText = () => {
    if (!date) return '';
    const age = calculateAge(selectedChild.birthDate, date);
    if (age.years === 0 && age.months === 0) {
      return `${age.days} Hari`;
    }
    if (age.years === 0) {
      return `${age.months} Bulan ${age.days} Hari`;
    }
    return `${age.years} Tahun ${age.months} Bulan ${age.days} Hari`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 transition-all scale-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-slate-850 text-lg">
              Catat Tumbuh Kembang
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="p-3 bg-sky-50/50 rounded-xl border border-sky-100 text-xs text-sky-850 flex items-center gap-3">
            <span className="text-xl">👦</span>
            <div>
              <p className="font-bold">{selectedChild.name}</p>
              <p className="text-slate-500">Gender: {selectedChild.gender} | Lahir: {new Date(selectedChild.birthDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          {error && (
            <div className="p-3 text-xs font-semibold text-red-600 bg-red-50 border border-red-150 rounded-xl">
              {error}
            </div>
          )}

          {/* Date Picker */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal Pengukuran</label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                min={selectedChild.birthDate}
                className="w-full px-4 py-3 pl-11 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-850 text-sm font-medium"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {date && (
              <p className="text-[10px] text-sky-600 font-semibold mt-1">
                Usia saat diukur: {chosenAgeText()}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Height */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tinggi Badan</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="50"
                  className="w-full px-4 py-3 pl-11 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-850 text-sm font-medium"
                />
                <Ruler className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <span className="text-xs font-bold text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">cm</span>
              </div>
            </div>

            {/* Weight */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Berat Badan</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="3.5"
                  className="w-full px-4 py-3 pl-11 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-850 text-sm font-medium"
                />
                <Scale className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <span className="text-xs font-bold text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">kg</span>
              </div>
            </div>
          </div>

          {/* Head Circumference (Optional) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lingkar Kepala <span className="text-slate-400 font-normal">(Opsional)</span></label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={headCirc}
                onChange={(e) => setHeadCirc(e.target.value)}
                placeholder="40"
                className="w-full px-4 py-3 pl-11 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-850 text-sm font-medium"
              />
              <Heart className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <span className="text-xs font-bold text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">cm</span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Catatan Tambahan</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Kondisi anak sehat, sehabis minum ASI, dll."
              rows={2}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-850 text-sm resize-none font-medium"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-100 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-200 text-slate-500 rounded-xl font-bold hover:bg-slate-50 transition-all text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-sky-600/10 text-sm"
            >
              Simpan Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
