import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AppLegacy from '../../App.legacy';
import { X, Lightbulb, Activity, ArrowRight } from 'lucide-react';
import { tipsService } from '../../services/tipsService';

export const OrtuDashboard: React.FC = () => {
  const { user } = useAuth();
  const [showTips, setShowTips] = useState(false);
  const [tipData, setTipData] = useState<any>(null);

  useEffect(() => {
    const fetchMonthlyTip = async () => {
      try {
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        
        // Fetch latest tip (ordered by year DESC, month DESC in backend)
        const response = await tipsService.getTips({ per_page: 1 });
        if (response.data && response.data.length > 0) {
          const latestTip = response.data[0];
          setTipData(latestTip);
          
          const tipMonth = latestTip.month || month;
          const tipYear = latestTip.year || year;
          const hasSeenTips = sessionStorage.getItem(`hasSeenOrtuTips_${tipMonth}_${tipYear}`);
          if (!hasSeenTips) {
            setShowTips(true);
            sessionStorage.setItem(`hasSeenOrtuTips_${tipMonth}_${tipYear}`, 'true');
          }
        }
      } catch (error) {
        console.error('Failed to fetch monthly tip:', error);
      }
    };

    fetchMonthlyTip();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Legacy App Content */}
      <div className="flex-1 relative bg-slate-50">
        <AppLegacy />
      </div>

      {/* Tips Modal */}
      {showTips && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
            {/* Image Header */}
            <div className="relative h-48 bg-gradient-to-br from-sky-50 to-emerald-50 p-6 flex justify-center">
              <img 
                src={tipData?.image || "/src/assets/images/stunting_tips.png"} 
                alt="Parenting Tips" 
                className="h-full object-contain drop-shadow-md rounded-xl"
              />
              <button
                onClick={() => setShowTips(false)}
                className="absolute top-4 right-4 bg-white/80 backdrop-blur text-slate-500 hover:text-slate-800 p-2 rounded-full shadow-sm transition-all hover:bg-white hover:scale-105"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 text-center space-y-4">
              <div className="inline-flex items-center justify-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-widest mb-1">
                <Lightbulb size={12} />
                Tips Bulan Ini
              </div>
              
              <h2 className="text-xl font-extrabold text-slate-800 leading-tight">
                {tipData?.title || 'Tips Kesehatan'}
              </h2>
              
              <p className="text-sm text-slate-500 leading-relaxed px-2">
                {tipData?.description || 'Pastikan si kecil mendapatkan asupan gizi yang cukup. Selalu pantau pertumbuhannya setiap bulan di Posyandu!'}
              </p>
              
              <div className="pt-4 pb-2">
                <button
                  onClick={() => setShowTips(false)}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-900/20"
                >
                  <Activity size={18} />
                  Mulai Pantau Pertumbuhan
                  <ArrowRight size={18} className="ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
