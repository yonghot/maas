/**
 * OAuth 로컬 테스트 및 디버깅 스크립트
 * 실제 OAuth 플로우를 단계별로 테스트
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testOAuthFlow() {
  console.log('🔍 OAuth 플로우 단계별 테스트 시작\n');
  
  // 1. 환경 변수 검증
  console.log('1️⃣ 환경 변수 상태 확인');
  console.log('================================');
  
  const env = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  };
  
  console.log('NEXT_PUBLIC_SUPABASE_URL:', env.url ? '✅ 설정됨' : '❌ 누락');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', env.anonKey ? '✅ 설정됨' : '❌ 누락');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', env.serviceKey ? '✅ 설정됨' : '❌ 누락');
  
  if (!env.url || !env.anonKey) {
    console.error('\n❌ 필수 환경 변수가 누락되었습니다!');
    return;
  }
  
  // 2. Supabase 클라이언트 테스트
  console.log('\n2️⃣ Supabase 클라이언트 연결 테스트');
  console.log('================================');
  
  const supabase = createClient(env.url, env.anonKey);
  
  try {
    // 연결 테스트
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Supabase 연결 실패:', testError.message);
      
      if (testError.message.includes('Invalid API key')) {
        console.error('⚠️ API 키가 유효하지 않습니다!');
        console.error('   Vercel과 로컬의 환경 변수가 다를 수 있습니다.');
        console.error('   Supabase 대시보드에서 API 키를 다시 확인하세요.');
      }
    } else {
      console.log('✅ Supabase 연결 성공!');
    }
  } catch (e) {
    console.error('❌ 예외 발생:', e.message);
  }
  
  // 3. OAuth 제공자 상태 확인
  console.log('\n3️⃣ OAuth 제공자 설정 확인');
  console.log('================================');
  
  try {
    // Service Key로 Admin 클라이언트 생성
    if (env.serviceKey) {
      const adminSupabase = createClient(env.url, env.serviceKey);
      
      // OAuth 설정 확인 (간접적으로)
      const { data: authData, error: authError } = await adminSupabase.auth.admin.listUsers({
        page: 1,
        perPage: 1
      });
      
      if (!authError) {
        console.log('✅ Admin API 접근 가능');
        console.log('   (OAuth 제공자는 Supabase 대시보드에서 확인 필요)');
      } else {
        console.log('⚠️ Admin API 접근 불가:', authError.message);
      }
    }
  } catch (e) {
    console.log('⚠️ Admin API 테스트 스킵:', e.message);
  }
  
  // 4. 실제 OAuth URL 생성 테스트
  console.log('\n4️⃣ OAuth URL 생성 테스트');
  console.log('================================');
  
  try {
    // Google OAuth URL 생성
    const { data: googleData, error: googleError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
        skipBrowserRedirect: true // 실제 리다이렉트 건너뛰기
      }
    });
    
    if (googleError) {
      console.error('❌ Google OAuth URL 생성 실패:', googleError.message);
    } else if (googleData?.url) {
      console.log('✅ Google OAuth URL 생성 성공');
      console.log('   URL:', googleData.url.substring(0, 100) + '...');
    }
    
    // Kakao OAuth URL 생성
    const { data: kakaoData, error: kakaoError } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
        skipBrowserRedirect: true
      }
    });
    
    if (kakaoError) {
      console.error('❌ Kakao OAuth URL 생성 실패:', kakaoError.message);
    } else if (kakaoData?.url) {
      console.log('✅ Kakao OAuth URL 생성 성공');
      console.log('   URL:', kakaoData.url.substring(0, 100) + '...');
    }
  } catch (e) {
    console.error('❌ OAuth URL 생성 중 예외:', e.message);
  }
  
  // 5. 디버깅 제안
  console.log('\n5️⃣ 디버깅 제안');
  console.log('================================');
  console.log('1. Supabase 대시보드 확인:');
  console.log('   - Authentication > Providers에서 Google/Kakao 활성화 확인');
  console.log('   - Authentication > URL Configuration에서 Redirect URLs 확인');
  console.log('');
  console.log('2. Vercel 환경 변수 확인:');
  console.log('   - Settings > Environment Variables에서 모든 변수 설정 확인');
  console.log('   - 변수명 오타 없는지 확인');
  console.log('');
  console.log('3. 브라우저 테스트:');
  console.log('   - http://localhost:3000 에서 직접 테스트');
  console.log('   - 개발자 도구 > Network 탭에서 실패한 요청 확인');
  console.log('   - Console 탭에서 에러 메시지 확인');
}

// 실행
testOAuthFlow().catch(console.error);