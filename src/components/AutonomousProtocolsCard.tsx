import React, { useState } from 'react';
import { Activity, ShieldAlert, RefreshCw, EyeOff, Zap, Play, CheckCircle2 } from 'lucide-react';
import { AUTONOMOUS_PROTOCOLS, AutonomousProtocol, playAlertChime } from '../services/commandSystem';
import { piperTTS } from '../services/piperTTS';

interface AutonomousProtocolsCardProps {
  onToggleBlackout?: (enable?: boolean) => void;
  isBlackout?: boolean;
}

export const AutonomousProtocolsCard: React.FC<AutonomousProtocolsCardProps> = ({
  onToggleBlackout,
  isBlackout = false
}) => {
  const [runningProtocol, setRunningProtocol] = useState<string | null>(null);
  const [completedProtocol, setCompletedProtocol] = useState<string | null>(null);

  const handleExecuteProtocol = (protocol: AutonomousProtocol) => {
    if (runningProtocol) return;

    setRunningProtocol(protocol.id);
    setCompletedProtocol(null);

    if (protocol.id === 'alpha') {
      playAlertChime('confirm');
      piperTTS.speak(
        "Protocole Alpha engagé. Tous les systèmes sont nominaux, Monsieur Albert. Zéro anomalie matérielle.",
        () => {
          setRunningProtocol(null);
          setCompletedProtocol('alpha');
        },
        { mode: 'executive' }
      );
    } else if (protocol.id === 'defense') {
      playAlertChime('alarm');
      piperTTS.speak(
        "Protocole Défense déployé. Bouclier Sentinel verrouillé au niveau maximal. Surveillance active.",
        () => {
          setRunningProtocol(null);
          setCompletedProtocol('defense');
        },
        { mode: 'alert' }
      );
    } else if (protocol.id === 'omega') {
      playAlertChime('system_ready');
      // Purge browser caches safely if supported
      try {
        if (typeof window !== 'undefined' && 'caches' in window && window.caches) {
          window.caches.keys().then(keys => {
            keys.forEach(k => {
              if (k.includes('temp')) window.caches.delete(k).catch(() => {});
            });
          }).catch(() => {});
        }
      } catch {}
      piperTTS.speak(
        "Protocole Oméga achevé. Mémoire vive assainie et canaux de calcul réalignés.",
        () => {
          setRunningProtocol(null);
          setCompletedProtocol('omega');
        },
        { mode: 'executive' }
      );
    } else if (protocol.id === 'stealth') {
      playAlertChime('beep');
      onToggleBlackout?.(true);
      piperTTS.speak(
        "Protocole Veille actif. Mode furtif Blackout déployé. Ali reste en écoute silencieuse à vos ordres.",
        () => {
          setRunningProtocol(null);
          setCompletedProtocol('stealth');
        },
        { mode: 'stealth' }
      );
    } else if (protocol.id === 'overclock') {
      playAlertChime('overclock_burst');
      piperTTS.speak(
        "Surcadence tactique Mark L engagée à 1000% d'efficacité. Tous les cœurs de calcul et pipelines neuronaux sont synchronisés à 4.85 GHz, Monsieur Albert.",
        () => {
          setRunningProtocol(null);
          setCompletedProtocol('overclock');
        },
        { mode: 'tactical' }
      );
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Activity':
        return <Activity className="w-4 h-4 text-cyan-400" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'RefreshCw':
        return <RefreshCw className="w-4 h-4 text-amber-400" />;
      case 'EyeOff':
        return <EyeOff className="w-4 h-4 text-emerald-400" />;
      default:
        return <Zap className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div
      className={`p-4 rounded-2xl border transition-all space-y-3.5 shadow-lg ${
        isBlackout
          ? 'bg-black/95 border-emerald-950 text-slate-200 shadow-[0_0_20px_rgba(16,185,129,0.12)]'
          : 'bg-slate-900/90 border-slate-800 text-slate-100'
      }`}
    >
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Zap className={`w-4 h-4 ${isBlackout ? 'text-emerald-400' : 'text-cyan-400'}`} />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            Routines & Protocoles Autonomes
          </span>
        </div>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
          isBlackout ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-950 text-cyan-400 border border-slate-800'
        }`}>
          Albert Exclusif
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {AUTONOMOUS_PROTOCOLS.map((proto) => {
          const isRunning = runningProtocol === proto.id;
          const isDone = completedProtocol === proto.id;

          return (
            <div
              key={proto.id}
              className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                isRunning
                  ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.25)]'
                  : isBlackout
                  ? 'bg-[#050505] border-emerald-950 hover:border-emerald-800/80'
                  : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                    {getIcon(proto.iconName)}
                  </div>
                  <div>
                    <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                      <span>{proto.name}</span>
                    </div>
                    <div className="text-[9px] font-mono text-slate-400 tracking-wider">
                      {proto.codename}
                    </div>
                  </div>
                </div>

                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                  {proto.badge}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 mt-2 font-mono line-clamp-2">
                {proto.description}
              </p>

              <button
                onClick={() => handleExecuteProtocol(proto)}
                disabled={isRunning}
                className={`mt-3 py-1.5 px-3 rounded-lg text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                  isRunning
                    ? 'bg-cyan-500 text-slate-950 animate-pulse'
                    : isDone
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : isBlackout
                    ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                    : 'bg-slate-900 hover:bg-slate-850 text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/60'
                }`}
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Exécution...</span>
                  </>
                ) : isDone ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Exécuté & Actif</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3" />
                    <span>Engager {proto.name}</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
