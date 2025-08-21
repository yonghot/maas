const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testGoogleAuth() {
  console.log('=== Google OAuth 설정 테스트 ===\n');
  
  // 환경 변수 확인
  console.log('1. 환경 변수 확인:');
  console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 설정됨' : '❌ 없음');
  console.log('SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ 설정됨' : '❌ 없음');
  console.log('');
  
  // Supabase 프로젝트 URL 파싱
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    console.log('2. 프로젝트 정보:');
    console.log('프로젝트 참조:', projectRef);
    console.log('');
    
    console.log('3. Supabase Dashboard에서 확인해야 할 사항:');
    console.log('');
    console.log('📌 다음 URL로 이동하여 설정을 확인하세요:');
    console.log(`   https://supabase.com/dashboard/project/${projectRef}/auth/providers`);
    console.log('');
    console.log('✅ 확인 사항:');
    console.log('1. Google Provider가 활성화되어 있는지');
    console.log('2. Google Cloud Console에서 OAuth 2.0 클라이언트 ID와 Secret이 설정되어 있는지');
    console.log('3. Authorized redirect URIs에 다음이 포함되어 있는지:');
    console.log(`   - https://${projectRef}.supabase.co/auth/v1/callback`);
    console.log('');
    console.log('4. Site URL 설정 확인:');
    console.log(`   https://supabase.com/dashboard/project/${projectRef}/auth/url-configuration`);
    console.log('   - Site URL: http://localhost:3002');
    console.log('   - Redirect URLs에 추가:');
    console.log('     * http://localhost:3000/auth/callback');
    console.log('     * http://localhost:3001/auth/callback');
    console.log('     * http://localhost:3002/auth/callback');
  }
  
  console.log('\n=== 테스트 완료 ===');
}

testGoogleAuth().catch(console.error);