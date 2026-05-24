import { MONTHS } from '../constants';
import { Task } from '../types';
import { Calendar } from 'lucide-react';
import { TRANSLATIONS } from '../translations';

interface MonthSelectorProps {
  selectedMonth: number | 'all';
  onMonthChange: (month: number | 'all') => void;
  tasks: Task[];
  language?: 'ar' | 'en';
}

export default function MonthSelector({ selectedMonth, onMonthChange, tasks, language = 'ar' }: MonthSelectorProps) {
  const t = TRANSLATIONS[language];
  
  // Calculate analytics for each month
  const getMonthStats = (monthVal: number) => {
    const monthTasks = tasks.filter(t => t.month === monthVal);
    const total = monthTasks.length;
    const completed = monthTasks.filter(t => t.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  };

  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const totalPercentage = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-[16px] flex items-center gap-2">
          <Calendar size={18} className="text-emerald-500" />
          <span>{language === 'ar' ? 'جدول الشهور' : 'Months Calendar'}</span>
        </h3>
        
        {/* Quick Clear Filter Button */}
        <button
          onClick={() => onMonthChange('all')}
          className={`px-3 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
            selectedMonth === 'all'
              ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-100'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
          id="btn-filter-all-months"
        >
          {t.allMonths} ({totalTasksCount})
        </button>
      </div>

      {/* Grid of Months */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-2 gap-2.5">
        {MONTHS.map((m) => {
          const stats = getMonthStats(m.value);
          const isSelected = selectedMonth === m.value;
          const localizedMonthName = language === 'ar' ? m.name : t.months_names[m.value - 1];
          
          return (
            <button
              key={m.value}
              onClick={() => onMonthChange(m.value)}
              className={`flex flex-col text-right p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-500 shadow-md shadow-emerald-100'
                  : 'bg-slate-50/50 dark:bg-slate-800/20 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-800 dark:text-slate-200 border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700'
              }`}
              id={`month-btn-${m.value}`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-bold text-sm truncate max-w-[70%]">{localizedMonthName.split(' ')[0]}</span>
                {stats.total > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold font-sans ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/60 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                  }`}>
                    {stats.completed}/{stats.total}
                  </span>
                )}
              </div>

              {stats.total > 0 ? (
                <div className="w-full mt-2">
                  <div className="flex justify-between items-center text-[10px] mb-1">
                    <span className={isSelected ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}>
                      {language === 'ar' ? 'نسبة الإنجاز' : 'Progress'}
                    </span>
                    <span className="font-semibold font-sans">{stats.percentage}%</span>
                  </div>
                  {/* Progress Line */}
                  <div className={`w-full h-1 rounded-full overflow-hidden ${isSelected ? 'bg-white/25' : 'bg-slate-200 dark:bg-slate-800'}`}>
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${isSelected ? 'bg-white' : 'bg-emerald-500'}`}
                      style={{ width: `${stats.percentage}%` }}
                    />
                  </div>
                </div>
              ) : (
                <p className={`text-[10px] mt-2 ${isSelected ? 'text-white/70' : 'text-slate-400 dark:text-slate-500'}`}>
                  {t.noTasks}
                </p>
              )}

              {/* Decorative accent for selected */}
              {isSelected && (
                <span className="absolute -bottom-1 -left-1 w-8 h-8 bg-white opacity-5 rounded-full filter blur-sm group-hover:scale-125 transition-transform" />
              )}
            </button>
          );
        })}
      </div>

      {/* Mini Overview Widget inside month picker */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{language === 'ar' ? 'إجمالي إنجاز العام الحالي:' : 'Total Annual Progress:'}</span>
        <span className="font-bold text-slate-800 dark:text-slate-200 font-sans">{totalPercentage}% {language === 'ar' ? 'مكتمل' : 'Completed'}</span>
      </div>
    </div>
  );
}
