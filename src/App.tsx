import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Search, 
  Plus, 
  Sparkles, 
  Clock, 
  Filter, 
  AlertCircle, 
  HelpCircle, 
  Activity, 
  SlidersHorizontal, 
  LayoutGrid, 
  LogIn, 
  LogOut, 
  User as UserIcon, 
  CheckCircle2, 
  Trash2, 
  Heart, 
  BookOpen, 
  Briefcase, 
  Home, 
  ShoppingCart, 
  Database, 
  Terminal, 
  Copy, 
  Check, 
  Github, 
  CloudLightning, 
  CornerDownLeft, 
  Info,
  Sun,
  Moon,
  Globe,
  Smartphone,
  Facebook,
  Chrome,
  Loader,
  Mail
} from 'lucide-react';
import { Task } from './types';
import { MONTHS, CATEGORIES } from './constants';
import TaskItem from './components/TaskItem';
import TaskForm from './components/TaskForm';
import MonthSelector from './components/MonthSelector';
import DaySelector from './components/DaySelector';
import StatsCard from './components/StatsCard';
import TrendChart from './components/TrendChart';
import { exportTasksToICS } from './utils/icsExport';
import { TRANSLATIONS } from './translations';

import SaaSSidebar from './components/SaaSSidebar';
import PomodoroTimer from './components/PomodoroTimer';
import SmartNotes from './components/SmartNotes';
import AIAssistant from './components/AIAssistant';
import SaaSStats from './components/SaaSStats';

import { supabase, isSupabaseConfigured, SUPABASE_SETUP_SQL } from './supabase';

// Helper: Translation interfaces
interface DBTask {
  id: string;
  title: string;
  description: string;
  day: number;
  month: number;
  year: number;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  time?: string;
  created_at: string;
  user_id: string;
  position?: number;
}

function toDBTask(task: Task, userId: string): any {
  const hasPosition = localStorage.getItem('supabase_has_position_columns') !== 'false';
  const item: any = {
    id: task.id,
    title: task.title,
    description: task.description || '',
    day: task.day,
    month: task.month,
    year: task.year || 2026,
    completed: task.completed,
    priority: task.priority,
    category: task.category,
    created_at: task.createdAt,
    user_id: userId
  };
  
  if (task.time) {
    item.time = task.time;
  }
  
  if (hasPosition) {
    item.position = task.position || 0;
  }
  
  return item;
}

function fromDBTask(dbTask: DBTask): Task {
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description || '',
    day: dbTask.day,
    month: dbTask.month,
    year: dbTask.year || 2026,
    completed: dbTask.completed,
    priority: dbTask.priority as 'low' | 'medium' | 'high',
    category: dbTask.category,
    time: dbTask.time,
    createdAt: dbTask.created_at,
    userId: dbTask.user_id,
    position: dbTask.position || 0
  };
}

// Demo data templates to seed if it's the first time
const SEED_TASKS_TEMPLATE = (userId: string): Task[] => [
  {
    id: 'seed-task-1',
    title: 'تنظيم الميزانية الشهرية وتنسيق المصروفات',
    description: 'مراجعة الدخل والمصروفات ووضع ميزانية تفصيلية لدعم الإدخار',
    day: new Date().getDate(),
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    completed: true,
    priority: 'high',
    category: 'work',
    createdAt: new Date().toISOString(),
    userId,
    position: 0
  },
  {
    id: 'seed-task-2',
    title: 'مشي سريع لمدة نصف ساعة في الهواء الطلق',
    description: 'الحفاظ على اللياقة البدنية وتصفية الذهن، يفضل وقت الغروب',
    day: new Date().getDate(),
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    completed: false,
    priority: 'medium',
    category: 'health',
    createdAt: new Date().toISOString(),
    userId,
    position: 1
  },
  {
    id: 'seed-task-3',
    title: 'استكمال قراءة الفصل الرابع من كتاب التطوير الذاتي',
    description: 'تلخيص النقاط الأساسية حول بناء العادات الإيجابية الصغيرة وتدوينها',
    day: new Date().getDate() === 28 || new Date().getDate() === 29 || new Date().getDate() === 30 || new Date().getDate() === 31 ? new Date().getDate() : new Date().getDate() + 1,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    completed: false,
    priority: 'low',
    category: 'study',
    createdAt: new Date().toISOString(),
    userId,
    position: 0
  }
];

function HeaderLiveClock({ language, label }: { language: 'ar' | 'en'; label: string }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-slate-100/50 dark:bg-white/5 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-white/10 p-3 flex flex-col items-center justify-center min-w-[130px]" id="live-header-clock">
      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-300 text-[11px] font-bold">
        <Clock size={12} />
        <span>{label}</span>
      </div>
      <span className="text-sm font-black font-mono mt-0.5 text-slate-800 dark:text-white leading-none">
        {time.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </span>
    </div>
  );
}

