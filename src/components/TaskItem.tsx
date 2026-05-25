import React from 'react';
import { motion } from 'motion/react';
import { 
  Briefcase, 
  BookOpen, 
  User, 
  Heart, 
  Home, 
  ShoppingCart, 
  HelpCircle, 
  Trash2, 
  Check, 
  Calendar, 
  AlertCircle,
  GripVertical
} from 'lucide-react';
import { Task } from '../types';
import { CATEGORIES } from '../constants';
import { TRANSLATIONS } from '../translations';

interface TaskItemProps {
  key?: string;
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  isOverdue?: boolean;
  language?: 'ar' | 'en';
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragEnter?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  isDragging?: boolean;
  isDragOver?: boolean;
}

// Category Icon Helper with correct styling
function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const props = { className, size: 16 };
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

export default function TaskItem({ 
  task, 
  onToggle, 
  onDelete, 
  onEdit, 
  isOverdue = false, 
  language = 'ar',
  draggable,
  onDragStart,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDragEnd,
  onDrop,
  isDragging = false,
  isDragOver = false
}: TaskItemProps) {
  const category = CATEGORIES.find(c => c.id === task.category) || CATEGORIES[2]; // fallback to personal
  const t = TRANSLATIONS[language];

  // Language Aware Time Formatter
  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    const [hourStr, minStr] = timeStr.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minStr, 10);
    if (isNaN(hour) || isNaN(minute)) return timeStr;
    
    if (language === 'ar') {
      const ampm = hour >= 12 ? 'م' : 'ص';
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      const displayMinute = String(minute).padStart(2, '0');
      return `${displayHour}:${displayMinute} ${ampm}`;
    } else {
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      const displayMinute = String(minute).padStart(2, '0');
      return `${displayHour}:${displayMinute} ${ampm}`;
    }
  };

  // Priority styling and localized labels
  const getPriorityBadge = (p: Task['priority']) => {
    switch (p) {
      case 'high':
        return {
          bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-100',
          dot: 'bg-rose-500',
          label: t.priority_high
        };
      case 'medium':
        return {
          bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-100',
          dot: 'bg-amber-500',
          label: t.priority_medium
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/50',
          dot: 'bg-slate-400',
          label: t.priority_low
        };
    }
  };

  const priorityStyle = getPriorityBadge(task.priority);

  // Category Color Map (Safeguarding against dynamic Tailwind styles for stability)
  const getCategoryTheme = (color: string) => {
    switch (color) {
      case 'emerald': return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', iconBg: 'bg-emerald-500 text-white' };
      case 'blue': return { bg: 'bg-blue-50 text-blue-700 border-blue-100', iconBg: 'bg-blue-500 text-white' };
      case 'purple': return { bg: 'bg-purple-50 text-purple-700 border-purple-100', iconBg: 'bg-purple-500 text-white' };
      case 'rose': return { bg: 'bg-rose-50 text-rose-700 border-rose-100', iconBg: 'bg-rose-500 text-white' };
      case 'amber': return { bg: 'bg-amber-50 text-amber-700 border-amber-100', iconBg: 'bg-amber-500 text-white' };
      case 'indigo': return { bg: 'bg-indigo-50 text-indigo-700 border-indigo-100', iconBg: 'bg-indigo-500 text-white' };
      default: return { bg: 'bg-slate-50 text-slate-700 border-slate-100', iconBg: 'bg-slate-500 text-white' };
    }
  };

  const catTheme = getCategoryTheme(category.color);
  const localizedCatName = (t.cats_names as any)[category.id] || category.name;

  // Set up staggered framer motion item variants
  const itemVariants: any = {
    hidden: { opacity: 0, y: 30, scale: 0.96 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 140,
        damping: 18,
        mass: 1
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.96, 
      y: -20, 
      transition: { duration: 0.2, ease: 'easeOut' } 
    }
  };

  return (
    <motion.div 
      layout
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-10px' }}
      exit="exit"
      variants={itemVariants}
      className="relative overflow-hidden rounded-xl w-full group/swipe select-none" 
      style={{ touchAction: 'pan-y' }}
    >
      {/* BACKGROUND SWIPE ACTION TRACKS */}
      <div className="absolute inset-0 flex items-center justify-between pointer-events-none select-none z-0 rounded-xl">
        {/* Left Swipe Track (revealed on Swipe Right) -> Green/Complete */}
        <div className="absolute inset-y-0 left-0 right-1/2 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-l-xl flex items-center justify-start px-6 gap-2 text-white">
          <motion.div animate={{ scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
            <Check size={18} strokeWidth={3.5} />
          </motion.div>
          <span className="text-xs font-bold">
            {language === 'ar' ? 'شطب المهمة' : 'Complete Task'}
          </span>
        </div>
        
        {/* Right Swipe Track (revealed on Swipe Left) -> Red/Delete */}
        <div className="absolute inset-y-0 right-0 left-1/2 bg-gradient-to-l from-rose-600 to-rose-500 rounded-r-xl flex items-center justify-end px-6 gap-2 text-white">
          <span className="text-xs font-bold">
            {language === 'ar' ? 'حذف المهمة' : 'Delete Task'}
          </span>
          <motion.div animate={{ rotate: [-10, 10, -10] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <Trash2 size={16} />
          </motion.div>
        </div>
      </div>

      {/* FRONT DRAGGABLE LAYER */}
      <motion.div
        layout
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.5, right: 0.5 }}
        onDragEnd={(event, info) => {
          if (info.offset.x > 140) {
            onToggle(task.id);
          } else if (info.offset.x < -140) {
            onDelete(task.id);
          }
        }}
        whileHover={{ 
          y: -4, 
          scale: 1.005,
          boxShadow: '0 12px 24px -10px rgba(16, 185, 129, 0.12), 0 4px 6px -4px rgba(0, 0, 0, 0.04)' 
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`group relative flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl border transition-all duration-300 z-10 cursor-grab active:cursor-grabbing ${
          isDragging
            ? 'opacity-40 border-dashed border-emerald-400 dark:border-emerald-600 bg-slate-100/50 dark:bg-slate-950/20 shadow-none'
            : isDragOver
              ? 'scale-[1.01] ring-2 ring-emerald-400 dark:ring-emerald-500 border-emerald-400 dark:border-emerald-500 shadow-lg'
              : task.completed 
                ? 'opacity-85 bg-slate-50/50 dark:bg-slate-950/40 border-dashed border-slate-200 dark:border-slate-800' 
                : isOverdue
                  ? 'bg-rose-50/40 dark:bg-rose-950/10 border-rose-250 dark:border-rose-900/40 ring-1 ring-rose-100 dark:ring-rose-950/20 shadow-sm shadow-rose-50/50 hover:border-rose-400'
                  : 'border-slate-200/60 dark:border-slate-800 bg-[#F5F5F4] dark:bg-slate-900 hover:border-emerald-500/40'
        }`}
        id={`task-item-${task.id}`}
      >
        {/* Visual background indicator for high priority */}
        {task.priority === 'high' && !task.completed && (
          <div className={`absolute top-0 bottom-0 w-1 bg-rose-500 ${language === 'en' ? 'left-0 rounded-l-xl' : 'right-0 rounded-r-xl'}`} />
        )}
        
        {/* Overdue visual edge indicator */}
        {isOverdue && !task.completed && (
          <div className={`absolute top-0 bottom-0 w-1 bg-rose-500 dark:bg-rose-400 animate-pulse ${language === 'en' ? 'right-0 rounded-r-xl' : 'left-0 rounded-l-xl'}`} />
        )}
  
        {/* Main task content */}
        <div className="flex items-start gap-2.5 w-full md:w-3/4">
          {/* Grip Handler for dragging context (HTML5 Drag only from Grip) */}
          <div 
            draggable={draggable}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            className="flex-shrink-0 cursor-grab active:cursor-grabbing text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 p-1.5 transition-colors self-start mt-0.5 z-20"
            title={language === 'ar' ? 'اسحب لإعادة الترتيب' : 'Drag to reorder'}
          >
            <GripVertical size={16} />
          </div>

        {/* Custom Circular Checkbox Button */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.12, borderColor: '#10b981' }}
            whileTap={{ scale: 0.88 }}
            onClick={() => onToggle(task.id)}
            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer mt-1 ${
              task.completed
                ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                : isOverdue
                  ? 'border-rose-300 dark:border-rose-700 hover:border-emerald-500 bg-[#F5F5F4] dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/20'
                  : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 bg-[#F5F5F4] dark:bg-slate-900 hover:bg-emerald-50/30'
            }`}
            id={`toggle-btn-${task.id}`}
          >
            {task.completed && (
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              >
                <Check size={14} strokeWidth={3} className="text-white" />
              </motion.div>
            )}
          </motion.button>
          
          {/* Sparkle explosion on completion */}
          {task.completed && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: 0,
                    scale: 1.5,
                    x: Math.cos((i * Math.PI) / 2 + Math.PI / 4) * 24,
                    y: Math.sin((i * Math.PI) / 2 + Math.PI / 4) * 24,
                  }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400"
                />
              ))}
            </div>
          )}
        </div>
 
         {/* Text info and details */}
         <div className="flex-1 min-w-0">
           <div className="flex flex-wrap items-center gap-2 mb-1.5">
             {/* Task Title */}
             <div className="relative inline-block max-w-full">
               <h4
                 onClick={() => onToggle(task.id)}
                 className={`font-semibold text-slate-800 dark:text-slate-100 cursor-pointer text-[15px] leading-tight break-words select-none transition-all ${
                   task.completed ? 'text-slate-400/80 dark:text-slate-500 font-normal' : ''
                 } ${isOverdue ? 'text-rose-950 dark:text-rose-200' : ''}`}
               >
                 {task.title}
               </h4>
               {task.completed && (
                 <motion.span
                   initial={{ width: 0 }}
                   animate={{ width: '100%' }}
                   transition={{ type: 'tween', duration: 0.35, ease: 'easeOut' }}
                   className="absolute left-0 right-0 top-[55%] h-[2px] bg-slate-400 dark:bg-slate-500 rounded-full"
                 />
               )}
             </div>
           </div>

          {/* Description if exists */}
          {task.description && (
            <p className={`text-xs text-slate-500 dark:text-slate-400 mb-2 leading-relaxed break-words ${task.completed ? 'text-slate-400 dark:text-slate-500' : ''}`}>
              {task.description}
            </p>
          )}

          {/* Badges/Meta details */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Badge */}
            <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${catTheme.bg} dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700`}>
              <CategoryIcon name={category.icon} />
              <span>{localizedCatName}</span>
            </span>

            {/* Priority Badge */}
            <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${priorityStyle.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot}`} />
              <span>{priorityStyle.label}</span>
            </span>

            {/* Date Badge */}
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 px-2 py-0.5 rounded-md">
              <Calendar size={11} className="text-slate-400 dark:text-slate-500" />
              <span>{language === 'ar' ? `اليوم ${task.day} / الشهر ${task.month}` : `Day ${task.day} / Month ${task.month}`}</span>
            </span>

            {/* Time Badge */}
            {task.time && (
              <span className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 px-2 py-0.5 rounded-md font-sans">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock text-indigo-500 dark:text-indigo-400"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span>{language === 'ar' ? `الساعة ${formatTime(task.time)}` : `${t.hourLabel} ${formatTime(task.time)}`}</span>
              </span>
            )}

            {/* Overdue/Late Alert Badge */}
            {isOverdue && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 animate-pulse border border-rose-200 dark:border-rose-900/50">
                <AlertCircle size={11} className="text-rose-600 dark:text-rose-400" />
                <span>{t.overdueWarning}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions (Edit / Delete) */}
      <div className="flex items-center justify-end gap-1.5 w-full md:w-auto mt-4 md:mt-0 pt-3 md:pt-0 border-t border-slate-100 dark:border-slate-800/60 md:border-0">
        <motion.button
          whileHover={{ scale: 1.12, r: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onEdit(task)}
          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
          id={`edit-btn-${task.id}`}
          title={language === 'ar' ? 'تعديل المهمة' : 'Edit Task'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.12, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onDelete(task.id)}
          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
          id={`delete-btn-${task.id}`}
          title={language === 'ar' ? 'حذف المهمة' : 'Delete Task'}
        >
          <Trash2 size={16} />
        </motion.button>
      </div>
    </motion.div>
    </motion.div>
  );
}
