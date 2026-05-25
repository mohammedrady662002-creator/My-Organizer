import React from 'react';
import { motion } from 'motion/react';
import { 
  LayoutGrid, 
  Flame, 
  Timer, 
  StickyNote, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  User,
  X,
  TrendingUp
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  user: any;
  onLogout: () => void;
  language: 'ar' | 'en';
}

export default function SaaSSidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  isOpenMobile,
  setIsOpenMobile,
  user,
  onLogout,
  language
}: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', nameAr: 'لوحة التحكم والمهام', nameEn: 'Dashboard & Tasks', icon: LayoutGrid },
    { id: 'pomodoro', nameAr: 'مؤقت البومودورو والتركيز', nameEn: 'Pomodoro Focus', icon: Timer },
    { id: 'stats', nameAr: 'التقارير والتحليلات البيانية', nameEn: 'Reports & Analytics', icon: TrendingUp },
  ];

  return (
    <div className={`h-full flex flex-col bg-slate-50 dark:bg-[#0F172A] text-slate-600 dark:text-[#94A3B8] relative border-slate-200 dark:border-white/5 transition-all duration-300 ${
      language === 'ar' ? 'border-l' : 'border-r'
    }`}>
      {/* Header / Logo */}
      <div className={`p-6 flex items-center justify-between border-b border-slate-200 dark:border-white/5 ${isCollapsed ? 'justify-center p-4' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6366F1] to-[#4F46E5] flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <Sparkles className="text-white w-5 h-5 animate-pulse" />
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <span className="text-slate-900 dark:text-white text-base font-black tracking-tight leading-none font-sans">ORGANIZED</span>
              <span className="text-[#6366F1] text-[10px] font-black tracking-widest font-sans mt-1">SaaS PLATFORM</span>
            </motion.div>
          )}
        </div>

        {/* Collapse Button (Desktop Only) */}
        {!isCollapsed && (
          <button 
            onClick={() => setIsCollapsed(true)}
            className="hidden md:flex p-1.5 rounded-lg border border-slate-200 dark:border-white/5 bg-white dark:bg-[#1E293B] text-slate-600 dark:text-white hover:bg-slate-100 dark:hover:bg-[#334155] cursor-pointer transition-colors"
          >
            {language === 'ar' ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}

        {/* Mobile Close Button (Mobile Drawer Only) */}
        {isOpenMobile && (
          <button 
            onClick={() => setIsOpenMobile(false)}
            className="md:hidden p-1.5 rounded-lg bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/5 text-slate-600 dark:text-white cursor-pointer hover:bg-slate-100 dark:hover:bg-[#334155]"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* User Status Card */}
      {!isCollapsed && user && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 mx-4 mt-6 rounded-2xl bg-white dark:bg-gradient-to-br dark:from-[#1E293B] dark:to-[#111827] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none relative overflow-hidden group shrink-0"
        >
          <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-indigo-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform" />
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 dark:border-indigo-500/30 flex items-center justify-center shrink-0">
              <User size={16} className="text-[#6366F1]" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">
                {user.user_metadata?.full_name || user.email?.split('@')[0] || (language === 'ar' ? 'مستخدم منظم' : 'Organizer User')}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-[#94A3B8] truncate leading-normal">
                {user.email || 'offline@organize.local'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Menu Options List */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsOpenMobile(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-sm transition-all relative cursor-pointer group ${
                isActive 
                  ? 'text-indigo-600 dark:text-white' 
                  : 'text-slate-600 dark:text-[#94A3B8] hover:text-indigo-600 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
              }`}
              title={isCollapsed ? (language === 'ar' ? item.nameAr : item.nameEn) : undefined}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeSideIndicator"
                  className={`absolute inset-0 bg-indigo-50 dark:bg-transparent dark:bg-gradient-to-r dark:from-indigo-500/10 dark:to-indigo-500/0 rounded-xl ${
                    language === 'ar' ? 'border-r-2 border-l-0 right-0' : 'border-l-2 border-r-0 left-0'
                  } border-[#6366F1]`}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <Icon size={18} className={`shrink-0 transition-transform group-hover:scale-110 relative z-10 ${isActive ? 'text-[#6366F1]' : 'text-slate-500 dark:text-[#94A3B8] group-hover:text-indigo-600 dark:group-hover:text-white'}`} />
              {!isCollapsed && (
                <span className="truncate relative z-10">
                  {language === 'ar' ? item.nameAr : item.nameEn}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-white/5 space-y-2 shrink-0">
        {isCollapsed ? (
          <button 
            onClick={() => setIsCollapsed(false)}
            className="w-full h-10 rounded-xl flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/5 cursor-pointer text-slate-500 dark:text-white"
            title={language === 'ar' ? 'توسيع القائمة' : 'Expand Sidebar'}
          >
            {language === 'ar' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : (
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold hover:text-[#FF4B4B] hover:bg-red-50 dark:hover:bg-red-500/10 border border-transparent hover:border-red-500/10 transition-all cursor-pointer group animate-none"
          >
            <LogOut size={15} className={`text-slate-500 dark:text-[#94A3B8] group-hover:text-[#FF4B4B] shrink-0 transition-transform ${
              language === 'ar' ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'
            }`} />
            <span>{language === 'ar' ? 'تسجيل الخروج' : 'Logout Workspace'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
