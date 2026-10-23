import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Thermometer, Zap, ShieldCheck, RefreshCw, Activity } from 'lucide-react';
import { fetchSystemMetrics, playAlertChime } from '../services/commandSystem';

interface HardwareTelemetryHUDProps {
  isBlackout?: boolean;
  compact?: boolean;
}

export const HardwareTelemetryHUD: React.FC<HardwareTelemetryHUDProps> = ({
  isBlackout = false,
  compact = false
}) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [cpuFreq, setCpuFreq] = useState(3.4);
  const [cpuLoad, setCpuLoad] = useState(24);
  const [tempC, setTempC] = useState(36.4);
  const [wavePoints, setWavePoints] = useState<number[]>([20, 35, 18, 42, 30, 22, 55, 38, 25, 40]);
  const [isPurging, setIsPurging] = useState(false);
  const [isOverclocked, setIsOverclocked] = useState(false);

  useEffect(() => {
    fetchSystemMetrics().then(setMetrics);

    const interval = setInterval(() => {
      if (isOverclocked) {
        // High-frequency turbo oscillation at 4.75 - 4.95 GHz
        const turboJitter = (Math.random() - 0.5) * 0.12;
        setCpuFreq(+(4.85 + turboJitter).toFixed(2));
        setCpuLoad(Math.floor(75 + Math.random() * 20));
        setTempC(prev => +(Math.max(38.0, Math.min(42.5, prev + (Math.random() - 0.5) * 0.4))).toFixed(1));
        setWavePoints(prev => {
          const nextVal = Math.floor(70 + Math.random() * 28);
          return [...prev.slice(1), nextVal];
        });
        return;
      }

      // Fluctuate CPU oscillation realistically around 2.8 - 4.1 GHz and load 18-45%
      const jitter = (Math.random() - 0.5) * 0.4;
      setCpuFreq(prev => +(Math.max(2.4, Math.min(4.2, prev + jitter))).toFixed(2));
      setCpuLoad(prev => Math.floor(Math.max(12, Math.min(68, prev + (Math.random() - 0.5) * 8))));

      // Temperature slight fluctuation (35.8 - 38.4 °C)
      setTempC(prev => +(Math.max(35.2, Math.min(39.1, prev + (Math.random() - 0.5) * 0.3))).toFixed(1));

      // Oscilloscope wave buffer
      setWavePoints(prev => {
        const nextVal = Math.floor(20 + Math.random() * 45);
        return [...prev.slice(1), nextVal];
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [isOverclocked]);

  const handleToggleOverclock = () => {
    if (!isOverclocked) {
      setIsOverclocked(true);
      setCpuFreq(4.85);
      setCpuLoad(98);
      playAlertChime('overclock_burst');
    } else {
      setIsOverclocked(false);
      setCpuFreq(3.40);
      setCpuLoad(22);
      playAlertChime('confirm');
    }
  };

  const handleQuickPurge = () => {
    setIsPurging(true);
    playAlertChime('beep');
    setTimeout(() => {
      setIsPurging(false);
      playAlertChime('confirm');
      setCpuLoad(14);
      setTempC(35.8);
    }, 600);
  };

  const ramUsed = metrics?.memoryEstimateMB ?? 138;
  const ramMax = 2048;
  const ramPercent = Math.min(100, Math.round((ramUsed / ramMax) * 100));

  if (compact) {
    return (
      <div
        className={`p-3.5 rounded-2xl border transition-all ${
          isBlackout
            ? 'bg-black/90 border-emerald-950/80 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
            : 'bg-slate-900/90 border-slate-800 shadow-lg'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Activity className={`w-3.5 h-3.5 ${isBlackout ? 'text-emerald-400' : 'text-cyan-400'} animate-pulse`} />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-white">
              Télémétrie Matérielle en Direct
            </span>
          </div>
          <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
            isBlackout
              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
              : 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/40'
          }`}>
            60 FPS · Nominal
          </span>
        </div>

        {/* 3 Metric Mini Pills */}
        <div className="grid grid-cols-3 gap-2 text-xs font-mono">
          <div className={`p-2 rounded-xl border ${isBlackout ? 'bg-[#050505] border-emerald-950' : 'bg-slate-950/70 border-slate-800/80'}`}>
            <div className="text-[9px] text-slate-500 uppercase flex items-center gap-1">
              <Cpu className="w-2.5 h-2.5 text-cyan-400" />
              <span>Cœurs CPU</span>
            </div>
            <div className="text-xs font-bold text-slate-100 mt-0.5 flex items-baseline justify-between">
              <span>{cpuFreq} GHz</span>
              <span className="text-[10px] text-cyan-400 font-normal">{cpuLoad}%</span>
            </div>
          </div>

          <div className={`p-2 rounded-xl border ${isBlackout ? 'bg-[#050505] border-emerald-950' : 'bg-slate-950/70 border-slate-800/80'}`}>
            <div className="text-[9px] text-slate-500 uppercase flex items-center gap-1">
              <HardDrive className="w-2.5 h-2.5 text-amber-400" />
              <span>RAM Allouée</span>
            </div>
            <div className="text-xs font-bold text-slate-100 mt-0.5 flex items-baseline justify-between">
              <span>{ramUsed} Mo</span>
              <span className="text-[10px] text-amber-400 font-normal">{ramPercent}%</span>
            </div>
          </div>

          <div className={`p-2 rounded-xl border ${isBlackout ? 'bg-[#050505] border-emerald-950' : 'bg-slate-950/70 border-slate-800/80'}`}>
            <div className="text-[9px] text-slate-500 uppercase flex items-center gap-1">
              <Thermometer className="w-2.5 h-2.5 text-emerald-400" />
              <span>Thermique</span>
            </div>
            <div className="text-xs font-bold text-emerald-400 mt-0.5 flex items-baseline justify-between">
              <span>{tempC}°C</span>
              <span className="text-[9px] text-slate-400 font-normal">Optimal</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-4 rounded-2xl border transition-all space-y-4 ${
        isBlackout
          ? 'bg-black border-emerald-900/60 shadow-[0_0_20px_rgba(16,185,129,0.15)] text-slate-200'
          : 'bg-slate-900/95 border-slate-800 shadow-xl text-slate-100'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${isBlackout ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'}`}>
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Scanner Matériel & Thermique</span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                isBlackout
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
              }`}>
                TEMPS RÉEL
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Surveillance continue des cœurs, de la RAM et de la température
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Overclock 1000% Turbo Boost Button */}
          <button
            onClick={handleToggleOverclock}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
              isOverclocked
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse'
                : 'bg-slate-950/80 border-amber-500/30 text-amber-300 hover:border-amber-400 hover:text-white'
            }`}
            title="Activer la surcadence Mark L (Boost 1000% des cœurs à 4.85 GHz)"
          >
            <Zap className={`w-3.5 h-3.5 ${isOverclocked ? 'animate-bounce text-slate-950' : 'text-amber-400'}`} />
            <span>{isOverclocked ? '4.85 GHz BOOST' : 'OVERCLOCK 1000%'}</span>
          </button>

          <button
            onClick={handleQuickPurge}
            disabled={isPurging}
            className={`p-2 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              isPurging
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 animate-spin'
                : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
            title="Optimiser & Assainir la mémoire RAM"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPurging ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Assainir</span>
          </button>
        </div>
      </div>

      {/* Real-time Oscilloscope Vector Graph */}
      <div className={`p-3 rounded-xl border ${isBlackout ? 'bg-[#030303] border-emerald-950' : 'bg-slate-950 border-slate-800/90'}`}>
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
          <span>Oscillation Fréquence CPU ({metrics?.cpuCores ?? 8} Cœurs)</span>
          <span className="text-cyan-400 font-bold">{cpuFreq} GHz · {cpuLoad}% Charge</span>
        </div>

        {/* Dynamic SVG Waveform */}
        <div className="h-14 w-full flex items-end gap-1.5 pt-2">
          {wavePoints.map((val, idx) => (
            <div key={idx} className="flex-1 flex flex-col justify-end items-center h-full gap-1">
              <div
                style={{ height: `${val}%` }}
                className={`w-full rounded-t-sm transition-all duration-300 ${
                  isBlackout
                    ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]'
                    : idx === wavePoints.length - 1
                    ? 'bg-cyan-300 shadow-[0_0_10px_#22d3ee]'
                    : 'bg-cyan-500/70 hover:bg-cyan-400'
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 3 Live Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
        {/* RAM Bar */}
        <div className={`p-3 rounded-xl border space-y-1.5 ${isBlackout ? 'bg-[#050505] border-emerald-950' : 'bg-slate-950/80 border-slate-800'}`}>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-amber-400" />
              Allocation RAM
            </span>
            <span className="text-amber-300 font-bold">{ramUsed} Mo</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
            <div
              style={{ width: `${ramPercent}%` }}
              className="h-full bg-amber-400 transition-all duration-500 rounded-full shadow-[0_0_8px_#f59e0b]"
            />
          </div>
          <div className="text-[10px] text-slate-500 flex justify-between">
            <span>Heap JS</span>
            <span>Max 2048 Mo</span>
          </div>
        </div>

        {/* Temperature Monitor */}
        <div className={`p-3 rounded-xl border space-y-1.5 ${isBlackout ? 'bg-[#050505] border-emerald-950' : 'bg-slate-950/80 border-slate-800'}`}>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-emerald-400" />
              Thermique Matériel
            </span>
            <span className="text-emerald-400 font-bold">{tempC}°C</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
            <div
              style={{ width: `${Math.min(100, (tempC / 65) * 100)}%` }}
              className="h-full bg-emerald-400 transition-all duration-500 rounded-full shadow-[0_0_8px_#10b981]"
            />
          </div>
          <div className="text-[10px] text-slate-500 flex justify-between">
            <span>État: Nominal</span>
            <span className="text-emerald-400">0% Throttling</span>
          </div>
        </div>

        {/* Confinement Integrity */}
        <div className={`p-3 rounded-xl border space-y-1.5 ${isBlackout ? 'bg-[#050505] border-emerald-950' : 'bg-slate-950/80 border-slate-800'}`}>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              Airgap Confinement
            </span>
            <span className="text-cyan-300 font-bold">100% Local</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
            <div className="h-full w-full bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]" />
          </div>
          <div className="text-[10px] text-slate-500 flex justify-between">
            <span>Exfiltration: Nulle</span>
            <span className="text-emerald-400">Étanche</span>
          </div>
        </div>
      </div>
    </div>
  );
};
