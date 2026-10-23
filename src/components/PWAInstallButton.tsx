import React, { useState } from 'react';
import { Download, Smartphone, Check, Share, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  // If already running in standalone mode, indicate ready
  if (isInstalled) {
    if (compact) return null;
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800/50">
        <Check className="w-3.5 h-3.5 text-emerald-600" />
        <span>Installed App</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setInstalledSuccess(true);
      setTimeout(() => setInstalledSuccess(false), 3000);
    }
  };

  return (
    <>
      {isInstallable && (
        <button
          onClick={handleInstallClick}
          className={`inline-flex items-center gap-2 font-medium transition shadow-sm ${
            compact
              ? 'px-3 py-1.5 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
              : 'px-4 py-2 text-sm rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 active:scale-95 shadow-emerald-500/20'
          }`}
          title="Install SpendWise directly to your phone or desktop"
        >
          <Download className="w-4 h-4 animate-bounce" />
          <span>{installedSuccess ? 'App Installed!' : 'Install on Phone'}</span>
        </button>
      )}

      {/* iOS Safari Fallback */}
      {isIOS && !isInstallable && (
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`inline-flex items-center gap-1.5 font-medium border transition ${
            compact
              ? 'px-2.5 py-1 text-xs rounded-lg border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              : 'px-3.5 py-2 text-sm rounded-xl border-emerald-300 text-emerald-800 bg-emerald-50/50 dark:border-emerald-700 dark:text-emerald-200 dark:bg-emerald-950/30 hover:bg-emerald-100'
          }`}
        >
          <Smartphone className="w-4 h-4 text-emerald-600" />
          <span>Install on iPhone</span>
        </button>
      )}

      {/* Fallback button for browsers that haven't triggered beforeinstallprompt yet or for general user guide */}
      {!isInstallable && !isIOS && !isInstalled && !compact && (
        <button
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          title="How to install on phone"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Install to Home Screen</span>
        </button>
      )}

      {/* Guide Modal for iOS / general mobile install */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl relative">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Install on Your Phone</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">100% Free, works offline anytime</p>
              </div>
            </div>

            <div className="space-y-3.5 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">On iPhone / iPad (Safari):</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                    Tap the <Share className="w-3.5 h-3.5 text-blue-500 inline" /> Share button in Safari, scroll and tap <strong className="text-slate-700 dark:text-slate-300">Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 text-slate-500 inline" />.
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex items-start gap-2.5">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">On Android (Chrome / Edge):</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Tap the <strong>⋮ menu</strong> icon at top right, then select <strong>Install App</strong> or <strong>Add to Home Screen</strong>.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 text-sm font-semibold text-white transition shadow-sm"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
