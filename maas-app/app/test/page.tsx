'use client';

import { useState, useEffect } from 'react';
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
import { ScoringCalculator } from '@/lib/scoring/calculator';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

export default function TestPage() {
  const router = useRouter();
  const {
    userInfo,
    setUserInfo,
    answers,
    setAnswer,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    nextQuestion,
    previousQuestion,
    resetTest,
    setResult,
    setTestCompleted
  } = useTestStore();

  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [showUserForm, setShowUserForm] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 성별에 따른 질문 목록 설정
  useEffect(() => {
    if (userInfo?.gender) {
      const questions = userInfo.gender === 'male' ? maleQuestions : femaleQuestions;
      setCurrentQuestions(questions);
    }
  }, [userInfo?.gender]);

  // 사용자 정보 설정 완료 처리
  const handleUserInfoSubmit = (info: UserInfo) => {
    setUserInfo(info);
    setShowUserForm(false);
    setCurrentQuestionIndex(0);
  };

  // 답변 처리
  const handleAnswerChange = (questionId: string, value: string | number) => {
    setAnswer({
      questionId,
      value,
      score: typeof value === 'number' ? value : 0
    });
  };

  // 다음 질문으로 이동
  const handleNext = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      nextQuestion();
    } else {
      setIsComplete(true);
    }
  };

  // 이전 질문으로 이동
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      previousQuestion();
    }
  };

  // 테스트 다시 시작
  const handleRestart = () => {
    resetTest();
    setShowUserForm(true);
    setIsComplete(false);
    setCurrentQuestions([]);
  };

  // 결과 계산 후 저장
  const handleViewResults = async () => {
    if (!userInfo) return;
    
    setSaving(true);
    setError(null);
    
    try {
      const calculator = new ScoringCalculator();
      const result = userInfo.gender === 'male'
        ? calculator.calculateMaleScore(answers, userInfo)
        : calculator.calculateFemaleScore(answers, userInfo);
      
      setResult(result);
      setTestCompleted(true);
      
      // Supabase에 프로필 저장
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // 프로필 데이터 저장
        const response = await fetch('/api/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            gender: userInfo.gender,
            age: userInfo.age,
            region: userInfo.region,
            tier: result.tier,
            grade: result.grade,
            totalScore: result.totalScore,
            categoryScores: result.categoryScores,
            evaluationData: {
              answers,
              userInfo
            }
          }),
        });
        
        if (!response.ok) {
          throw new Error('프로필 저장 실패');
        }
        
        // 프로필 페이지로 이동
        router.push('/profile');
      } else {
        // 로그인하지 않은 경우 정보 입력 페이지로 이동
        router.push('/info');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError('결과 저장 중 오류가 발생했습니다.');
      setSaving(false);
    }
  };

  // 진행률 계산
  const progress = currentQuestions.length > 0 
    ? ((currentQuestionIndex + 1) / currentQuestions.length) * 100 
    : 0;

  // 현재 답변 가져오기
  const getCurrentAnswer = () => {
    if (currentQuestions.length === 0) return undefined;
    const currentQuestion = currentQuestions[currentQuestionIndex];
    return answers.find(answer => answer.questionId === currentQuestion.id);
  };

  // 사용자 정보 입력 화면
  if (showUserForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 backdrop-blur-lg bg-white/90">
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-3xl font-bold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
                MAAS 테스트
              </CardTitle>
              <p className="text-center text-gray-600 mt-2">기본 정보를 입력해주세요</p>
            </CardHeader>
            <CardContent>
              <UserInfoForm onSubmit={handleUserInfoSubmit} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 테스트 완료 화면
  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 backdrop-blur-lg bg-white/90">
            <CardHeader>
              <CardTitle className="text-center text-3xl font-bold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
                테스트 완료!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-lg text-gray-700 font-medium">
                  모든 질문에 답변해주셨습니다
                </p>
                <p className="text-sm text-gray-500">
                  총 {answers.length}개의 답변을 수집했습니다
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={handleRestart} 
                  variant="outline" 
                  className="flex-1 h-12 text-gray-700 border-gray-300 hover:bg-gray-50"
                >
                  다시 시작
                </Button>
                <Button 
                  className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg" 
                  onClick={handleViewResults}
                >
                  결과 보기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 질문이 없는 경우
  if (currentQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 backdrop-blur-lg bg-white/90">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <p className="text-center text-gray-600">질문을 불러오는 중...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = currentQuestions[currentQuestionIndex];
  const currentAnswer = getCurrentAnswer();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6 bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">MAAS 테스트</h1>
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full">
              <span className="text-sm font-medium text-gray-700">
                {userInfo?.nickname || (userInfo?.gender === 'male' ? '남성' : '여성')}
              </span>
            </div>
          </div>
          
          {/* 진행률 */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-gray-600">진행률</span>
              <span className="text-purple-600 font-bold">{currentQuestionIndex + 1} / {currentQuestions.length}</span>
            </div>
            <Progress value={progress} className="h-3 bg-gray-200" />
          </div>
        </div>

        {/* 질문 카드 */}
        <QuestionCard
          question={currentQuestion}
          answer={currentAnswer}
          onAnswerChange={handleAnswerChange}
        />

        {/* 네비게이션 버튼 */}
        <div className="mt-6 flex gap-3">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="flex-1 h-12 text-gray-700 border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-all"
          >
            이전
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!currentAnswer}
            className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg disabled:opacity-50 transition-all"
          >
            {currentQuestionIndex === currentQuestions.length - 1 ? '완료' : '다음'}
          </Button>
        </div>

        {/* 테스트 재시작 버튼 */}
        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRestart}
            className="text-gray-500 hover:text-purple-600 transition-colors"
          >
            테스트 다시 시작
          </Button>
        </div>
      </div>
    </div>
  );
}