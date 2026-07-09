import React, { useState, useEffect } from 'react';
import { Download, Sparkles, X } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Check if user has already dismissed it in this session
      const dismissed = sessionStorage.getItem('pwa-prompt-dismissed');
      if (!dismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Also check if app is already running in standalone mode (installed)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsVisible(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-sky-600 to-indigo-700 rounded-2xl p-5 text-white shadow-xl shadow-sky-600/10 border border-sky-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden animate-fade-in">
      <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-10 translate-y-10 scale-150">
        <Sparkles className="w-40 h-40" />
      </div>
      
      <button 
        onClick={handleDismiss}
        className="absolute right-4 top-4 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="space-y-1.5 max-w-[500px] z-10 pr-6">
        <div className="flex items-center gap-2">
          <span className="bg-white/20 text-[11px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full">
            Fitur PWA Spesial
          </span>
        </div>
        <h4 className="font-extrabold text-lg leading-snug">Pasang Aplikasi SiKecil di HP Anda!</h4>
        <p className="text-white/80 text-xs leading-relaxed">
          Gunakan aplikasi secara lebih lancar, cepat, hemat kuota, dan dapat diakses sepenuhnya secara **offline** kapan saja saat posyandu.
        </p>
      </div>

      <button
        onClick={handleInstallClick}
        className="w-full md:w-auto px-5 py-3 bg-white text-sky-800 font-extrabold text-sm rounded-xl flex items-center justify-center gap-2.5 hover:bg-sky-50 transition-all active:scale-[0.98] cursor-pointer shadow-md z-10 whitespace-nowrap"
      >
        <Download className="w-4 h-4" />
        Pasang Sekarang
      </button>
    </div>
  );
}
