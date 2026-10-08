import React, { useState } from 'react';
import type { QuizDifficulty, QuizQuestion, TopicQuizData } from '../types/quiz';
import { TOPIC_QUIZZES } from '../data/quizzes';
import { sound } from '../utils/audio';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  Award,
  Cpu,
  Shuffle,
  Lightbulb,
  Check,
  RefreshCw,
  Zap,
} from 'lucide-react';

interface QuizViewProps {
  topicId: string;
  topicTitle: string;
}

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const QuizView: React.FC<QuizViewProps> = ({ topicId, topicTitle }) => {
  const quizData: TopicQuizData | undefined = TOPIC_QUIZZES[topicId];

  const [difficulty, setDifficulty] = useState<QuizDifficulty | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // User's answer for the current question
  // string (block fill / concept fill), number (multiple choice / diagnostic), string[] (step order)
  const [currentAnswer, setCurrentAnswer] = useState<string | number | string[] | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Score & History for review
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<
    Array<{
      question: QuizQuestion;
      userAnswer: string | number | string[] | null;
      isCorrect: boolean;
    }>
  >([]);
  const [isFinished, setIsFinished] = useState(false);

  // Start / Reset Quiz Session with 5 randomly sampled questions
  const startQuizSession = (chosenDifficulty: QuizDifficulty) => {
    if (!quizData) return;
    const pool = chosenDifficulty === 'beginner' ? quizData.beginner : quizData.practical;
    if (!pool || pool.length === 0) return;

    // Shuffle and pick 5 questions
    const shuffledPool = shuffleArray(pool);
    const selectedFive = shuffledPool.slice(0, Math.min(5, shuffledPool.length));

    // Also shuffle options for each question so choice positions vary (except step-order correct answer logic)
    const randomizedQuestions = selectedFive.map(q => {
      if (q.format === 'step-order') {
        // Shuffle options for step ordering so they don't start in correct order
        return { ...q, options: shuffleArray(q.options) };
      }
      if (q.format === 'code-block-fill' || q.format === 'concept-fill') {
        return { ...q, options: shuffleArray(q.options) };
      }
      if (q.format === 'multiple-choice' || q.format === 'bug-diagnostic') {
        // For multiple choice, map options and update correctAnswer index accordingly
        const correctIndex = typeof q.correctAnswer === 'number' ? q.correctAnswer : 0;
        const correctText = q.options[correctIndex];
        const shuffledOpts = shuffleArray(q.options);
        const newCorrectIndex = shuffledOpts.indexOf(correctText);
        return {
          ...q,
          options: shuffledOpts,
          correctAnswer: newCorrectIndex,
        };
      }
      return q;
    });

    setDifficulty(chosenDifficulty);
    setQuestions(randomizedQuestions);
    setCurrentIndex(0);
    setCurrentAnswer(null);
    setIsAnswerChecked(false);
    setShowHint(false);
    setScore(0);
    setHistory([]);
    setIsFinished(false);
    sound.playClick(750);
  };

  const currentQ: QuizQuestion | undefined = questions[currentIndex];

  // Helper to check correctness
  const checkCurrentAnswerCorrectness = (): boolean => {
    if (!currentQ || currentAnswer === null) return false;

    if (currentQ.format === 'code-block-fill' || currentQ.format === 'concept-fill') {
      const expected = String(currentQ.correctAnswer).trim();
      const user = String(currentAnswer).trim();
      return user === expected;
    }

    if (currentQ.format === 'multiple-choice' || currentQ.format === 'bug-diagnostic') {
      return Number(currentAnswer) === Number(currentQ.correctAnswer);
    }

    if (currentQ.format === 'step-order') {
      const expectedArr = currentQ.correctAnswer as string[];
      const userArr = currentAnswer as string[];
      if (!Array.isArray(userArr) || userArr.length !== expectedArr.length) return false;
      return userArr.every((step, idx) => step === expectedArr[idx]);
    }

    return false;
  };

  const handleCheckAnswer = () => {
    if (!currentQ || currentAnswer === null) return;
    const isCorrect = checkCurrentAnswerCorrectness();
    setIsAnswerChecked(true);

    if (isCorrect) {
      setScore(prev => prev + 1);
      sound.playSuccess();
    } else {
      sound.playCollision();
    }

    setHistory(prev => [
      ...prev,
      {
        question: currentQ,
        userAnswer: currentAnswer,
        isCorrect,
      },
    ]);
  };

  const handleNextQuestion = () => {
    sound.playClick(600);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setCurrentAnswer(null);
      setIsAnswerChecked(false);
      setShowHint(false);
    } else {
      setIsFinished(true);
      sound.playSuccess();
    }
  };

  // If no quiz data exists for this topic yet
  if (!quizData) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-slate-400">
        <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-base font-semibold text-slate-300">แบบทดสอบสำหรับหัวข้อนี้กำลังอยู่ในระหว่างการจัดเตรียม</p>
      </div>
    );
  }

  // SCREEN 1: DIFFICULTY SELECTION SCREEN
  if (difficulty === null) {
    return (
      <div className="space-y-6">
        {/* Intro Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ระบบสุ่ม 5 ข้อต่อครั้ง • คลังข้อสอบเชิงลึก</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                แบบทดสอบวัดความเข้าใจ: {topicTitle}
              </h2>
              <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-3xl leading-relaxed">
                เลือกระดับความท้าทายที่คุณต้องการ ระบบจะสุ่มเลือก 5 คำถามจากคลังข้อสอบ 
                โดย<strong>ไม่มีการพิมพ์ข้อความ</strong> ใช้การคลิกเลือกช้อยส์และบล็อกคำสั่งที่สะดวก รวดเร็ว และแม่นยำ
              </p>
            </div>
          </div>
        </div>

        {/* 2 Level Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Level 1: Beginner */}
          <div className="bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-500/60 rounded-3xl p-6 sm:p-8 transition-all hover:shadow-2xl hover:shadow-emerald-500/10 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                  🌱 ระดับเริ่มต้น (Foundational)
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {quizData.beginner.length} ข้อในคลัง (สุ่ม 5 ข้อ)
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                  เน้นเติมคำ & เติมบล็อกโค้ดพื้นฐาน
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                  ทดสอบความเข้าใจแกนหลัก คำศัพท์เฉพาะทาง และเติมช่องว่างบล็อกโค้ดที่ขาดหายไป 
                  เหมาะสำหรับผู้ที่ต้องการทบทวนเนื้อหาและตรวจสอบว่าเข้าใจกลไกหลักของบทเรียนถูกต้องหรือไม่
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>เติมบล็อกโค้ด/คำศัพท์ลงในช่องว่างด้วยการคลิกเลือก</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>เข้าใจ Big-O, สาเหตุ Frame Stutter, และคำสั่งสำคัญ</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>ไม่ต้องพิมพ์คีย์บอร์ด — ตอบง่ายและมีเสียงเอฟเฟกต์</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => startQuizSession('beginner')}
              className="mt-6 w-full py-3.5 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all group-hover:scale-[1.02]"
            >
              <Zap className="w-4 h-4" />
              <span>เริ่มทำแบบทดสอบระดับเริ่มต้น (5 ข้อ)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Level 2: Practical / Deep-Dive */}
          <div className="bg-slate-900/90 border border-indigo-500/30 hover:border-indigo-500/60 rounded-3xl p-6 sm:p-8 transition-all hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                  ⚡ เน้นปฏิบัติจริง & เชิงลึก (Practical Engine)
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {quizData.practical.length} ข้อในคลัง (สุ่ม 5 ข้อ)
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                  แก้ปัญหา Bottleneck & สถาปัตยกรรมระดับฮาร์ดแวร์
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                  โจทย์จำลองปัญหาจริงในสตูดิโอเกมระดับ Production เช่น การวิเคราะห์ Profiler Frame Drop, 
                  แคช L1/L2 Miss, Memory Alignment, และการตัดสินใจเชิงวิศวกรรมระดับ Senior
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>วิเคราะห์สาเหตุของบั๊กประสิทธิภาพจากข้อมูล Profiler</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>เจาะลึกกลไกภายในของ Unity, Unreal Engine 5, และ C++</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>เรียงลำดับ Pipeline ขั้นตอนการเรนเดอร์/ฟิสิกส์ให้ถูกต้อง</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => startQuizSession('practical')}
              className="mt-6 w-full py-3.5 px-5 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all group-hover:scale-[1.02]"
            >
              <Cpu className="w-4 h-4" />
              <span>เริ่มทำแบบทดสอบระดับปฏิบัติจริง (5 ข้อ)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 3: FINISHED SUMMARY SCREEN
  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);

    const getVerdict = () => {
      if (score === 5) {
        return {
          title: '🌟 ระดับ Engine Master!',
          desc: 'ยอดเยี่ยมอย่างไร้ที่ติ! คุณมีความเข้าใจเชิงลึกในกลไกของสถาปัตยกรรมนี้อย่างทะลุปรุโปร่งพร้อมนำไปประยุกต์ใช้จริง',
          color: 'text-amber-300',
        };
      }
      if (score >= 4) {
        return {
          title: '⚡ ระดับ Senior Game Dev',
          desc: 'เยี่ยมมาก! คุณเข้าใจหลักการสำคัญและสามารถวิเคราะห์ปัญหาคอขวดส่วนใหญ่ได้อย่างถูกต้อง',
          color: 'text-emerald-400',
        };
      }
      if (score >= 3) {
        return {
          title: '🛠️ ผ่านเกณฑ์มาตรฐาน (Mid-Level)',
          desc: 'ทำได้ดี! มีความเข้าใจหลักการพื้นฐานที่แน่นหนา และมีจุดเฉพาะทางบางจุดที่สามารถทบทวนเพิ่มเติมได้',
          color: 'text-cyan-400',
        };
      }
      return {
        title: '🌱 กำลังเติบโต (Apprentice)',
        desc: 'ได้เรียนรู้ข้อผิดพลาดใหม่ๆ! ลองอ่านคำอธิบายด้านล่างหรือกลับไปทบทวนบทเรียน แล้วกดสุ่มข้อสอบทำใหม่อีกครั้ง',
        color: 'text-purple-400',
      };
    };

    const verdict = getVerdict();

    return (
      <div className="space-y-6">
        {/* Score Summary Banner */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 text-center relative overflow-hidden">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-500/20 border-2 border-indigo-500/40 text-indigo-400 mb-4 shadow-xl shadow-indigo-500/20">
            <Award className="w-10 h-10" />
          </div>

          <h2 className={`text-2xl sm:text-3xl font-black ${verdict.color}`}>
            {verdict.title}
          </h2>
          <p className="text-sm text-slate-300 mt-2 max-w-xl mx-auto leading-relaxed">
            {verdict.desc}
          </p>

          <div className="mt-6 flex items-center justify-center gap-4">
            <div className="px-6 py-3 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">คะแนนที่ได้</span>
              <span className="text-3xl font-black text-white">{score} / {questions.length}</span>
            </div>
            <div className="px-6 py-3 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">ความแม่นยำ</span>
              <span className="text-3xl font-black text-emerald-400">{percentage}%</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <button
              onClick={() => startQuizSession(difficulty)}
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <Shuffle className="w-4 h-4" />
              <span>🎲 สุ่มชุดข้อสอบใหม่ 5 ข้อ</span>
            </button>
            <button
              onClick={() => {
                sound.playClick(500);
                setDifficulty(null);
              }}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>สลับระดับความยาก</span>
            </button>
          </div>
        </div>

        {/* Detailed Question Review List */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>เฉลยและทบทวนรายละเอียดทั้ง 5 ข้อ</span>
          </h3>

          <div className="space-y-3">
            {history.map((item, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border transition-colors ${
                  item.isCorrect
                    ? 'bg-slate-900/80 border-emerald-500/40'
                    : 'bg-slate-900/80 border-rose-500/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-xs font-mono font-bold text-slate-300">
                      ข้อ {idx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-white">{item.question.title}</h4>
                  </div>
                  {item.isCorrect ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>ถูกต้อง</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400">
                      <XCircle className="w-4 h-4" />
                      <span>ยังไม่ถูก</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 mt-2">{item.question.prompt}</p>

                {/* Show Answer Comparison */}
                <div className="mt-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs font-mono space-y-1">
                  <div className="text-slate-400">
                    คำตอบของคุณ:{' '}
                    <span className={item.isCorrect ? 'text-emerald-300 font-bold' : 'text-rose-300 font-bold'}>
                      {Array.isArray(item.userAnswer)
                        ? item.userAnswer.join(' ➔ ')
                        : typeof item.userAnswer === 'number'
                        ? item.question.options[item.userAnswer]
                        : String(item.userAnswer || '(ไม่ได้เลือก)')}
                    </span>
                  </div>
                  {!item.isCorrect && (
                    <div className="text-emerald-400">
                      เฉลยที่ถูกต้อง:{' '}
                      <span className="font-bold">
                        {Array.isArray(item.question.correctAnswer)
                          ? item.question.correctAnswer.join(' ➔ ')
                          : typeof item.question.correctAnswer === 'number'
                          ? item.question.options[item.question.correctAnswer]
                          : String(item.question.correctAnswer)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Technical Explanation */}
                <div className="mt-3 p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-200/90 leading-relaxed">
                  <span className="font-bold text-indigo-300 block mb-1">📖 คำอธิบายเชิงวิศวกรรม:</span>
                  {item.question.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 2: ACTIVE QUESTION SCREEN
  if (!currentQ) return null;

  return (
    <div className="space-y-6">
      {/* Quiz Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3.5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick(400);
              setDifficulty(null);
            }}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold transition-colors"
          >
            <span>‹ ออกจากแบบทดสอบ</span>
          </button>
          <span className="text-slate-700">|</span>
          <span className="text-xs font-bold text-indigo-400">
            {difficulty === 'beginner' ? '🌱 ระดับเริ่มต้น' : '⚡ ปฏิบัติจริง & สถาปัตยกรรม'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress Indicator */}
          <div className="flex items-center gap-1.5">
            {questions.map((_, idx) => (
              <div
                key={idx}
                className={`w-5 h-2 rounded-full transition-all ${
                  idx === currentIndex
                    ? 'bg-indigo-400 w-8'
                    : idx < currentIndex
                    ? 'bg-emerald-500'
                    : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-mono font-bold text-slate-300">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
        {/* Question Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold">
              คำถามที่ {currentIndex + 1} จาก {questions.length}
            </span>
            {currentQ.engineContext && (
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs font-semibold">
                Context: {currentQ.engineContext}
              </span>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {currentQ.title}
          </h3>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {currentQ.prompt}
          </p>
        </div>

        {/* =========================================================================
            QUESTION FORMAT 1: CODE BLOCK FILL / CONCEPT FILL (Interactive Slot)
            ========================================================================= */}
        {(currentQ.format === 'code-block-fill' || currentQ.format === 'concept-fill') && (
          <div className="space-y-4">
            {/* Code Box with Slot */}
            {currentQ.codeSnippet && (
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs sm:text-sm text-slate-300 overflow-x-auto leading-relaxed">
                <pre className="whitespace-pre-wrap">
                  {currentQ.codeSnippet.split('___BLANK___').map((segment, idx, arr) => (
                    <React.Fragment key={idx}>
                      {segment}
                      {idx < arr.length - 1 && (
                        <button
                          onClick={() => {
                            // Click slot to unselect
                            if (!isAnswerChecked && currentAnswer !== null) {
                              setCurrentAnswer(null);
                              sound.playClick(400);
                            }
                          }}
                          disabled={isAnswerChecked}
                          className={`inline-flex items-center mx-1 px-3 py-1 rounded-xl font-bold font-mono transition-all ${
                            currentAnswer !== null
                              ? isAnswerChecked
                                ? checkCurrentAnswerCorrectness()
                                  ? 'bg-emerald-950/90 border border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/30 ring-2 ring-emerald-500/40'
                                  : 'bg-rose-950/90 border border-rose-400 text-rose-300 shadow-md shadow-rose-500/30 ring-2 ring-rose-500/40'
                                : 'bg-indigo-950 border-2 border-indigo-400 text-indigo-300 shadow-md shadow-indigo-500/20 hover:bg-indigo-900 cursor-pointer'
                              : 'bg-slate-900/90 border-2 border-dashed border-cyan-500/50 text-cyan-400 hover:border-cyan-400 hover:bg-slate-850 cursor-pointer'
                          }`}
                        >
                          {currentAnswer !== null ? (
                            <>
                              <span>{String(currentAnswer)}</span>
                              {!isAnswerChecked && <span className="ml-1.5 text-xs text-indigo-400">✕</span>}
                            </>
                          ) : (
                            <span className="text-xs text-cyan-400 font-medium">
                              [ ➕ คลิกเลือกบล็อกด้านล่าง ]
                            </span>
                          )}
                        </button>
                      )}
                    </React.Fragment>
                  ))}
                </pre>
              </div>
            )}

            {/* Clickable Option Blocks */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 block">
                📦 คลิกบล็อกด้านล่างเพื่อเติมลงในช่องว่าง:
              </span>
              <div className="flex flex-wrap gap-2.5">
                {currentQ.options.map((opt, oIdx) => {
                  const isSelected = currentAnswer === opt;
                  return (
                    <button
                      key={oIdx}
                      disabled={isAnswerChecked}
                      onClick={() => {
                        setCurrentAnswer(opt);
                        sound.playClick(700);
                      }}
                      className={`px-4 py-2.5 rounded-xl font-mono text-xs sm:text-sm font-semibold border transition-all ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/25 scale-105'
                          : 'bg-slate-950/80 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            QUESTION FORMAT 2: MULTIPLE CHOICE & BUG DIAGNOSTIC (Radio Cards)
            ========================================================================= */}
        {(currentQ.format === 'multiple-choice' || currentQ.format === 'bug-diagnostic') && (
          <div className="space-y-4">
            {/* Optional code snippet to analyze */}
            {currentQ.codeSnippet && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs sm:text-sm text-slate-300 overflow-x-auto leading-relaxed">
                <pre className="whitespace-pre-wrap">{currentQ.codeSnippet}</pre>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              {currentQ.options.map((opt, oIdx) => {
                const isSelected = currentAnswer === oIdx;
                const letter = String.fromCharCode(65 + oIdx); // A, B, C, D

                let cardStyle =
                  'bg-slate-950/70 hover:bg-slate-800/80 border-slate-800 text-slate-300 hover:text-white';
                if (isSelected) {
                  cardStyle = 'bg-indigo-950/70 border-indigo-500 text-white ring-2 ring-indigo-500/30';
                }

                if (isAnswerChecked) {
                  const isThisCorrect = oIdx === Number(currentQ.correctAnswer);
                  if (isThisCorrect) {
                    cardStyle =
                      'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/40';
                  } else if (isSelected && !isThisCorrect) {
                    cardStyle =
                      'bg-rose-950/80 border-rose-500 text-rose-200 ring-2 ring-rose-500/40';
                  }
                }

                return (
                  <button
                    key={oIdx}
                    disabled={isAnswerChecked}
                    onClick={() => {
                      setCurrentAnswer(oIdx);
                      sound.playClick(650);
                    }}
                    className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all ${cardStyle}`}
                  >
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-indigo-500 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="text-xs sm:text-sm font-medium leading-relaxed">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            QUESTION FORMAT 3: STEP ORDER (Sequence arrangement)
            ========================================================================= */}
        {currentQ.format === 'step-order' && (
          <div className="space-y-4">
            <span className="text-xs font-semibold text-slate-400 block">
              🔢 จัดเรียงลำดับขั้นตอนให้ถูกต้อง (คลิกเลือกตามลำดับ 1, 2, 3, 4):
            </span>

            {/* Selected Sequence Slots */}
            <div className="space-y-2 p-4 rounded-2xl bg-slate-950 border border-slate-800">
              {currentQ.options.map((_, slotIdx) => {
                const currentArr = (currentAnswer as string[]) || [];
                const placedStep = currentArr[slotIdx];

                return (
                  <div
                    key={slotIdx}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800"
                  >
                    <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-xs font-mono font-bold">
                      {slotIdx + 1}
                    </span>
                    <div className="flex-1 text-xs sm:text-sm font-medium">
                      {placedStep ? (
                        <div className="flex items-center justify-between">
                          <span className="text-white">{placedStep}</span>
                          {!isAnswerChecked && (
                            <button
                              onClick={() => {
                                // Remove this step
                                const nextArr = currentArr.filter((_, i) => i !== slotIdx);
                                setCurrentAnswer(nextArr);
                                sound.playClick(400);
                              }}
                              className="text-xs text-rose-400 hover:text-rose-300 px-2 py-0.5 rounded bg-rose-950/60"
                            >
                              ยกเลิก
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">เลือกขั้นตอนที่ {slotIdx + 1} จากด้านล่าง...</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Available Step Blocks to Tap */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">ขั้นตอนที่สามารถเลือกได้:</span>
                {!isAnswerChecked && Array.isArray(currentAnswer) && currentAnswer.length > 0 && (
                  <button
                    onClick={() => {
                      setCurrentAnswer([]);
                      sound.playClick(400);
                    }}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    รีเซ็ตลำดับใหม่
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {currentQ.options.map((opt, oIdx) => {
                  const currentArr = (currentAnswer as string[]) || [];
                  const isAlreadyPlaced = currentArr.includes(opt);

                  return (
                    <button
                      key={oIdx}
                      disabled={isAnswerChecked || isAlreadyPlaced}
                      onClick={() => {
                        const nextArr = [...currentArr, opt];
                        setCurrentAnswer(nextArr);
                        sound.playClick(700);
                      }}
                      className={`w-full p-3 rounded-xl text-left text-xs sm:text-sm font-medium border transition-all ${
                        isAlreadyPlaced
                          ? 'opacity-40 bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-200 hover:border-slate-500'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Hint Box (Optional) */}
        {currentQ.hint && (
          <div>
            {showHint ? (
              <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200/90 text-xs flex items-start gap-2.5">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300 block mb-0.5">💡 คำใบ้:</span>
                  <span>{currentQ.hint}</span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setShowHint(true);
                  sound.playClick(500);
                }}
                className="text-xs font-semibold text-slate-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>ดูคำใบ้ (Hint)</span>
              </button>
            )}
          </div>
        )}

        {/* Result & Technical Explanation Box (Expands when checked) */}
        {isAnswerChecked && (
          <div
            className={`p-5 rounded-2xl border transition-all animate-fadeIn ${
              checkCurrentAnswerCorrectness()
                ? 'bg-emerald-950/40 border-emerald-500/40'
                : 'bg-rose-950/40 border-rose-500/40'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {checkCurrentAnswerCorrectness() ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-bold text-emerald-300">ยอดเยี่ยม! คำตอบถูกต้อง</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-400" />
                  <span className="text-sm font-bold text-rose-300">ยังไม่ถูกต้อง</span>
                </>
              )}
            </div>

            {/* Engineering Explanation */}
            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-1">
              <span className="font-bold text-white block">📖 คำอธิบายเชิงสถาปัตยกรรม:</span>
              <p>{currentQ.explanation}</p>
            </div>
          </div>
        )}

        {/* Action Bottom Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <span className="text-xs font-mono text-slate-500">
            คะแนนสะสม: <strong className="text-white">{score}</strong> / {questions.length}
          </span>

          {!isAnswerChecked ? (
            <button
              onClick={handleCheckAnswer}
              disabled={
                currentAnswer === null ||
                (currentQ.format === 'step-order' &&
                  Array.isArray(currentAnswer) &&
                  currentAnswer.length !== currentQ.options.length)
              }
              className="py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/25 transition-all hover:scale-105"
            >
              ✅ ตรวจคำตอบ
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="py-3 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all hover:scale-105"
            >
              <span>{currentIndex + 1 < questions.length ? 'ข้อถัดไป' : 'ดูสรุปผลคะแนน 🏆'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