function HeaderGreeting({ language }: { language: 'ar' | 'en' }) {
  const [hour, setHour] = useState(() => new Date().getHours());

  useEffect(() => {
    const timer = setInterval(() => {
      setHour(new Date().getHours());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  if (language === 'ar') {
    if (hour >= 5 && hour < 12) return <>صباح الخير، استعد ليوم منظم ومثمر! ☀️</>;
    if (hour >= 12 && hour < 17) return <>أهلاً بك، واصل تنظيم مهامك ومزامنتها! 🚀</>;
    if (hour >= 17 && hour < 22) return <>مساء الخير، قيم إنجازك اليوم واستعد للغد! ✨</>;
    return <>مرحباً، تنظيم المهام يمنحك بداية رائعة غداً! 🌙</>;
  } else {
    if (hour >= 5 && hour < 12) return <>Good morning! Prepare for an organized and productive day! ☀️</>;
    if (hour >= 12 && hour < 17) return <>Welcome! Keep organizing and syncing your tasks! 🚀</>;
    if (hour >= 17 && hour < 22) return <>Good evening! Evaluate your performance and prepare for tomorrow! ✨</>;
    return <>Hello! Organizing your tasks grants you an excellent start tomorrow! 🌙</>;
  }
}

// Check if user is a real Supabase-authenticated user (with database UUID) or a local/simulated account
export function isRealSupabaseUser(user: any): boolean {
  if (!user) return false;
  const id = String(user.id);
  // Match standard UUID structure (8-4-4-4-12 hex characters)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export function sanitizeApiError(errMessage: string | undefined, defaultMsg: string): string {
  if (typeof errMessage !== 'string') return defaultMsg;
  if (errMessage.includes('<!doctype') || errMessage.includes('Unexpected token') || errMessage.includes('SyntaxError')) {
    return 'Invalid Supabase URL Configuration.';
  }
  return errMessage;
}

export default function App() {
  // Language support state
  const [language, setLanguage] = useState<'ar' | 'en'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language') as 'ar' | 'en';
      return saved || 'ar';
    }
    return 'ar';
  });

  const t = TRANSLATIONS[language];

  // Dark Mode support state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme === 'dark';
    }
    return false;
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      localStorage.setItem('language', language);
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
    }
  }, [language]);

  // Session structures
  const [user, setUser] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Login / Signup forms states
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [isSingupMode, setIsSignupMode] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authActionLoading, setAuthActionLoading] = useState(false);
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');

  // Additional login methods states (Google, Facebook, Phone OTP)
  const [authTab, setAuthTab] = useState<'email' | 'phone'>('email');
  const [phoneNo, setPhoneNo] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [tempSimulatedCode, setTempSimulatedCode] = useState('');

  // Phone auth extra configuration states
  const [phoneAuthSubTab, setPhoneAuthSubTab] = useState<'otp' | 'password'>('password');
  const [phonePassword, setPhonePassword] = useState('');
  const [isPhoneSignUp, setIsPhoneSignUp] = useState(false);
  const [phoneOtpChannel, setPhoneOtpChannel] = useState<'sms' | 'whatsapp'>('sms');
  const [showConfigGuide, setShowConfigGuide] = useState(false);

  // SaaS layout toggling states
  const [activeTab, setActiveTab] = useState<string>(() => localStorage.getItem('saas_active_tab') || 'dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('saas_active_tab', activeTab);
  }, [activeTab]);

  // Core application states
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [dbSyncError, setDbSyncError] = useState<string>('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Drag and drop states
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);
  
  // Filtering states
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'all'>('daily'); // New view toggle
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(new Date().getMonth() + 1); // default to current month
  const [selectedDay, setSelectedDay] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Interactive panels display
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSqlPanelOpen, setIsSqlPanelOpen] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Time metrics state
  const [currentTime, setCurrentTime] = useState(new Date());

  // Helper to check if a task is overdue relative to the simulated local clock
  const checkIsOverdue = useCallback((task: Task): boolean => {
    if (task.completed) return false;
    
    const taskYear = task.year || 2026;
    const taskMonth = task.month; // 1-12
    const taskDay = task.day;
    
    const curYear = currentTime.getFullYear();
    const curMonth = currentTime.getMonth() + 1; // getMonth() is 0-indexed
    const curDay = currentTime.getDate();
    
    if (taskYear < curYear) return true;
    if (taskYear > curYear) return false;
    
    if (taskMonth < curMonth) return true;
    if (taskMonth > curMonth) return false;
    
    if (taskDay < curDay) return true;
    
    // Check if task is today but time is past
    if (taskDay === curDay && task.time) {
      const [taskHour, taskMinute] = task.time.split(':').map(Number);
      const curHour = currentTime.getHours();
      const curMinute = currentTime.getMinutes();
      if (curHour > taskHour) return true;
      if (curHour === taskHour && curMinute > taskMinute) return true;
    }
    
    return false;
  }, [currentTime]);

  // Auth subscriber: Listen to Supabase session change
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      // Local fallback profile
      const cachedSession = localStorage.getItem('organized_guest_mode');
      if (cachedSession) {
        try {
          setUser(JSON.parse(cachedSession));
        } catch {
          setUser(null);
        }
      } else {
        // Automatically default to Guest to let user enjoy the preview instantly
        const guestUser = { id: 'guest-session-1001', email: 'guest@organize.local', user_metadata: { full_name: 'ضيف منظم حياتي (الوضع المحلي)' } };
        setUser(guestUser);
        localStorage.setItem('organized_guest_mode', JSON.stringify(guestUser));
      }
      setAuthLoading(false);
      return;
    }

    // Get active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      if (u && !u.email_confirmed_at) {
        supabase.auth.signOut();
        setUser(null);
      } else {
        setUser(u);
      }
      setAuthLoading(false);
    }).catch(err => {
      console.error("Supabase auth session error:", err);
      setUser(null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_err, session) => {
      const u = session?.user ?? null;
      if (u && !u.email_confirmed_at) {
        supabase.auth.signOut();
        setUser(null);
      } else {
        setUser(u);
      }
      setAuthLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Fetch and Subscribe Tasks lists
  const fetchTasks = async () => {
    if (!isSupabaseConfigured || !supabase || !user || !isRealSupabaseUser(user)) return;
    setTasksLoading(true);
    setDbSyncError('');
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        const msg = sanitizeApiError(error.message, 'Database query failed.');
        console.error('Database connection failed:', msg);
        setDbSyncError(msg);
        setTasksLoading(false);
        return;
      }

      if (data) {
        const dbTasks = data.map(fromDBTask);
        
        // Dynamic Smart Sync: Compare with localStorage to see if any local updates aren't pushed yet
        const local = localStorage.getItem(`tasks_local_${user.id}`);
        let finalTasks = [...dbTasks];

        if (local) {
          try {
            const localTasks: Task[] = JSON.parse(local);
            // By default, do not aggressively push all missing tasks (doing so resurrects deleted tasks).
            // Only use local tasks if the database is literally empty and we have data (first sync).
            if (dbTasks.length === 0 && localTasks.length > 0) {
              const hasSeeded = localStorage.getItem(`seeded_to_db_${user.id}`);
              if (!hasSeeded) {
                console.log('Database empty but local tasks found. Push syncing initial batch...');
                for (const task of localTasks) {
                  await supabase.from('tasks').upsert(toDBTask(task, user.id));
                }
                localStorage.setItem(`seeded_to_db_${user.id}`, 'true');
                finalTasks = [...localTasks];
              }
            }
          } catch {
            // parse error
          }
        }

        // Remove any local duplicate ids just in case
        const uniqueTasks: Task[] = [];
        const seenIds = new Set<string>();
        for (const t of finalTasks) {
          if (!seenIds.has(t.id)) {
            seenIds.add(t.id);
            uniqueTasks.push(t);
          }
        }

        // Sort tasks locally by position ascending first, then by createdAt descending
        uniqueTasks.sort((a, b) => {
          const posA = a.position !== undefined ? a.position : 0;
          const posB = b.position !== undefined ? b.position : 0;
          if (posA !== posB) return posA - posB;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        setTasks(uniqueTasks);
        localStorage.setItem(`tasks_local_${user.id}`, JSON.stringify(uniqueTasks));
      }
    } catch (e: any) {
      console.error(e);
      setDbSyncError(e.message || String(e));
    } finally {
      setTasksLoading(false);
    }
  };

  // Drag and Drop action handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, targetTask: Task) => {
    if (!draggedTaskId) return;
    const dragItem = tasks.find(t => t.id === draggedTaskId);
    if (!dragItem) return;

    // Direct constraint: Only allowable within the exact same day, month, and year!
    if (
      dragItem.day === targetTask.day && 
      dragItem.month === targetTask.month && 
      dragItem.year === targetTask.year
    ) {
      e.preventDefault(); // Standard activation of dropping
    }
  };

  const handleDragEnter = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (!draggedTaskId) return;
    const active = tasks.find(t => t.id === draggedTaskId);
    const target = tasks.find(t => t.id === id);
    if (active && target && active.day === target.day && active.month === target.month) {
      setDragOverTaskId(id);
    }
  };

  const handleDragLeave = () => {
    setDragOverTaskId(null);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverTaskId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();
    const activeId = draggedTaskId || e.dataTransfer.getData('text/plain');
    setDraggedTaskId(null);
    setDragOverTaskId(null);

    if (!activeId || activeId === targetTaskId) return;

    const draggedTask = tasks.find(t => t.id === activeId);
    const targetTask = tasks.find(t => t.id === targetTaskId);
    if (!draggedTask || !targetTask) return;

    if (
      draggedTask.day !== targetTask.day || 
      draggedTask.month !== targetTask.month || 
      draggedTask.year !== targetTask.year
    ) {
      return;
    }

    // Get all tasks currently inside this day, in sorted order
    const dayTasks = tasks
      .filter(t => t.day === draggedTask.day && t.month === draggedTask.month && t.year === draggedTask.year)
      .sort((a, b) => {
        const pA = a.position !== undefined ? a.position : 0;
        const pB = b.position !== undefined ? b.position : 0;
        if (pA !== pB) return pA - pB;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

    const activeIdx = dayTasks.findIndex(t => t.id === activeId);
    const targetIdx = dayTasks.findIndex(t => t.id === targetTaskId);
    if (activeIdx === -1 || targetIdx === -1) return;

    const reordered = [...dayTasks];
    const [removedTask] = reordered.splice(activeIdx, 1);
    reordered.splice(targetIdx, 0, removedTask);

    // Apply absolute sequential position mapping
    const updatedPositions = reordered.map((task, idx) => ({
      ...task,
      position: idx
    }));

    const posMap = new Map<string, number>();
    updatedPositions.forEach(t => posMap.set(t.id, t.position!));

    // Map these onto our loaded tasks state array
    let updatedTasksList = tasks.map(t => {
      if (posMap.has(t.id)) {
        return { ...t, position: posMap.get(t.id) };
      }
      return t;
    });

    // Make sure we carry out the sort order consistently
    updatedTasksList.sort((a, b) => {
      const pA = a.position !== undefined ? a.position : 0;
      const pB = b.position !== undefined ? b.position : 0;
      if (pA !== pB) return pA - pB;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    setTasks(updatedTasksList);

    // Sync positions
    if (isSupabaseConfigured && supabase && user && isRealSupabaseUser(user) && localStorage.getItem('supabase_has_position_columns') !== 'false') {
      try {
        const updates = updatedPositions.map(ut => {
          return supabase!
            .from('tasks')
            .update({ position: ut.position })
            .eq('id', ut.id);
        });
        await Promise.all(updates);
      } catch (err: any) {
        if (err?.message?.includes('position') || err?.message?.includes('Could not find')) {
          localStorage.setItem('supabase_has_position_columns', 'false');
        }
        console.error('Failed to sync updated positions to Supabase:', err);
      }
    } else if (user) {
      localStorage.setItem(`tasks_local_${user.id}`, JSON.stringify(updatedTasksList));
    }
  };

  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }

    // Always pre-load from LocalStorage as a fast warm cache so tasks are instantly visible on refresh
    const local = localStorage.getItem(`tasks_local_${user.id}`);
    if (local) {
      try {
        const loaded: Task[] = JSON.parse(local);
        loaded.sort((a, b) => {
          const posA = a.position !== undefined ? a.position : 0;
          const posB = b.position !== undefined ? b.position : 0;
          if (posA !== posB) return posA - posB;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setTasks(loaded);
      } catch {
        // ignore JSON syntax errors
      }
    } else if (!isSupabaseConfigured || !supabase || !isRealSupabaseUser(user)) {
      // Seed default template only if there is no localStorage and guest mode/offline
      const defaultSeeds = SEED_TASKS_TEMPLATE(user.id);
      const initializedSeeds = defaultSeeds.map((t, idx) => ({ ...t, position: idx }));
      setTasks(initializedSeeds);
      localStorage.setItem(`tasks_local_${user.id}`, JSON.stringify(initializedSeeds));
    }

    if (!isSupabaseConfigured || !supabase || !isRealSupabaseUser(user)) {
      return;
    }

    // Live sync queries
    fetchTasks();

    // Setup real-time postgres changes subscription
    const channel = supabase
      .channel('realtime_tasks_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${user.id}` },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [user]);

  // Daily Routine Injector
  useEffect(() => {
    if (!user || tasksLoading || tasks.length === 0) return;
    
    const todayStr = new Date().toLocaleDateString('en-US'); // e.g., "5/24/2026"
    const injectedKey = `routines_injected_v2_${user.id}_${todayStr}`;
    if (localStorage.getItem(injectedKey)) return;

    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const habits = [
      { key: 'fajr', title: language === 'ar' ? 'صلاة الفجر' : 'Fajr Prayer', category: 'worship', priority: 'high' as const },
      { key: 'morning_azkar', title: language === 'ar' ? 'أذكار الصباح' : 'Morning Azkar', category: 'worship', priority: 'medium' as const },
      { key: 'dhuhr', title: language === 'ar' ? 'صلاة الظهر' : 'Dhuhr Prayer', category: 'worship', priority: 'high' as const },
      { key: 'asr', title: language === 'ar' ? 'صلاة العصر' : 'Asr Prayer', category: 'worship', priority: 'high' as const },
      { key: 'evening_azkar', title: language === 'ar' ? 'أذكار المساء' : 'Evening Azkar', category: 'worship', priority: 'medium' as const },
      { key: 'maghrib', title: language === 'ar' ? 'صلاة المغرب' : 'Maghrib Prayer', category: 'worship', priority: 'high' as const },
      { key: 'isha', title: language === 'ar' ? 'صلاة العشاء' : 'Isha Prayer', category: 'worship', priority: 'high' as const },
      { key: 'quran', title: language === 'ar' ? 'ورد القرآن الكريم' : 'Quran Reading', category: 'worship', priority: 'high' as const },
      { key: 'gym', title: language === 'ar' ? 'الجيم' : 'Gym Workout', category: 'health', priority: 'medium' as const }
    ];
    
    // We also optionally add gym if required, but let's keep it simple with worship
    const existingTitles = new Set(
      tasks
        .filter(t => t.day === day && t.month === month && t.year === year)
        .map(t => t.title)
    );

    const missingHabits = habits.filter(h => !existingTitles.has(h.title));

    if (missingHabits.length > 0) {
      const newTasks: Task[] = missingHabits.map((h, idx) => ({
        id: `routine-${todayStr.replace(/\//g, '-')}-${idx}-${Date.now()}`,
        title: h.title,
        description: language === 'ar' ? 'مهمة يومية متكررة' : 'Daily recurring task',
        completed: false,
        priority: h.priority,
        category: h.category,
        day,
        month,
        year,
        createdAt: new Date(Date.now() + idx).toISOString(),
        userId: user.id || 'guest',
        position: idx
      }));

      const updatedTasks = [...newTasks, ...tasks];
      setTasks(updatedTasks);
      localStorage.setItem(`tasks_local_${user.id}`, JSON.stringify(updatedTasks));
      
      if (isSupabaseConfigured && supabase && isRealSupabaseUser(user)) {
         Promise.all(newTasks.map(t => supabase.from('tasks').upsert(toDBTask(t, user.id)))).catch(err => console.error(err));
      }
    }

    localStorage.setItem(injectedKey, 'true');

  }, [tasks, user, tasksLoading, language]);

  // Clock live interval tick (updated every 60 seconds for performance)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Handler: Form-based Custom Credential login
  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');
    setAuthActionLoading(true);

    if (!isSupabaseConfigured || !supabase) {
      // Local account simulation inside localStorage!
      setTimeout(() => {
        try {
          const storedUsersKey = 'organized_local_users';
          const existingUsersStr = localStorage.getItem(storedUsersKey) || '[]';
          const existingUsers = JSON.parse(existingUsersStr);

          if (isSingupMode) {
            const alreadyExists = existingUsers.some((u: any) => u.email === authEmail);
            if (alreadyExists) {
              setAuthError(language === 'ar' ? 'هذا البريد الإلكتروني مسجل بالفعل!' : 'This email is already registered!');
              setAuthActionLoading(false);
              return;
            }
            const newUserObj = { id: 'local-' + Date.now(), email: authEmail, password: authPassword, full_name: authUsername || authEmail.split('@')[0] };
            existingUsers.push(newUserObj);
            localStorage.setItem(storedUsersKey, JSON.stringify(existingUsers));
            setAuthSuccessMsg(language === 'ar' ? 'تم إنشاء الحساب المحلي بنجاح! سجل الدخول الآن.' : 'Local account completed! Sign in now.');
          } else {
            const matchedUser = existingUsers.find((u: any) => u.email === authEmail && u.password === authPassword);
            if (matchedUser) {
              const sessionUser = { id: matchedUser.id, email: matchedUser.email, user_metadata: { full_name: matchedUser.full_name } };
              setUser(sessionUser);
              localStorage.setItem('organized_guest_mode', JSON.stringify(sessionUser));
            } else {
              setAuthError(language === 'ar' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' : 'Incorrect email or password.');
            }
          }
        } catch (err: any) {
          setAuthError(err.message || 'Error occurred.');
        } finally {
          setAuthActionLoading(false);
        }
      }, 800);
      return;
    }

    try {
      if (isSingupMode) {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            data: {
              full_name: authUsername || authEmail.split('@')[0]
            },
            emailRedirectTo: 'https://myoganizer.mohammedrady662002.workers.dev/'
          }
        });
        if (error) throw error;
        
        if (data?.user && !data.user.email_confirmed_at) {
          // Force sign out immediately so they cannot bypass verification
          await supabase.auth.signOut();
          setAuthSuccessMsg(language === 'ar' 
            ? 'تم تقديم طلب التسجيل بنجاح! تم إرسال رابط تأكيد إلى بريدك الإلكتروني. يرجى تفعيل الحساب أولاً لتتمكن من الدخول.' 
            : 'Registration request submitted successfully! A confirmation link has been sent to your email. Please verify your email first to be able to sign in.');
        } else if (data?.user) {
          setUser(data.user);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        
        if (data?.user) {
          if (!data.user.email_confirmed_at) {
            // Force sign out if email is not confirmed
            await supabase.auth.signOut();
            setAuthError(language === 'ar'
              ? 'لم يتم تأكيد بريدك الإلكتروني بعد! يرجى التحقق من الرسائل في بريدك الإلكتروني لتنشيط الحساب.'
              : 'Your email address is not confirmed yet! Please check your email inbox to confirm your address and activate your account.');
          } else {
            setUser(data.user);
          }
        }
      }
    } catch (err: any) {
      setAuthError(sanitizeApiError(err.message, (language === 'ar' ? 'فشلت هذه العملية، تأكد من التفاصيل المدخلة.' : 'Operation failed. Check details.')));
    } finally {
      setAuthActionLoading(false);
    }
  };

  // Handler: Forgot Password Reset Email Request
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim()) {
      setAuthError(language === 'ar' ? 'يرجى إدخال البريد الإلكتروني للمتابعة!' : 'Please enter your email to proceed!');
      return;
    }
    setAuthError('');
    setAuthSuccessMsg('');
    setAuthActionLoading(true);

    if (!isSupabaseConfigured || !supabase) {
      setTimeout(() => {
        setAuthSuccessMsg(language === 'ar' 
          ? 'تم إرسال رابط استعادة كلمة المرور (محاكاة) إلى بريدك الإلكتروني بنجاح.' 
          : 'Password reset link (simulated) sent to your email successfully.');
        setAuthActionLoading(false);
      }, 800);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(authEmail.trim(), {
        redirectTo: 'https://myoganizer.mohammedrady662002.workers.dev/'
      });
      if (error) throw error;
      setAuthSuccessMsg(language === 'ar' 
        ? 'تم إرسال رابط إعادة تعيين كلمة المرور بنجاح! يرجى مراجعة صندوق الرسائل ببريدك الإلكتروني.' 
        : 'Password reset link sent successfully! Please check your email inbox.');
    } catch (err: any) {
      setAuthError(sanitizeApiError(err.message, (language === 'ar' ? 'فشل في إرسال رابط إعادة تعيين كلمة المرور.' : 'Failed to send password reset link.')));
    } finally {
      setAuthActionLoading(false);
    }
  };

  // Phone + Password Sign-In / Sign-Up (وينشئ باس)
  const handlePhonePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNo.trim() || !phonePassword.trim()) return;
    setAuthError('');
    setAuthSuccessMsg('');
    setAuthActionLoading(true);

    if (isSupabaseConfigured && supabase) {
      try {
        if (isPhoneSignUp) {
          const { data, error } = await supabase.auth.signUp({
            phone: phoneNo,
            password: phonePassword,
          });
          if (error) throw error;
          
          setAuthSuccessMsg(language === 'ar' 
            ? 'تم إنشاء الحساب بالرقم بنجاح! إذا كانت إعدادات التحقق نشطة في لوحة تحكم Supabase، فسيتم إرسال OTP لتأكيد الرقم، وإلا يمكنك تسجيل الدخول بالرقم وكلمة المرور مباشرةً.' 
            : 'Phone account created successfully! If phone verification is enabled in your Supabase Auth, check your phone for OTP, otherwise you can sign in directly.');
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            phone: phoneNo,
            password: phonePassword,
          });
          if (error) throw error;
          if (data?.user) {
            setUser(data.user);
          }
        }
      } catch (err: any) {
        console.error('Phone Password Auth Error:', err);
        // Beautiful guided instruction if provider is not configured
        if (err.message?.includes('provider is not enabled') || err.message?.includes('Unsupported provider')) {
          setAuthError(language === 'ar'
            ? 'فشلت العملية لأن خدمة تسجيل الدخول برقم الهاتف لم يتم تفعيلها بعد في لوحة تحكم مشروعك بـ Supabase (Auth -> Providers -> Phone). اتبع دليل المساعدة بالأسفل لتفعيلها بسهولة!'
            : 'Operation failed: Phone Auth provider is not enabled in your Supabase project (Auth -> Providers -> Phone). See setup guide below to enable it!');
          setShowConfigGuide(true);
        } else {
          setAuthError(sanitizeApiError(err.message, (language === 'ar' ? 'حدث خطأ أثناء مصادقة الهاتف.' : 'An error occurred during phone authentication.')));
        }
      } finally {
        setAuthActionLoading(false);
      }
    } else {
      // Local Database simulation for Phone and Password (with custom user key)
      setTimeout(() => {
        try {
          const storedUsersKey = 'organized_local_phone_users';
          const existingUsersStr = localStorage.getItem(storedUsersKey) || '[]';
          const existingUsers = JSON.parse(existingUsersStr);

          if (isPhoneSignUp) {
            const alreadyExists = existingUsers.some((u: any) => u.phone === phoneNo);
            if (alreadyExists) {
              setAuthError(language === 'ar' ? 'رقم الهاتف هذا مسجل بالفعل!' : 'This phone number is already registered!');
              setAuthActionLoading(false);
              return;
            }
            const newUserObj = { 
              id: 'phone-local-' + Date.now(), 
              phone: phoneNo, 
              password: phonePassword 
            };
            existingUsers.push(newUserObj);
            localStorage.setItem(storedUsersKey, JSON.stringify(existingUsers));
            setAuthSuccessMsg(language === 'ar' ? 'تم إنشاء حساب الهاتف المحلي بنجاح وبأمان! سجل دخولك الآن بالرقم.' : 'Local phone account created successfully! Select Sign In to enter.');
          } else {
            const matchedUser = existingUsers.find((u: any) => u.phone === phoneNo && u.password === phonePassword);
            if (matchedUser) {
              const sessionUser = { 
                id: matchedUser.id, 
                email: `${phoneNo.replace('+', '')}@phone.local`, 
                user_metadata: { full_name: phoneNo } 
              };
              setUser(sessionUser);
              localStorage.setItem('organized_guest_mode', JSON.stringify(sessionUser));
            } else {
              setAuthError(language === 'ar' ? 'رقم الهاتف أو كلمة المرور غير صحيحة.' : 'Incorrect phone number or password.');
            }
          }
        } catch (err: any) {
          setAuthError(err.message || 'Error occurred');
        } finally {
          setAuthActionLoading(false);
        }
      }, 800);
    }
  };

  // OTP phone authentication handler - Send Code
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNo.trim()) return;
    setAuthError('');
    setAuthSuccessMsg('');
    setAuthActionLoading(true);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithOtp({
          phone: phoneNo,
          options: {
            channel: phoneOtpChannel, // 'sms' or 'whatsapp' based on state!
          }
        });
        if (error) throw error;
        setOtpSent(true);
        setAuthSuccessMsg(language === 'ar'
          ? `تم إرسال رمز التحقق بنجاح إلى هاتفك عبر ${phoneOtpChannel === 'whatsapp' ? 'الواتساب (WhatsApp)' : 'الأرقام القصيرة (SMS)'}!`
          : `OTP was dispatched successfully to your phone via ${phoneOtpChannel === 'whatsapp' ? 'WhatsApp' : 'SMS'}!`);
      } catch (err: any) {
        console.error('Phone OTP Send Error:', err);
        // Intercept provider is not enabled
        if (err.message?.includes('provider is not enabled') || err.message?.includes('Unsupported provider')) {
          setAuthError(language === 'ar'
            ? `فشل الإرسال لأن خدمة OTP عبر ${phoneOtpChannel === 'whatsapp' ? 'الواتساب' : 'الرسائل SMS'} ليست مفعلة في لوحة تحكم مشروعك بـ Supabase (أو تحتاج لربط مزود خدمة مثل Twilio أو MessageBird). قمنا بتفعيل وضع المحاكاة التلقائي بالأسفل لتجربة التطبيق!`
            : `Failed: OTP via ${phoneOtpChannel === 'whatsapp' ? 'WhatsApp' : 'SMS'} is not enabled in your Supabase project dashboard (requires configuring a text message adapter like Twilio). Fallback simulation is enabled below!`);
          
          // Fallback simulation inside active session if user wants
          const simulatedDigits = Math.floor(100000 + Math.random() * 900000).toString();
          setTempSimulatedCode(simulatedDigits);
          setOtpSent(true);
          setAuthSuccessMsg(language === 'ar'
            ? `[تنبيه محاكاة] تم التحول لوضع المحاكاة التلقائي نظراً لعدم تفعيل مزود Supabase. الرمز هو: ${simulatedDigits}`
            : `[Simulation Fallback] Auto-switched to simulation due to default provider configurations. Code is: ${simulatedDigits}`);
          setShowConfigGuide(true);
        } else {
          setAuthError(err.message || 'Error occurred');
        }
      } finally {
        setAuthActionLoading(false);
      }
    } else {
      // Local simulation
      setTimeout(() => {
        const simulatedDigits = Math.floor(100000 + Math.random() * 900000).toString();
        setTempSimulatedCode(simulatedDigits);
        setOtpSent(true);
        setAuthActionLoading(false);
        setAuthSuccessMsg(language === 'ar' 
          ? `[محاكاة] تم إرسال رمز التحقق بنجاح إلى هاتفك عبر ${phoneOtpChannel === 'whatsapp' ? 'الواتس آب 🟢' : 'الرسائل النصية SMS 📱'}!`
          : `[Simulated] OTP code sent successfully to your phone via ${phoneOtpChannel === 'whatsapp' ? 'WhatsApp 🟢' : 'SMS 📱'}!`);
      }, 1000);
    }
  };

  // OTP phone authentication handler - Verify Code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');
    setAuthActionLoading(true);

    if (isSupabaseConfigured && supabase) {
      try {
        // First try to check real OTP with Supabase
        const { data, error } = await supabase.auth.verifyOtp({
          phone: phoneNo,
          token: otpCode,
          type: 'sms', // Note: SMS verify also handles verification in Supabase
        });
        
        if (error) {
          // If it fails but we simulated it due to provider is not enabled
          if (tempSimulatedCode && otpCode.trim() === tempSimulatedCode) {
            const phoneUser = {
              id: 'phone-user-' + Date.now(),
              email: `${phoneNo.replace('+', '')}@phone.local`,
              user_metadata: { full_name: phoneNo }
            };
            setUser(phoneUser);
            localStorage.setItem('organized_guest_mode', JSON.stringify(phoneUser));
            setAuthSuccessMsg(language === 'ar' ? 'تم تسجيل الدخول المحاكى بنجاح!' : 'Simulated login completed successfully!');
          } else {
            throw error;
          }
        } else if (data?.user) {
          setUser(data.user);
        }
      } catch (err: any) {
        console.error('OTP Verification Error:', err);
        setAuthError(sanitizeApiError(err.message, (language === 'ar' ? 'تأكد من كتابة كود التحقق بشكل صحيح.' : 'Invalid verification code. Please check and retry.')));
      } finally {
        setAuthActionLoading(false);
      }
    } else {
      setTimeout(() => {
        if (otpCode.trim() === tempSimulatedCode) {
          const phoneUser = {
            id: 'phone-user-' + Date.now(),
            email: `${phoneNo.replace('+', '')}@phone.local`,
            user_metadata: { full_name: phoneNo }
          };
          setUser(phoneUser);
          localStorage.setItem('organized_guest_mode', JSON.stringify(phoneUser));
          setAuthActionLoading(false);
        } else {
          setAuthError(language === 'ar' ? 'رمز التحقق غير صحيح، يرجى المحاولة مرة أخرى.' : 'OTP verification code is incorrect, please try again.');
          setAuthActionLoading(false);
        }
      }, 1000);
    }
  };

  // Social Sign-In (Google / Facebook)
  const handleSocialSignIn = async (provider: 'google' | 'facebook') => {
    setAuthError('');
    setAuthSuccessMsg('');
    
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: window.location.origin
          }
        });
        if (error) {
          // Check if provider is not enabled
          if (error.message?.includes('provider is not enabled') || error.message?.includes('Unsupported provider')) {
            throw error;
          }
          throw error;
        }
      } catch (err: any) {
        console.error(`${provider} OAuth Error:`, err);
        if (err.message?.includes('provider is not enabled') || err.message?.includes('Unsupported provider')) {
          setAuthError(language === 'ar'
            ? `فشل تسجيل الدخول لأن حساب ${provider === 'google' ? 'Google' : 'Facebook'} لم يتم تفعيله وربطه بمشروعك في Supabase Dashboard بعد (Auth -> Providers). يمكنك اتباع الدليل الموجود أسفل النافذة لتفعيله بخطوات بسيطة!`
            : `Failed: ${provider === 'google' ? 'Google' : 'Facebook'} provider is disabled in your Supabase project (Auth -> Providers). Follow our dynamic configuration guide below to enable it!`);
          setShowConfigGuide(true);
        } else {
          setAuthError(sanitizeApiError(err.message, `Failed to sign in via ${provider}`));
        }
      }
    } else {
      // Simulate OAuth successfully in local mode!
      setAuthActionLoading(true);
      setTimeout(() => {
        const dummyUser = {
          id: `${provider}-user-` + Date.now(),
          email: `${provider}-user@social.local`,
          user_metadata: { full_name: `${provider === 'google' ? 'Google User' : 'Facebook User'}` }
        };
        setUser(dummyUser);
        localStorage.setItem('organized_guest_mode', JSON.stringify(dummyUser));
        setAuthActionLoading(false);
        setAuthSuccessMsg(language === 'ar' ? 'تم تسجيل الدخول الاجتماعي بنجاح!' : 'Social login completed successfully!');
      }, 1000);
    }
  };

  // Switch to Guest mode explicitly if desired
  const handleContinueAsGuest = () => {
    const guestUser = { id: 'guest-session-1001', email: 'guest@organize.local', user_metadata: { full_name: 'ضيف منظم حياتي (الوضع المحلي)' } };
    setUser(guestUser);
    localStorage.setItem('organized_guest_mode', JSON.stringify(guestUser));
  };

  // Sign out handler
  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('organized_guest_mode');
    }
    setUser(null);
  };

  // Handler: Task Add or Edit Submission
  const handleFormSubmit = async (taskData: Omit<Task, 'id' | 'completed' | 'createdAt' | 'userId'>) => {
    if (!user) return;

    if (editingTask) {
      const updatedItem: Task = {
        ...editingTask,
        title: taskData.title,
        description: taskData.description || '',
        day: taskData.day,
        month: taskData.month,
        priority: taskData.priority,
        category: taskData.category,
        time: taskData.time
      };

      const updatedList = tasks.map(t => t.id === editingTask.id ? updatedItem : t);
      setTasks(updatedList);
      localStorage.setItem(`tasks_local_${user.id}`, JSON.stringify(updatedList));

      if (isSupabaseConfigured && supabase && isRealSupabaseUser(user)) {
        try {
          let { error } = await supabase
            .from('tasks')
            .update(toDBTask(updatedItem, user.id))
            .eq('id', editingTask.id);
          
          if (error && (error.message.includes('position') || error.message.includes('Column not found') || error.message.includes('Could not find'))) {
            localStorage.setItem('supabase_has_position_columns', 'false');
            const healedRes = await supabase
              .from('tasks')
              .update(toDBTask(updatedItem, user.id))
              .eq('id', editingTask.id);
            error = healedRes.error;
          }

          if (error) {
            console.error('Failed to sync edit to database:', error.message);
            setDbSyncError(error.message);
          }
        } catch (e: any) {
          console.error(e);
          setDbSyncError(e.message || String(e));
        }
      }
      setEditingTask(null);
      setIsFormOpen(false);
    } else {
      // Create new
      const generatedId = 'task-' + Date.now();
      const dayTasksCount = tasks.filter(t => t.day === taskData.day && t.month === taskData.month).length;
      const newItem: Task = {
        id: generatedId,
        title: taskData.title,
        description: taskData.description || '',
        day: taskData.day,
        month: taskData.month,
        year: new Date().getFullYear(),
        completed: false,
        priority: taskData.priority,
        category: taskData.category,
        time: taskData.time,
        userId: user.id,
        createdAt: new Date().toISOString(),
        position: dayTasksCount
      };

      const updatedList = [newItem, ...tasks];
      updatedList.sort((a, b) => {
        const posA = a.position !== undefined ? a.position : 0;
        const posB = b.position !== undefined ? b.position : 0;
        if (posA !== posB) return posA - posB;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setTasks(updatedList);
      localStorage.setItem(`tasks_local_${user.id}`, JSON.stringify(updatedList));

      if (isSupabaseConfigured && supabase && isRealSupabaseUser(user)) {
        try {
          let { error } = await supabase
            .from('tasks')
            .upsert(toDBTask(newItem, user.id));
          
          if (error && (error.message.includes('position') || error.message.includes('Column not found') || error.message.includes('Could not find'))) {
            localStorage.setItem('supabase_has_position_columns', 'false');
            const healedRes = await supabase
              .from('tasks')
              .upsert(toDBTask(newItem, user.id));
            error = healedRes.error;
          }

          if (error) {
            console.error('Failed database sync on insert:', error.message);
            setDbSyncError(error.message);
          }
        } catch (e: any) {
          console.error(e);
          setDbSyncError(e.message || String(e));
        }
      }
      setIsFormOpen(false);
    }
  };

  // Handler: Toggle complete checkboxes
  const handleToggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const nextCompleted = !task.completed;
    const updatedList = tasks.map(t => t.id === id ? { ...t, completed: nextCompleted } : t);
    
    setTasks(updatedList);
    localStorage.setItem(`tasks_local_${user.id}`, JSON.stringify(updatedList));

    if (isSupabaseConfigured && supabase && isRealSupabaseUser(user)) {
      try {
        const { error } = await supabase
          .from('tasks')
          .update({ completed: nextCompleted })
          .eq('id', id);
        if (error) console.error('Error syncing complete status:', error.message);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Handler: Task delete
  const handleDeleteTask = async (id: string) => {
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه المهمة؟' : 'Are you sure you want to delete this task?')) return;
    
    // Optimistic local delete
    const previousTasks = [...tasks];
    const updatedList = tasks.filter(t => t.id !== id);
    setTasks(updatedList);
    localStorage.setItem(`tasks_local_${user?.id || 'guest'}`, JSON.stringify(updatedList));

    if (isSupabaseConfigured && supabase && isRealSupabaseUser(user)) {
      try {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', id);
          
        if (error) {
          console.error('Error deleting task from database:', error.message);
          window.alert(language === 'ar' 
            ? 'تعذر حذف المهمة من قاعدة البيانات، يرجى التحقق من الصلاحيات (RLS).' 
            : 'Failed to delete task from the database. Please check RLS policies.');
          // Revert local state because the DB failed to delete it
          setTasks(previousTasks);
          localStorage.setItem(`tasks_local_${user.id}`, JSON.stringify(previousTasks));
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }

    if (editingTask?.id === id) {
      setEditingTask(null);
    }
  };

  const handleEditTrigger = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Action: Copy SQL setup code to clipboard
  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  // Filter calculations memoized for high-performance and smoothness
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      let passesDate = true;
      const now = new Date();
      
      if (viewMode === 'daily') {
        passesDate = task.year === now.getFullYear() && task.month === (now.getMonth() + 1) && task.day === now.getDate();
      } else if (viewMode === 'weekly') {
        const tDate = new Date(task.year, task.month - 1, task.day);
        const todayAtMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const diffDays = Math.round((tDate.getTime() - todayAtMidnight.getTime()) / (1000 * 60 * 60 * 24));
        const currentDayOfWeek = todayAtMidnight.getDay(); // 0 is Sunday
        const startDiff = -currentDayOfWeek;
        const endDiff = 6 - currentDayOfWeek;
        passesDate = diffDays >= startDiff && diffDays <= endDiff;
      } else {
        const matchesMonth = selectedMonth === 'all' || task.month === selectedMonth;
        const matchesDay = selectedDay === 'all' || task.day === selectedDay;
        passesDate = matchesMonth && matchesDay;
      }

      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'completed' && task.completed) || 
        (statusFilter === 'pending' && !task.completed);
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
      const titleString = task.title || '';
      const matchesSearch = 
        titleString.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return passesDate && matchesStatus && matchesPriority && matchesCategory && matchesSearch;
    });
  }, [tasks, viewMode, selectedMonth, selectedDay, statusFilter, priorityFilter, categoryFilter, searchQuery]);

  // Grouped by day computed via memoization
  const { tasksByDay, sortedDays } = useMemo(() => {
    const group: { [day: number]: Task[] } = {};
    filteredTasks.forEach(task => {
      if (!group[task.day]) {
        group[task.day] = [];
      }
      group[task.day].push(task);
    });
    const sorted = Object.keys(group).map(Number).sort((a, b) => a - b);
    return { tasksByDay: group, sortedDays: sorted };
  }, [filteredTasks]);

  const getSelectedMonthName = () => {
    if (selectedMonth === 'all') return language === 'ar' ? 'جميع الشهور' : 'All Months';
    const found = MONTHS.find(m => m.value === selectedMonth);
    if (!found) return language === 'ar' ? 'الشهر المختار' : 'Selected Month';
    if (language === 'ar') {
      return found.name.split(' ')[0];
    } else {
      const enNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      return enNames[found.value - 1];
    }
  };

  // Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-bold text-slate-500 font-sans">
            {language === 'ar' ? 'جاري التحقق من الهوية السحابية لـ Supabase...' : 'Verifying Supabase secure connection...'}
          </span>
        </div>
      </div>
    );
  }

  // Login page fallback if user has not logged in yet
  if (!user) {
    const t = TRANSLATIONS[language];
    return (
      <div 
        className="min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden flex flex-col justify-between transition-colors" 
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        <div className="absolute top-0 right-0 left-0 h-96 bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 z-0">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
        </div>

        <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Database size={20} className="text-emerald-400 animate-pulse" />
            <span className="font-extrabold text-lg tracking-tight font-sans">
              {language === 'ar' ? 'منظم حياتي' : 'My Organizer'}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Language Selection Toggle */}
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="px-3 py-1.5 text-xs text-white bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer font-sans font-bold"
            >
              <Globe size={13} className="text-emerald-300" />
              <span>{language === 'ar' ? 'English' : 'العربية'}</span>
            </button>

            <span className="text-xs font-bold text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-white/5 font-sans">
              {isSupabaseConfigured 
                ? (language === 'ar' ? 'مزامنة قاعدة البيانات نشطة ⚡' : 'DB Sync Live ⚡')
                : (language === 'ar' ? 'الوضع المحلي النشط 💾' : 'Local Storage Mode 💾')
              }
            </span>
          </div>
        </header>

        <main className="relative z-10 max-w-md mx-auto w-full px-6 py-12 flex flex-col justify-center my-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-2xl space-y-6 transition-all">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-md">
                <Database size={28} />
              </div>
              <h3 className="font-extrabold text-slate-800 dark:text-white text-lg">
                {isForgotPasswordMode 
                  ? (language === 'ar' ? 'استعادة كلمة المرور' : 'Reset Password') 
                  : t.loginTitle}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {isForgotPasswordMode 
                  ? (language === 'ar' ? 'أدخل بريدك الإلكتروني لتلقي رابط استعادة الحساب' : 'Enter your email to receive a password reset link') 
                  : t.loginDesc}
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 text-xs rounded-xl flex items-start gap-2 animate-shake">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                <span className="font-semibold leading-relaxed font-sans">{authError}</span>
              </div>
            )}

            {authSuccessMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 text-xs rounded-xl flex items-start gap-2">
                <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" />
                <span className="font-semibold leading-relaxed font-sans">{authSuccessMsg}</span>
              </div>
            )}

            {isForgotPasswordMode ? (
              /* Forgot Password Form */
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 font-sans">
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-4 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authActionLoading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer font-sans"
                >
                  {authActionLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    language === 'ar' ? 'إرسال رابط استعادة كلمة المرور' : 'Send password reset link'
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPasswordMode(false);
                      setAuthError('');
                      setAuthSuccessMsg('');
                    }}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-bold hover:underline cursor-pointer font-sans"
                  >
                    {language === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login'}
                  </button>
                </div>
              </form>
            ) : (
              /* Authentication Forms Wrapper */
              <div className="space-y-4">
                {/* Auth Mode Tabs */}
                {(!isForgotPasswordMode) && (
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button 
                      onClick={() => setAuthTab('email')}
                      className={`flex-1 text-xs py-2 font-bold rounded-lg transition-all ${authTab === 'email' ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-800 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                      <div className="flex items-center justify-center gap-1.5"><Mail size={14} />{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</div>
                    </button>
                    <button 
                      onClick={() => setAuthTab('phone')}
                      className={`flex-1 text-xs py-2 font-bold rounded-lg transition-all ${authTab === 'phone' ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-800 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                      <div className="flex items-center justify-center gap-1.5"><Smartphone size={14} />{language === 'ar' ? 'رقم الهاتف' : 'Phone'}</div>
                    </button>
                  </div>
                )}

                {authTab === 'email' ? (
                  <form onSubmit={handleAuthAction} className="space-y-4">
                    {isSingupMode && (
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">
                          {language === 'ar' ? 'اسم المستخدم' : 'Username'}
                        </label>
                        <input
                          type="text"
                          required
                          value={authUsername}
                          onChange={(e) => setAuthUsername(e.target.value)}
                          placeholder={language === 'ar' ? 'مثال: محمد' : 'e.g., Mohammed'}
                          className="w-full pl-4 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans font-medium"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">{t.emailField}</label>
                      <input
                        type="email"
                        required
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full pl-4 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans font-medium"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-500">{t.passwordField}</label>
                        {!isSingupMode && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsForgotPasswordMode(true);
                              setAuthError('');
                              setAuthSuccessMsg('');
                            }}
                            className="text-[11px] font-bold text-emerald-600 hover:text-emerald-500 hover:underline cursor-pointer"
                          >
                            {language === 'ar' ? 'نسيت كلمة السر؟' : 'Forgot Password?'}
                          </button>
                        )}
                      </div>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="******"
                        className="w-full pl-4 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={authActionLoading}
                      className="w-full py-3 bg-[#10b981] hover:bg-[#059669] disabled:bg-slate-300 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer font-sans"
                    >
                      {authActionLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        isSingupMode 
                          ? (language === 'ar' ? 'إنشاء حساب جديد بالبريد' : 'Create Email Account') 
                          : (language === 'ar' ? 'تسجيل دخول بالبريد' : 'Sign In with Email')
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handlePhonePasswordAuth} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">
                        {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                      </label>
                      <input
                        type="tel"
                        required
                        value={phoneNo}
                        onChange={(e) => setPhoneNo(e.target.value)}
                        placeholder="+201012345678"
                        className="w-full pl-4 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans font-medium ltr-dir"
                        dir="ltr"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">{t.passwordField}</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={phonePassword}
                        onChange={(e) => setPhonePassword(e.target.value)}
                        placeholder="******"
                        className="w-full pl-4 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={authActionLoading}
                      className="w-full py-3 bg-[#10b981] hover:bg-[#059669] disabled:bg-slate-300 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer font-sans"
                    >
                      {authActionLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        isPhoneSignUp 
                          ? (language === 'ar' ? 'إنشاء حساب جديد بالهاتف' : 'Create Phone Account') 
                          : (language === 'ar' ? 'تسجيل دخول بالهاتف' : 'Sign In with Phone')
                      )}
                    </button>
                    
                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsPhoneSignUp(!isPhoneSignUp);
                          setAuthError('');
                          setAuthSuccessMsg('');
                        }}
                        className="text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-bold hover:underline cursor-pointer"
                      >
                        {isPhoneSignUp 
                          ? (language === 'ar' ? 'مسجل مسبقاً؟ سجل الدخول بالهاتف' : 'Already registered? Sign in via Phone.') 
                          : (language === 'ar' ? 'تسجيل رقم جديد كحساب' : 'Register new phone number.')}
                      </button>
                    </div>
                  </form>
                )}

                {!isSingupMode && authTab === 'email' && (
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignupMode(!isSingupMode);
                        setAuthError('');
                        setAuthSuccessMsg('');
                      }}
                      className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-bold hover:underline cursor-pointer"
                    >
                      {language === 'ar' ? 'ليس لديك حساب؟ سجل حساباً جديداً' : "Don't have an account? Sign Up"}
                    </button>
                  </div>
                )}
                
                {isSingupMode && authTab === 'email' && (
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignupMode(!isSingupMode);
                        setAuthError('');
                        setAuthSuccessMsg('');
                      }}
                      className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-bold hover:underline cursor-pointer"
                    >
                      {language === 'ar' ? 'لديك حساب بالفعل؟ سجل دخولك' : 'Already have an account? Sign In'}
                    </button>
                  </div>
                )}

                {/* Social Login Divider */}
                <div className="flex items-center gap-3 pt-4">
                  <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                    {language === 'ar' ? 'أو عبر' : 'OR CONTINUE WITH'}
                  </span>
                  <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                </div>

                {/* Social Buttons */}
                <div className="grid grid-cols-2 gap-3 pb-2">
                  <button 
                    onClick={() => handleSocialSignIn('google')}
                    disabled={authActionLoading}
                    className="py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                  </button>
                  <button 
                    onClick={() => handleSocialSignIn('facebook')}
                    disabled={authActionLoading}
                    className="py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6c.86 0 1.9.15 1.9.15v2.1h-1.07c-1.05 0-1.33.65-1.33 1.28V12h2.36l-.38 3h-1.98v6.8C18.56 20.87 22 16.84 22 12z" />
                    </svg>
                    Facebook
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        <footer className="relative z-10 max-w-md mx-auto w-full px-6 py-4 text-center">
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            {language === 'ar' ? 'جميع الحقوق محفوظة © لمنظم حياتي' : 'All rights reserved © My Organizer'}
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-slate-50 dark:bg-[#0F172A] text-slate-800 dark:text-slate-100 selection:bg-[#6366F1]/20 selection:text-indigo-200 font-sans flex overflow-hidden h-screen transition-colors duration-300" 
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      
      {/* 1. Desktop & Mobile Drawer Sidebar Wrapper */}
      <div className={`hidden md:block shrink-0 transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <SaaSSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          isOpenMobile={false}
          setIsOpenMobile={() => {}}
          user={user}
          onLogout={handleLogout}
          language={language}
        />
      </div>

      {/* Mobile Drawer (collapsible menu) */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm"
            />
            
            {/* Drawer Content */}
            <motion.div
              initial={{ x: language === 'ar' ? 288 : -288 }}
              animate={{ x: 0 }}
              exit={{ x: language === 'ar' ? 288 : -288 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className={`relative w-72 h-full bg-[#0F172A] ${language === 'ar' ? 'border-l' : 'border-r'} border-white/5 z-10`}
            >
              <SaaSSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isCollapsed={false}
                setIsCollapsed={() => {}}
                isOpenMobile={isMobileSidebarOpen}
                setIsOpenMobile={setIsMobileSidebarOpen}
                user={user}
                onLogout={handleLogout}
                language={language}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Main Content Screen Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 dark:bg-[#0B0F19] transition-colors duration-300">
        
        {/* Top Professional Navbar */}
        <header className="h-16 px-6 border-b border-slate-200/50 dark:border-white/5 flex items-center justify-between shrink-0 bg-white/80 dark:bg-[#0F172A]/40 backdrop-blur-md z-10 transition-colors duration-300">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger menu toggle button */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-1 px-2 text-slate-500 hover:text-slate-800 dark:text-[#94A3B8] dark:hover:text-white md:hidden mr-1 text-lg cursor-pointer"
            >
              ☰
            </button>

            {/* Display title based on activeTab */}
            <div className="flex flex-col">
              <h2 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-1.5 leading-none">
                {activeTab === 'dashboard' && (language === 'ar' ? 'لوحة تنظيم المهام ⏱️' : 'Task Planner Hub ⏱️')}
                {activeTab === 'pomodoro' && (language === 'ar' ? 'مساعد الفوكس والتركيز 🎯' : 'Attention Flow Engine 🎯')}
                {activeTab === 'notes' && (language === 'ar' ? 'المفكرة الفكرية الذكية 🧠' : 'Cognitive Sandbox 🧠')}
                {activeTab === 'ai_assistant' && (language === 'ar' ? 'استشاري الإنتاجية راضي AI 🧠' : 'AI Strategic Assistant 🧠')}
                {activeTab === 'stats' && (language === 'ar' ? 'المقاييس البيانية والتقارير 📊' : 'Performance Diagnostics 📊')}
              </h2>
              <span className="text-[10px] text-[#64748B] mt-1 font-sans hidden sm:inline">
                {activeTab === 'dashboard' && (language === 'ar' ? 'إدارة الخطط الزمنية وجداول الأعمال' : 'Configure milestones and timeline checkoffs')}
                {activeTab === 'pomodoro' && (language === 'ar' ? 'جلسات تركيز عميقة خالية من المشتتات مع مولد الذبذبات الصوتيّة' : 'Stave off distractions and listen to clean auditory focus loop loops')}
                {activeTab === 'notes' && (language === 'ar' ? 'مساحة منظمة لتلخيص الأفكار ومذكراتك الحرة بفرشاة الذكاء الاصطناعي' : 'Dynamic canvas with server-side AI context summarization')}
                {activeTab === 'ai_assistant' && (language === 'ar' ? 'حلول جدولة وتخطيط فوري لمهامك بالاستعانة بخبراء Gemini' : 'Orchestrated timelines and scheduling analysis on demand')}
                {activeTab === 'stats' && (language === 'ar' ? 'مراجعة نسب الالتزام والتوزيع الزمني لحجم إنجازك' : 'Interactive charting analysis')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Clock Indicator */}
            <HeaderLiveClock language={language} label={t.clockTitle} />

            {/* Language Selection Toggle */}
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1E293B] dark:hover:bg-[#334155] border border-slate-200 dark:border-white/5 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer text-slate-700 dark:text-white"
            >
              <Globe size={14} className="text-[#6366F1]" />
              <span className="hidden sm:inline">{language === 'ar' ? 'English' : 'العربية'}</span>
            </button>

            {/* Light/Dark Mode Selection Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1E293B] dark:hover:bg-[#334155] border border-slate-200 dark:border-white/5 transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-white animate-none"
              title={language === 'ar' ? 'تبديل المظهر' : 'Toggle Theme'}
            >
              {isDarkMode ? (
                <>
                  <Sun size={14} className="text-amber-500 animate-[spin_10s_linear_infinite]" />
                  <span className="hidden sm:inline">{language === 'ar' ? 'مضيء' : 'Light'}</span>
                </>
              ) : (
                <>
                  <Moon size={14} className="text-indigo-600" />
                  <span className="hidden sm:inline">{language === 'ar' ? 'مظلم' : 'Dark'}</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Sync Warn banner */}
        <AnimatePresence>
          {false && dbSyncError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-6 mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 flex items-center justify-between gap-4 shrink-0"
            >
              <div className="flex gap-2">
                <AlertCircle size={16} className="text-amber-400 mt-0.5 shrink-0" />
                <p className="text-xs font-sans">
                  {language === 'ar' 
                    ? `تنبيه مزامنة Supabase بقيمة: ${dbSyncError}. تم حفظ العمل محلياً بأمان.` 
                    : `Database issue cached: ${dbSyncError}. Changes synced safely locally.`}
                </p>
              </div>
              <button
                onClick={() => setDbSyncError('')}
                className="text-xs font-bold text-amber-200 hover:text-white cursor-pointer px-2"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Database setup instructions inside workspace */}
        <AnimatePresence>
          {isSqlPanelOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-6 mt-4 shrink-0"
            >
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-4 text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Database size={13} className="text-emerald-400" />
                    <span>{language === 'ar' ? 'إعداد هيكل الجداول والسياسات في Supabase' : 'SQL Table Configuration Script'}</span>
                  </span>
                  <button onClick={() => setIsSqlPanelOpen(false)} className="text-[#94A3B8] hover:text-white">✕</button>
                </div>
                <div className="relative">
                  <pre className="bg-[#0F172A] p-3 rounded-lg text-[9px] font-mono text-[#a5f3fc] overflow-x-auto border border-white/5 max-h-36">
                    {SUPABASE_SETUP_SQL}
                  </pre>
                  <button
                    onClick={handleCopySql}
                    className="absolute left-2 top-2 px-2 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-[9px] font-bold text-slate-300"
                  >
                    {copiedSql ? (language === 'ar' ? 'مكتمل!' : 'Copied!') : (language === 'ar' ? 'نسخ' : 'Copy')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Tab Main Screen Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              
              {/* TAB 1: CORE PLANNING DASHBOARD */}
              {activeTab === 'dashboard' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left task filters and items list */}
                  <div className="lg:col-span-8 space-y-6">
                    
                    {/* Add new task trigger form block */}
                    <div className="bg-white dark:bg-[#1E293B]/30 border border-slate-200/60 dark:border-white/5 rounded-3xl p-5 flex flex-col gap-4 shadow-sm dark:shadow-none">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xs font-black text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider">{language === 'ar' ? 'إدارة وتخطيط اليوم' : 'TASKS MANAGEMENT'}</h3>
                          <p className="text-xs text-[#64748B] mt-0.5 font-sans">
                            {language === 'ar' ? `قائمة مهام شهر ${getSelectedMonthName()}` : `Viewing scheduler list for ${getSelectedMonthName()}`}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setEditingTask(null);
                            setIsFormOpen(!isFormOpen);
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:opacity-90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-505/10 cursor-pointer"
                        >
                          <Plus size={14} />
                          <span>{language === 'ar' ? 'إضافة مهمة جديدة' : 'Add New Task'}</span>
                        </button>
                      </div>

                      {/* Animated Task Form */}
                      <AnimatePresence>
                        {isFormOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden mt-2"
                          >
                            <TaskForm 
                              onSubmit={handleFormSubmit}
                              editingTask={editingTask}
                              onCancelEdit={() => {
                                setEditingTask(null);
                                setIsFormOpen(false);
                              }}
                              defaultMonth={selectedMonth === 'all' ? (new Date().getMonth() + 1) : selectedMonth}
                              defaultDay={selectedDay === 'all' ? new Date().getDate() : selectedDay}
                              language={language}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Filters Dashboard Panel bar */}
                    <div className="bg-white dark:bg-[#1E293B]/40 rounded-3xl border border-slate-200/60 dark:border-white/5 p-4 space-y-4 shadow-sm dark:shadow-none">
                      
                      {/* View Mode Toggle */}
                      <div className="flex bg-slate-100 dark:bg-[#0F172A] p-1 rounded-xl border border-slate-200/50 dark:border-white/5 w-fit">
                        {[
                          { id: 'daily', labelAr: 'اليوم', labelEn: 'Today' },
                          { id: 'weekly', labelAr: 'أسبوعي', labelEn: 'Week' },
                          { id: 'all', labelAr: 'شهري (الكل)', labelEn: 'Month (All)' },
                        ].map(mode => (
                          <button
                            key={mode.id}
                            onClick={() => {
                              setViewMode(mode.id as any);
                              if (mode.id === 'daily') {
                                setSelectedMonth(new Date().getMonth() + 1);
                                setSelectedDay(new Date().getDate());
                              } else if (mode.id === 'all' && selectedDay !== 'all') {
                                // If they click month(all), clear specific day selection to show entire month again
                                setSelectedDay('all');
                              }
                            }}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              viewMode === mode.id
                                ? 'bg-white dark:bg-[#1E293B] text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-white/10'
                                : 'text-slate-500 dark:text-[#94A3B8] hover:text-slate-800 dark:hover:text-white'
                            }`}
                          >
                            {language === 'ar' ? mode.labelAr : mode.labelEn}
                          </button>
                        ))}
                      </div>

                      {/* Search box queries */}
                      <div className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200/60 dark:border-white/5 rounded-xl px-3.5 py-2.5 flex items-center gap-3">
                        <Search size={14} className="text-[#475569] dark:text-[#94A3B8]" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={language === 'ar' ? 'ابحث عن أي مهمة بالاسم أو بالمحتوى المكتوب...' : 'Search tasks by title, agenda details...'}
                          className="w-full bg-transparent border-none text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-0 font-sans"
                        />
                      </div>

                      {/* Select properties tools bar */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-white/5">
                        <div className="flex flex-wrap items-center gap-2">
                          {[
                            { id: 'all', labelAr: 'الكل', labelEn: 'All' },
                            { id: 'pending', labelAr: 'المعلقة', labelEn: 'Pending' },
                            { id: 'completed', labelAr: 'المكتملة', labelEn: 'Done' }
                          ].map(opt => (
                            <button
                              key={opt.id}
                              onClick={() => setStatusFilter(opt.id as any)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                statusFilter === opt.id
                                  ? 'bg-indigo-500/15 text-[#6366F1] border border-indigo-505/20'
                                  : 'text-slate-500 hover:text-slate-900 dark:text-[#94A3B8] dark:hover:text-white'
                              }`}
                            >
                              {language === 'ar' ? opt.labelAr : opt.labelEn}
                            </button>
                          ))}
                        </div>

                        {/* select dropdowns */}
                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value as any)}
                            className="bg-slate-50 dark:bg-[#0F172A] text-[11px] text-slate-700 dark:text-[#94A3B8] font-bold border border-slate-200 dark:border-white/5 px-2.5 py-1.5 rounded-lg focus:outline-none cursor-pointer"
                          >
                            <option value="all" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{language === 'ar' ? 'كل الأولويات' : 'All Priority'}</option>
                            <option value="high" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{language === 'ar' ? 'عالية الأهمية 🟥' : 'High Priority'}</option>
                            <option value="medium" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{language === 'ar' ? 'متوسطة الأهمية 🟨' : 'Medium Priority'}</option>
                            <option value="low" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{language === 'ar' ? 'منخفضة الأهمية 🟩' : 'Low Priority'}</option>
                          </select>

                          <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="bg-slate-50 dark:bg-[#0F172A] text-[11px] text-slate-700 dark:text-[#94A3B8] font-bold border border-slate-200 dark:border-white/5 px-2.5 py-1.5 rounded-lg focus:outline-none cursor-pointer"
                          >
                            <option value="all" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{language === 'ar' ? 'كل الأقسام' : 'All Categories'}</option>
                            {CATEGORIES.map(c => (
                              <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{language === 'ar' ? c.name : c.id}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Active timelines sorted by day lists */}
                    <div className="space-y-6">
                      {tasksLoading ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <Loader size={24} className="animate-spin text-indigo-500 mb-2" />
                          <span className="text-xs text-[#64748B]">{language === 'ar' ? 'جاري استيراد وجدولة المهام...' : 'Retrieving active schedules...'}</span>
                        </div>
                      ) : sortedDays.length > 0 ? (
                        sortedDays.map((day) => {
                          const dayTasks = tasksByDay[day];
                          return (
                            <div key={day} className="space-y-3.5">
                              {/* Day Label Tag */}
                              <div className="flex items-center gap-2.5 px-1.5">
                                <span className="w-1.5 h-3 rounded-full bg-[#6366F1] inline-block" />
                                <h4 className="font-extrabold text-sm text-slate-800 dark:text-white font-sans">
                                  {language === 'ar' ? `يوم ${day} من شهر ${getSelectedMonthName()}` : `Day ${day} ${getSelectedMonthName()}`}
                                </h4>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold bg-slate-100 dark:bg-[#1E293B] px-2 py-0.5 rounded-full font-mono">
                                  {dayTasks.length} {language === 'ar' ? 'مهام' : 'tasks'}
                                </span>
                              </div>

                              {/* Task Items grid */}
                              <div className="grid grid-cols-1 gap-2.5">
                                {dayTasks.map(task => (
                                  <TaskItem
                                    key={task.id}
                                    task={task}
                                    onToggle={handleToggleTask}
                                    onDelete={handleDeleteTask}
                                    onEdit={handleEditTrigger}
                                    isOverdue={checkIsOverdue(task)}
                                    language={language}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, task.id)}
                                    onDragOver={(e) => handleDragOver(e, task)}
                                    onDragEnter={(e) => handleDragEnter(e, task.id)}
                                    onDragLeave={handleDragLeave}
                                    onDragEnd={handleDragEnd}
                                    onDrop={(e) => handleDrop(e, task.id)}
                                    isDragging={draggedTaskId === task.id}
                                    isDragOver={dragOverTaskId === task.id}
                                  />
                                ))}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-12 text-center rounded-3xl bg-slate-100/50 dark:bg-[#1E293B]/10 border border-slate-200/60 dark:border-white/5 flex flex-col items-center gap-3">
                          <Calendar size={32} className="text-slate-400 dark:text-[#334155]" />
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-white mb-1">{language === 'ar' ? 'جدول المخططات فارغ' : 'A clean scheduler horizon'}</h4>
                            <p className="text-[11px] text-slate-400 dark:text-[#64748B]">{language === 'ar' ? 'لا توجد مهام مطابقة لفلاتر التصفية النشطة.' : 'No tasks map onto your active filter rules.'}</p>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Right side scheduler details */}
                  <div className="lg:col-span-4 space-y-6">
                    
                    {/* Compact Metrics visual widget */}
                    <StatsCard tasks={filteredTasks} language={language} />

                    {/* Integrated Calendar Scheduler Widget */}
                    <MonthSelector
                      selectedMonth={selectedMonth}
                      onMonthChange={(m) => {
                        setSelectedMonth(m);
                        setSelectedDay('all');
                        setViewMode('all');
                      }}
                      tasks={tasks}
                    />

                    {/* Day selector for deep filtering */}
                    {selectedMonth !== 'all' && (
                      <DaySelector
                        selectedMonth={selectedMonth}
                        selectedDay={selectedDay}
                        onDayChange={(d) => {
                          setSelectedDay(d);
                          setViewMode('all'); // Stay in 'all' view block to respect matchesDay
                        }}
                        tasks={tasks}
                        language={language}
                      />
                    )}

                    {/* Accomplishment Tendence Trend widgets */}
                    <TrendChart tasks={tasks} />

                    {/* Export / Sync Options card */}
                    <div className="p-5 rounded-3xl bg-white dark:bg-[#1E293B]/40 border border-slate-200/60 dark:border-white/5 space-y-4 shadow-sm dark:shadow-none">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white">{language === 'ar' ? 'الاستيراد والتصدير والمزامنة' : 'Data Integrity & Feeds'}</h4>
                        <p className="text-[10px] text-slate-500 dark:text-[#64748B] mt-1 font-sans">{language === 'ar' ? 'قم بتصدير مهام حياتك لتقويمات Google أو Apple بنقرة واحدة.' : 'Consolidate plans and push outputs to Apple or Google feeds.'}</p>
                      </div>
                      <button
                        onClick={() => exportTasksToICS(tasks)}
                        className="w-full py-2.5 rounded-xl bg-slate-50 dark:bg-[#1E293B] hover:bg-slate-100 dark:hover:bg-[#334155] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-[#CBD5E1] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Calendar size={13} className="text-[#6366F1]" />
                        <span>{language === 'ar' ? 'تصدير للتقويم (.ics)' : 'Export calendar feed (.ics)'}</span>
                      </button>
                    </div>

                  </div>

                </div>
              )}

              {/* TAB 3: POMODORO TIMER WORKSPACE */}
              {activeTab === 'pomodoro' && (
                <PomodoroTimer language={language} />
              )}

              {/* TAB 4: SMART COGNITIVE NOTES */}
              {activeTab === 'notes' && (
                <SmartNotes userId={user.id} language={language} />
              )}

              {/* TAB 5: AI STRATEGIC COACH */}
              {activeTab === 'ai_assistant' && (
                <AIAssistant tasks={tasks} language={language} />
              )}

              {/* TAB 6: PERFORMANCE ANALYTICS */}
              {activeTab === 'stats' && (
                <SaaSStats tasks={tasks} language={language} />
              )}

            </motion.div>
          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
