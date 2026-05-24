import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Coffee, 
  Flame, 
  Sparkles, 
  Timer, 
  Volume2, 
  VolumeX, 
  ListTodo,
  CheckCircle2
} from 'lucide-react';

interface FocusLog {
  id: string;
  duration: number; // minutes
  type: 'work' | 'short' | 'long';
  timestamp: string;
}

interface PomodoroTimerProps {
  language: 'ar' | 'en';
}

export default function PomodoroTimer({ language }: PomodoroTimerProps) {
  const [sessionType, setSessionType] = useState<'work' | 'short' | 'long'>('work');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [focusLogs, setFocusLogs] = useState<FocusLog[]>([]);

  // Config presets in seconds
  const PRESETS = {
    work: 25 * 60,
    short: 5 * 60,
    long: 15 * 60
  };

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const totalSeconds = PRESETS[sessionType];

  useEffect(() => {
    // Load local logs
    const savedLogs = localStorage.getItem('focus_session_logs');
    if (savedLogs) {
      try { setFocusLogs(JSON.parse(savedLogs)); } catch (e) { }
    }
  }, []);

  const saveLogs = (newLogs: FocusLog[]) => {
    setFocusLogs(newLogs);
    localStorage.setItem('focus_session_logs', JSON.stringify(newLogs));
  };

  // Synther sound helper - generates gorgeous clean bleeps
  const triggerTone = (type: 'tick' | 'complete' | 'start') => {
    if (!soundEnabled) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      const ctx = new AudioCtxClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'tick') {
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.005, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
      } else if (type === 'start') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(330, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
      } else if (type === 'complete') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.24); // G5
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.55);
      }
    } catch (e) {
      // safe fallback
    }
  };

  // Timer run loop
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          // Tick accent
          if (prev % 60 === 0 || prev <= 5) {
            triggerTone('tick');
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, sessionType]);

  const handleStartPause = () => {
    if (!isRunning) {
      triggerTone('start');
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(PRESETS[sessionType]);
  };

  const handleSwitchPreset = (type: 'work' | 'short' | 'long') => {
    setIsRunning(false);
    setSessionType(type);
    setSecondsLeft(PRESETS[type]);
  };

  const handleComplete = () => {
    setIsRunning(false);
    triggerTone('complete');

    // log session history
    const newLog: FocusLog = {
      id: 'log-' + Date.now(),
      duration: Math.round(PRESETS[sessionType] / 60),
      type: sessionType,
      timestamp: new Date().toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    };

    saveLogs([newLog, ...focusLogs]);
    setSecondsLeft(PRESETS[sessionType]);
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const clearFocusLogs = () => {
    saveLogs([]);
  };

  // Progress metrics for circular indicator SVG
  const progressPercent = ((totalSeconds - secondsLeft) / totalSeconds) * 100;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // Stats calculation
  const totalFocusMinutes = focusLogs
    .filter(log => log.type === 'work')
    .reduce((acc, log) => acc + log.duration, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Visual Timer Display Panel */}
      <div className="lg:col-span-8 bg-[#1E293B]/60 backdrop-blur-md rounded-3xl border border-white/5 p-8 flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* Soft atmospheric gradient behind timer */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl transition-colors duration-500 -z-10 ${
          sessionType === 'work' ? 'bg-indigo-500/15' : 'bg-emerald-500/10'
        }`} />

        {/* Focus Header Option list */}
        <div className="flex bg-[#0F172A] p-1.5 rounded-2xl border border-white/5 gap-1 mb-8 self-center">
          {[
            { id: 'work', labelAr: 'التركيز العملي', labelEn: 'Deep Work', colorClass: 'text-[#6366F1]' },
            { id: 'short', labelAr: 'استراحة قصيرة', labelEn: 'Short Break', colorClass: 'text-emerald-400' },
            { id: 'long', labelAr: 'استراحة طويلة', labelEn: 'Long Break', colorClass: 'text-cyan-400' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => handleSwitchPreset(opt.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                sessionType === opt.id 
                  ? 'bg-[#1E293B] text-white border border-white/5 shadow-md'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              {language === 'ar' ? opt.labelAr : opt.labelEn}
            </button>
          ))}
        </div>

        {/* Visual progress SVG loop */}
        <div className="relative w-60 h-60 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            {/* Background track circle */}
            <circle
              cx="120"
              cy="120"
              r={radius}
              className="stroke-[#0F172A] fill-transparent stroke-[8]"
            />
            {/* Active glowing color ring */}
            <motion.circle
              cx="120"
              cy="120"
              r={radius}
              className={`fill-transparent stroke-[8] ${
                sessionType === 'work' ? 'stroke-[#6366F1]' : 'stroke-emerald-400'
              }`}
              strokeDasharray={circumference}
              animate={{ strokeDashoffset }}
              transition={{ ease: "easeInOut", duration: 0.5 }}
              strokeLinecap="round"
            />
          </svg>

          {/* Time digits & Status in centering */}
          <div className="absolute text-center flex flex-col items-center select-none">
            <span className="text-3xl font-mono font-black text-white tracking-widest">
              {formatTime(secondsLeft)}
            </span>
            <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest mt-1">
              {sessionType === 'work' 
                ? (language === 'ar' ? 'وقت التركيز' : 'STAY FOCUS')
                : (language === 'ar' ? 'وقت الراحة' : 'REST TIME')}
            </span>
            
            {/* Sound Mute Trigger */}
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="mt-4 p-1.5 rounded-lg text-[#475569] hover:text-white transition-colors cursor-pointer"
            >
              {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={handleReset}
            className="p-3.5 rounded-2xl bg-[#0F172A] hover:bg-[#1E293B] border border-white/5 text-[#94A3B8] hover:text-white transition-all cursor-pointer"
            title={language === 'ar' ? 'إعادة تعيين المؤقت' : 'Reset focus counter'}
          >
            <RotateCcw size={18} />
          </button>

          <button
            onClick={handleStartPause}
            className={`px-8 py-4 rounded-2xl font-bold text-xs flex items-center gap-2 transform active:scale-95 transition-all shadow-lg cursor-pointer ${
              isRunning
                ? 'bg-[#1E293B] text-white border border-white/10 hover:bg-white/5'
                : sessionType === 'work'
                  ? 'bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white shadow-indigo-500/20'
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-500/20'
            }`}
          >
            {isRunning ? (
              <>
                <Pause size={14} fill="currentColor" />
                <span>{language === 'ar' ? 'إيقاف مؤقت' : 'Pause Focus'}</span>
              </>
            ) : (
              <>
                <Play size={14} fill="currentColor" />
                <span>{language === 'ar' ? 'بدء التركيز' : 'Start Focus'}</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Habits Focus statistics & Sessions history log */}
      <div className="lg:col-span-4 bg-[#1E293B] rounded-3xl border border-white/5 p-6 flex flex-col justify-between">
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Timer size={16} className="text-[#6366F1]" />
              <span>{language === 'ar' ? 'سجل جلسات التركيز' : 'Focus Session Log'}</span>
            </h3>
            {focusLogs.length > 0 && (
              <button 
                onClick={clearFocusLogs}
                className="text-[10px] text-red-400 hover:underline cursor-pointer"
              >
                {language === 'ar' ? 'مسح السجل' : 'Clear logs'}
              </button>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-[#0F172A] border border-white/5 grid grid-cols-2 gap-4">
            <div>
              <span className="block text-[10px] font-medium text-[#94A3B8]">{language === 'ar' ? 'دقائق العمل الإجمالية' : 'Deep focus mins'}</span>
              <span className="text-lg font-mono font-black text-white">{totalFocusMinutes} {language === 'ar' ? 'دقيقة' : 'm'}</span>
            </div>
            <div>
              <span className="block text-[10px] font-medium text-[#94A3B8]">{language === 'ar' ? 'جلسات العمل' : 'Sessions Done'}</span>
              <span className="text-lg font-mono font-black text-emerald-400">
                {focusLogs.filter(l => l.type === 'work').length}
              </span>
            </div>
          </div>

          {/* Sessions entries feed */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {focusLogs.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#475569] flex flex-col items-center justify-center gap-2">
                <CheckCircle2 size={24} className="text-[#1E293B]" />
                <p>{language === 'ar' ? 'لم تكتمل أي جلسة بعد' : 'Log completed sessions here'}</p>
              </div>
            ) : (
              focusLogs.map((log) => (
                <div key={log.id} className="p-3 bg-[#0F172A]/40 rounded-xl border border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      log.type === 'work' ? 'bg-[#6366F1]' : 'bg-emerald-400'
                    }`} />
                    <span className="font-semibold text-white">
                      {log.type === 'work' 
                        ? (language === 'ar' ? 'جلسة تركيز عميق' : 'Focus Session')
                        : (language === 'ar' ? 'استراحة مستحقة' : 'Break Session')}
                    </span>
                    <span className="text-[#475569] font-mono">({log.duration}m)</span>
                  </div>
                  <span className="text-[10px] text-[#94A3B8] font-mono">{log.timestamp}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ambient tips container */}
        <div className="mt-6 pt-6 border-t border-white/5">
          <div className="p-3.5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex gap-3 text-[11px] leading-relaxed text-[#94A3B8]">
            <Coffee className="text-[#6366F1] shrink-0" size={16} />
            <p className="font-sans">
              {language === 'ar'
                ? 'تقنية الطماطم (بومودورو) تمنع التعب الفكري من خلال فترات مدروسة من العمل التنافسي المتبادل بنفحات استرخاء مدمجة.'
                : 'Focus on singular high priority objectives during work bursts. Mute background chatter and reload mental batteries during breaks.'}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
