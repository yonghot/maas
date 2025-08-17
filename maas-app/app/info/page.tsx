'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTestStore } from '@/store/test-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Lock, Shield, CheckCircle } from 'lucide-react';
import UserInfoForm from '@/components/info/UserInfoForm';

export default function InfoPage() {
  const router = useRouter();
  const { isTestCompleted, hasSubmittedLead, userInfo } = useTestStore();

  useEffect(() => {
    // 테스트를 완료하지 않았으면 테스트 페이지로 리다이렉트
    if (!isTestCompleted) {
      router.push('/test');
      return;
    }
    
    // 이미 정보를 제출했으면 결과 페이지로 리다이렉트
    if (hasSubmittedLead) {
      router.push('/result/test');
      return;
    }
  }, [isTestCompleted, hasSubmittedLead, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* 진행률 표시 */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>테스트 완료</span>
            <span className="font-semibold">마지막 단계!</span>
          </div>
          <Progress value={90} className="h-2" />
        </div>

        {/* 메인 카드 */}
        <Card className="shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">
              축하합니다! 테스트가 완료되었습니다
            </CardTitle>
            <CardDescription className="text-lg">
              <span className="text-purple-600 font-semibold">당신의 결혼매력 점수</span>가 계산되었습니다!
              <br />
              결과를 확인하려면 아래 정보를 입력해주세요.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* 신뢰 배지 */}
            <div className="flex items-center justify-center space-x-4 py-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Lock className="w-4 h-4" />
                <span>개인정보 안전 보호</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="w-4 h-4" />
                <span>스팸 문자 없음</span>
              </div>
            </div>

            {/* 호기심 자극 메시지 */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg text-center">
              <p className="text-purple-700 font-medium">
                🎯 당신의 등급은 상위 몇 %일까요?
              </p>
              <p className="text-sm text-gray-600 mt-1">
                지금 바로 확인해보세요!
              </p>
            </div>

            {/* 정보 입력 폼 */}
            <UserInfoForm />
          </CardContent>
        </Card>

        {/* 하단 안내 */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>입력하신 정보는 결과 분석 및 통계 목적으로만 사용됩니다.</p>
          <p>자세한 내용은 개인정보 처리방침을 확인해주세요.</p>
        </div>
      </div>
    </div>
  );
}