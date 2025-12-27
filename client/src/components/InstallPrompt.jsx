import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true;

    if (isStandalone) {
      return; // Already installed, don't show prompt
    }

    // Check if dismissed recently (don't annoy users)
    const dismissed = localStorage.getItem('ito-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 24) {
        return; // Dismissed less than 24h ago
      }
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // Detect mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (!isMobile) {
      return; // Only show on mobile
    }

    // For iOS, show after a delay
    if (isIOSDevice) {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    // For Android, listen for beforeinstallprompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSInstructions(false);
    localStorage.setItem('ito-install-dismissed', Date.now().toString());
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 z-50"
        >
          <div className="glass rounded-2xl p-4 border border-primary/30 shadow-lg shadow-primary/20">
            {showIOSInstructions ? (
              // iOS Instructions
              <div>
                <p className="text-white font-medium mb-3">Para instalar no iPhone:</p>
                <ol className="text-white/70 text-sm space-y-2 mb-4">
                  <li className="flex items-start gap-2">
                    <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">1</span>
                    <span>Toque no botão <strong className="text-white">Compartilhar</strong> (quadrado com seta)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">2</span>
                    <span>Role e toque em <strong className="text-white">"Adicionar à Tela de Início"</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">3</span>
                    <span>Toque em <strong className="text-white">"Adicionar"</strong></span>
                  </li>
                </ol>
                <button
                  onClick={handleDismiss}
                  className="w-full py-2 text-white/60 text-sm"
                >
                  Entendi
                </button>
              </div>
            ) : (
              // Install prompt
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">ITO</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium">Instalar ITO</p>
                  <p className="text-white/60 text-sm truncate">Adicione à tela inicial</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleDismiss}
                    className="p-2 text-white/40 hover:text-white/60"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <button
                    onClick={handleInstall}
                    className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-xl font-medium text-sm transition-colors"
                  >
                    Instalar
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
