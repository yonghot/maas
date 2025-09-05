/**
 * Supabase OAuth 설정 체크리스트
 * 
 * 이 스크립트는 Supabase 대시보드에서 확인해야 할 설정들을 안내합니다.
 */

console.log('\n🔍 ===== Supabase OAuth 설정 체크리스트 =====\n');

console.log('📌 Supabase 대시보드 URL:');
console.log('   https://supabase.com/dashboard/project/hvpyqchgimnzaotwztuy\n');

console.log('1️⃣ OAuth Providers 설정 확인');
console.log('================================');
console.log('경로: Authentication → Providers');
console.log('');
console.log('✅ 확인 사항:');
console.log('   □ Google Provider가 "Enabled" 상태인가?');
console.log('   □ Google Client ID가 입력되어 있는가?');
console.log('   □ Google Client Secret이 입력되어 있는가?');
console.log('   □ Kakao Provider가 "Enabled" 상태인가?');
console.log('   □ Kakao Client ID (REST API Key)가 입력되어 있는가?');
console.log('   □ Kakao Client Secret이 입력되어 있는가?');
console.log('');

console.log('2️⃣ Redirect URLs 설정 확인 (가장 중요!)');
console.log('================================');
console.log('경로: Authentication → URL Configuration');
console.log('');
console.log('✅ Site URL:');
console.log('   https://maas-eight.vercel.app');
console.log('');
console.log('✅ Redirect URLs (모두 추가되어야 함):');
console.log('   http://localhost:3000/auth/callback');
console.log('   http://localhost:3001/auth/callback');
console.log('   https://maas-eight.vercel.app/auth/callback');
console.log('');
console.log('⚠️ 중요: Redirect URLs에 위 3개 URL이 모두 추가되어 있어야 합니다!');
console.log('');

console.log('3️⃣ Google OAuth 설정');
console.log('================================');
console.log('Google Cloud Console: https://console.cloud.google.com');
console.log('');
console.log('✅ OAuth 2.0 Client ID의 Authorized redirect URIs:');
console.log('   https://hvpyqchgimnzaotwztuy.supabase.co/auth/v1/callback');
console.log('');

console.log('4️⃣ Kakao OAuth 설정');
console.log('================================');
console.log('Kakao Developers: https://developers.kakao.com');
console.log('');
console.log('✅ 카카오 로그인 Redirect URI:');
console.log('   https://hvpyqchgimnzaotwztuy.supabase.co/auth/v1/callback');
console.log('');

console.log('5️⃣ 문제 진단');
console.log('================================');
console.log('');
console.log('증상별 해결책:');
console.log('');
console.log('❌ "Invalid API key" 오류');
console.log('   → 환경 변수가 설정되지 않음 (이미 폴백으로 해결됨)');
console.log('');
console.log('❌ OAuth URL이 생성되지 않음');
console.log('   → Provider가 비활성화되어 있거나 Client ID/Secret이 없음');
console.log('');
console.log('❌ OAuth 후 "session_failed" 오류');
console.log('   → Redirect URLs에 콜백 URL이 추가되지 않음');
console.log('');
console.log('❌ Google/Kakao 로그인 페이지에서 에러');
console.log('   → Google/Kakao 콘솔에서 Redirect URI 설정 필요');
console.log('');

console.log('6️⃣ 테스트 순서');
console.log('================================');
console.log('1. https://maas-eight.vercel.app/debug-oauth 접속');
console.log('2. "연결 테스트 실행" 클릭 → 성공 확인');
console.log('3. "Google 로그인 테스트" 클릭');
console.log('4. OAuth URL이 생성되는지 확인');
console.log('5. URL이 생성되면 "확인" 클릭하여 실제 로그인 진행');
console.log('');

console.log('💡 팁: 브라우저 개발자 도구의 Console 탭을 열어두고 테스트하면');
console.log('      더 자세한 오류 메시지를 볼 수 있습니다.\n');