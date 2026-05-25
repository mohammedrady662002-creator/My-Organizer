import React, { useMemo, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Calendar } from 'lucide-react';
import { TRANSLATIONS } from '../translations';
import { Task } from '../types';

interface DaySelectorProps {
  selectedMonth: number;
  selectedDay: number | 'all';
  onDayChange: (day: number | 'all') => void;
  tasks: Task[];
  language?: 'ar' | 'en';
}

export default function DaySelector({ selectedMonth, selectedDay, onDayChange, tasks, language = 'ar' }: DaySelectorProps) {
  const t = TRANSLATIONS[language];
  
  const daysInMonth = useMemo(() => {
    return new Date(2026, selectedMonth, 0).getDate();
  }, [selectedMonth]);
  
  const dayStatsMap = useMemo(() => {
    const stats: { [key: number]: { total: number; completed: number; percentage: number } } = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const dayTasks = tasks.filter(t => t.month === selectedMonth && t.day === d);
      const total = dayTasks.length;
      const completed = dayTasks.filter(t => t.completed).length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      stats[d] = { total, completed, percentage };
    }
    return stats;
  }, [tasks, selectedMonth, daysInMonth]);

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to selected day
  useEffect(() => {
    if (selectedDay !== 'all' && scrollContainerRef.current) {
      const selectedEl = scrollContainerRef.current.querySelector(`[data-day="${selectedDay}"]`);
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedDay, selectedMonth]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
      className="bg-[#F5F5F4] dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-5 shadow-sm transition-all duration-300 mt-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-[16px] flex items-center gap-2">
          <Calendar size={18} className="text-blue-500" />
          <span>{language === 'ar' ? 'أيام الشهر' : 'Month Days'}</span>
        </h3>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onDayChange('all')}
          className={`px-3 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
            selectedDay === 'all'
              ? 'bg-blue-500 text-white shadow-sm shadow-blue-400/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          {language === 'ar' ? 'كل الأيام' : 'All Days'}
        </motion.button>
      </div>

      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {daysArray.map((d) => {
          const stats = dayStatsMap[d];
          const isSelected = selectedDay === d;
          
          return (
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              key={d}
              data-day={d}
              onClick={() => onDayChange(d)}
              className={`flex-shrink-0 flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer min-w-[70px] snap-center relative overflow-hidden group ${
                isSelected
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-blue-500 shadow-md shadow-blue-400/20'
                  : 'bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 border-slate-100 dark:border-slate-800/60 hover:border-blue-500/20 dark:hover:border-blue-500/20'
              }`}
            >
              <span className={`text-xl font-bold font-sans ${isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                {d}
              </span>
              
              <div className="w-full mt-2 h-1 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700/50">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${isSelected ? 'bg-[#F5F5F4]' : 'bg-blue-500'}`}
                  style={{ width: `${stats.percentage}%` }}
                />
              </div>

              {stats.total > 0 && (
                <span className={`mt-1.5 text-[9px] font-bold font-sans px-1.5 py-0.5 rounded-md ${
                  isSelected ? 'bg-[#F5F5F4]/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {stats.completed}/{stats.total}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
