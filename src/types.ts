export interface Task {
  id: string;
  title: string;
  description?: string;
  day: number;      // 1 - 31
  month: number;    // 1 - 12 (1 = يناير, 12 = ديسمبر)
  year: number;     // 2026 default
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  time?: string;      // "HH:MM" 24h format or empty
  createdAt: string;
  userId?: string;
}

export type TaskFilter = 'all' | 'today' | 'month' | 'completed' | 'pending';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string; // Tailwind colors like emerald, blue, amber, etc.
}

export interface MonthInfo {
  value: number;
  name: string;
  days: number;
}
