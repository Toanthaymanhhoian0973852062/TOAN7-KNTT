import React, { useState, useEffect } from 'react';
import { CURRICULUM } from './data/curriculum';
import { generateQuiz, generateMathNews } from './services/geminiService';
import { QuizRunner } from './components/QuizRunner';
import { NewsCard } from './components/NewsCard';
import { ChatSupport } from './components/ChatSupport';
import { AppScreen, UserProgress, QuizData, QuizMode, MathNews } from './types';
import { BookOpen, Lock, CheckCircle, PlayCircle, Star, Loader2, AlertCircle, Unlock, Sparkles, List, X, LayoutGrid } from 'lucide-react';

const STORAGE_KEY = 'math7_kntt_progress';
const NEWS_CACHE_KEY = 'math7_kntt_news_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export default function App() {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.DASHBOARD);
  const [mode, setMode] = useState<QuizMode>('ASSESSMENT');
  const [progress, setProgress] = useState<UserProgress>({ scores: {} });
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [news, setNews] = useState<MathNews | null>(null);
  const [newsLoading, setNewsLoading] = useState(false);
  const [showTOC, setShowTOC] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setProgress(JSON.parse(saved)); } catch (e) { console.error(e); }
    }

    const loadNews = async () => {
      const cachedNewsRaw = localStorage.getItem(NEWS_CACHE_KEY);
      if (cachedNewsRaw) {
        try {
          const cached = JSON.parse(cachedNewsRaw);
          if (Date.now() - cached.timestamp < CACHE_DURATION) {
            setNews(cached.data);
            return;
          }
        } catch (e) { console.error(e); }
      }

      setNewsLoading(true);
      try {
        const data = await generateMathNews();
        setNews(data);
        localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: data }));
      } catch (e) {
        setNews({
            title: "Hệ thống đang bận",
            content: "Hiện tại máy chủ AI đang quá tải. Bạn vẫn có thể làm bài tập bình thường nhé!",
            imageUrl: undefined
        });
      } finally {
        setNewsLoading(false);
      }
    };
    loadNews();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const handleLessonSelect = async (lessonId: string, title: string) => {
    if (mode === 'ASSESSMENT' && isLocked(lessonId)) {
      alert("Bạn cần hoàn thành bài trước với điểm số >= 8.0 để mở bài này!");
      return;
    }

    setScreen(AppScreen.LOADING);
    setActiveLessonId(lessonId);
    setError(null);

    try {
      const data = await generateQuiz(title, "Toán Lớp 7 - Kết nối tri thức");
      setQuizData(data);
      setScreen(AppScreen.QUIZ);
    } catch (err: any) {
      console.error(err);
      let errorMessage = "Không thể tạo đề thi. Vui lòng thử lại sau.";
      
      // Improve error messaging for user
      if (err.message && err.message.includes("quota")) {
        errorMessage = "Hệ thống AI đang hết hạn mức phục vụ. Vui lòng quay lại sau 1-2 phút.";
      } else if (err.message && (err.message.includes("API Key") || err.message.includes("VITE_API_KEY"))) {
        errorMessage = "Lỗi Cấu Hình: Chưa tìm thấy VITE_API_KEY trong cài đặt Vercel.";
      }
      
      setError(errorMessage);
      setScreen(AppScreen.DASHBOARD);
    }
  };

  const handleQuizFinish = (score: number) => {
    if (mode === 'ASSESSMENT' && activeLessonId) {
      setProgress(prev => {
        const currentBest = prev.scores[activeLessonId] || 0;
        return {
          ...prev,
          scores: { ...prev.scores, [activeLessonId]: Math.max(currentBest, score) }
        };
      });
    }
    setScreen(AppScreen.DASHBOARD);
    setQuizData(null);
    setActiveLessonId(null);
  };

  const isLocked = (lessonId: string) => {
    if (lessonId === 'l1.1') return false;
    let prevLessonId: string | null = null;
    let found = false;
    for (const chapter of CURRICULUM) {
      for (const lesson of chapter.lessons) {
        if (lesson.id === lessonId) { found = true; break; }
        prevLessonId = lesson.id;
      }
      if (found) break;
    }
    if (!prevLessonId) return false;
    const prevScore = progress.scores[prevLessonId] || 0;
    return prevScore < 8.0;
  };

  const getLessonStatus = (lessonId: string) => {
    if (mode === 'PRACTICE') return 'UNLOCKED';
    if (isLocked(lessonId)) return 'LOCKED';
    const score = progress.scores[lessonId];
    if (score === undefined) return 'UNLOCKED';
    if (score >= 8.0) return 'PASSED';
    return 'FAILED';
  };

  const scrollToChapter = (chapterId: string) => {
    setShowTOC(false);
    const element = document.getElementById(`chapter-${chapterId}`);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  if (screen === AppScreen.LOADING) {
    return (
      <div className="min-h-screen bg-indigo-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center max-w-sm text-center">
            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-6" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Đang soạn đề...</h2>
            <p className="text-slate-500">AI đang chuẩn bị các câu hỏi thú vị cho bạn. Đợi xíu nhé! 🚀</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-nunito relative selection:bg-indigo-100 selection:text-indigo-700">
      {screen === AppScreen.QUIZ && quizData ? (
        <div className="min-h-screen bg-slate-50">
           <QuizRunner 
            quizData={quizData} 
            mode={mode}
            onFinish={handleQuizFinish} 
            onBack={() => setScreen(AppScreen.DASHBOARD)}
          />
        </div>
      ) : (
        <>
          {/* Modern Header */}
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-indigo-100 shadow-sm transition-all">
            <div className="max-w-4xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-600 to-violet-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-200">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-xl md:text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700">Toán 7 Master</h1>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowTOC(true)}
                    className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all active:scale-95"
                  >
                    <List className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main className="max-w-4xl mx-auto px-4 py-8 pb-32 space-y-8">
            {/* Mode Switcher */}
            <div className="bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm flex relative">
                <button 
                  onClick={() => setMode('ASSESSMENT')}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 relative z-10 ${mode === 'ASSESSMENT' ? 'text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  {mode === 'ASSESSMENT' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl -z-10 animate-in fade-in zoom-in-95 duration-200"></div>
                  )}
                  <Star className="w-4 h-4 fill-current" /> Lộ trình Chính
                </button>
                <button 
                  onClick={() => setMode('PRACTICE')}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 relative z-10 ${mode === 'PRACTICE' ? 'text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                   {mode === 'PRACTICE' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl -z-10 animate-in fade-in zoom-in-95 duration-200"></div>
                  )}
                  <Sparkles className="w-4 h-4 fill-current" /> Luyện Tự Do
                </button>
            </div>

            {error && (
              <div className="bg-rose-50 text-rose-600 px-4 py-4 rounded-2xl border border-rose-100 flex items-start gap-3 font-medium text-sm animate-in fade-in slide-in-from-top-2 shadow-sm">
                 <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /> 
                 <div>
                   <span className="font-bold block mb-1">Đã xảy ra lỗi!</span>
                   {error}
                 </div>
              </div>
            )}

            <NewsCard news={news} loading={newsLoading} />

            {mode === 'PRACTICE' && (
              <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-100 rounded-2xl p-5 flex gap-4 text-violet-800 text-sm shadow-sm">
                <div className="bg-white p-2 rounded-full h-fit shadow-sm text-violet-500"><Unlock className="w-5 h-5" /></div>
                <div>
                  <h4 className="font-bold text-violet-900 mb-1">Chế độ mở khóa toàn bộ</h4>
                  <p className="opacity-80">Thoải mái chọn bất kỳ bài nào để ôn tập. Điểm số sẽ không được lưu vào hồ sơ chính.</p>
                </div>
              </div>
            )}

            {/* Curriculum List */}
            <div className="space-y-8">
              {CURRICULUM.map((chapter) => (
                <div key={chapter.id} className="scroll-mt-32" id={`chapter-${chapter.id}`}>
                  <div className="flex items-center gap-3 mb-4 sticky top-[72px] bg-[#F8FAFC]/90 backdrop-blur-sm py-2 z-10">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <LayoutGrid className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800">{chapter.title}</h2>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {chapter.lessons.map((lesson) => {
                      const status = getLessonStatus(lesson.id);
                      const score = progress.scores[lesson.id];
                      
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => handleLessonSelect(lesson.id, lesson.title)}
                          disabled={status === 'LOCKED'}
                          className={`group relative text-left p-5 rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col justify-between h-full
                            ${status === 'LOCKED' 
                              ? 'bg-slate-100/50 border-slate-200 grayscale opacity-80 cursor-not-allowed' 
                              : 'bg-white border-slate-100 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100 hover:-translate-y-1'
                            }
                          `}
                        >
                          {/* Card Content */}
                          <div className="relative z-10 w-full">
                            <div className="flex justify-between items-start mb-3">
                               <div className={`p-2 rounded-xl ${status === 'LOCKED' ? 'bg-slate-200 text-slate-400' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors'}`}>
                                  {status === 'LOCKED' ? <Lock className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                               </div>
                               {mode === 'ASSESSMENT' && status === 'PASSED' && (
                                  <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-current" /> {score}
                                  </div>
                               )}
                            </div>
                            
                            <h3 className={`font-bold text-base leading-tight mb-1 ${status === 'LOCKED' ? 'text-slate-500' : 'text-slate-800 group-hover:text-indigo-700'}`}>
                              {lesson.title.split(':')[0]}
                            </h3>
                            <p className="text-sm text-slate-500 line-clamp-2">{lesson.title.split(':')[1]}</p>
                          </div>

                          {/* Decorative Background Gradient on Hover */}
                          {status !== 'LOCKED' && (
                             <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center pt-8 pb-4">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Toán 7 KNTT Master • {new Date().getFullYear()}</p>
            </div>
          </main>

          {/* Table of Contents Modal */}
          {showTOC && (
            <div className="fixed inset-0 z-50 flex justify-end">
              <div 
                className="absolute inset-0 bg-indigo-900/20 backdrop-blur-sm transition-opacity" 
                onClick={() => setShowTOC(false)}
              />
              <div className="relative w-full max-w-xs bg-white h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300 border-l border-slate-100">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-slate-800">Mục Lục</h3>
                  <button onClick={() => setShowTOC(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"><X className="w-6 h-6" /></button>
                </div>
                <div className="space-y-1">
                  {CURRICULUM.map((chapter) => (
                    <button
                      key={chapter.id}
                      onClick={() => scrollToChapter(chapter.id)}
                      className="w-full text-left px-4 py-3 rounded-xl hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 font-medium text-sm transition-all border border-transparent hover:border-indigo-100 group flex items-center gap-3"
                    >
                      <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-500 group-hover:bg-indigo-200 group-hover:text-indigo-700 flex items-center justify-center text-xs font-bold">
                        {chapter.id.replace('chap', '')}
                      </span>
                      <span className="truncate">{chapter.title.split(':')[1]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <ChatSupport />
        </>
      )}
    </div>
  );
}