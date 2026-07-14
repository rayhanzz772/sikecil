import React from 'react';
import { X, BookOpen, Download } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  description: string;
  fileName: string; // nama file persis seperti di folder public/bukupanduan/
}

// Daftar buku panduan — filenya ada di public/bukupanduan/
const BOOKS = [
  {
    id: "1",
    title: "Buku Kesehatan Ibu dan Anak",
    description: "Panduan resmi Kemenkes RI.",
    fileName: "Buku1.pdf",
  },
  {
    id: "2",
    title: "Buku Pemberian Makan Bayi dan Anak",
    description: "Panduan MPASI dan ASI.",
    fileName: "Buku2.pdf",
  },
];

interface BookGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookGuideModal({ isOpen, onClose }: BookGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 sticky top-0 bg-white">
          <h2 className="font-extrabold text-slate-800 flex items-center gap-2 text-base">
            <BookOpen className="w-5 h-5 text-sky-600" />
            Buku Panduan Kesehatan
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {BOOKS.map(book => (
            <div
              key={book.id}
              className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
            >
              <div>
                <h3 className="text-sm font-bold text-slate-800">{book.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{book.description}</p>
              </div>
              <a
                href={encodeURI(`/bukupanduan/${book.fileName}`)}
                download
                className="p-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl transition-all shrink-0"
                title={`Download ${book.title}`}
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}