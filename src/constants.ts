import { Category, MonthInfo } from './types';

export const MONTHS: MonthInfo[] = [
  { value: 1, name: 'يناير (01)', days: 31 },
  { value: 2, name: 'فبراير (02)', days: 28 }, // 2026 is not a leap year
  { value: 3, name: 'مارس (03)', days: 31 },
  { value: 4, name: 'أبريل (04)', days: 30 },
  { value: 5, name: 'مايو (05)', days: 31 },
  { value: 6, name: 'يونيو (06)', days: 30 },
  { value: 7, name: 'يوليو (07)', days: 31 },
  { value: 8, name: 'أغسطس (08)', days: 31 },
  { value: 9, name: 'سبتمبر (09)', days: 30 },
  { value: 10, name: 'أكتوبر (10)', days: 31 },
  { value: 11, name: 'نوفمبر (11)', days: 30 },
  { value: 12, name: 'ديسمبر (12)', days: 31 },
];

export const CATEGORIES: Category[] = [
  { id: 'work', name: 'العمل', icon: 'Briefcase', color: 'emerald' },
  { id: 'study', name: 'الدراسة والتعليم', icon: 'BookOpen', color: 'blue' },
  { id: 'personal', name: 'الحياة الشخصية', icon: 'User', color: 'purple' },
  { id: 'worship', name: 'العبادات', icon: 'Star', color: 'cyan' },
  { id: 'health', name: 'الصحة والرياضة', icon: 'Heart', color: 'rose' },
  { id: 'family', name: 'العائلة والمنزل', icon: 'Home', color: 'amber' },
  { id: 'shopping', name: 'التسوق والمشتريات', icon: 'ShoppingCart', color: 'indigo' },
];

export const PRIORITIES = [
  { value: 'low', label: 'منخفضة', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  { value: 'medium', label: 'متوسطة', color: 'bg-amber-50 text-amber-700 border-amber-20 border dark:bg-amber-950/30 dark:text-amber-400' },
  { value: 'high', label: 'عالية الأهمية', color: 'bg-rose-50 text-rose-700 border-rose-20 border dark:bg-rose-950/30 dark:text-rose-400' },
];
