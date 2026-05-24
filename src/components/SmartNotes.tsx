import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Save, 
  Sparkles, 
  FileText, 
  StickyNote, 
  Tag, 
  Loader2,
  BookOpen,
  ArrowRight
} from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  updatedAt: string;
}

interface SmartNotesProps {
  userId: string;
  language: 'ar' | 'en';
}

export default function SmartNotes({ userId, language }: SmartNotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Edit states
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('personal');

  // AI states
  const [aiSummary, setAiSummary] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    const cached = localStorage.getItem(`notes_${userId}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setNotes(parsed);
        if (parsed.length > 0) {
          selectNote(parsed[0]);
        }
      } catch (e) {}
    } else {
      // Seed default notes
      const initialNotes: Note[] = [
        {
          id: 'note-1',
          title: language === 'ar' ? 'أفكار لتطوير مهاراتي المهنية 🚀' : 'Skill Development & Career Goals 🚀',
          content: language === 'ar' 
            ? '١. تعلم الممارسات الحديثة لإطارات الواجهات مثل Next.js و React 19.\n٢. العمل بشكل مكثف على هندسة الأوامر (Prompt Engineering) واستثمار الذكاء الاصطناعي في الكود اليومي.\n٣. الالتزام بمتابعة دروس تصميم الـ UI/UX لمدة ٣ ساعات أسبوعياً لبناء حس بصري ممتاز.'
            : '1. Master Next.js 15, React 19 and advanced Tailwind configuration.\n2. Dedicate 3 hours weekly to explore clean UI/UX trends.\n3. Integrate server-side Gemini endpoints into production SaaS prototypes.',
          category: 'work',
          updatedAt: new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')
        },
        {
          id: 'note-2',
          title: language === 'ar' ? 'أشياء ممتعة يجب قراءتها 📚' : 'Reading List & Books 📚',
          content: language === 'ar'
            ? 'كتاب العادات الذرية "Atomic Habits" للكاتب جيمس كلير - يركز على الكيفية التي يمكن بها للتغييرات البسيطة أن تقدم مخرجات ثورية.\nأيضاً كتاب "Deep Work" لكال نيوبورت لفهم آليات التركيز الفائق.'
            : 'Explore "Atomic Habits" by James Clear and "Deep Work" by Cal Newport to reinforce micro-habits and focus.',
          category: 'study',
          updatedAt: new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')
        }
      ];
      setNotes(initialNotes);
      localStorage.setItem(`notes_${userId}`, JSON.stringify(initialNotes));
      if (initialNotes.length > 0) {
        selectNote(initialNotes[0]);
      }
    }
  }, [userId]);

  const saveNotes = (updated: Note[]) => {
    setNotes(updated);
    localStorage.setItem(`notes_${userId}`, JSON.stringify(updated));
  };

  const selectNote = (note: Note) => {
    setSelectedNoteId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditCategory(note.category);
    setAiSummary('');
    setAiError('');
  };

  const handleCreateNote = () => {
    const newNote: Note = {
      id: 'note-' + Date.now(),
      title: language === 'ar' ? 'ملاحظة جديدة غير معنونة' : 'Untitled New Note',
      content: '',
      category: 'personal',
      updatedAt: new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')
    };

    const updated = [newNote, ...notes];
    saveNotes(updated);
    selectNote(newNote);
  };

  const handleSaveActiveNote = () => {
    if (!selectedNoteId) return;

    const updated = notes.map(n => {
      if (n.id === selectedNoteId) {
        return {
          ...n,
          title: editTitle || (language === 'ar' ? 'ملاحظة جديدة' : 'Untitled Note'),
          content: editContent,
          category: editCategory,
          updatedAt: new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')
        };
      }
      return n;
    });

    saveNotes(updated);
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notes.filter(n => n.id !== id);
    saveNotes(updated);
    
    if (selectedNoteId === id) {
      if (updated.length > 0) {
        selectNote(updated[0]);
      } else {
        setSelectedNoteId(null);
        setEditTitle('');
        setEditContent('');
        setEditCategory('personal');
      }
    }
    setAiSummary('');
    setAiError('');
  };

  // call proxy summarization endpoint
  const handleAiSummarize = async () => {
    if (!editContent.trim()) return;
    setIsAiLoading(true);
    setAiSummary('');
    setAiError('');

    try {
      const res = await fetch('/api/ai/summarize-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteContent: editContent, language })
      });
      const data = await res.json();
      if (data.error) {
        setAiError(data.error);
      } else {
        setAiSummary(data.result);
      }
    } catch (e: any) {
      setAiError(language === 'ar' ? 'فشل الاتصال بخادم الذكاء الاصطناعي.' : 'Failed to connect to the AI server.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-[calc(100vh-140px)]">
      
      {/* Search and notes catalog sidebar container */}
      <div className="md:col-span-4 bg-[#1E293B]/40 rounded-3xl border border-white/5 p-4 flex flex-col gap-4 overflow-hidden h-full">
        
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <BookOpen size={16} className="text-[#6366F1]" />
            <span>{language === 'ar' ? 'كتالوج الملاحظات الذكية' : 'Smart Notebook'}</span>
          </h2>
          <button
            onClick={handleCreateNote}
            className="p-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-[#6366F1] border border-indigo-500/15 cursor-pointer transition-colors"
            title={language === 'ar' ? 'ملاحظة جديدة' : 'Create new note'}
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Search Input bar */}
        <div className="bg-[#0F172A] border border-white/5 rounded-xl px-3 py-2.5 flex items-center gap-2">
          <Search size={14} className="text-[#475569]" />
          <input
            type="text"
            placeholder={language === 'ar' ? 'ابحث في محتوى المفكرات...' : 'Search notebooks & thoughts...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none text-xs text-white focus:outline-none focus:ring-0 font-sans"
          />
        </div>

        {/* List of notes */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12 text-[#94A3B8] text-xs">
              <StickyNote className="mx-auto mb-2 text-[#334155]" size={32} />
              <p>{language === 'ar' ? 'لا توجد ملاحظات مطابقة' : 'No matches found'}</p>
            </div>
          ) : (
            filteredNotes.map((note) => {
              const isActive = selectedNoteId === note.id;
              return (
                <div
                  key={note.id}
                  onClick={() => selectNote(note)}
                  className={`w-full text-right md:text-right p-3.5 rounded-2xl border transition-all flex flex-col text-xs cursor-pointer relative group ${
                    isActive 
                      ? 'bg-indigo-500/10 border-[#6366F1]/30 text-white' 
                      : 'bg-[#1E293B]/40 hover:bg-white/5 border-transparent text-[#94A3B8]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      note.category === 'work' ? 'bg-emerald-500/10 text-emerald-400' :
                      note.category === 'study' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-purple-500/10 text-purple-400'
                    }`}>
                      {note.category === 'work' ? (language === 'ar' ? 'عمل' : 'Work') :
                       note.category === 'study' ? (language === 'ar' ? 'دراسة' : 'Study') :
                       (language === 'ar' ? 'شخصي' : 'Personal')}
                    </span>
                    <span className="text-[10px] text-[#475569] font-mono leading-none">{note.updatedAt}</span>
                  </div>

                  <h3 className="font-bold text-white text-xs mt-2.5 truncate w-full">{note.title}</h3>
                  <p className="text-[11px] text-[#64748B] mt-1.5 truncate w-full leading-normal font-sans">
                    {note.content || (language === 'ar' ? 'خاوية... صِف أفكارك هنا.' : 'Empty node... Write your thoughts.')}
                  </p>

                  <button
                    onClick={(e) => handleDeleteNote(note.id, e)}
                    className="absolute right-3 bottom-3 p-1.5 rounded-lg hover:bg-red-500/10 text-[#475569] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title={language === 'ar' ? 'حذف' : 'Remove idea'}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Editor & AI Workspace */}
      <div className="md:col-span-8 bg-[#111827]/30 rounded-3xl border border-white/5 p-6 flex flex-col gap-6 overflow-hidden h-full">
        {selectedNoteId ? (
          <div className="flex-1 flex flex-col gap-6 overflow-hidden">
            
            {/* Header / Category / Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex bg-[#0F172A] p-1 rounded-xl border border-white/5 gap-0.5">
                  {[
                    { id: 'personal', labelAr: 'شخصي', labelEn: 'Personal' },
                    { id: 'work', labelAr: 'عمل', labelEn: 'Work' },
                    { id: 'study', labelAr: 'دراسة', labelEn: 'Study' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setEditCategory(cat.id);
                        setTimeout(handleSaveActiveNote, 10);
                      }}
                      className={`px-3 py-1.5 text-[10px] rounded-lg font-bold transition-all cursor-pointer ${
                        editCategory === cat.id
                          ? 'bg-[#1E293B] text-white border border-white/5 shadow'
                          : 'text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      {language === 'ar' ? cat.labelAr : cat.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action utilities */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAiSummarize}
                  disabled={isAiLoading || !editContent.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 hover:border-[#6366F1] text-[#c7d2fe] hover:text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isAiLoading ? (
                    <Loader2 size={13} className="animate-spin text-[#6366F1]" />
                  ) : (
                    <Sparkles size={13} className="text-purple-400" />
                  )}
                  <span>{language === 'ar' ? 'تلخيص ذكي (AI)' : 'Summarize via AI'}</span>
                </button>

                <button
                  onClick={handleSaveActiveNote}
                  className="px-4 py-2 bg-[#1E293B] hover:bg-[#334155] border border-white/5 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Save size={13} />
                  <span>{language === 'ar' ? 'حفظ الملاحظة' : 'Save note'}</span>
                </button>
              </div>
            </div>

            {/* Input Titles and text-area */}
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-h-0 pr-1">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => {
                  setEditTitle(e.target.value);
                  setTimeout(handleSaveActiveNote, 10);
                }}
                placeholder={language === 'ar' ? 'مثال: خطة الـ ٣ سنوات الأخيرة' : 'e.g., 3-Year Master Strategy'}
                className="w-full bg-transparent border-none text-base md:text-lg font-black text-white focus:outline-none focus:ring-0 leading-tight placeholder-white/20"
              />

              <textarea
                value={editContent}
                onChange={(e) => {
                  setEditContent(e.target.value);
                  setTimeout(handleSaveActiveNote, 10);
                }}
                placeholder={language === 'ar' ? 'ابدأ تدوين مذكراتك وأفكارك بنمط حر هنا...' : 'Start recording your thoughts freely here...'}
                className="w-full flex-1 bg-transparent border-none text-xs text-[#CBD5E1] focus:outline-none focus:ring-0 leading-relaxed resize-none h-60 md:h-[220px] font-sans placeholder-white/10"
              />

              {/* AI Summary outcome panel */}
              <AnimatePresence>
                {(aiSummary || isAiLoading || aiError) && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="p-5 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-purple-500/20 relative mt-4 block"
                  >
                    <div className="absolute right-4 top-4 text-purple-400 opacity-60">
                      <Sparkles size={16} />
                    </div>

                    <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                      <span>{language === 'ar' ? 'ملخص الذكاء الاصطناعي الذكي' : 'Summarized Insights (AI)'}</span>
                    </h4>

                    {isAiLoading && (
                      <div className="flex items-center gap-2 py-4 text-xs text-[#94A3B8]">
                        <Loader2 size={14} className="animate-spin text-[#6366F1]" />
                        <span>{language === 'ar' ? 'جارٍ قراءة واستخلاص المفكرة بشكل ذكي...' : 'Extracting structure from note...'}</span>
                      </div>
                    )}

                    {aiError && (
                      <p className="text-xs text-red-400 font-sans">{aiError}</p>
                    )}

                    {aiSummary && (
                      <p className="text-xs leading-relaxed text-[#c7d2fe] whitespace-pre-line font-sans">
                        {aiSummary}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#94A3B8] text-center gap-3">
            <FileText className="text-[#1E293B]" size={48} />
            <div>
              <h3 className="font-bold text-white text-sm">{language === 'ar' ? 'لا توجد ملاحظة محددة' : 'No note open'}</h3>
              <p className="text-xs mt-1">{language === 'ar' ? 'اختر ملاحظة من القائمة أو اضغط على الإضافة لكتابة فكرة جديدة.' : 'Select a folder path or click the add button to structure a new thought.'}</p>
            </div>
            <button
              onClick={handleCreateNote}
              className="mt-2 px-4 py-2 bg-gradient-to-tr from-[#6366F1] to-[#4F46E5] hover:opacity-90 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-500/10"
            >
              <Plus size={14} />
              <span>{language === 'ar' ? 'إنشاء ملاحظة الآن' : 'Create Note'}</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
