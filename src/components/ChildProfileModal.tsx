import React, { useState, useEffect } from 'react';
import { X, Baby, Calendar, UserCheck } from 'lucide-react';
import { Child, Gender } from '../types';

interface ChildProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (child: Omit<Child, 'id'> & { id?: string }) => void;
  initialChild?: Child | null;
}

export default function ChildProfileModal({ isOpen, onClose, onSave, initialChild }: ChildProfileModalProps) {
  const [name, setName] = useState('');
  const [nik, setNik] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<Gender>('Laki-laki');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialChild) {
      setName(initialChild.name);
      setNik(initialChild.nik || '');
      setBirthDate(initialChild.birthDate);
      setGender(initialChild.gender);
    } else {
      setName('');
      setNik('');
      // Default to today or a sensible past date
      setBirthDate(new Date().toISOString().split('T')[0]);
      setGender('Laki-laki');
    }
    setError('');
  }, [initialChild, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama anak tidak boleh kosong');
      return;
    }
    if (!nik || nik.length !== 16 || !/^\d+$/.test(nik)) {
      setError('NIK anak harus 16 digit angka');
      return;
    }
    if (!birthDate) {
      setError('Tanggal lahir tidak boleh kosong');
      return;
    }

    // Birthdate must not be in the future
    if (new Date(birthDate) > new Date()) {
      setError('Tanggal lahir tidak boleh di masa depan');
      return;
    }

    onSave({
      id: initialChild?.id,
      name: name.trim(),
      nik,
      birthDate,
      gender
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 transition-all scale-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Baby className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-slate-850 text-lg">
              {initialChild ? 'Ubah Profil Anak' : 'Tambah Profil Anak'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs font-semibold text-red-600 bg-red-50 border border-red-150 rounded-xl">
              {error}
            </div>
          )}

          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap Anak</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Jaki / Aisyah"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-850 font-medium"
            />
          </div>

          {/* NIK */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">NIK Anak</label>
            <input
              type="text"
              value={nik}
              onChange={(e) => setNik(e.target.value)}
              placeholder="16 Digit NIK Anak"
              maxLength={16}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-850 font-medium"
            />
          </div>

          {/* Gender */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Jenis Kelamin</label>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setGender('Laki-laki')}
                className={`py-3 px-4 rounded-xl border-2 font-semibold flex items-center justify-center gap-2 transition-all ${
                  gender === 'Laki-laki'
                    ? 'border-sky-500 bg-sky-50/50 text-sky-700'
                    : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                Laki-laki
              </button>
              <button
                type="button"
                onClick={() => setGender('Perempuan')}
                className={`py-3 px-4 rounded-xl border-2 font-semibold flex items-center justify-center gap-2 transition-all ${
                  gender === 'Perempuan'
                    ? 'border-pink-500 bg-pink-50/50 text-pink-700'
                    : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                Perempuan
              </button>
            </div>
          </div>

          {/* Birth Date */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal Lahir</label>
            <div className="relative">
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 pl-11 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-850 font-medium"
              />
              <Calendar className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="text-[10px] text-slate-400">Digunakan untuk menghitung usia anak secara presisi saat grafik diplot.</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-200 text-slate-500 rounded-xl font-bold hover:bg-slate-50 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-sky-600/10"
            >
              <UserCheck className="w-4 h-4" />
              Simpan Profil
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
