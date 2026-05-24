import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Sparkles, 
  Send, 
  Trash2, 
  Loader2, 
  Bot, 
  Flame, 
  User, 
  Play, 
  Clock, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { Task } from '../types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

interface AIAssistantProps {
  tasks: Task[];
  language: 'ar' | 'en';
}

export default function AIAssistant({ tasks, language }: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [tabType, setTabType] = useState<'chat' | 'coaching'>('chat');

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Load cached conversations on mount
    const cached = localStorage.getItem('ai_assistant_chats');
    if (cached) {
      try { setMessages(JSON.parse(cached)); } catch (e) { }
    } else {
      // initial greeting
      const initial: ChatMessage[] = [
        {
          id: 'g-1',
          role: 'assistant',
          text: language === 'ar' 
            ? 'مرحباً بك! أنا مستشارك الشخصي للإنتاجية والذكاء الاصطناعي **سيرين AI (Serene AI)**. 🧠🌟\n\nكيف يمكنني مساعدتك اليوم؟ يمكنك:\n- كتابة أي سؤال للتنظيم الشخصي واستراتيجيات التركيز.\n- الضغط على **"تحليل الإنتاجية"** بالأسفل لقراءة المهام الحالية وإعطاء نصائح مخصصة.\n- الضغط على **"تخطيط وتوزيع يومي"** لاقتراح جدول زمني ذكي بناءً على قائمتك.'
            : 'Welcome! I am **Serene AI**, your high-end productivity companion. 🧠🌟\n\nHow can I shape your schedule today? You can:\n- Ask for smart organization and focus strategies.\n- Click **"Analyze Productivity"** below to assess your current list.\n- Click **"Auto-Plan Daily Schedule"** to construct an hour-by-hour timeline.'
        }
      ];
      setMessages(initial);
      localStorage.setItem('ai_assistant_chats', JSON.stringify(initial));
    }
  }, [language]);

  useEffect(() => {
    // Scroll to bottom
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [messages, isLoading]);

  const saveChats = (updated: ChatMessage[]) => {
    setMessages(updated);
    localStorage.setItem('ai_assistant_chats', JSON.stringify(updated));
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMsg.trim() || isLoading) return;

    setErrorText('');
    const userMsg: ChatMessage = {
      id: 'm-' + Date.now(),
      role: 'user',
      text: inputMsg.trim()
    };

    const newHistory = [...messages, userMsg];
    saveChats(newHistory);
    setInputMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMsg.text, 
          history: messages,
          language 
        })
      });
      const data = await res.json();
      if (data.error) {
        setErrorText(data.error);
      } else {
        const replyMsg: ChatMessage = {
          id: 'r-' + Date.now(),
          role: 'assistant',
          text: data.result
        };
        saveChats([...newHistory, replyMsg]);
      }
    } catch (err) {
      setErrorText(language === 'ar' ? 'حدث خطأ أثناء محاولة الاتصال بالخادم.' : 'Error contacting the AI server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Analyze productivity tasks list directly
  const handleAnalyzeProductivity = async () => {
    setIsLoading(true);
    setErrorText('');
    setTabType('chat');

    const userMsg: ChatMessage = {
      id: 'm-' + Date.now(),
      role: 'user',
      text: language === 'ar' ? 'حلل إنتاجيتي الحالية وقائمة مهامي من فضلك.' : 'Please analyze my current productivity and task list.'
    };

    const newHistory = [...messages, userMsg];
    saveChats(newHistory);

    try {
      const res = await fetch('/api/ai/analyze-productivity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks, language })
      });
      const data = await res.json();

      if (data.error) {
        setErrorText(data.error);
        setIsLoading(false);
      } else {
        const replyMsg: ChatMessage = {
          id: 'r-' + Date.now(),
          role: 'assistant',
          text: data.result
        };
        saveChats([...newHistory, replyMsg]);
      }
    } catch (e: any) {
      setErrorText(language === 'ar' ? 'فشل إرسال التحليل للذكاء الاصطناعي.' : 'Failed to analyze list via AI.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto Plan Day schedule directly from tasks list
  const handleAutoPlanDay = async () => {
    setIsLoading(true);
    setErrorText('');
    setTabType('chat');

    const userMsg: ChatMessage = {
      id: 'm-' + Date.now(),
      role: 'user',
      text: language === 'ar' ? 'اقترح علي جدولاً تفصيلياً مع تحديد الأولويات لليوم.' : 'Structure a smart time table matching my tasks for today.'
    };

    const newHistory = [...messages, userMsg];
    saveChats(newHistory);

    try {
      const res = await fetch('/api/ai/plan-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks, language })
      });
      const data = await res.json();

      if (data.error) {
        setErrorText(data.error);
        setIsLoading(false);
      } else {
        const replyMsg: ChatMessage = {
          id: 'r-' + Date.now(),
          role: 'assistant',
          text: data.result
        };
        saveChats([...newHistory, replyMsg]);
      }
    } catch (e: any) {
      setErrorText(language === 'ar' ? 'فشل تنسيق يومك الذكي.' : 'Failed to orchestrate schedule via AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    const initial: ChatMessage[] = [
      {
        id: 'g-1',
        role: 'assistant',
        text: language === 'ar' 
          ? 'تم مسح المحادثة السابقة بأمان. كيف يمكنني إلهامك للتنفيذ مجدداً؟'
          : 'Conversation cleared safely. Ask me anything to reshape your dashboard focus!'
      }
    ];
    saveChats(initial);
    setErrorText('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-140px)]">
      
      {/* Sidebar Quick-Action Controls */}
      <div className="lg:col-span-4 bg-[#1E293B]/40 rounded-3xl border border-white/5 p-6 flex flex-col gap-6 overflow-y-auto">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles size={16} className="text-[#6366F1]" />
            <span>{language === 'ar' ? 'الأدوات ومحركات الذكاء الاصطناعي' : 'AI Engine Presets'}</span>
          </h2>
          <p className="text-[11px] text-[#94A3B8] font-sans mt-1.5 leading-relaxed">
            {language === 'ar' 
              ? 'محركات الذكاء الاصطناعي المباشرة تقرأ قائمة مهامك الحالية وتعيد هندسة وقتك في ثوانٍ دون الحاجة لكتابة يدويّة.'
              : 'Direct integration queries your actual task array on the server and crafts instant advice.'}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleAutoPlanDay}
            disabled={isLoading || tasks.length === 0}
            className="w-full text-right p-4 rounded-2xl bg-[#1E293B] hover:bg-[#334155] border border-white/5 flex flex-col gap-1 transition-all cursor-pointer group disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-bold text-xs text-white group-hover:text-[#6366F1] transition-colors">
                {language === 'ar' ? '⏱️ تخطيط وتوزيع اليوم تفصيلياً' : '⏱️ Auto-Plan Daily Schedule'}
              </span>
              <Sparkles size={12} className="text-[#6366F1]" />
            </div>
            <p className="text-[10px] text-[#94A3B8] font-sans mt-1 leading-normal">
              {language === 'ar' ? 'يقرأ مهامك ويقترح خطة صباحية ومسائية دقيقة.' : 'Analyze tasks and build a structured morning/evening chronological list.'}
            </p>
          </button>

          <button
            onClick={handleAnalyzeProductivity}
            disabled={isLoading || tasks.length === 0}
            className="w-full text-right p-4 rounded-2xl bg-[#1E293B] hover:bg-[#334155] border border-white/5 flex flex-col gap-1 transition-all cursor-pointer group disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-bold text-xs text-white group-hover:text-purple-400 transition-colors">
                {language === 'ar' ? '📊 تحليل الإنتاجية وتخفيف التراكم' : '📊 Analyze Productivity Flow'}
              </span>
              <Flame size={12} className="text-purple-400" />
            </div>
            <p className="text-[10px] text-[#94A3B8] font-sans mt-1 leading-normal">
              {language === 'ar' ? 'مراجعة المماطلة والأولويات وتقديم نصائح تحسين مباشرة.' : 'Scrutinize incomplete steps and propose anti-procrastination strategies.'}
            </p>
          </button>
        </div>

        {/* Task list quick visual preview */}
        <div className="mt-auto bg-[#0F172A] p-4 rounded-2xl border border-white/5 space-y-3">
          <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider block">
            {language === 'ar' ? 'محتوى التحليل النشط' : 'SYSTEM ANALYTICS CONTEXT'}
          </span>
          <div className="flex justify-between text-xs text-[#CBD5E1]">
            <span>{language === 'ar' ? 'المهام الإجمالية المقروءة:' : 'Total tracked tasks:'}</span>
            <span className="font-mono font-bold text-white">{tasks.length}</span>
          </div>
          <div className="flex justify-between text-xs text-[#CBD5E1]">
            <span>{language === 'ar' ? 'قيد الانتظار:' : 'Pending queues:'}</span>
            <span className="font-mono font-bold text-yellow-400">{tasks.filter(t => !t.completed).length}</span>
          </div>
        </div>

      </div>

      {/* Main Conversational Chat Hub */}
      <div className="lg:col-span-8 bg-[#111827]/30 rounded-3xl border border-white/5 p-6 flex flex-col justify-between overflow-hidden h-full">
        
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[#6366F1] flex items-center justify-center shrink-0">
              <Bot size={16} />
            </div>
            <div>
              <h3 className="font-black text-sm text-white">{language === 'ar' ? 'المستشار الذكي سيرين AI' : 'Serene Assistant Hub'}</h3>
              <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>{language === 'ar' ? 'نشط ويقرأ بياناتك بأمان' : 'Interactive Gemini 3.5 Engine Active'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleClearHistory}
            className="p-2 rounded-xl text-[#475569] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            title={language === 'ar' ? 'مسح المحادثة' : 'Flush chats'}
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Message logs scroll content */}
        <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-1 min-h-0">
          {messages.map((msg) => {
            const isAI = msg.role === 'assistant';
            return (
              <div 
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${
                  isAI ? 'mr-auto self-start' : 'ml-auto self-end flex-row-reverse text-right md:-text-right'
                }`}
              >
                {/* avatar */}
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border text-xs ${
                  isAI 
                    ? 'bg-indigo-500/10 border-indigo-500/20 text-[#6366F1]' 
                    : 'bg-[#1E293B] border-white/5 text-white'
                }`}>
                  {isAI ? <Bot size={14} /> : <User size={14} />}
                </div>

                {/* message body */}
                <div className={`p-4 rounded-2xl text-xs space-y-1 overflow-x-auto ${
                  isAI 
                    ? 'bg-[#1E293B]/60 text-[#E2E8F0] border border-white/5' 
                    : 'bg-indigo-500 text-white font-sans'
                }`}>
                  {isAI ? (
                    <div className="markdown-body">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-[80%] mr-auto self-start">
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 border-indigo-500/20 text-[#6366F1] flex items-center justify-center shrink-0">
                <Loader2 size={14} className="animate-spin text-[#6366F1]" />
              </div>
              <div className="p-4 rounded-2xl bg-[#1E293B]/60 border border-white/5 text-[#94A3B8] text-xs flex items-center gap-2">
                <Loader2 size={12} className="animate-spin text-[#6366F1]" />
                <span>{language === 'ar' ? 'سيرين تراجع بياناتك وصياغة الحل الأمثل...' : 'Serene compiling response...'}</span>
              </div>
            </div>
          )}

          {errorText && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/10 text-xs text-red-400 font-sans mx-4 mt-2">
              {errorText}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input box */}
        <form onSubmit={handleSendMessage} className="bg-[#0F172A] border border-white/5 rounded-2xl p-2 flex items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder={language === 'ar' ? 'اسأل سيرين أي سؤال...' : 'Ask Serene coaching advice...'}
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            disabled={isLoading}
            className="w-full bg-transparent border-none text-xs text-white px-3 focus:outline-none focus:ring-0 font-sans"
          />
          <button
            type="submit"
            disabled={isLoading || !inputMsg.trim()}
            className="p-3 bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white rounded-xl hover:opacity-90 transition-all cursor-pointer disabled:opacity-40 shrink-0"
          >
            <Send size={14} />
          </button>
        </form>

      </div>

    </div>
  );
}
