import React, { useEffect, useState } from "react";
import { X, User } from "lucide-react";

interface FamilyProfile {
  motherName: string;
  posyanduDesa: string;
  bidanName: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: FamilyProfile;
  onSave: (data: FamilyProfile) => void;
}

export default function FamilyProfileModal({
  isOpen,
  onClose,
  profile,
  onSave,
}: Props) {
  const [form, setForm] = useState(profile);

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">

        <div className="flex justify-between items-center mb-5">

          <h2 className="font-bold text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-sky-600"/>
            Profil Ibu
          </h2>

          <button onClick={onClose}>
            <X className="w-5 h-5"/>
          </button>

        </div>

        <div className="space-y-4">

          <div>
            <label className="text-sm font-medium">
              Nama Ibu
            </label>

            <input
              type="text"
              value={form.motherName}
              onChange={(e)=>
                setForm({...form,motherName:e.target.value})
              }
              className="w-full mt-1 border rounded-xl px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Desa / Posyandu
            </label>

            <input
              type="text"
              value={form.posyanduDesa}
              onChange={(e)=>
                setForm({...form,posyanduDesa:e.target.value})
              }
              className="w-full mt-1 border rounded-xl px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Bidan Penanggung Jawab
            </label>

            <input
              type="text"
              value={form.bidanName}
              onChange={(e)=>
                setForm({...form,bidanName:e.target.value})
              }
              className="w-full mt-1 border rounded-xl px-3 py-2"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-xl font-semibold mt-2"
          >
            Simpan Profil
          </button>

        </div>

      </div>

    </div>
  );
}