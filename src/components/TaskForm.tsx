import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  Save, 
  X, 
  Calendar, 
  Type, 
  FileText, 
  Tag, 
  AlertTriangle,
  Briefcase,
  BookOpen,
  User,
  Heart,
  Home,
  ShoppingCart,
  HelpCircle,
  Loader2
} from 'lucide-react';
import { Task, Category } from '../types';
import { MONTHS, CATEGORIES } from '../constants';
import { TRANSLATIONS } from '../translations';

interface TaskFormProps {
  onSubmit: (taskData: Omit<Task, 'id' | 'completed' | 'createdAt'>) => Promise<void> | void;
  editingTask: Task | null;
  onCancelEdit: () => void;
  defaultMonth?: number;
  defaultDay?: number;
  language?: 'ar' | 'en';
}

// Category Icon Helper inside TaskForm
function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const props = { className, size: 15 };
  switch (name) {
    case 'Briefcase': return <Briefcase {...props} />;
    case 'BookOpen': return <BookOpen {...props} />;
    case 'User': return <User {...props} />;
    case 'Heart': return <Heart {...props} />;
    case 'Home': return <Home {...props} />;
    case 'ShoppingCart': return <ShoppingCart {...props} />;
    default: return <HelpCircle {...props} />;
  }
}

export default function TaskForm({ onSubmit, editingTask, onCancelEdit, defaultMonth = new Date().getMonth() + 1, defaultDay = new Date().getDate(), language = 'ar' }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [month, setMonth] = useState<number>(defaultMonth);
  const [day, setDay] = useState<number>(defaultDay);
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [category, setCategory] = useState<string>('personal');
  const [time, setTime] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // validation error
  const [error, setError] = useState('');
  const t = TRANSLATIONS[language];

  // Update states if we are editing a task
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setMonth(editingTask.month);
      setDay(editingTask.day);
      setPriority(editingTask.priority);
      setCategory(editingTask.category);
      setTime(editingTask.time || '');
    } else {
      resetForm();
    }
  }, [editingTask]);

  // Adjust day value if month changes and day exceeds the month's maximum days
  useEffect(() => {
    const selectedMonthInfo = MONTHS.find(m => m.value === month);
    if (selectedMonthInfo && day > selectedMonthInfo.days) {
      setDay(selectedMonthInfo.days);
    }
  }, [month]);

  // Handle form reset
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setMonth(editingTask ? editingTask.month : defaultMonth);
    setDay(editingTask ? editingTask.day : defaultDay);
    setPriority('medium');
    setCategory('personal');
    setTime('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError(t.requiredTitle);
      return;
    }

    // Validate day constraints for the selected month
    const selectedMonthInfo = MONTHS.find(m => m.value === month);
    const maxDays = selectedMonthInfo ? selectedMonthInfo.days : 31;
    if (day < 1 || day > maxDays) {
      setError(t.daysConstraint.replace('{max}', String(maxDays)));
      return;
    }

    setIsSaving(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        day,
        month,
        year: new Date().getFullYear(), // Default calendar year
        priority,
        category,
        time: time || undefined
      });
      if (!editingTask) {
        resetForm();
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to get total days of currently selected month
  const currentMonthMaxDays = MONTHS.find(m => m.value === month)?.days || 31;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      className="bg-[#F1F5F9] dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-5 shadow-sm transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-[16px] flex items-center gap-2">
          {editingTask ? (
            <>
              <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 4, repeatDelay: 1 }}>
                <Save size={18} className="text-violet-500" />
              </motion.div>
              <span>{t.editTask}</span>
            </>
          ) : (
            <>
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 3 }}>
                <Plus size={20} className="text-emerald-500" />
              </motion.div>
              <span>{t.addNewTask}</span>
            </>
          )}
        </h3>

        {editingTask && (
          <motion.button
            whileHover={{ scale: 1.15, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onCancelEdit}
            className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            id="cancel-edit-btn"
          >
            <X size={16} />
          </motion.button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" id="task-submission-form">
        {/* Error notification */}
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 text-xs rounded-xl border border-rose-100/50 dark:border-rose-900/30 flex items-center gap-2">
            <AlertTriangle size={14} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Title input */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block flex items-center gap-1.5">
            <Type size={13} className="text-slate-400 dark:text-slate-500" />
            <span>{t.taskTitle}</span> <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.taskTitlePlaceholder}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
            id="task-title-input"
          />
        </div>

        {/* Description input */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block flex items-center gap-1.5">
            <FileText size={13} className="text-slate-400 dark:text-slate-500" />
            <span>{t.descriptionLabel}</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.descriptionPlaceholder}
            rows={2}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all leading-normal"
            id="task-description-input"
          />
        </div>

        {/* Day, Month, and Time parameters arranged next to each other */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="space-y-1">
            <label className="text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 block flex items-center gap-1">
              <Calendar size={12} className="text-slate-400 dark:text-slate-500" />
              <span>{t.monthLabel}</span>
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full px-2 sm:px-3 py-2 bg-slate-50 dark:bg-slate-800/45 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium cursor-pointer"
              id="task-month-select"
            >
              {MONTHS.map(m => {
                const localizedMonthName = language === 'ar' ? m.name : t.months_names[m.value - 1];
                return (
                  <option key={m.value} value={m.value} className="dark:bg-slate-900">{localizedMonthName}</option>
                );
              })}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 block flex items-center gap-1">
              <Calendar size={12} className="text-slate-400 dark:text-slate-500" />
              <span>{t.dayFieldLabel}</span>
            </label>
            <input
              type="number"
              min={1}
              max={currentMonthMaxDays}
              value={day}
              onChange={(e) => setDay(Math.min(currentMonthMaxDays, Math.max(1, Number(e.target.value) || 1)))}
              className="w-full px-2 sm:px-3 py-2 bg-slate-50 dark:bg-slate-800/45 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
              id="task-day-input"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 block flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 dark:text-slate-500"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>{t.timeLabel}</span>
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800/45 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium cursor-pointer"
              id="task-time-input"
            />
          </div>
        </div>

        {/* Priority Level Buttons */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block flex items-center gap-1.5">
            <AlertTriangle size={13} className="text-slate-400 dark:text-slate-500" />
            <span>{t.priorityLabel}</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['low', 'medium', 'high'] as const).map((p) => {
              const label = p === 'high' ? t.priority_high : p === 'medium' ? t.priority_medium : t.priority_low;
              const isSelected = priority === p;
              
              let colors = '';
              if (isSelected) {
                colors = p === 'high' 
                  ? 'bg-rose-500 text-white border-rose-500 shadow-sm' 
                  : p === 'medium'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                    : 'bg-slate-700 dark:bg-slate-600 text-white border-slate-700 dark:border-slate-600 shadow-sm';
              } else {
                colors = 'bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200';
              }

              return (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-2 px-3 border rounded-xl text-xs font-semibold transition-all cursor-pointer ${colors}`}
                  id={`priority-toggle-${p}`}
                >
                  {label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Category Choice cards */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block flex items-center gap-1.5">
            <Tag size={13} className="text-slate-400 dark:text-slate-500" />
            <span>{t.categoryLabel}</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat.id;
              
              // dynamic active color selection safely defined
              let activeColor = '';
              if (isSelected) {
                switch (cat.color) {
                  case 'emerald': activeColor = 'bg-emerald-500 text-white border-emerald-500 shadow-emerald-50'; break;
                  case 'blue': activeColor = 'bg-blue-500 text-white border-blue-500 shadow-blue-50'; break;
                  case 'purple': activeColor = 'bg-purple-500 text-white border-purple-500 shadow-purple-50'; break;
                  case 'rose': activeColor = 'bg-rose-500 text-white border-rose-500 shadow-rose-50'; break;
                  case 'amber': activeColor = 'bg-amber-500 text-white border-amber-500 shadow-amber-50'; break;
                  case 'indigo': activeColor = 'bg-indigo-500 text-white border-indigo-505 shadow-indigo-50'; break;
                  default: activeColor = 'bg-slate-600 text-white border-slate-600';
                }
              }

              const localizedCatName = (t.cats_names as any)[cat.id] || cat.name;

              return (
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex flex-col items-center gap-1 p-2 border rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                    isSelected 
                      ? `${activeColor} border-2 scale-102` 
                      : 'bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100'
                  }`}
                  id={`category-choice-${cat.id}`}
                >
                  <CategoryIcon name={cat.icon} className={isSelected ? 'text-white' : 'text-slate-400 dark:text-slate-500'} />
                  <span className="truncate max-w-full">{localizedCatName}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Form buttons */}
        <div className="pt-2 flex gap-2">
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.25)' }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={isSaving}
            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            id="task-form-submit-btn"
          >
            {isSaving ? (
               <>
                 <Loader2 size={16} className="animate-spin" />
                 <span className="text-xs">{language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}</span>
               </>
            ) : editingTask ? (
              <>
                <Save size={16} />
                <span>{t.saveChange}</span>
              </>
            ) : (
              <>
                <Plus size={16} />
                <span>{t.addNewTask}</span>
              </>
            )}
          </motion.button>
          
          {editingTask ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={onCancelEdit}
              className="px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
              id="task-form-cancel-btn"
            >
              {t.cancel}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={resetForm}
              className="px-4 bg-slate-50 dark:bg-slate-800/45 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              id="task-form-reset-btn"
            >
              {language === 'ar' ? 'مسح بالكامل' : 'Clear Form'}
            </motion.button>
          )}
        </div>
      </form>
    </motion.div>
  );
}
