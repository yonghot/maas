const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testOAuthFlow() {
  console.log('🔍 OAuth Flow 테스트 시작...\n');
  
  // 1. 현재 인증 상태 확인
  console.log('1️⃣ 현재 인증 상태 확인...');
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError) {
    console.log('   ❌ 인증 오류:', authError.message);
  } else if (user) {
    console.log('   ✅ 로그인된 사용자:', user.id);
    console.log('   📧 이메일:', user.email);
    
    // 프로필 확인
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (profile) {
      console.log('   ✅ 프로필 존재:');
      console.log('      - 성별:', profile.gender);
      console.log('      - 나이:', profile.age);
      console.log('      - 점수:', profile.total_score);
      console.log('      - Instagram:', profile.instagram_id);
    } else {
      console.log('   ⚠️ 프로필 없음 (신규 사용자)');
    }
  } else {
    console.log('   ℹ️ 로그인되지 않은 상태');
  }
  
  // 2. 테이블 상태 확인
  console.log('\n2️⃣ 데이터베이스 테이블 상태...');
  
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('user_id, gender, total_score, instagram_id, created_at')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (profiles && profiles.length > 0) {
    console.log(`   ✅ 최근 프로필 ${profiles.length}개:`);
    profiles.forEach((p, i) => {
      console.log(`      ${i + 1}. ${p.gender} / 점수: ${p.total_score} / Instagram: ${p.instagram_id || '없음'}`);
    });
  } else {
    console.log('   ⚠️ 프로필 데이터 없음');
  }
  
  // 3. OAuth Provider 상태 확인
  console.log('\n3️⃣ OAuth Provider 설정 상태...');
  console.log('   ℹ️ Supabase Dashboard에서 확인 필요:');
  console.log('      - Google OAuth: https://app.supabase.com/project/hvpyqchgimnzaotwztuy/auth/providers');
  console.log('      - Kakao OAuth: 위 링크에서 함께 확인');
  
  // 4. PKCE 테스트 (시뮬레이션)
  console.log('\n4️⃣ PKCE Flow 시뮬레이션...');
  console.log('   ℹ️ 실제 OAuth 플로우:');
  console.log('      1. 사용자가 소셜 로그인 버튼 클릭');
  console.log('      2. Supabase가 PKCE 쿠키 생성 (sb-xxx-auth-token-code-verifier)');
  console.log('      3. OAuth Provider로 리다이렉트');
  console.log('      4. 인증 후 /auth/callback으로 돌아옴');
  console.log('      5. PKCE 쿠키 검증 및 세션 생성');
  
  // 5. 권장 사항
  console.log('\n5️⃣ 권장 디버깅 단계:');
  console.log('   1. 브라우저 개발자 도구 > Application > Cookies 확인');
  console.log('   2. sb- 로 시작하는 쿠키들이 있는지 확인');
  console.log('   3. Network 탭에서 /auth/callback 요청 확인');
  console.log('   4. Console에서 오류 메시지 확인');
  
  console.log('\n✅ 테스트 완료!');
}

testOAuthFlow().catch(console.error);