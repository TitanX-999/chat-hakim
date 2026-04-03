/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { 
  Send, 
  Bot, 
  User, 
  Trash2, 
  Loader2, 
  Settings2,
  Sparkles,
  ChevronDown,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { cn } from '@/src/lib/utils';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

type UserLevel = 'beginner' | 'intermediate' | 'advanced';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userLevel, setUserLevel] = useState<UserLevel>('intermediate');
  const [showSettings, setShowSettings] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const systemInstruction = `
        أنت مساعد ذكي متطور (AI Chatbot) تم تصميمه ليكون مفيدًا، سريعًا، ودقيقًا.
        
        🔹 مهمتك:
        - الإجابة على أسئلة المستخدم بشكل واضح ومبسط.
        - تقديم شروحات مفهومة حسب مستوى المستخدم الحالي: ${userLevel === 'beginner' ? 'مبتدئ (شرح بسيط جداً، تجنب المصطلحات المعقدة)' : userLevel === 'intermediate' ? 'متوسط (توازن بين البساطة والعمق)' : 'متقدم (شرح تقني عميق ومفصل)'}.
        - اقتراح حلول عملية وقابلة للتطبيق.
        - استخدام لغة ودودة ومحترمة.

        🔹 أسلوبك:
        - اختصر المعلومات بدون فقدان الفائدة.
        - استعمل أمثلة عند الحاجة.
        - إذا لم تفهم السؤال، اطلب توضيحًا بدل إعطاء جواب خاطئ.
        - لا تعطي معلومات غير مؤكدة.

        🔹 تخصصك:
        - يمكنك الإجابة في مجالات متعددة (الدراسة، التقنية، المال، الألعاب، الإسلام...).
        - إذا طُلب منك شرح، قدمه خطوة بخطوة.

        🔹 قواعد مهمة:
        - لا تقدم محتوى ضار أو مخالف.
        - احترم جميع المستخدمين.
        - ركّز على إعطاء أفضل إجابة ممكنة.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: 'user', parts: [{ text: input.trim() }] }
        ],
        config: {
          systemInstruction,
        },
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text || "عذراً، لم أتمكن من معالجة طلبك.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Gemini Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white shadow-xl overflow-hidden sm:rounded-2xl sm:my-4 sm:h-[calc(100vh-2rem)]" dir="rtl">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500 p-2 rounded-xl">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">المساعد الذكي</h1>
            <p className="text-xs text-indigo-200">متصل وجاهز للمساعدة</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors relative"
            title="الإعدادات"
          >
            <Settings2 className="w-5 h-5" />
          </button>
          <button 
            onClick={clearChat}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors text-rose-400"
            title="مسح المحادثة"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Settings Overlay */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-slate-100 p-4 border-b border-slate-200 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Info className="w-4 h-4" />
                مستوى الشرح المفضل:
              </label>
              <div className="flex bg-white rounded-lg p-1 shadow-sm border border-slate-200">
                {(['beginner', 'intermediate', 'advanced'] as UserLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setUserLevel(level)}
                    className={cn(
                      "px-3 py-1 text-xs rounded-md transition-all",
                      userLevel === level 
                        ? "bg-slate-900 text-white shadow-sm" 
                        : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    {level === 'beginner' ? 'مبتدئ' : level === 'intermediate' ? 'متوسط' : 'متقدم'}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Area */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center mb-2">
              <Bot className="w-10 h-10 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">أهلاً بك! أنا مساعدك الذكي</h2>
            <p className="text-slate-500 max-w-sm">
              يمكنني مساعدتك في الدراسة، التقنية، المال، أو أي موضوع آخر يخطر ببالك. كيف يمكنني مساعدتك اليوم؟
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md mt-6">
              {[
                "اشرح لي كيف يعمل الذكاء الاصطناعي",
                "كيف يمكنني تحسين مهاراتي في البرمجة؟",
                "ما هي أفضل الطرق للادخار؟",
                "نصائح للدراسة بفعالية"
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="text-right p-3 text-sm bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-all text-slate-700 shadow-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id}
              className={cn(
                "flex gap-3 max-w-[85%]",
                msg.role === 'user' ? "mr-auto flex-row-reverse" : "ml-auto"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm",
                msg.role === 'user' ? "bg-slate-900" : "bg-indigo-600"
              )}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
              </div>
              
              <div className={cn(
                "p-4 rounded-2xl shadow-sm",
                msg.role === 'user' 
                  ? "bg-slate-900 text-white rounded-tr-none" 
                  : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
              )}>
                <div className="markdown-body">
                  <Markdown>{msg.content}</Markdown>
                </div>
                <div className={cn(
                  "text-[10px] mt-2 opacity-50",
                  msg.role === 'user' ? "text-left" : "text-right"
                )}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))
        )}
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3 ml-auto"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 mt-1 shadow-sm">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span className="text-sm text-slate-500 italic">جاري التفكير...</span>
            </div>
          </motion.div>
        )}
      </main>

      {/* Input Area */}
      <footer className="p-4 bg-white border-t border-slate-200">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اكتب سؤالك هنا..."
            className="flex-1 bg-slate-100 border-none rounded-2xl py-3 px-4 pr-12 focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute left-2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-md"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 rotate-180" />}
          </button>
        </form>
        <p className="text-[10px] text-center text-slate-400 mt-2">
          قد يرتكب الذكاء الاصطناعي بعض الأخطاء، يرجى التحقق من المعلومات الهامة.
        </p>
      </footer>
    </div>
  );
}

