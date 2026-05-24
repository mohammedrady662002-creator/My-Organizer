import { Task } from '../types';
import { CATEGORIES } from '../constants';
import { CheckCircle2, ListTodo, AlertCircle, TrendingUp } from 'lucide-react';
import { TRANSLATIONS } from '../translations';
import { motion } from 'motion/react';

interface StatsCardProps {
  tasks: Task[];
  language?: 'ar' | 'en';
}

export default function StatsCard({ tasks, language = 'ar' }: StatsCardProps) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  const highPriority = tasks.filter(t => t.priority === 'high' && !t.completed).length;
  const t = TRANSLATIONS[language];

  // Percentage complete
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Calculate parameters for SVG radial circle
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Progress per category
  const categoryStats = CATEGORIES.map(cat => {
    const catTasks = tasks.filter(t => t.category === cat.id);
    const catTotal = catTasks.length;
    const catCompleted = catTasks.filter(t => t.completed).length;
    const catPercentage = catTotal > 0 ? Math.round((catCompleted / catTotal) * 100) : 0;
    
    return {
      ...cat,
      total: catTotal,
      completed: catCompleted,
      percentage: catPercentage
    };
  }).filter(c => c.total > 0); // only show categories that have tasks

  const localizedCountDesc = t.completedCountDesc
    .replace('{completed}', String(completed))
    .replace('{total}', String(total));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgb(16 185 129 / 0.05), 0 8px 10px -6px rgb(16 185 129 / 0.05)' }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-5 shadow-sm space-y-5 transition-all duration-300"
    >
      <div className="flex items-center gap-2 pb-1">
        <TrendingUp size={18} className="text-emerald-500 animate-bounce" />
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-[16px]">{t.achievementLevels}</h3>
      </div>

      {/* Main radial wheel and statistics overview */}
      <div className="flex items-center justify-between bg-emerald-50/5 dark:bg-emerald-950/5 p-4 rounded-xl border border-slate-100 dark:border-slate-850 hover:border-emerald-500/30 transition-all duration-300">
        <div className="space-y-1">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium block">{t.realtimeUpdate}</span>
          <div className="flex items-baseline gap-1 font-sans">
            <span className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight" id="progress-percentage-text">{percentage}%</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.completedText}</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            {localizedCountDesc}
          </p>
        </div>

        {/* Dynamic Circular SVG Progress Wheel */}
        <div className="relative flex items-center justify-center w-24 h-24">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Circle */}
            <circle
              className="text-slate-200 dark:text-slate-850"
              strokeWidth="6"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="48"
              cy="48"
            />
            {/* Foreground Fill Circle */}
            <motion.circle
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: strokeDashoffset }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-emerald-500"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="48"
              cy="48"
            />
          </svg>
          {/* Centered Percentage Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center font-sans">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mb-0.5">{language === 'ar' ? 'درجة' : 'Score'}</span>
            <span className="text-[14px] font-extrabold text-slate-705 dark:text-slate-300 leading-none">{percentage}%</span>
          </div>
        </div>
      </div>

      {/* Numerical Metrics Grid */}
      <div className="grid grid-cols-3 gap-2">
        {/* Completed */}
        <motion.div 
          whileHover={{ scale: 1.03, y: -2 }}
          className="bg-emerald-50/20 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30 p-2.5 rounded-xl text-center transition-all cursor-pointer"
        >
          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center mx-auto mb-1 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={14} />
          </div>
          <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold truncate">{t.completedBadge}</span>
          <span className="text-sm font-extrabold text-slate-700 dark:text-slate-200 font-sans">{completed}</span>
        </motion.div>

        {/* Pending */}
        <motion.div 
          whileHover={{ scale: 1.03, y: -2 }}
          className="bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 p-2.5 rounded-xl text-center transition-all cursor-pointer"
        >
          <div className="w-6 h-6 rounded-lg bg-slate-505/10 flex items-center justify-center mx-auto mb-1 text-slate-600 dark:text-slate-400">
            <ListTodo size={14} />
          </div>
          <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold truncate">{t.pendingBadge}</span>
          <span className="text-sm font-extrabold text-slate-700 dark:text-slate-200 font-sans">{pending}</span>
        </motion.div>

        {/* High Priority Warning */}
        <motion.div 
          whileHover={{ scale: 1.03, y: -2 }}
          className="bg-rose-50/20 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/30 p-2.5 rounded-xl text-center transition-all cursor-pointer"
        >
          <div className="w-6 h-6 rounded-lg bg-rose-500/10 flex items-center justify-center mx-auto mb-1 text-rose-600 dark:text-rose-400">
            <AlertCircle size={14} />
          </div>
          <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold truncate">{t.highPriorityBadge}</span>
          <span className={`text-sm font-extrabold font-sans ${highPriority > 0 ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-slate-500 dark:text-slate-400'}`}>
            {highPriority}
          </span>
        </motion.div>
      </div>

      {/* Category Progress Breakdowns */}
      {categoryStats.length > 0 && (
        <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.aspectsProgress}</h4>
          <div className="space-y-2">
            {categoryStats.map(cat => {
              // Get category progress bar colors
              let barColor = 'bg-slate-500';
              switch (cat.color) {
                case 'emerald': barColor = 'bg-emerald-500'; break;
                case 'blue': barColor = 'bg-blue-500'; break;
                case 'purple': barColor = 'bg-purple-500'; break;
                case 'rose': barColor = 'bg-rose-500'; break;
                case 'amber': barColor = 'bg-amber-500'; break;
                case 'indigo': barColor = 'bg-indigo-500'; break;
              }

              const localizedCatName = (t.cats_names as any)[cat.id] || cat.name;

              return (
                <div key={cat.id} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    <span>{localizedCatName}</span>
                    <span className="font-sans">{cat.completed} {language === 'ar' ? 'من' : 'of'} {cat.total} ({cat.percentage}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.percentage}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className={`h-full rounded-full ${barColor}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
