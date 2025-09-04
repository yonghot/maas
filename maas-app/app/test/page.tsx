'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTestStore } from '@/store/test-store';
import { UserInfoForm } from '@/components/test/UserInfoForm';
import { QuestionCard } from '@/components/test/QuestionCard';
import { maleQuestions } from '@/lib/questions/male';
import { femaleQuestions } from '@/lib/questions/female';
import { Question, UserInfo } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScoringCalculator, ScoringWeights, DEFAULT_WEIGHTS } from '@/lib/scoring/calculator';
import { createClient } from '@/lib/supabase/client';
import { Loader2, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TestPage() {
  const router = useRouter();
  const {
    userInfo,
    setUserInfo,
    answers,
    setAnswer,
    resetTest,
    setResult,
    setTestCompleted
  } = useTestStore();

  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [showUserForm, setShowUserForm] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scoringWeights, setScoringWeights] = useState<ScoringWeights | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 가중치 불러오기
  useEffect(() => {
    const loadWeights = async () => {
      try {
        const response = await fetch('/api/scoring-weights');
        if (response.ok) {
          const data = await response.json();
          if (data.weights) {
            setScoringWeights(data.weights);
          }
        }
      } catch (error) {
        console.error('가중치 로드 실패:', error);
        // 실패 시 기본 가중치 사용
        setScoringWeights(DEFAULT_WEIGHTS);
      }
    };
    
    loadWeights();
  }, []);

  // 성별에 따른 질문 목록 설정
  useEffect(() => {
    if (userInfo?.gender) {
      const questions = userInfo.gender === 'male' ? maleQuestions : femaleQuestions;
      setCurrentQuestions(questions);
    }
  }, [userInfo?.gender]);

  // 스크롤 상태 감지
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 사용자 정보 설정 완료 처리
  const handleUserInfoSubmit = (info: UserInfo) => {
    setUserInfo(info);
    setShowUserForm(false);
  };

  // 답변 처리
  const handleAnswerChange = (questionId: string, value: string | number) => {
    setAnswer({
      questionId,
      value,
      score: typeof value === 'number' ? value : 0
    });
  };

  // 모든 필수 질문에 답변했는지 확인
  const isAllAnswered = () => {
    const requiredQuestions = currentQuestions.filter(q => q.required !== false);
    return requiredQuestions.every(q => 
      answers.some(a => a.questionId === q.id)
    );
  };

  // 답변 가져오기
  const getAnswer = (questionId: string) => {
    return answers.find(answer => answer.questionId === questionId);
  };

  // 진행률 계산
  const calculateProgress = () => {
    const requiredQuestions = currentQuestions.filter(q => q.required !== false);
    const answeredCount = requiredQuestions.filter(q => 
      answers.some(a => a.questionId === q.id)
    ).length;
    return requiredQuestions.length > 0 
      ? (answeredCount / requiredQuestions.length) * 100 
      : 0;
  };

  // 맨 위로 스크롤
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 테스트 다시 시작
  const handleRestart = () => {
    resetTest();
    setShowUserForm(true);
    setCurrentQuestions([]);
    scrollToTop();
  };

  // 결과 계산 후 저장
  const handleViewResults = async () => {
    if (!userInfo || !isAllAnswered()) return;
    
    setSaving(true);
    setError(null);
    
    try {
      // 가중치가 로드되지 않았으면 기본 가중치 사용
      const weights = scoringWeights || DEFAULT_WEIGHTS;
      const calculator = new ScoringCalculator(weights);
      
      const result = userInfo.gender === 'male'
        ? calculator.calculateMaleScore(answers, userInfo)
        : calculator.calculateFemaleScore(answers, userInfo);
      
      setResult(result);
      setTestCompleted(true);
      
      // 회원가입 유도 페이지로 이동
      router.push('/signup-result');
    } catch (err) {
      console.error('Save error:', err);
      setError('결과 저장 중 오류가 발생했습니다.');
      setSaving(false);
    }
  };

  // 사용자 정보 입력 화면
  if (showUserForm) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50/30 flex items-center justify-center p-4 safe-area-padding">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 backdrop-blur-lg bg-white/95">
            <CardHeader className="pb-4 text-center">
              <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                나의 결혼 점수는?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UserInfoForm onSubmit={handleUserInfoSubmit} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 질문이 없는 경우
  if (currentQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50/30 flex items-center justify-center p-4 safe-area-padding">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 backdrop-blur-lg bg-white/95">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
                <p className="text-center text-purple-600/80">질문을 불러오는 중...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50/30">
      {/* 상단 고정 헤더 */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg shadow-md">
        <div className="max-w-2xl mx-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg sm:text-xl font-bold text-purple-700">
              나의 결혼 점수는?
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRestart}
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            >
              다시 시작
            </Button>
          </div>
          
          {/* 진행률 바 */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-purple-600/70">진행률</span>
              <span className="text-purple-600">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2 bg-purple-100" />
          </div>
        </div>
      </div>

      {/* 질문 목록 - 무한 스크롤 */}
      <div className="max-w-2xl mx-auto p-4 pt-8 pb-32">
        <div className="space-y-6">
          {currentQuestions.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="relative">
                {/* 질문 번호 */}
                <div className="absolute -left-2 -top-2 z-10">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                    {index + 1}
                  </div>
                </div>
                
                <QuestionCard
                  question={question}
                  answer={getAnswer(question.id)}
                  onAnswerChange={handleAnswerChange}
                />
              </div>
            </motion.div>
          ))}
        </div>
        
        <div ref={bottomRef} />
      </div>

      {/* 하단 고정 완료 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-purple-100 safe-area-padding">
        <div className="max-w-2xl mx-auto p-4">
          <div className="flex flex-col gap-3">
            {error && (
              <p className="text-center text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                {error}
              </p>
            )}
            
            <Button
              onClick={handleViewResults}
              disabled={!isAllAnswered() || saving}
              className="w-full h-14 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-lg font-medium shadow-lg disabled:opacity-50 transition-all touch-manipulation"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  제출 중...
                </>
              ) : (
                <>
                  {isAllAnswered() ? '제출하기' : `${currentQuestions.filter(q => q.required !== false).length - currentQuestions.filter(q => q.required !== false && getAnswer(q.id)).length}개 질문 남음`}
                </>
              )}
            </Button>
            
            {!isAllAnswered() && (
              <p className="text-center text-xs text-purple-600/70">
                모든 필수 질문에 답변해주세요
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 맨 위로 가기 버튼 */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-24 right-4 z-30 w-12 h-12 bg-purple-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-purple-600 transition-colors touch-manipulation"
          >
            <ChevronUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}