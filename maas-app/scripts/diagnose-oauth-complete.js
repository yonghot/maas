/**
 * 완전한 OAuth 진단 스크립트
 * Supabase OAuth 설정의 모든 측면을 체크
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hvpyqchgimnzaotwztuy.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2cHlxY2hnaW1uemFvdHd6dHV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NTY4ODgsImV4cCI6MjA3MTAzMjg4OH0.8prtIUesStj4xNabIKY3yVlrbvWseAYIUM11rk7KZX4';

console.log('\n🔍 ===== OAuth 완전 진단 시작 =====\n');

// 1. 환경 변수 확인
console.log('1️⃣ 환경 변수 확인');
console.log('================================');
console.log('✅ SUPABASE_URL:', SUPABASE_URL ? '설정됨' : '❌ 없음');
console.log('✅ SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? `설정됨 (길이: ${SUPABASE_ANON_KEY.length})` : '❌ 없음');
console.log('');

// 2. Supabase 클라이언트 생성
console.log('2️⃣ Supabase 클라이언트 생성');
console.log('================================');
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});
console.log('✅ 클라이언트 생성 완료');
console.log('');

// 3. 기본 연결 테스트
async function testConnection() {
  console.log('3️⃣ 기본 연결 테스트');
  console.log('================================');
  
  try {
    // 간단한 쿼리로 연결 테스트
    const { error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      if (error.message.includes('Invalid API key')) {
        console.log('❌ API 키 오류:', error.message);
        console.log('   → Vercel 환경 변수 설정을 확인하세요');
        return false;
      }
      // 테이블이 없어도 연결은 성공한 것
      console.log('✅ 연결 성공 (테이블 없음은 정상)');
    } else {
      console.log('✅ 연결 및 테이블 접근 성공');
    }
    return true;
  } catch (err) {
    console.log('❌ 연결 실패:', err.message);
    return false;
  }
}

// 4. OAuth Provider 테스트
async function testOAuthProvider(provider) {
  console.log(`\n4️⃣ ${provider.toUpperCase()} OAuth Provider 테스트`);
  console.log('================================');
  
  try {
    // skipBrowserRedirect로 URL만 생성
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: 'https://maas-eight.vercel.app/auth/callback',
        skipBrowserRedirect: true,
        scopes: provider === 'google' ? 'email profile' : undefined
      }
    });
    
    if (error) {
      console.log(`❌ ${provider} OAuth 오류:`, error.message);
      console.log('   가능한 원인:');
      console.log('   1. Supabase Dashboard에서 Provider가 비활성화됨');
      console.log('   2. Client ID/Secret이 설정되지 않음');
      console.log('   3. Redirect URL이 잘못 설정됨');
      return false;
    }
    
    if (data?.url) {
      const url = new URL(data.url);
      console.log(`✅ ${provider} OAuth URL 생성 성공`);
      console.log('   호스트:', url.host);
      console.log('   클라이언트 ID:', url.searchParams.get('client_id')?.substring(0, 20) + '...');
      console.log('   리다이렉트 URI:', decodeURIComponent(url.searchParams.get('redirect_uri') || ''));
      console.log('   스코프:', url.searchParams.get('scope'));
      
      // URL 구조 분석
      if (provider === 'google' && !url.host.includes('accounts.google.com')) {
        console.log('⚠️ 경고: Google OAuth URL이 올바르지 않음');
      }
      if (provider === 'kakao' && !url.host.includes('kauth.kakao.com')) {
        console.log('⚠️ 경고: Kakao OAuth URL이 올바르지 않음');
      }
      
      return true;
    } else {
      console.log(`❌ ${provider} OAuth URL이 생성되지 않음`);
      return false;
    }
  } catch (err) {
    console.log(`❌ ${provider} 테스트 예외:`, err.message);
    return false;
  }
}

// 5. Redirect URL 설정 확인 (간접적으로)
async function checkRedirectUrls() {
  console.log('\n5️⃣ Redirect URL 설정 체크');
  console.log('================================');
  
  const testUrls = [
    'http://localhost:3000/auth/callback',
    'http://localhost:3001/auth/callback',
    'https://maas-eight.vercel.app/auth/callback'
  ];
  
  console.log('✅ 다음 URL들이 Supabase에 등록되어 있어야 함:');
  testUrls.forEach(url => {
    console.log(`   - ${url}`);
  });
  
  console.log('\n📍 Supabase Dashboard 확인 방법:');
  console.log('   1. https://supabase.com/dashboard/project/hvpyqchgimnzaotwztuy');
  console.log('   2. Authentication → URL Configuration');
  console.log('   3. Redirect URLs 섹션에 위 URL들이 모두 있는지 확인');
}

// 6. Auth 세션 테스트
async function testAuthSession() {
  console.log('\n6️⃣ Auth 세션 테스트');
  console.log('================================');
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('❌ 세션 확인 오류:', error.message);
    } else if (session) {
      console.log('✅ 활성 세션 있음:', session.user?.email);
    } else {
      console.log('ℹ️ 현재 세션 없음 (정상)');
    }
  } catch (err) {
    console.log('❌ 세션 테스트 예외:', err.message);
  }
}

// 7. 실제 OAuth Flow 시뮬레이션
async function simulateOAuthFlow() {
  console.log('\n7️⃣ OAuth Flow 시뮬레이션');
  console.log('================================');
  
  console.log('📋 실제 OAuth 플로우:');
  console.log('   1. 사용자가 Google/Kakao 버튼 클릭');
  console.log('   2. Supabase가 OAuth URL 생성');
  console.log('   3. Provider 로그인 페이지로 리다이렉트');
  console.log('   4. 사용자 로그인 및 권한 승인');
  console.log('   5. /auth/callback으로 리다이렉트');
  console.log('   6. Supabase가 세션 생성');
  console.log('   7. /result/save로 리다이렉트');
  console.log('');
  
  console.log('🔍 현재 문제 분석:');
  console.log('   - 5번 단계에서 "session_failed" 오류 발생');
  console.log('   - "Invalid API key" 메시지 표시');
  console.log('');
  
  console.log('⚠️ 가능한 원인:');
  console.log('   1. Supabase Dashboard의 Redirect URLs 미등록');
  console.log('   2. Provider의 Client ID/Secret 오류');
  console.log('   3. Provider 콘솔(Google/Kakao)의 리다이렉트 URI 미등록');
}

// 메인 실행
async function main() {
  // 연결 테스트
  const connected = await testConnection();
  if (!connected) {
    console.log('\n❌ 기본 연결 실패. 환경 변수를 확인하세요.');
    process.exit(1);
  }
  
  // OAuth Provider 테스트
  const googleOk = await testOAuthProvider('google');
  const kakaoOk = await testOAuthProvider('kakao');
  
  // Redirect URL 체크
  await checkRedirectUrls();
  
  // 세션 테스트
  await testAuthSession();
  
  // Flow 시뮬레이션
  await simulateOAuthFlow();
  
  // 최종 진단
  console.log('\n\n📊 ===== 최종 진단 결과 =====');
  console.log('================================');
  
  if (googleOk && kakaoOk) {
    console.log('✅ OAuth URL 생성은 정상');
    console.log('');
    console.log('🔧 해결 방법:');
    console.log('1. Supabase Dashboard 확인:');
    console.log('   - Authentication → URL Configuration');
    console.log('   - Redirect URLs에 프로덕션 URL 추가 확인');
    console.log('   - https://maas-eight.vercel.app/auth/callback');
    console.log('');
    console.log('2. Google Console 확인:');
    console.log('   - OAuth 2.0 클라이언트 ID 설정');
    console.log('   - 승인된 리디렉션 URI 확인');
    console.log('   - https://hvpyqchgimnzaotwztuy.supabase.co/auth/v1/callback');
    console.log('');
    console.log('3. Kakao Developers 확인:');
    console.log('   - 카카오 로그인 설정');
    console.log('   - Redirect URI 확인');
    console.log('   - https://hvpyqchgimnzaotwztuy.supabase.co/auth/v1/callback');
  } else {
    console.log('❌ OAuth Provider 설정 문제');
    console.log('');
    console.log('🔧 해결 방법:');
    console.log('1. Supabase Dashboard에서:');
    console.log('   - Authentication → Providers');
    console.log('   - Google/Kakao Provider 활성화 확인');
    console.log('   - Client ID와 Secret 입력 확인');
  }
  
  console.log('\n💡 다음 단계:');
  console.log('1. 위 설정들을 모두 확인');
  console.log('2. https://maas-eight.vercel.app/debug-oauth 에서 재테스트');
  console.log('3. 개발자 도구 Console 탭에서 상세 오류 확인');
}

// 실행
main().catch(console.error);