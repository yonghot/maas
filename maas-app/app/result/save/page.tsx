'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

export default function SaveResultPage() {
  const router = useRouter();

  useEffect(() => {
    const saveResults = async () => {
      try {
        const supabase = createClient();
        
        // 사용자 정보 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          console.error('인증 오류:', authError);
          router.push('/login');
          return;
        }

        // localStorage와 sessionStorage에서 테스트 결과 가져오기 (localStorage 우선)
        let testDataStr = localStorage.getItem('test_result') || sessionStorage.getItem('test_result');
        
        if (!testDataStr) {
          // 테스트 결과가 없으면 기존 프로필이 있는지 확인
          const { data: existingProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          if (existingProfile) {
            // 기존 프로필이 있으면 결과 페이지로
            console.log('기존 프로필 발견, 결과 페이지로 이동');
            router.push('/result');
          } else {
            // 프로필도 없으면 테스트 페이지로
            console.log('프로필 없음, 테스트 페이지로 이동');
            router.push('/test');
          }
          return;
        }

        const testData = JSON.parse(testDataStr);
        const { result, userInfo, answers, instagram_id, instagram_public } = testData;
        
        console.log('저장할 데이터:', {
          user_id: user.id,
          instagram_id,
          instagram_public
        });

        // 프로필 데이터 생성 (Instagram 정보 포함)
        const profileData = {
          user_id: user.id,
          gender: userInfo.gender,
          age: userInfo.age || null,
          region: userInfo.region || 'seoul',  // region 필드 추가!
          total_score: result.score,
          percentile: result.percentile,
          tier: result.tier,
          answers: answers,
          category_scores: result.categoryScores,
          instagram_id: instagram_id || null,
          instagram_public: instagram_public !== undefined ? instagram_public : true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // 프로필 저장 (upsert 사용하여 중복 방지)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .upsert(profileData, {
            onConflict: 'user_id'
          })
          .select()
          .single();

        if (profileError) {
          console.error('프로필 저장 오류:', profileError);
          // 오류가 있어도 결과 페이지로 이동 시도
        }

        // localStorage와 sessionStorage 정리
        localStorage.removeItem('test_result');
        sessionStorage.removeItem('test_result');

        // 결과 페이지로 이동
        router.push('/result');
        
      } catch (error) {
        console.error('결과 저장 중 오류:', error);
        router.push('/result');
      }
    };

    saveResults();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-teal-50/30 flex items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
        <p className="text-teal-700 font-medium">결과를 저장하고 있습니다...</p>
      </div>
    </div>
  );
}