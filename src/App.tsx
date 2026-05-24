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
  Chrome
} from 'lucide-react';
import { Task } from './types';
import { MONTHS, CATEGORIES } from './constants';
import TaskItem from './components/TaskItem';
import TaskForm from './components/TaskForm';
import MonthSelector from './components/MonthSelector';
import StatsCard from './components/StatsCard';
import TrendChart from './components/TrendChart';
import { exportTasksToICS } from './utils/icsExport';
import { TRANSLATIONS } from './translations';

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

function toDBTask(task: Task, userId: string): DBTask {
  return {
    id: task.id,
    title: task.title,
    description: task.description || '',
    day: task.day,
    month: task.month,
    year: task.year || 2026,
    completed: task.completed,
    priority: task.priority,
    category: task.category,
    time: task.time,
    created_at: task.createdAt,
    user_id: userId,
    position: task.position || 0
  };
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
    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-3 flex flex-col items-center justify-center min-w-[130px]" id="live-header-clock">
      <div className="flex items-center gap-1.5 text-emerald-300 text-[11px] font-bold">
        <Clock size={12} />
        <span>{label}</span>
      </div>
      <span className="text-sm font-black font-mono mt-0.5 text-white leading-none">
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

export default function App() {
  // Language support state
  const [language, setLanguage] = useState<'ar' | 'en'>(() => {
    return (localStorage.getItem('language') as 'ar' | 'en') || 'ar';
  });

  const t = TRANSLATIONS[language];

  // Dark Mode support state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
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

  // Core application states
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Drag and drop states
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);
  
  // Filtering states
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
    if (!isSupabaseConfigured || !supabase || !user || user.id === 'guest-session-1001') return;
    setTasksLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Database connection failed, possibly missing table tasks:', error.message);
        // Fall back to local tasks in memory gracefully so app stays interactive
        setTasksLoading(false);
        return;
      }

      if (data) {
        const mapped = data.map(fromDBTask);
        // Sort tasks locally by position ascending first, then by createdAt descending
        mapped.sort((a, b) => {
          const posA = a.position !== undefined ? a.position : 0;
          const posB = b.position !== undefined ? b.position : 0;
          if (posA !== posB) return posA - posB;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setTasks(mapped);
      }
    } catch (e) {
      console.error(e);
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
    if (isSupabaseConfigured && supabase && user && user.id !== 'guest-session-1001') {
      try {
        const updates = updatedPositions.map(ut => {
          return supabase!
            .from('tasks')
            .update({ position: ut.position })
            .eq('id', ut.id);
        });
        await Promise.all(updates);
      } catch (err) {
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

    if (!isSupabaseConfigured || !supabase || user.id === 'guest-session-1001') {
      // Offline fallback: LocalStorage loading
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
          setTasks([]);
        }
      } else {
        // Seed default template for instant wow experience
        const defaultSeeds = SEED_TASKS_TEMPLATE(user.id);
        const initializedSeeds = defaultSeeds.map((t, idx) => ({ ...t, position: idx }));
        setTasks(initializedSeeds);
        localStorage.setItem(`tasks_local_${user.id}`, JSON.stringify(initializedSeeds));
      }
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
      supabase.removeChannel(channel);
    };
  }, [user]);

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
      setAuthError(err.message || (language === 'ar' ? 'فشلت هذه العملية، تأكد من التفاصيل المدخلة.' : 'Operation failed. Check details.'));
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
      setAuthError(err.message || (language === 'ar' ? 'فشل في إرسال رابط إعادة تعيين كلمة المرور.' : 'Failed to send password reset link.'));
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
          setAuthError(err.message || (language === 'ar' ? 'حدث خطأ أثناء مصادقة الهاتف.' : 'An error occurred during phone authentication.'));
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
        setAuthError(err.message || (language === 'ar' ? 'تأكد من كتابة كود التحقق بشكل صحيح.' : 'Invalid verification code. Please check and retry.'));
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
          setAuthError(err.message || `Failed to sign in via ${provider}`);
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

      if (isSupabaseConfigured && supabase && user.id !== 'guest-session-1001') {
        try {
          const { error } = await supabase
            .from('tasks')
            .update(toDBTask(updatedItem, user.id))
            .eq('id', editingTask.id);
          if (error) {
            // fallback state update if DB has issues
            console.error('Failed to sync to database, editing locally', error.message);
          }
          // Optimistically update locally
          setTasks(prev => prev.map(t => t.id === editingTask.id ? updatedItem : t));
        } catch (e) {
          console.error(e);
        }
      } else {
        // Offline / storage save
        const updatedList = tasks.map(t => t.id === editingTask.id ? updatedItem : t);
        setTasks(updatedList);
        localStorage.setItem(`tasks_local_${user.id}`, JSON.stringify(updatedList));
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

      if (isSupabaseConfigured && supabase && user.id !== 'guest-session-1001') {
        try {
          const { error } = await supabase
            .from('tasks')
            .insert(toDBTask(newItem, user.id));
          if (error) {
            console.error('Failed database sync on insert', error.message);
          }
          setTasks(prev => {
            const newList = [newItem, ...prev];
            newList.sort((a, b) => {
              const posA = a.position !== undefined ? a.position : 0;
              const posB = b.position !== undefined ? b.position : 0;
              if (posA !== posB) return posA - posB;
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            return newList;
          });
        } catch (e) {
          console.error(e);
        }
      } else {
        // offline save
        const updatedList = [newItem, ...tasks];
        updatedList.sort((a, b) => {
          const posA = a.position !== undefined ? a.position : 0;
          const posB = b.position !== undefined ? b.position : 0;
          if (posA !== posB) return posA - posB;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setTasks(updatedList);
        localStorage.setItem(`tasks_local_${user.id}`, JSON.stringify(updatedList));
      }
      setIsFormOpen(false);
    }
  };

  // Handler: Toggle complete checkboxes
  const handleToggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const nextCompleted = !task.completed;
    
    // update state optimistically
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: nextCompleted } : t));

    if (isSupabaseConfigured && supabase && user.id !== 'guest-session-1001') {
      try {
        const { error } = await supabase
          .from('tasks')
          .update({ completed: nextCompleted })
          .eq('id', id);
        if (error) console.error('Error syncing complete status:', error.message);
      } catch (err) {
        console.error(err);
      }
    } else {
      const updatedList = tasks.map(t => t.id === id ? { ...t, completed: nextCompleted } : t);
      localStorage.setItem(`tasks_local_${user.id}`, JSON.stringify(updatedList));
    }
  };

  // Handler: Task delete
  const handleDeleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));

    if (isSupabaseConfigured && supabase && user.id !== 'guest-session-1001') {
      try {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', id);
        if (error) console.error('Error deleting task from database:', error.message);
      } catch (err) {
        console.error(err);
      }
    } else {
      const updatedList = tasks.filter(t => t.id !== id);
      localStorage.setItem(`tasks_local_${user.id}`, JSON.stringify(updatedList));
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
      const matchesMonth = selectedMonth === 'all' || task.month === selectedMonth;
      const matchesDay = selectedDay === 'all' || task.day === selectedDay;
      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'completed' && task.completed) || 
        (statusFilter === 'pending' && !task.completed);
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
      const matchesSearch = 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesMonth && matchesDay && matchesStatus && matchesPriority && matchesCategory && matchesSearch;
    });
  }, [tasks, selectedMonth, selectedDay, statusFilter, priorityFilter, categoryFilter, searchQuery]);

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
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">
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
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
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
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    {language === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login'}
                  </button>
                </div>
              </form>
            ) : (
              /* Email Authentication Form (Sign In / Sign Up) */
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
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  {authActionLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : isSingupMode ? (
                    t.signUpBtn
                  ) : (
                    t.signInBtn
                  )}
                </button>
              </form>
            )}

            {!isForgotPasswordMode && (
              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignupMode(!isSingupMode);
                    setAuthError('');
                    setAuthSuccessMsg('');
                  }}
                  className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  {isSingupMode ? t.switchSignUp : t.switchSignIn}
                </button>

                <button
                  type="button"
                  onClick={handleContinueAsGuest}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-semibold flex items-center gap-0.5 cursor-pointer"
                >
                  <span>{t.continueAsGuest}</span>
                  <CornerDownLeft size={12} />
                </button>
              </div>
            )}
          </div>
        </main>

        <footer className="text-center py-6 text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-900">
          {language === 'ar' ? 'منظم حياتي © 2026 مصصم بواسطة Mo_Rady' : 'My Organizer © 2026 Designed by Mo_Rady'}
        </footer>
      </div>
    );
  }

  // Workspace View
  return (
    <div 
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-16 selection:bg-emerald-100 selection:text-emerald-900 font-sans transition-colors duration-200" 
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Database Schema Setup Instruction Modal or Card if trigger is clicked */}
      <AnimatePresence>
        {isSqlPanelOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 mt-4"
          >
            <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Database size={18} />
                  <span className="font-extrabold text-sm">
                    {language === 'ar' ? 'أكواد SQL لإنشاء الجدول في Supabase' : 'SQL Code to Schema Setup in Supabase'}
                  </span>
                </div>
                <button
                  onClick={() => setIsSqlPanelOpen(false)}
                  className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
                >
                  {language === 'ar' ? 'إغلاق نافذة الأكواد ×' : 'Close Panel ×'}
                </button>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                {language === 'ar' 
                  ? 'انسخ الكود بالأسفل والصقه بداخل "SQL Editor" في لوحة تحكم مشروعك بـ Supabase لإنشاء جدول المهام المطلوب وتطبيق سياسات الأمان والحماية فوراً:'
                  : 'Copy the query below and paste it into the "SQL Editor" inside your Supabase project dashboard to create the tasks table and activate secure database policies immediately:'
                }
              </p>

              <div className="relative">
                <pre className="bg-slate-950 p-4 rounded-xl text-[10px] font-mono overflow-x-auto text-emerald-300 leading-relaxed border border-slate-800/80 max-h-56">
                  {SUPABASE_SETUP_SQL}
                </pre>
                <button
                  onClick={handleCopySql}
                  className="absolute left-3 top-3 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-300 flex items-center gap-1 transition-all cursor-pointer"
                >
                  {copiedSql ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  <span>{copiedSql ? (language === 'ar' ? 'تم النسخ في الحافظة!' : 'Copied!') : (language === 'ar' ? 'نسخ الكود' : 'Copy Code')}</span>
                </button>
              </div>

              <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-[11px] text-slate-300 leading-relaxed space-y-1">
                <span className="font-bold block text-emerald-400">
                  {language === 'ar' ? '📍 خطوات ربط المفاتيح في منصة AI Studio:' : '📍 How to connect Supabase keys in AI Studio:'}
                </span>
                <p>
                  {language === 'ar' 
                    ? '1. اذهب لقسم الإعدادات / الأسرار (Secrets panel) في الواجهة الجانبية لـ AI Studio.' 
                    : '1. Navigate to the Secrets Panel in the sidebar menu of your AI Studio environment.'
                  }
                </p>
                <p>
                  {language === 'ar' 
                    ? '2. أضف مفتاحين جديدين باسم: VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY.' 
                    : '2. Create two new secrets: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY with your values.'
                  }
                </p>
                <p>
                  {language === 'ar' 
                    ? '3. سيتم المزامنة السحابية الفورية الآمنة بمتصفحك بلحظتها دون إعادة تشغيل!' 
                    : '3. Fully secure automatic cloud sync will take effect instantly in your app!'
                  }
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visual Ambient Header Background */}
      <div className="relative bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-950 text-white overflow-hidden py-9 px-4 md:px-10 border-b border-emerald-900/40 shadow-sm">
        <div className="absolute top-0 right-0 left-0 bottom-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                isSupabaseConfigured && user?.id !== 'guest-session-1001'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {isSupabaseConfigured && user?.id !== 'guest-session-1001' ? <Database size={10} /> : <AlertCircle size={10} />}
                <span>
                  {isSupabaseConfigured && user?.id !== 'guest-session-1001' ? t.supabaseActive : t.offlineMode}
                </span>
              </span>
              
              <button
                onClick={() => setIsHelpOpen(!isHelpOpen)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[10px] font-bold hover:bg-blue-500/20 transition-all cursor-pointer"
              >
                <Info size={10} />
                <span>{t.guideTitle}</span>
              </button>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-sans" id="applet-title">
              {t.title} <span className="text-emerald-400">{t.subtitle}</span>
            </h1>
            <p className="text-emerald-200/90 text-xs md:text-sm font-medium">
              <HeaderGreeting language={language} />
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto">
            {/* Language Toggle Switch */}
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="bg-white/5 backdrop-blur-md hover:bg-white/10 p-3 rounded-2xl border border-white/10 transition-all cursor-pointer flex items-center gap-1.5 text-white text-xs font-bold"
              title={language === 'ar' ? 'Switch to English' : 'التحويل للغة العربية'}
              id="lang-toggle-btn"
            >
              <Globe size={18} className="text-emerald-300" />
              <span>{language === 'ar' ? 'English' : 'العربية'}</span>
            </button>

            {/* Dark Mode Switcher Button */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="bg-white/5 backdrop-blur-md hover:bg-white/10 p-3 rounded-2xl border border-white/10 transition-all cursor-pointer flex items-center justify-center text-white"
              title={isDarkMode ? (language === 'ar' ? 'التبديل إلى الوضع المضيء' : 'Switch to Light Mode') : (language === 'ar' ? 'التبديل إلى الوضع الداكن' : 'Switch to Dark Mode')}
              id="theme-toggle-btn"
            >
              {isDarkMode ? <Sun size={18} className="text-amber-300" /> : <Moon size={18} className="text-blue-200" />}
            </button>

            {/* Live clock */}
            <HeaderLiveClock language={language} label={t.clockTitle} />

            {/* Profile Detail */}
            {user && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/15 p-3 flex items-center gap-3 shadow-inner">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white font-extrabold flex items-center justify-center border-2 border-white/20 text-sm shadow">
                  {user.email ? user.email[0].toUpperCase() : 'U'}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-white text-xs font-black truncate max-w-[90px] font-sans">
                    {user.email ? user.email.split('@')[0] : 'User'}
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="text-[10px] text-red-300 hover:text-red-400 font-extrabold flex items-center gap-0.5 transition-all w-fit cursor-pointer"
                  >
                    <LogOut size={10} />
                    <span>{language === 'ar' ? 'خروج' : 'Logout'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deploy & Git Help Panel (Collapsible) */}
      <AnimatePresence>
        {isHelpOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 mt-6 overflow-hidden"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-850 p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h4 className="font-extrabold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                  <Github className="text-slate-700 dark:text-slate-350" size={18} />
                  <span>{language === 'ar' ? 'دليل الإطلاق الشامل: التصدير لـ GitHub والرفع بـ Cloudflare Pages 🌐' : 'Comprehensive Launch Guide: Export to GitHub & Deploy to Cloudflare Pages 🌐'}</span>
                </h4>
                <button 
                  onClick={() => setIsHelpOpen(false)}
                  className="text-xs text-slate-400 font-bold hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                >
                  {language === 'ar' ? 'إغلاق الدليل ×' : 'Close Guide ×'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {/* Section 1: GitHub */}
                <div className="space-y-2.5 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850">
                  <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5 text-sm">
                    <Github size={16} className="text-slate-900 dark:text-slate-200" />
                    <span>{language === 'ar' ? '1. الربط والتصدير إلى GitHub' : '1. Connect and Export to GitHub'}</span>
                  </span>
                  <ol className="list-decimal list-inside space-y-2 pl-1">
                    <li>{language === 'ar' ? 'اضغط على قائمة Export في الزاوية العلوية لمنصة AI Studio.' : 'Click on the Export menu in the top corner of the AI Studio workspace.'}</li>
                    <li>{language === 'ar' ? 'اختر Export to GitHub، وسيتم رفع كامل الكود لمستودعك.' : 'Select Export to GitHub to push your clean code automatically to your repository.'}</li>
                    <li>{language === 'ar' ? 'أو خذ نسخة كاملة مضغوطة عبر Download as ZIP وقم برفعها يدوياً.' : 'Or download a ZIP archive of the project and push it to your GitHub account.'}</li>
                  </ol>
                </div>

                {/* Section 2: Cloudflare */}
                <div className="space-y-2.5 p-4 bg-emerald-50/40 dark:bg-emerald-950/10 rounded-xl border border-emerald-100/10 dark:border-emerald-950/20">
                  <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5 text-sm">
                    <CloudLightning size={16} className="text-emerald-600" />
                    <span>{language === 'ar' ? '2. الاستضافة المجانية على Cloudflare Pages' : '2. Host Free on Cloudflare Pages'}</span>
                  </span>
                  <ol className="list-decimal list-inside space-y-2 pl-1">
                    <li>{language === 'ar' ? 'افتح حساب كلاودفلير المجاني ثم توجه لقسم Pages.' : 'Create a free Cloudflare account and navigate to Pages.'}</li>
                    <li>{language === 'ar' ? 'اربط مستودع GitHub الخاص بك الذي قمت بتصديره للتو.' : 'Connect the GitHub repository that you just created/exported.'}</li>
                    <li>{language === 'ar' ? 'اضبط أمر البناء إلى npm run build ومسار المخرجات إلى dist.' : 'Set build command to "npm run build" and output directory to "dist".'}</li>
                    <li>{language === 'ar' ? 'اضغط على Save and Deploy لتشغيل موقعك الفعلي بالكامل!' : 'Click Save and Deploy to launch your production worker live in seconds!'}</li>
                  </ol>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Main Container Dashboard Workspace */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Right Sidebar on desktop / Top on mobile: Analytics, Month switch config */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Real Stats card reflecting checkboxes & values */}
            <StatsCard tasks={tasks} />

            {/* Calendar scheduler selector */}
            <MonthSelector 
              selectedMonth={selectedMonth} 
              onMonthChange={(m) => {
                setSelectedMonth(m);
                setSelectedDay('all'); // reset day filter when month changes to avoid confusion
              }} 
              tasks={tasks}
            />

            {/* Achievement Trend chart - Recharts line chart */}
            <TrendChart tasks={tasks} />

            {/* Helpful Quotes/Tips block */}
            <div className="bg-emerald-50/55 dark:bg-emerald-950/15 border border-emerald-100 dark:border-emerald-950/30 rounded-2xl p-4 text-xs text-emerald-800 dark:text-emerald-300 space-y-2 transition-all">
              <span className="font-bold block text-emerald-900 dark:text-emerald-400 text-sm">💡 نصيحة تنظيمية:</span>
              <p className="leading-relaxed">
                قسّم مهامك الكبيرة إلى خطوات يومية صغيرة. تحديد أولوية المهام بلون مخصص والالتزام بشطبها فور إكمالها يرفع من دافعيتك ونسب التقدم طوال الشهر!
              </p>
            </div>
          </div>

          {/* Column for tasks and lists */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Dynamic Add / Edit form toggle panel */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <span>مهام شهر {getSelectedMonthName()}</span>
                    {selectedDay !== 'all' && (
                      <span className="text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-md">اليوم {selectedDay}</span>
                    )}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    تم تصفية <span className="font-bold text-slate-700 dark:text-slate-300">{filteredTasks.length}</span> من أصل <span className="font-bold text-slate-700 dark:text-slate-300">{tasks.length}</span> مهام إجمالية لـ <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{user?.email?.split('@')[0] || 'الضيف'}</span>.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportTasksToICS(tasks)}
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer shadow-sm"
                    id="export-ics-btn"
                    title="تصدير المهام لتقويم Google أو Apple"
                  >
                    <Calendar size={13} className="text-emerald-500 animate-pulse" />
                    <span>تصدير للتقويم (.ics)</span>
                  </button>

                  {!isFormOpen && (
                    <button
                      onClick={() => {
                        setEditingTask(null);
                        setIsFormOpen(true);
                      }}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-100 dark:shadow-none flex items-center gap-1.5 cursor-pointer"
                      id="trigger-add-form-btn"
                    >
                      <Plus size={16} />
                      <span>إضافة مهمة جديدة</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Collapsible Form Animation block */}
              <AnimatePresence>
                {isFormOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
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
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Filter and search control board */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm space-y-3.5 transition-all">
              
              {/* Search line */}
              <div className="relative">
                <Search className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن أي مهمة بالاسم أو تفاصيل الوصف..."
                  className="w-full pl-4 pr-10 py-2.5 bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                  id="task-search-input"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-[11px] font-bold cursor-pointer font-arabic"
                  >
                    مسح
                  </button>
                )}
              </div>

              {/* Select filters toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-50 dark:border-slate-800/60">
                
                {/* Left: Filter categories buttons map */}
                <div className="flex flex-wrap items-center gap-1.5 font-arabic">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-bold ml-1 flex items-center gap-1">
                    <Filter size={11} />
                    <span>الحالة:</span>
                  </span>
                  
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                      statusFilter === 'all' 
                        ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-sm' 
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    الكل
                  </button>
                  <button
                    onClick={() => setStatusFilter('pending')}
                    className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                      statusFilter === 'pending' 
                        ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40' 
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    المعلقة
                  </button>
                  <button
                    onClick={() => setStatusFilter('completed')}
                    className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                      statusFilter === 'completed' 
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40' 
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    المكتملة
                  </button>
                </div>

                {/* Right: Category filters options */}
                <div className="flex flex-wrap items-center gap-1.5 font-arabic">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-bold ml-1 flex items-center gap-1">
                    <SlidersHorizontal size={11} />
                    <span>أخرى:</span>
                  </span>

                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value as any)}
                    className="px-2 py-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-300 font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
                    id="priority-filter-select"
                  >
                    <option value="all" className="dark:bg-slate-900">كل الأولويات</option>
                    <option value="high" className="dark:bg-slate-900">عالية الأهمية</option>
                    <option value="medium" className="dark:bg-slate-900">متوسطة</option>
                    <option value="low" className="dark:bg-slate-900">منخفضة</option>
                  </select>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-2 py-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-300 font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
                    id="category-filter-select"
                  >
                    <option value="all" className="dark:bg-slate-900">كل الأقسام</option>
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id} className="dark:bg-slate-900">{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Timelines container */}
            <div className="space-y-6" id="tasks-timeline-container">
              {tasksLoading ? (
                <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
                  <span className="text-xs text-slate-400 font-semibold font-arabic">جاري استيراد مهامك سحابياً...</span>
                </div>
              ) : sortedDays.length > 0 ? (
                sortedDays.map((day) => {
                  const dayTasks = tasksByDay[day];
                  return (
                    <div key={day} className="space-y-2.5">
                      {/* Day Title Ribbon */}
                      <div className="flex items-center gap-2 px-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                        <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm font-arabic">
                          يوم {day} من شهر {getSelectedMonthName()}
                        </h3>
                        <span className="text-[11px] text-slate-400 dark:text-slate-400 bg-slate-200/50 dark:bg-slate-800/60 px-2 py-0.5 rounded-full font-bold">
                          {dayTasks.length} {dayTasks.length === 1 ? 'مهمة' : 'مهام'}
                        </span>
                      </div>

                      {/* Day Tasks List with Staggered Animations */}
                      <motion.div 
                        key={`${day}-${selectedMonth}-${selectedDay}-${statusFilter}-${priorityFilter}-${categoryFilter}-${searchQuery.length > 0}`}
                        variants={{
                          hidden: { opacity: 0 },
                          visible: {
                            opacity: 1,
                            transition: {
                              staggerChildren: 0.07,
                              delayChildren: 0.02
                            }
                          }
                        }}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 gap-3"
                      >
                        <AnimatePresence mode="popLayout">
                          {dayTasks.map((task) => (
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
                        </AnimatePresence>
                      </motion.div>
                    </div>
                  );
                })
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all"
                  id="empty-tasks-placeholder"
                >
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 text-slate-400/85 rounded-full flex items-center justify-center mb-4">
                    <LayoutGrid size={28} className="text-slate-300 dark:text-slate-600" />
                  </div>
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 text-base mb-1">لا توجد مهام حالياً</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm leading-relaxed mb-6">
                    {searchQuery || categoryFilter !== 'all' || priorityFilter !== 'all' || statusFilter !== 'all'
                      ? 'لا توجد مهام تطابق خيارات التصفية أو البحث. جرّب تخفيف قيود البحث.'
                      : `لا توجد مهام مسجلة لشهر ${getSelectedMonthName()} حتى الان. ابدأ بكتابة أولى أعمالك المجدولة!`}
                  </p>
                  
                  {!(searchQuery || categoryFilter !== 'all' || priorityFilter !== 'all' || statusFilter !== 'all') && (
                    <button
                      onClick={() => setIsFormOpen(true)}
                      className="px-5 py-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 rounded-xl transition-all cursor-pointer border border-emerald-100 dark:border-emerald-900/40 flex items-center gap-1.5"
                    >
                      <Plus size={14} />
                      <span>اضبط هدفك الأول لشهر {getSelectedMonthName()}</span>
                    </button>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
