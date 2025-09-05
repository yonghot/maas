/**
 * OAuth 인증 문제 진단 스크립트
 * PKCE 쿠키 유실 및 Invalid API key 문제 점검
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 OAuth 인증 문제 진단 시작...\n');

// 환경 변수 확인
console.log('1️⃣ 환경 변수 확인');
console.log('================================');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.');
} else {
  console.log('✅ NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
}

if (!supabaseAnonKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되지 않았습니다.');
} else {
  console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey.substring(0, 40) + '...');
  
  // JWT 디코딩 (base64)
  try {
    const parts = supabaseAnonKey.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      console.log('   - JWT 발급자:', payload.iss);
      console.log('   - 프로젝트 참조:', payload.ref);
      console.log('   - 역할:', payload.role);
      console.log('   - 만료 시간:', new Date(payload.exp * 1000).toISOString());
      
      // URL과 ref 일치 확인
      if (supabaseUrl && !supabaseUrl.includes(payload.ref)) {
        console.error('   ⚠️ 경고: URL과 JWT의 프로젝트 참조가 일치하지 않습니다!');
      }
    }
  } catch (e) {
    console.error('   ⚠️ JWT 파싱 실패:', e.message);
  }
}

console.log('\n2️⃣ Supabase 연결 테스트');
console.log('================================');

async function testConnection() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ 필수 환경 변수가 누락되어 연결 테스트를 건너뜁니다.');
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // 간단한 쿼리로 연결 테스트
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      if (error.message?.includes('Invalid API key')) {
        console.error('❌ Invalid API key 오류 발생!');
        console.error('   - 에러:', error.message);
        console.error('   - Vercel 환경 변수를 다시 확인해주세요.');
      } else {
        console.error('❌ 데이터베이스 연결 실패:', error.message);
      }
    } else {
      console.log('✅ Supabase 연결 성공!');
      console.log('   - profiles 테이블 레코드 수:', data);
    }
  } catch (e) {
    console.error('❌ 예외 발생:', e.message);
  }
}

console.log('\n3️⃣ OAuth 설정 확인');
console.log('================================');
console.log('Supabase 대시보드에서 확인해야 할 사항:');
console.log('1. Authentication > Providers에서 Google/Kakao 활성화 상태');
console.log('2. Authentication > URL Configuration의 Redirect URLs:');
console.log('   - http://localhost:3000/auth/callback');
console.log('   - https://maas-eight.vercel.app/auth/callback');
console.log('3. Google Cloud Console OAuth 2.0 클라이언트 ID 설정');
console.log('4. Kakao Developers OAuth 설정');

console.log('\n4️⃣ 해결 방안 요약');
console.log('================================');
console.log('✅ 적용된 수정 사항:');
console.log('1. lib/supabase/client.ts - HTTPS 환경에서 Secure 플래그 추가');
console.log('2. app/auth/callback/route.ts - 상세한 디버깅 로그 추가');
console.log('3. app/signup-result/page.tsx - 에러 메시지 개선');
console.log('');
console.log('📝 추가 확인 필요 사항:');
console.log('1. Vercel 환경 변수가 올바르게 설정되었는지 확인');
console.log('2. 브라우저 쿠키 설정이 제한되어 있지 않은지 확인');
console.log('3. Supabase 프로젝트 설정에서 OAuth providers가 활성화되어 있는지 확인');

// 비동기 테스트 실행
testConnection();