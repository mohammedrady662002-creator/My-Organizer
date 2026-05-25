import React, { useMemo, useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';
import { 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  PieChart as PieIcon, 
  BarChart2
} from 'lucide-react';
import { Task } from '../types';

interface SaaSStatsProps {
  tasks: Task[];
  language: 'ar' | 'en';
}

export default function SaaSStats({ tasks, language }: SaaSStatsProps) {
  const currentMonthIdx = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonthIdx);

  const monthNamesAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // 1. Completion Rate Calculation (Filtered by selected month)
  const stats = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const monthlyTasks = tasks.filter(t => {
      const taskDate = new Date(t.createdAt || Date.now());
      return taskDate.getMonth() === selectedMonth && taskDate.getFullYear() === currentYear;
    });

    const total = monthlyTasks.length;
    const completed = monthlyTasks.filter(t => t.completed).length;
    const pending = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Calculate priorities count based on monthly tasks
    const high = monthlyTasks.filter(t => t.priority === 'high').length;
    const medium = monthlyTasks.filter(t => t.priority === 'medium').length;
    const low = monthlyTasks.filter(t => t.priority === 'low').length;

    return { total, completed, pending, rate, high, medium, low, monthlyTasks };
  }, [tasks, selectedMonth]);

  // 2. Data for monthly productivity chart (monthly distribution)
  const monthlyDistributionData = useMemo(() => {
    const monthNamesAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize 12 months for current year
    const currentYear = new Date().getFullYear();
    const monthMap = Array.from({ length: 12 }, (_, idx) => {
      return {
        monthIndex: idx,
        name: language === 'ar' ? monthNamesAr[idx] : monthNamesEn[idx],
        done: 0,
        total: 0
      };
    });

    tasks.forEach(t => {
      const taskDate = new Date(t.createdAt || Date.now());
      if (taskDate.getFullYear() === currentYear) {
        const tMonth = taskDate.getMonth();
        const found = monthMap.find(item => item.monthIndex === tMonth);
        if (found) {
          found.total += 1;
          if (t.completed) found.done += 1;
        }
      }
    });

    return monthMap;
  }, [tasks, language]);

  // 3. Category distribution data (Achievements percentage)
  const categoryChartData = useMemo(() => {
    const listMap: Record<string, { name: string; completed: number; total: number; percentage: number }> = {};
    
    let totalCompletedOverall = 0;

    stats.monthlyTasks.forEach(t => {
      const cat = t.category || 'personal';
      if (!listMap[cat]) {
        let label = cat;
        if (language === 'ar') {
          if (cat === 'personal') label = 'شخصي';
          else if (cat === 'work') label = 'المكتب والعمل';
          else if (cat === 'study') label = 'الدراسة والمقالات';
          else if (cat === 'health') label = 'صحي وبدني';
          else if (cat === 'worship') label = 'روحاني وعبادات';
        }
        listMap[cat] = { name: label, completed: 0, total: 0, percentage: 0 };
      }
      listMap[cat].total += 1;
      if (t.completed) {
        listMap[cat].completed += 1;
        totalCompletedOverall += 1;
      }
    });

    const data = Object.values(listMap).map(item => ({
      name: item.name,
      value: item.completed, // Use completed tasks as value to size pie slices relative to achievements
      total: item.total,
      percentage: totalCompletedOverall > 0 ? Math.round((item.completed / totalCompletedOverall) * 100) : 0,
      completionRate: item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0
    })).filter(item => item.total > 0);

    if (data.length === 0) {
      return [
        { name: language === 'ar' ? 'لا توجد مهام' : 'No Tasks', value: 1, percentage: 0, completionRate: 0, total: 0 }
      ];
    }
    
    return data;
  }, [tasks, language]);

  // Color arrays for category pie cells
  const COLORS = ['#6366F1', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899'];

  return (
    <div className="space-y-6">
      
      {/* Month Selection Header for Reports */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white font-sans flex items-center gap-2">
            <PieIcon size={20} className="text-[#6366F1]" />
            {language === 'ar' ? 'التقارير والإنجازات' : 'Performance Insights'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1 font-sans">
            {language === 'ar' ? 'متابعة مهامك ونسب الأقسام شهرياً' : 'Monitor task completion and category ratios monthly'}
          </p>
        </div>
        
        <div>
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-[#F1F5F9] dark:bg-[#0F172A] border border-slate-200/60 dark:border-white/10 text-slate-700 dark:text-[#CBD5E1] text-xs font-bold rounded-xl px-3 py-2 outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1E293B] transition-colors"
          >
            {monthNamesAr.map((mAr, idx) => (
              <option key={idx} value={idx}>
                {language === 'ar' ? mAr : monthNamesEn[idx]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dynamic Statistics bento grid widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            id: 'c-total',
            labelAr: 'المهام الإجمالية',
            labelEn: 'Total Scope Tasks',
            val: stats.total,
            bgClass: 'from-indigo-500/10 to-indigo-500/0 border-indigo-500/15',
            textClass: 'text-[#6366F1]',
            tag: language === 'ar' ? 'المسجلة بالكامل' : 'All lifetime nodes'
          },
          {
            id: 'c-done',
            labelAr: 'المهام المنجزة',
            labelEn: 'Completed Tasks',
            val: stats.completed,
            bgClass: 'from-emerald-500/10 to-emerald-500/0 border-emerald-500/15',
            textClass: 'text-emerald-400',
            tag: language === 'ar' ? 'أفعال ناجحة مكتملة' : 'Accomplished units'
          },
          {
            id: 'c-pending',
            labelAr: 'قيد المتابعة',
            labelEn: 'Pending Actions',
            val: stats.pending,
            bgClass: 'from-yellow-500/10 to-yellow-500/0 border-yellow-500/15',
            textClass: 'text-yellow-400',
            tag: language === 'ar' ? 'تنتظر التنشيط' : 'Awaiting checkoff'
          },
          {
            id: 'c-rate',
            labelAr: 'نسبة النجاح والالتزام',
            labelEn: 'Success Rate',
            val: `${stats.rate}%`,
            bgClass: 'from-purple-500/10 to-purple-500/0 border-purple-500/15',
            textClass: 'text-purple-400',
            tag: language === 'ar' ? 'متوسط نسبة التقدم' : 'Efficiency score'
          }
        ].map((widget) => (
          <div key={widget.id} className={`p-5 rounded-2xl bg-[#F1F5F9] dark:bg-[#1E293B] border border-slate-100 dark:border-white/5 shadow-sm dark:shadow-none bg-gradient-to-br ${widget.bgClass}`}>
            <span className="block text-[10px] font-bold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider">{language === 'ar' ? widget.labelAr : widget.labelEn}</span>
            <span className={`text-2xl font-black block mt-2 font-mono ${widget.textClass}`}>
              {widget.val}
            </span>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 block mt-1 font-sans">{widget.tag}</span>
          </div>
        ))}
      </div>

      {/* Visual Analytics graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Monthly Productivity Area Chart */}
        <div className="lg:col-span-8 bg-[#F1F5F9] dark:bg-[#1E293B] rounded-3xl border border-slate-100 dark:border-white/5 p-6 flex flex-col justify-between shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5 font-sans">
                <TrendingUp size={16} className="text-[#6366F1]" />
                <span>{language === 'ar' ? 'منحنى الإنجاز والإنتاجية الشهري' : 'Monthly Productivity Curve'}</span>
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-[#94A3B8] mt-0.5 font-sans">{language === 'ar' ? 'مقارنة المهام المكتملة مقابل المهام المنشأة لكل شهر في السنة' : 'Completed tasks compared to overall created scope per month'}</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={monthlyDistributionData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDone" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '11px', color: '#f8fafc' }}
                  labelStyle={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="total" name={language === 'ar' ? 'المهام الكلية' : 'Total scope'} stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="done" name={language === 'ar' ? 'المنجزة' : 'Done'} stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorDone)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Achievements Pie Widget */}
        <div className="lg:col-span-4 bg-[#F1F5F9] dark:bg-[#1E293B] rounded-3xl border border-slate-100 dark:border-white/5 p-6 flex flex-col justify-between shadow-sm dark:shadow-none">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5 mb-1 font-sans">
              <PieIcon size={16} className="text-purple-500 dark:text-purple-400" />
              <span>{language === 'ar' ? 'إنجازات الأقسام (بالنسبة)' : 'Section Achievements'}</span>
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-[#94A3B8] font-sans">{language === 'ar' ? 'نسب الإنجاز والمعدل لكل قسم' : 'Completion percentage per section'}</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center relative my-4">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '11px', color: '#f8fafc' }}
                  formatter={(value: any, name: any, props: any) => {
                    return [`${props.payload.percentage}% (${value} ${language === 'ar' ? 'منجزة' : 'done'})`, name];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center stat metric */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-slate-800 dark:text-white font-mono">{stats.completed}</span>
              <span className="text-[9px] text-[#64748B] font-bold uppercase">{language === 'ar' ? 'مهمة منجزة' : 'Done Total'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-1">
            {categoryChartData.map((c, i) => (
              <div key={i} className="flex flex-col border border-slate-100 dark:border-white/5 rounded-xl p-2.5 bg-slate-50 dark:bg-[#0F172A]">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 font-bold font-sans">{c.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono font-black text-slate-800 dark:text-white">
                  <span>{c.percentage}% <span className="text-[9px] text-slate-400 font-normal">({c.value}/{c.total})</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
