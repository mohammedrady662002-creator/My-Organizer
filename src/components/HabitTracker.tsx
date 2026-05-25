import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  Check, 
  Plus, 
  Trash2, 
  Sparkles, 
  Award, 
  Heart, 
  BookOpen, 
  Code, 
  Droplet, 
  Grid 
} from 'lucide-react';

interface Habit {
  id: string;
  name: string;
  category: 'health' | 'study' | 'work' | 'personal';
  streak: number;
  history: Record<string, boolean>; // date string "YYYY-MM-DD" -> true/false
  createdAt: string;
}

interface HabitTrackerProps {
  userId: string;
  language: 'ar' | 'en';
}

export default function HabitTracker({ userId, language }: HabitTrackerProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState<'health' | 'study' | 'work' | 'personal'>('health');
  
  // Load habits from localStorage on mount/userId change
  useEffect(() => {
    const cached = localStorage.getItem(`habits_${userId}`);
    if (cached) {
      try {
        setHabits(JSON.parse(cached));
      } catch (e) {
        console.error("Failed to load habits", e);
      }
    } else {
      // Seed default habits
      const defaultHabits: Habit[] = [
        {
          id: 'h1',
          name: language === 'ar' ? 'شرب 3 لتر ماء 💧' : 'Drink 3L Water 💧',
          category: 'health',
          streak: 3,
          history: {
            [getDaysAgoDate(2)]: true,
            [getDaysAgoDate(1)]: true,
            [getDaysAgoDate(0)]: true,
          },
          createdAt: new Date().toISOString()
        },
        {
          id: 'h2',
          name: language === 'ar' ? 'القراءة اليومية 📖' : 'Daily Reading 📖',
          category: 'study',
          streak: 1,
          history: {
            [getDaysAgoDate(1)]: true,
            [getDaysAgoDate(0)]: false,
          },
          createdAt: new Date().toISOString()
        },
        {
          id: 'h3',
          name: language === 'ar' ? 'ممارسة الرياضة 🏋️‍♂️' : 'Gym & Workouts 🏋️‍♂️',
          category: 'health',
          streak: 5,
          history: {
            [getDaysAgoDate(4)]: true,
            [getDaysAgoDate(3)]: true,
            [getDaysAgoDate(2)]: true,
            [getDaysAgoDate(1)]: true,
            [getDaysAgoDate(0)]: true,
          },
          createdAt: new Date().toISOString()
        },
        {
          id: 'h4',
          name: language === 'ar' ? 'تطوير البرمجيات وكتابة الكود 💻' : 'Coding & Projects 💻',
          category: 'work',
          streak: 2,
          history: {
            [getDaysAgoDate(1)]: true,
            [getDaysAgoDate(0)]: true,
          },
          createdAt: new Date().toISOString()
        }
      ];
      setHabits(defaultHabits);
      localStorage.setItem(`habits_${userId}`, JSON.stringify(defaultHabits));
    }
  }, [userId]);

  function getDaysAgoDate(daysAgo: number): string {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  }

  // Save changes helper
  const saveHabits = (updated: Habit[]) => {
    setHabits(updated);
    localStorage.setItem(`habits_${userId}`, JSON.stringify(updated));
  };

  // Helper: Get dates list for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    const dayNameAr = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'][d.getDay()];
    const dayNameEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
    return {
      dateStr: d.toISOString().split('T')[0],
      dayName: language === 'ar' ? dayNameAr : dayNameEn,
      dayNum: d.getDate(),
      isToday: idx === 6
    };
  });

  const handleToggleHabitDay = (habitId: string, dateStr: string) => {
    const updated = habits.map(habit => {
      if (habit.id === habitId) {
        const historyCopy = { ...habit.history };
        const currentlyChecked = !!historyCopy[dateStr];
        historyCopy[dateStr] = !currentlyChecked;

        // Calculate Streak: count consecutive true values starting from today moving backwards
        let streak = 0;
        let checkDate = new Date();
        while (true) {
          const ds = checkDate.toISOString().split('T')[0];
          if (historyCopy[ds]) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            // Check if user missed today, but completed yesterday (to keep the streak active)
            const isCheckToday = ds === new Date().toISOString().split('T')[0];
            if (isCheckToday) {
              // check yesterday
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              const dsYest = yesterday.toISOString().split('T')[0];
              if (historyCopy[dsYest]) {
                streak = 1; // keep streak active as 1
                // Count remaining consecutive days from yesterday
                let subCheck = yesterday;
                while (true) {
                  subCheck.setDate(subCheck.getDate() - 1);
                  const dsSub = subCheck.toISOString().split('T')[0];
                  if (historyCopy[dsSub]) {
                    streak++;
                  } else {
                    break;
                  }
                }
              }
            }
            break;
          }
        }

        return {
          ...habit,
          history: historyCopy,
          streak: streak
        };
      }
      return habit;
    });

    saveHabits(updated);
  };

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const newHabit: Habit = {
      id: 'habit-' + Date.now(),
      name: newHabitName.trim(),
      category: newHabitCategory,
      streak: 0,
      history: {},
      createdAt: new Date().toISOString()
    };

    const updated = [...habits, newHabit];
    saveHabits(updated);
    setNewHabitName('');
  };

  const handleDeleteHabit = (habitId: string) => {
    const updated = habits.filter(h => h.id !== habitId);
    saveHabits(updated);
  };

  // Compute stats
  const totalHabits = habits.length;
  const completedToday = habits.filter(h => h.history[getDaysAgoDate(0)]).length;
  const complRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Habits Header Bento Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Welcome and stats panel */}
        <div className="md:col-span-8 bg-[#F1F5F9] dark:bg-[#1E293B]/60 border border-slate-200/60 dark:border-white/5 p-6 flex flex-col justify-between rounded-3xl shadow-sm dark:shadow-none">
          <div>
            <div className="flex items-center gap-2 text-[#6366F1] font-bold text-xs uppercase tracking-wider mb-2">
              <Flame size={14} className="text-[#6366F1]" />
              <span>{language === 'ar' ? 'العادات وبناء الروتين' : 'HAIBTS & ROUTINES'}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white leading-tight">
              {language === 'ar' ? 'متابع العادات وبناء الروتين الممتاز' : 'Premium Habit & Micro-Routine Builder'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-2 font-sans md:max-w-xl leading-relaxed">
              {language === 'ar' 
                ? 'تكرار الأفعال الصغيرة يبني شخصيتك الحقيقية. تابع عاداتك بانتظام لتكسب خطوط التزام أطول (Streaks) مع الحفاظ على وتيرتك اليومية.'
                : 'Consistency compounds daily. Log, view daily streaks, and stay disciplined with your health, focus, shopping, and workout goals.'}
            </p>
          </div>

          <div className="flex gap-6 mt-6 pt-6 border-t border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-500/20 text-[#6366F1] font-black text-lg">
                {totalHabits}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white">{language === 'ar' ? 'العادات الكلية' : 'Total Habits'}</h4>
                <p className="text-[10px] text-slate-400 dark:text-[#94A3B8]">{language === 'ar' ? 'المفعلة حالياً' : 'Active tracks'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/25 text-emerald-500 dark:text-emerald-400 font-black text-lg">
                {complRate}%
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white">{language === 'ar' ? 'معدل إنجاز اليوم' : 'Completed Today'}</h4>
                <p className="text-[10px] text-slate-400 dark:text-[#94A3B8]">
                  {language === 'ar' ? `${completedToday} من ${totalHabits} عادات` : `${completedToday} of ${totalHabits} accomplished`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Habit Bento Card */}
        <div className="md:col-span-4 bg-[#F1F5F9] dark:bg-[#1E293B] border border-slate-200/60 dark:border-white/5 p-6 flex flex-col justify-between rounded-3xl shadow-sm dark:shadow-none">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Plus size={16} className="text-[#6366F1]" />
            <span>{language === 'ar' ? 'عاطفة مخصصة جديدة' : 'Add Custom Habit'}</span>
          </h3>
          <form onSubmit={handleAddHabit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-[#94A3B8] uppercase mb-1.5">{language === 'ar' ? 'اسم العادة والرمز' : 'Habit Name & Emoji'}</label>
              <input
                type="text"
                placeholder={language === 'ar' ? 'مثال: التأمل 🧘‍♂️' : 'e.g., Meditation 🧘‍♂️'}
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#6366F1] font-sans"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-[#94A3B8] uppercase mb-1.5">{language === 'ar' ? 'التصنيف' : 'Category'}</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'health', labelAr: 'الصحة', labelEn: 'Health' },
                  { id: 'study', labelAr: 'التعليم', labelEn: 'Study' },
                  { id: 'work', labelAr: 'العمل', labelEn: 'Work' },
                  { id: 'personal', labelAr: 'شخصي', labelEn: 'Personal' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setNewHabitCategory(cat.id as any)}
                    className={`px-3 py-2 text-[11px] rounded-xl font-bold border transition-colors cursor-pointer ${
                      newHabitCategory === cat.id
                        ? 'bg-indigo-500/10 border-[#6366F1] text-[#6366F1]'
                        : 'bg-slate-50 border-slate-200 dark:bg-[#0F172A] dark:border-white/5 text-slate-500 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#F1F5F9]/5'
                    }`}
                  >
                    {language === 'ar' ? cat.labelAr : cat.labelEn}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:opacity-90 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md shadow-indigo-500/20 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check size={14} />
              <span>{language === 'ar' ? 'إضافة إلى روتيني' : 'Anchor to My Routine'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Habits List Panel */}
      <div className="bg-[#F1F5F9] dark:bg-[#1E293B]/30 rounded-3xl border border-slate-200/60 dark:border-white/5 overflow-hidden shadow-sm dark:shadow-none">
        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 dark:bg-[#1E293B]/40">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Check className="text-emerald-500 shrink-0" size={18} />
              <span>{language === 'ar' ? 'العادات الأسبوعية الفعالة' : 'Core Weekly Tracks'}</span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-sans mt-1">
              {language === 'ar' ? 'اضغط على الدائرة للموازنة وتحديث الحالة لكل يوم من الأيام الـ 7 الأخيرة.' : 'Click to log your micro-achievements across the last 7 calendar days.'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">{language === 'ar' ? 'تحديث متزامن في الوقت الفعلي' : 'Real-time client active'}</span>
          </div>
        </div>

        {habits.length === 0 ? (
          <div className="p-12 text-center text-slate-400 dark:text-[#94A3B8] flex flex-col items-center justify-center gap-3">
            <Grid className="text-slate-300 dark:text-[#334155]" size={40} />
            <p className="text-xs">{language === 'ar' ? 'لا توجد عادات مسجلة بعد. أنشئ عاداتك بالبطاقة الجانبية!' : 'No habits tracked. Create your first customized habits with the sidebar card.'}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {habits.map((habit) => (
              <div key={habit.id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-slate-50 dark:hover:bg-[#F1F5F9]/5 transition-colors">
                
                {/* Habit details and streak */}
                <div className="flex items-start gap-4 lg:w-1/3">
                  <div className={`mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    habit.category === 'health' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                    habit.category === 'study' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                    habit.category === 'work' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                    'bg-purple-500/10 border-purple-500/20 text-purple-500'
                  }`}>
                    {habit.category === 'health' ? <Heart size={16} /> :
                     habit.category === 'study' ? <BookOpen size={16} /> :
                     habit.category === 'work' ? <Code size={16} /> :
                     <Grid size={16} />}
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white truncate leading-snug">{habit.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] text-slate-500 dark:text-[#94A3B8] font-sans font-bold capitalize">
                        {language === 'ar' 
                          ? (habit.category === 'health' ? 'صحة ولياقة' : habit.category === 'study' ? 'دراسة وفكر' : habit.category === 'work' ? 'عمل وإنتاج' : 'تطوير شخصي')
                          : habit.category}
                      </span>
                      <span className="text-slate-300 dark:text-[#334155]">•</span>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        <Flame size={12} className="fill-amber-500/20" />
                        <span className="text-xs font-mono font-black">{habit.streak} {language === 'ar' ? 'أيام التزام' : 'streak'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 7 Days tracker buttons */}
                <div className="flex-1 flex justify-between items-center gap-2 max-w-lg lg:w-1/2">
                  {last7Days.map((day) => {
                    const isCompleted = !!habit.history[day.dateStr];
                    return (
                      <button
                        key={day.dateStr}
                        onClick={() => handleToggleHabitDay(habit.id, day.dateStr)}
                        className="flex flex-col items-center gap-1.5 flex-1 p-2 rounded-xl transition-all relative group cursor-pointer"
                      >
                        <span className={`text-[10px] font-bold ${day.isToday ? 'text-[#6366F1]' : 'text-slate-500 dark:text-[#94A3B8]'} transition-colors group-hover:text-slate-800 dark:group-hover:text-white`}>
                          {day.dayName}
                        </span>
                        
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                          isCompleted 
                            ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 border-transparent text-white dark:text-slate-900 shadow-md shadow-emerald-500/20 scale-105'
                            : day.isToday 
                              ? 'bg-indigo-505/5 hover:bg-indigo-550/10 border-indigo-500/30 text-indigo-600 dark:text-[#94A3B8]' 
                              : 'bg-slate-50 hover:bg-slate-100 dark:bg-[#0F172A] dark:hover:bg-[#1E293B] border-slate-200 dark:border-white/5 text-slate-500 dark:text-[#94A3B8]'
                        }`}>
                          {isCompleted ? (
                            <Check className="stroke-[3px]" size={15} />
                          ) : (
                            <span className="text-[11px] font-mono font-bold">{day.dayNum}</span>
                          )}
                        </div>

                        {day.isToday && (
                          <div className="w-1 h-1 rounded-full bg-[#6366F1] absolute -bottom-1" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Action panel */}
                <div className="shrink-0 flex items-center justify-end lg:w-16">
                  <button
                    onClick={() => handleDeleteHabit(habit.id)}
                    className="p-2 rounded-xl hover:bg-red-500/10 text-slate-400 dark:text-[#475569] hover:text-red-500 dark:hover:text-red-400 border border-transparent hover:border-red-500/5 transition-all cursor-pointer group"
                    title={language === 'ar' ? 'حذف العادة' : 'Remove Habit Track'}
                  >
                    <Trash2 size={14} className="transition-transform group-hover:scale-110" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Motivational Advice Widget */}
      <div className="p-6 rounded-3xl bg-[#F1F5F9] dark:bg-gradient-to-br dark:from-[#1E293B] dark:to-[#111827] border border-slate-200/60 dark:border-white/5 relative overflow-hidden flex flex-col md:flex-row items-center gap-6 shadow-sm dark:shadow-none">
        <div className="absolute right-0 top-0 w-32 h-32 bg-[#6366F1]/5 rounded-full blur-2xl" />
        <div className="absolute left-12 bottom-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
          <Award className="text-[#6366F1]" size={22} />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
            <span>{language === 'ar' ? 'أفضل الرواد يركزون على النظم وليس الأهداف' : 'Atomic Habit Compounds'}</span>
            <Sparkles size={14} className="text-amber-400" />
          </h4>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] leading-relaxed font-sans">
            {language === 'ar'
              ? 'الأهداف تضع الاتجاه، الروابط والنظم هي محرك التقدم الحقيقي. التزامك بـ 4 عادات صغيرة يومياً بنسبة 90% يعطيك نجاحاً مضاعفاً بنهاية العام.'
              : 'Goals direct, but routines compile progress. Managing standard physical benchmarks alongside digital tasks ensures clean daily momentum.'}
          </p>
        </div>
      </div>

    </div>
  );
}
