import React, { useMemo } from 'react';
import { Task } from '../types';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { LineChart as ChartIcon, HelpCircle, Activity } from 'lucide-react';
import { TRANSLATIONS } from '../translations';

interface TrendChartProps {
  tasks: Task[];
  language?: 'ar' | 'en';
}

export default function TrendChart({ tasks, language = 'ar' }: TrendChartProps) {
  const t = TRANSLATIONS[language];
  
  // We want to calculate chronological stats for the past 12 months
  // Ending at May 2026 (the active year/month of our demo clock)
  const endYear = 2026;
  const endMonth = 5; // May

  const labelScheduled = language === 'ar' ? 'المهام المقررة' : 'Scheduled';
  const labelCompleted = language === 'ar' ? 'المهام المنجزة' : 'Completed';
  const labelRate = language === 'ar' ? 'نسبة الإنجاز (%)' : 'Completion Rate (%)';

  // Arabic & English months abbreviation map
  const MONTHS_MAP = useMemo(() => {
    return language === 'ar' 
      ? [
          'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
          'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ]
      : [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
  }, [language]);

  const chartData = useMemo(() => {
    const data = [];
    for (let i = 11; i >= 0; i--) {
      let m = endMonth - i;
      let y = endYear;
      
      // adjust if month values are <= 0 representing the prior year
      if (m <= 0) {
        m += 12;
        y -= 1;
      }

      // Filter tasks for this month and year
      const monthTasks = tasks.filter(t => t.month === m && (t.year || 2026) === y);
      const totalCount = monthTasks.length;
      const completedCount = monthTasks.filter(t => t.completed).length;
      
      const rate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      const labelLabel = `${MONTHS_MAP[m - 1]} ${y.toString().slice(-2)}`;

      data.push({
        name: labelLabel,
        [labelScheduled]: totalCount,
        [labelCompleted]: completedCount,
        [labelRate]: rate,
      });
    }
    return data;
  }, [tasks, MONTHS_MAP, labelScheduled, labelCompleted, labelRate]);

  // Custom premium Tooltip using Tailwind for light/dark support
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-xl shadow-lg text-xs space-y-1">
          <p className="font-bold text-slate-800 dark:text-slate-100 mb-2 border-b border-slate-100 dark:border-slate-800 pb-1 font-sans">{label}</p>
          {payload.map((item: any, idx: number) => {
            const isPercent = item.name.includes('%');
            return (
              <div key={idx} className="flex items-center justify-between gap-4 text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}:</span>
                </div>
                <span className="font-extrabold text-slate-900 dark:text-white font-sans">
                  {item.value}{isPercent ? '%' : ''}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const hasAnyData = tasks.length > 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <ChartIcon size={18} className="text-emerald-500" />
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-[16px]">{t.achievementTrend}</h3>
        </div>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-full border border-slate-100 dark:border-slate-800">
          {t.liveUpdate}
        </span>
      </div>

      {hasAnyData ? (
        <div className="w-full h-64 overflow-hidden" dir="ltr">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" className="hidden dark:block" />
              
              <XAxis 
                dataKey="name" 
                stroke="#94a3b8" 
                fontSize={9}
                tickLine={false}
                axisLine={false}
                dy={6}
              />
              
              <YAxis 
                stroke="#94a3b8" 
                fontSize={9}
                tickLine={false}
                axisLine={false}
              />
              
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '11px' }}
              />
              
              <Line 
                type="monotone" 
                dataKey={labelRate} 
                stroke="#6366f1" 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 1, fill: '#fff' }}
                activeDot={{ r: 6 }}
                name={labelRate}
              />
              <Line 
                type="monotone" 
                dataKey={labelCompleted} 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 1, fill: '#fff' }}
                activeDot={{ r: 5 }}
                name={labelCompleted}
              />
              <Line 
                type="monotone" 
                dataKey={labelScheduled} 
                stroke="#94a3b8" 
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={{ r: 2 }}
                name={labelScheduled}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 dark:bg-slate-800/30 rounded-xl">
          <Activity size={24} className="text-slate-300 dark:text-slate-600 mb-2 animate-pulse" />
          <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">{t.noChartData}</span>
        </div>
      )}

      <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-start gap-1 py-1 px-1 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
        <HelpCircle size={12} className="flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {t.chartQuote}
        </p>
      </div>
    </div>
  );
}
