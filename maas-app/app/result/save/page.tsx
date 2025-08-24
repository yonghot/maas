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

        // localStorage, sessionStorage, 쿠키에서 테스트 결과 가져오기
        let testDataStr = localStorage.getItem('test_result') || sessionStorage.getItem('test_result');
        
        // 쿠키에서도 확인
        if (!testDataStr) {
          const cookies = document.cookie.split(';');
          for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'test_result') {
              testDataStr = decodeURIComponent(value);
              break;
            }
          }
        }
        
        if (!testDataStr) {
          console.log('⚠️ 테스트 결과가 localStorage/sessionStorage/쿠키에 없음');
          
          // Zustand store에서 확인
          const storeData = localStorage.getItem('maas-test-storage');
          if (storeData) {
            try {
              const { state } = JSON.parse(storeData);
              if (state?.result && state?.userInfo && state?.answers) {
                console.log('✅ Zustand store에서 테스트 결과 발견');
                // Zustand store 데이터로 프로필 저장 진행
                const result = state.result;
                const userInfo = state.userInfo;
                const answers = state.answers;
                const userLead = state.userLead;
                
                const profileData = {
                  user_id: user.id, // auth.users.id 직접 참조 (새 구조)
                  gender: userInfo.gender,
                  age: userInfo.age || null,
                  region: userInfo.region || 'seoul',
                  total_score: result.score,
                  tier: result.tier || result.grade,
                  grade: result.grade || result.tier,
                  evaluation_data: answers, // answers 데이터를 evaluation_data에 저장
                  category_scores: result.categoryScores,
                  // Instagram 정보 profiles에 직접 저장 (NULL 허용)
                  instagram_id: userLead?.instagram_id || null,
                  instagram_public: userLead?.instagram_public || false,
                  last_evaluated_at: new Date().toISOString(),
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                };

                // 프로필 저장
                console.log('💾 Zustand store에서 프로필 저장 시도:', JSON.stringify(profileData, null, 2));
                
                const { data: profile, error: profileError } = await supabase
                  .from('profiles')
                  .upsert(profileData, { onConflict: 'user_id' })
                  .select()
                  .single();

                if (profileError) {
                  console.error('❌ Zustand store 프로필 저장 오류:', {
                    message: profileError.message,
                    code: profileError.code,
                    details: profileError.details,
                    hint: profileError.hint
                  });
                  
                  // 오류 발생 시에도 결과 페이지로 이동하지만 메시지 표시
                  router.push('/result?error=save_failed&message=' + encodeURIComponent('프로필 저장에 실패했지만 로그인은 완료되었습니다.'));
                  return;
                } else {
                  console.log('✅ Zustand store 프로필 저장 성공:', profile);
                }

                // 결과 페이지로 이동
                router.push('/result');
                return;
              }
            } catch (parseError) {
              console.error('Zustand store 파싱 오류:', parseError);
            }
          }
          
          // 기존 프로필이 있는지 확인
          const { data: existingProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          if (existingProfile) {
            // 기존 프로필이 있으면 결과 페이지로
            console.log('✅ 기존 프로필 발견, 결과 페이지로 이동');
            router.push('/result');
          } else {
            // 프로필도 없고 테스트 결과도 없음 - 기본 프로필 생성하고 테스트 페이지로 안내
            console.log('❌ 프로필 없고 테스트 결과도 없음');
            
            // 빈 프로필 생성 (나중에 테스트 완료 시 업데이트)
            const emptyProfileData = {
              user_id: user.id, // auth.users.id 직접 참조 (새 구조)
              gender: 'male', // 기본값
              age: 25, // 기본값
              region: 'seoul',
              total_score: 0,
              tier: 'F',
              grade: 'F',
              evaluation_data: {},
              category_scores: {},
              // Instagram 정보 profiles에 직접 저장 (NULL 허용)
              instagram_id: null,
              instagram_public: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };

            // 빈 프로필 저장
            await supabase
              .from('profiles')
              .upsert(emptyProfileData, { onConflict: 'user_id' });

            console.log('✅ 빈 프로필 생성 완료, 테스트 페이지로 안내');
            router.push('/signup-result?message=소셜 로그인이 완료되었습니다. 이제 매력도 테스트를 진행해보세요!');
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

        // 프로필 데이터 생성 (새 구조: auth.users 직접 참조)
        const profileData = {
          user_id: user.id, // auth.users.id 직접 참조 (public.users 제거됨)
          gender: userInfo.gender,
          age: userInfo.age || null,
          region: userInfo.region || 'seoul',
          total_score: result.score,
          tier: result.tier || result.grade,
          grade: result.grade || result.tier,
          evaluation_data: answers, // answers를 evaluation_data에 저장
          category_scores: result.categoryScores,
          // Instagram 정보 profiles 테이블에 직접 저장 (선택사항)
          instagram_id: instagram_id || null, // NULL 허용으로 변경
          instagram_public: instagram_public !== undefined ? instagram_public : true,
          last_evaluated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // 프로필 저장 (upsert 사용하여 중복 방지)
        console.log('💾 프로필 저장 시도:', JSON.stringify(profileData, null, 2));
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .upsert(profileData, {
            onConflict: 'user_id'
          })
          .select()
          .single();

        if (profileError) {
          console.error('❌ 프로필 저장 오류:', {
            message: profileError.message,
            code: profileError.code,
            details: profileError.details,
            hint: profileError.hint
          });
          
          // 오류 발생 시에도 결과 페이지로 이동하지만 메시지 표시
          router.push('/result?error=save_failed&message=' + encodeURIComponent('프로필 저장에 실패했지만 로그인은 완료되었습니다.'));
          return;
        } else {
          console.log('✅ 프로필 저장 성공:', profile);
        }

        // localStorage, sessionStorage, 쿠키 정리
        localStorage.removeItem('test_result');
        sessionStorage.removeItem('test_result');
        document.cookie = 'test_result=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';

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