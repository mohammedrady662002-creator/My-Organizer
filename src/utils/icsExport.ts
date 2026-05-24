import { Task } from '../types';

/**
 * Triggers a browser download of the tasks as an iCalendar (.ics) format file,
 * highly compatible with Google Calendar, Apple Calendar, and Microsoft Outlook.
 */
export function exportTasksToICS(tasks: Task[]) {
  if (tasks.length === 0) return;

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Life Organizer Task Manager//AR//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  // Helper helper to ensure 2 digits padding
  const pad = (num: number) => String(num).padStart(2, '0');

  tasks.forEach((task) => {
    const year = task.year || 2026;
    const monthIndex = task.month - 1; // 0-indexed in JS
    const day = task.day;

    // Build start date
    const dateObj = new Date(year, monthIndex, day);
    
    // For all-day events, Google Calendar/Apple Calendar require DTEND to be the NEXT day
    const nextDate = new Date(dateObj);
    nextDate.setDate(dateObj.getDate() + 1);

    const dtstart = `${year}${pad(task.month)}${pad(day)}`;
    const dtend = `${nextDate.getFullYear()}${pad(nextDate.getMonth() + 1)}${pad(nextDate.getDate())}`;

    // Get real creation/stamp time or default 
    const nowStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    // Fallback safe ID generator
    const uniqueId = task.id || `local-${Math.random().toString(36).substring(2, 11)}`;
    const uid = `${uniqueId}@lifeorganizer.com`;

    // Helper to escape standard ICS characters
    const escapeText = (text: string) => 
      text
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\n/g, '\\n');

    const summary = escapeText(task.title);
    
    const priorityLabel = task.priority === 'high' ? '🔥 عالية' : task.priority === 'medium' ? '⚡ متوسطة' : '🟢 عادية';
    const statusLabel = task.completed ? '✅ مكتملة بنجاح' : '⏳ قيد الإنجاز';
    const categoryLabel = task.category ? `📌 تصنيف: ${task.category}` : '';

    let descriptionRaw = '';
    if (task.description) {
      descriptionRaw += `${task.description}\n\n`;
    }
    descriptionRaw += `الاستحقاق: ${day}/${task.month}/${year}\n`;
    descriptionRaw += `الوضعية: ${statusLabel}\n`;
    descriptionRaw += `الأهمية: ${priorityLabel}\n`;
    if (categoryLabel) {
      descriptionRaw += `${categoryLabel}\n`;
    }
    descriptionRaw += `تم التوليد بواسطة منظم الحياة العربي ❤️`;

    const description = escapeText(descriptionRaw);

    icsLines.push('BEGIN:VEVENT');
    icsLines.push(`UID:${uid}`);
    icsLines.push(`DTSTAMP:${nowStamp}`);
    icsLines.push(`DTSTART;VALUE=DATE:${dtstart}`);
    icsLines.push(`DTEND;VALUE=DATE:${dtend}`);
    icsLines.push(`SUMMARY:${summary}`);
    icsLines.push(`DESCRIPTION:${description}`);
    icsLines.push('CLASS:PUBLIC');
    icsLines.push('STATUS:CONFIRMED');
    icsLines.push('END:VEVENT');
  });

  icsLines.push('END:VCALENDAR');

  // Prefix with BOM to guarantee perfect Arabic character support in Outlook/Windows
  const icsString = '\uFEFF' + icsLines.join('\r\n');
  const fileBlob = new Blob([icsString], { type: 'text/calendar;charset=utf-8;' });
  const downloadUrl = URL.createObjectURL(fileBlob);

  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.setAttribute('download', 'منظم_الحياة_مهامي.ics');
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(downloadUrl);
}
