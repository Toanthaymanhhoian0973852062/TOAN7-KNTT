import React, { useState, useEffect } from 'react';
import { QuizData, QuizMode } from '../types';
import { CheckCircle, ArrowLeft, Eye, EyeOff, Lightbulb, Clock, Check, X, AlertCircle, XCircle, Share2, RotateCcw, ArrowRight, ListChecks, Trophy, School, User, GraduationCap, Play, HelpCircle, Star } from 'lucide-react';
import { MathRenderer } from './MathRenderer';

interface QuizRunnerProps {
  quizData: QuizData;
  mode: QuizMode;
  onFinish: (score: number) => void;
  onBack: () => void;
}

const ASSESSMENT_DURATION = 60 * 60; // 60 minutes

export const QuizRunner: React.FC<QuizRunnerProps> = ({ quizData, mode, onFinish, onBack }) => {
  // Quiz State
  const [quizStarted, setQuizStarted] = useState(false);
  const [part1Answers, setPart1Answers] = useState<Record<number, number>>({});
  const [part2Answers, setPart2Answers] = useState<Record<string, boolean | null>>({});
  const [part3Answers, setPart3Answers] = useState<Record<number, string>>({});
  const [part3Revealed, setPart3Revealed] = useState<Record<number, boolean>>({}); 
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [instantFeedback, setInstantFeedback] = useState(mode === 'PRACTICE');
  const [timeLeft, setTimeLeft] = useState(ASSESSMENT_DURATION);

  // Student Info State
  const [studentName, setStudentName] = useState('');
  const [className, setClassName] = useState('');
  const [schoolName, setSchoolName] = useState('');

  // Timer countdown logic
  useEffect(() => {
    if (mode !== 'ASSESSMENT' || isSubmitted || !quizStarted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, isSubmitted, quizStarted]);

  // Auto-submit
  useEffect(() => {
    if (mode === 'ASSESSMENT' && quizStarted && timeLeft === 0 && !isSubmitted) {
      handleAutoSubmit();
    }
  }, [timeLeft, mode, isSubmitted, quizStarted]);

  const handleStartQuiz = () => {
    if (!studentName.trim() || !className.trim() || !schoolName.trim()) {
      alert("Vui lòng điền đầy đủ Họ tên, Lớp và Trường để bắt đầu!");
      return;
    }
    setQuizStarted(true);
  };

  const calculateScore = () => {
    let score = 0;
    quizData.part1.forEach(q => {
      if (part1Answers[q.id] === q.correctAnswerIndex) score += 0.25;
    });
    quizData.part2.forEach(q => {
      q.statements.forEach(s => {
        const key = `${q.id}-${s.id}`;
        if (part2Answers[key] === s.isTrue) score += 0.25;
      });
    });
    quizData.part3.forEach(q => {
      const userAns = part3Answers[q.id]?.trim().replace(',', '.');
      const correctAns = String(q.correctAnswer).trim().replace(',', '.');
      const userNum = parseFloat(userAns);
      const correctNum = parseFloat(correctAns);
      if (!isNaN(userNum) && !isNaN(correctNum)) {
         if (Math.abs(userNum - correctNum) < 0.0001) score += 0.5;
      } else if (userAns === correctAns) {
        score += 0.5;
      }
    });
    return Math.max(0, Math.min(score, 10));
  };

  const handleAttemptSubmit = () => setShowConfirmModal(true);

  const confirmManualSubmit = () => {
    setShowConfirmModal(false);
    setIsSubmitted(true);
    setShowResultModal(true);
  };

  const handleAutoSubmit = () => {
    setIsSubmitted(true);
    setShowResultModal(true);
  };

  const handleShare = async () => {
    const score = calculateScore();
    const text = `Tôi vừa đạt ${score}/10 điểm bài "${quizData.topic}" trên ứng dụng Toán 7 KNTT Master! 🏆`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Kết quả học tập', text: text }); } catch (error) { console.log('Error sharing:', error); }
    } else {
      try { await navigator.clipboard.writeText(text); alert('Đã sao chép kết quả!'); } catch (error) { console.error('Failed to copy:', error); }
    }
  };

  const cleanOptionText = (text: string) => text.replace(/^[A-Da-d0-9]+[.:)]\s*/, '').trim();
  const shouldShowResult = (isAnswered: boolean) => isSubmitted || (mode === 'PRACTICE' && instantFeedback && isAnswered);
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const renderExplanation = (text?: string) => {
    if (!text) return null;
    return (
      <div className="mt-4 mx-2 sm:mx-4 mb-2 p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex gap-3 animate-in fade-in slide-in-from-top-2">
         <div className="bg-white p-2 rounded-xl text-indigo-500 shadow-sm h-fit shrink-0">
            <Lightbulb className="w-5 h-5" />
         </div>
         <div className="flex-1">
            <h5 className="font-bold text-indigo-900 text-xs uppercase tracking-wider mb-1">Giải thích</h5>
            <div className="text-slate-700 text-sm leading-relaxed">
              <MathRenderer text={text} />
            </div>
         </div>
      </div>
    );
  };

  // --- INTRO SCREEN ---
  if (!quizStarted) {
    return (
      <div className="max-w-2xl mx-auto py-8 sm:py-12 px-4 animate-in fade-in duration-500">
        <button onClick={onBack} className="mb-6 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm flex items-center gap-2 transition-all hover:-translate-x-1 shadow-sm">
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>

        <div className="bg-white rounded-[2rem] shadow-xl shadow-indigo-100 overflow-hidden border border-indigo-50 relative">
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500"></div>
          
          <div className="p-8 sm:p-10 text-center">
             <div className="w-24 h-24 bg-indigo-50 rounded-full mx-auto flex items-center justify-center mb-6 shadow-inner">
               <User className="w-10 h-10 text-indigo-600" />
             </div>
             <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Thông tin thí sinh</h2>
             <p className="text-slate-500 mb-8">Điền tên vào phiếu để bắt đầu thử thách nhé!</p>

             <div className="space-y-5 text-left max-w-md mx-auto">
               <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Họ và tên</label>
                 <input 
                    type="text" 
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Nhập tên của bạn..."
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold text-slate-700 placeholder:font-normal"
                 />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Lớp</label>
                    <input 
                        type="text" 
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        placeholder="VD: 7A"
                        className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold text-slate-700 placeholder:font-normal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Trường</label>
                    <input 
                        type="text" 
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        placeholder="Tên trường"
                        className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold text-slate-700 placeholder:font-normal"
                    />
                  </div>
               </div>
             </div>

             <div className="mt-8 pt-6 border-t border-slate-100">
               <div className="flex items-center justify-center gap-2 text-indigo-600 bg-indigo-50 py-2 px-4 rounded-full w-fit mx-auto mb-6">
                  <Clock className="w-4 h-4" />
                  <span className="font-bold text-sm">Thời gian: {ASSESSMENT_DURATION / 60} phút</span>
               </div>
               
               <button 
                  onClick={handleStartQuiz}
                  className="w-full sm:max-w-xs mx-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-indigo-200 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
               >
                  <Play className="w-6 h-6 fill-current" /> Bắt đầu ngay
               </button>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // --- QUIZ PARTS ---
  const renderPart1 = () => (
    <section className="space-y-6">
      {/* Section Header - Red */}
      <div className="flex items-center gap-3 mb-4 px-2">
        <div className="bg-red-50 p-2 rounded-xl text-red-600">
           <ListChecks className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-red-600">Phần 1: Trắc nghiệm</h3>
          <p className="text-sm font-medium text-slate-400">Chọn 1 đáp án đúng nhất</p>
        </div>
      </div>
      
      <div className="grid gap-6">
        {quizData.part1.map((q, idx) => {
          const userVal = part1Answers[q.id];
          const isAnswered = userVal !== undefined;
          const showResult = shouldShowResult(isAnswered);
          const isCorrect = userVal === q.correctAnswerIndex;
          
          return (
            <div key={q.id} className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="p-6">
                <div className="flex gap-4">
                  {/* Question Number - Blue */}
                  <span className="flex-shrink-0 bg-blue-50 text-blue-600 w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-inner">
                    {idx + 1}
                  </span>
                  <div className="font-medium text-slate-800 text-lg pt-1">
                    <MathRenderer text={q.question} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 ml-0 sm:ml-14">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = userVal === optIdx;
                    const isThisCorrect = q.correctAnswerIndex === optIdx;
                    
                    // Base style
                    let wrapperClass = "relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center gap-3 group";
                    let labelClass = "font-bold w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors border";
                    
                    if (showResult) {
                       if (isThisCorrect) {
                          wrapperClass += " bg-emerald-50 border-emerald-400 z-10";
                          labelClass += " bg-emerald-500 border-emerald-500 text-white";
                       } else if (isSelected && !isThisCorrect) {
                          wrapperClass += " bg-rose-50 border-rose-400";
                          labelClass += " bg-rose-500 border-rose-500 text-white";
                       } else {
                          wrapperClass += " opacity-50 border-slate-100 bg-slate-50";
                          labelClass += " bg-white border-slate-200 text-slate-400";
                       }
                    } else {
                       if (isSelected) {
                          wrapperClass += " bg-blue-50 border-blue-500 shadow-sm";
                          labelClass += " bg-blue-500 border-blue-500 text-white";
                       } else {
                          // Default Option Style - Blue Tint
                          wrapperClass += " bg-white border-slate-100 hover:border-blue-200 hover:bg-blue-50";
                          labelClass += " bg-blue-50 border-blue-100 text-blue-600 group-hover:border-blue-300 group-hover:bg-blue-100";
                       }
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={isSubmitted || (mode === 'PRACTICE' && instantFeedback && isAnswered)}
                        onClick={() => setPart1Answers(prev => ({ ...prev, [q.id]: optIdx }))}
                        className={wrapperClass}
                      >
                         <span className={labelClass}>
                           {String.fromCharCode(65 + optIdx)}
                         </span>
                         <span className={`text-left text-base ${isSelected || (showResult && isThisCorrect) ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
                           <MathRenderer text={cleanOptionText(opt)} />
                         </span>
                         
                         {showResult && isThisCorrect && <CheckCircle className="w-5 h-5 text-emerald-500 absolute right-4" />}
                         {showResult && isSelected && !isThisCorrect && <XCircle className="w-5 h-5 text-rose-500 absolute right-4" />}
                      </button>
                    );
                  })}
                </div>
              </div>
              {showResult && renderExplanation(q.explanation)}
            </div>
          );
        })}
      </div>
    </section>
  );

  const renderPart2 = () => (
    <section className="space-y-6 mt-16">
      {/* Section Header - Red */}
      <div className="flex items-center gap-3 mb-4 px-2">
        <div className="bg-red-50 p-2 rounded-xl text-red-600">
           <CheckCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-red-600">Phần 2: Đúng / Sai</h3>
          <p className="text-sm font-medium text-slate-400">Xác định tính đúng sai của mỗi ý</p>
        </div>
      </div>

      <div className="grid gap-8">
        {quizData.part2.map((q, idx) => (
          <div key={q.id} className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-100">
            <h4 className="font-semibold text-slate-800 mb-6 flex gap-3 text-lg leading-relaxed">
              {/* Question Number - Blue */}
              <span className="bg-blue-50 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span><MathRenderer text={q.stem} /></span>
            </h4>

            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
                 <div className="col-span-8 sm:col-span-9">Mệnh đề</div>
                 <div className="col-span-2 sm:col-span-1 text-center">Đúng</div>
                 <div className="col-span-2 sm:col-span-1 text-center">Sai</div>
              </div>

              {q.statements.map((s) => {
                  const key = `${q.id}-${s.id}`;
                  const val = part2Answers[key];
                  const isAnswered = val !== undefined && val !== null;
                  const showResult = shouldShowResult(isAnswered);
                  const isMatch = val === s.isTrue;
                  
                  return (
                    <div key={s.id} className={`rounded-xl border transition-all ${
                        showResult 
                          ? (isMatch ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100')
                          : 'bg-slate-50/50 border-slate-100 hover:bg-white hover:shadow-sm'
                    }`}>
                      <div className="grid grid-cols-12 gap-2 p-4 items-center">
                        <div className="col-span-8 sm:col-span-9 text-slate-700 font-medium text-sm sm:text-base pr-2">
                           <MathRenderer text={s.statement} />
                        </div>
                        
                        <div className="col-span-2 sm:col-span-1 flex justify-center">
                          <label className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${
                             val === true 
                                ? 'bg-blue-500 border-blue-500 text-white shadow-md transform scale-105' 
                                : 'bg-white border-slate-200 text-slate-300 hover:border-blue-300'
                          } ${showResult && s.isTrue ? 'ring-2 ring-emerald-400 ring-offset-1' : ''}`}>
                             <input type="radio" name={`p2-${key}`} className="hidden" 
                                disabled={isSubmitted || (mode === 'PRACTICE' && instantFeedback && isAnswered)}
                                checked={val === true} onChange={() => setPart2Answers(prev => ({ ...prev, [key]: true }))} />
                             <span className="font-bold text-xs sm:text-sm">Đ</span>
                          </label>
                        </div>

                        <div className="col-span-2 sm:col-span-1 flex justify-center">
                          <label className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${
                             val === false 
                                ? 'bg-orange-500 border-orange-500 text-white shadow-md transform scale-105' 
                                : 'bg-white border-slate-200 text-slate-300 hover:border-orange-300'
                          } ${showResult && !s.isTrue ? 'ring-2 ring-emerald-400 ring-offset-1' : ''}`}>
                             <input type="radio" name={`p2-${key}`} className="hidden"
                                disabled={isSubmitted || (mode === 'PRACTICE' && instantFeedback && isAnswered)}
                                checked={val === false} onChange={() => setPart2Answers(prev => ({ ...prev, [key]: false }))} />
                             <span className="font-bold text-xs sm:text-sm">S</span>
                          </label>
                        </div>
                      </div>
                      
                      {showResult && s.explanation && (
                         <div className="px-4 pb-4">
                            <div className="pt-3 border-t border-dashed border-slate-200/50">
                               <div className="flex gap-2 text-xs text-slate-500">
                                  <Lightbulb className="w-3 h-3 text-amber-500 mt-0.5" />
                                  <div className="flex-1"><MathRenderer text={s.explanation} /></div>
                               </div>
                            </div>
                         </div>
                      )}
                    </div>
                  );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  const renderPart3 = () => (
    <section className="space-y-6 mt-16">
      {/* Section Header - Red */}
      <div className="flex items-center gap-3 mb-4 px-2">
        <div className="bg-red-50 p-2 rounded-xl text-red-600">
           <HelpCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-red-600">Phần 3: Trả lời ngắn</h3>
          <p className="text-sm font-medium text-slate-400">Điền số thích hợp vào chỗ trống</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quizData.part3.map((q, idx) => {
          const val = part3Answers[q.id] || '';
          const userNum = parseFloat(val.replace(',', '.'));
          const correctNum = parseFloat(String(q.correctAnswer).replace(',', '.'));
          const isMatch = !isNaN(userNum) && !isNaN(correctNum) && Math.abs(userNum - correctNum) < 0.0001;
          const revealed = part3Revealed[q.id] || false;
          const showResult = isSubmitted || revealed;

          return (
            <div key={q.id} className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="mb-6 flex-1">
                {/* Question Number - Blue */}
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide mb-3 inline-block">Câu {idx + 1}</span>
                <p className="font-medium text-slate-800 text-lg leading-relaxed"><MathRenderer text={q.question} /></p>
              </div>
              
              <div className="mt-auto pt-4 border-t border-slate-50">
                <div className="relative group">
                  <input
                    type="number"
                    step="any"
                    disabled={isSubmitted || (revealed && instantFeedback)}
                    value={val}
                    placeholder="Nhập kết quả..."
                    onChange={(e) => setPart3Answers(prev => ({ ...prev, [q.id]: e.target.value }))}
                    className={`w-full p-4 pr-12 rounded-2xl border-2 outline-none transition-all text-xl font-bold tracking-wide placeholder:font-normal placeholder:text-sm placeholder:text-slate-300 ${
                      showResult
                        ? isMatch
                          ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                          : 'border-rose-400 bg-rose-50 text-rose-700'
                        : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 text-slate-700'
                    }`}
                  />
                  {showResult && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      {isMatch ? <CheckCircle className="w-6 h-6 text-emerald-500" /> : <XCircle className="w-6 h-6 text-rose-500" />}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center mt-3 min-h-[2rem]">
                   {mode === 'PRACTICE' && !isSubmitted && !revealed && (
                    <button 
                      onClick={() => setPart3Revealed(prev => ({ ...prev, [q.id]: true }))}
                      className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      Kiểm tra
                    </button>
                  )}
                  {showResult && !isMatch && (
                    <div className="text-sm font-bold flex items-center gap-2 text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 animate-in slide-in-from-left-2">
                      <ArrowRight className="w-4 h-4" /> Đáp án: <span className="font-black text-lg">{q.correctAnswer}</span>
                    </div>
                  )}
                </div>
                {showResult && renderExplanation(q.explanation)}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );

  return (
    <div className="max-w-4xl mx-auto pb-40 px-2 sm:px-0">
      {/* HEADER */}
      <div className="sticky top-2 z-30 mb-8 mx-auto max-w-4xl">
         <div className="bg-white/80 backdrop-blur-md border border-white/40 shadow-lg shadow-indigo-100/50 rounded-2xl p-2 sm:p-3 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-slate-800">
                  <ArrowLeft className="w-5 h-5" />
               </button>
               <h2 className="text-base sm:text-lg font-bold text-slate-800 truncate max-w-[120px] sm:max-w-[300px]">{quizData.topic}</h2>
             </div>

             <div className="flex items-center gap-2 sm:gap-4">
                {mode === 'ASSESSMENT' && !isSubmitted && (
                   <div className={`flex items-center gap-2 font-mono font-bold text-lg px-4 py-1.5 rounded-xl border shadow-sm transition-colors duration-500 ${timeLeft < 300 ? 'text-white bg-rose-500 border-rose-600 animate-pulse' : 'text-indigo-600 bg-indigo-50 border-indigo-100'}`}>
                       <Clock className="w-5 h-5" />
                       {formatTime(timeLeft)}
                   </div>
                )}
                
                {isSubmitted ? (
                    <button 
                         onClick={() => setShowResultModal(true)}
                         className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-emerald-200 transition-all active:scale-95 flex items-center gap-2"
                    >
                       <Trophy className="w-4 h-4" /> <span className="hidden sm:inline">Kết quả</span>
                    </button>
                ) : (
                    <div className={`text-xs font-bold px-3 py-1 rounded-full border hidden sm:block ${mode === 'PRACTICE' ? 'bg-indigo-50 text-indigo-500 border-indigo-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>
                        {mode === 'PRACTICE' ? 'Luyện tập' : 'Kiểm tra'}
                    </div>
                )}
             </div>
         </div>
      </div>

      {/* QUIZ CONTENT */}
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
         {renderPart1()}
         {renderPart2()}
         {renderPart3()}
      </div>

      {/* BOTTOM ACTION BAR */}
      {!isSubmitted && (
        <div className="fixed bottom-6 left-0 right-0 z-20 flex justify-center px-4 pointer-events-none">
           <button
             onClick={handleAttemptSubmit}
             className="pointer-events-auto w-full max-w-md bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-bold py-4 px-8 rounded-full shadow-xl shadow-indigo-300/50 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 text-lg border-2 border-white/20"
           >
             <CheckCircle className="w-6 h-6" /> Nộp bài hoàn thành
           </button>
        </div>
      )}

      {/* MODALS */}
      {!isSubmitted && showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden p-8 animate-in zoom-in-95 duration-200 text-center">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner text-amber-500">
                <HelpCircle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">Đã xong chưa?</h3>
              <p className="text-slate-500 mb-8 font-medium">
                 {mode === 'ASSESSMENT' 
                    ? `Vẫn còn ${Math.ceil(timeLeft / 60)} phút nữa. Kiểm tra lại bài cho chắc ăn nhé!` 
                    : "Chắc chắn muốn nộp bài và xem điểm số ngay bây giờ?"}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="py-3 px-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Để xem lại
                </button>
                <button 
                  onClick={confirmManualSubmit}
                  className="py-3 px-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                  Nộp luôn
                </button>
              </div>
          </div>
        </div>
      )}

      {isSubmitted && showResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-900/80 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 relative my-auto">
            <div className={`p-10 text-center text-white relative overflow-hidden ${calculateScore() >= 8 || mode === 'PRACTICE' ? 'bg-gradient-to-b from-emerald-400 to-teal-600' : 'bg-gradient-to-b from-orange-400 to-rose-600'}`}>
               <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
               
               <div className="relative z-10">
                 <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/30 shadow-lg">
                    {calculateScore() >= 8 ? <Trophy className="w-12 h-12 text-yellow-300 drop-shadow-md" /> : <Star className="w-12 h-12 text-white drop-shadow-md" />}
                 </div>
                 <div className="text-7xl font-black mb-2 tracking-tighter drop-shadow-sm">{calculateScore()}<span className="text-4xl opacity-80 font-bold">.0</span></div>
                 <div className="inline-block px-4 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-sm font-bold uppercase tracking-wide">
                    {mode === 'PRACTICE' ? "Hoàn thành luyện tập" : calculateScore() >= 8 ? "Đạt yêu cầu" : "Chưa đạt"}
                 </div>
               </div>
            </div>

            <div className="p-8 bg-white space-y-6">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-slate-800 text-lg truncate">{studentName || 'Học sinh'}</h4>
                    <p className="text-slate-500 text-sm truncate">{className} • {schoolName}</p>
                  </div>
                </div>

                <div className="space-y-3">
                    <button 
                      onClick={() => onFinish(calculateScore())}
                      className={`w-full py-4 rounded-2xl font-bold text-lg text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3
                        {(calculateScore() >= 8 || mode === 'PRACTICE') 
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-indigo-200' 
                            : 'bg-slate-700 hover:bg-slate-800 shadow-slate-300'
                        }`}
                    >
                      {(calculateScore() >= 8 || mode === 'PRACTICE') ? (
                        <><Play className="w-5 h-5 fill-current" /> {mode === 'PRACTICE' ? "Bài tiếp theo" : "Học bài mới"}</>
                      ) : (
                        <><RotateCcw className="w-5 h-5" /> Thử lại lần nữa</>
                      )}
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setShowResultModal(false)}
                        className="py-3 px-4 rounded-xl font-bold text-slate-600 bg-slate-50 border-2 border-slate-100 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                          <ListChecks className="w-4 h-4" /> Xem bài sửa
                      </button>
                      
                      {mode === 'ASSESSMENT' && (
                        <button
                            onClick={handleShare}
                            className="py-3 px-4 rounded-xl font-bold text-indigo-600 bg-indigo-50 border-2 border-indigo-100 hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                            <Share2 className="w-4 h-4" /> Khoe điểm
                        </button>
                      )}
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};