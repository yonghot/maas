/**
 * Supabase OAuth 설정 확인 스크립트
 * 프로바이더 설정 문제를 정확히 진단
 */

console.log('\n🚨 ===== 핵심 문제 발견 =====\n');
console.log('OAuth URL이 Google/Kakao로 가지 않고 Supabase로만 갑니다!');
console.log('이는 Supabase Dashboard에서 Provider 설정이 잘못되었음을 의미합니다.\n');

console.log('✅ 즉시 확인해야 할 사항:');
console.log('=====================================\n');

console.log('1️⃣ Supabase Dashboard 접속');
console.log('   URL: https://supabase.com/dashboard/project/hvpyqchgimnzaotwztuy\n');

console.log('2️⃣ Authentication → Providers 메뉴로 이동\n');

console.log('3️⃣ Google Provider 설정 확인');
console.log('   ❓ Google Provider가 "Enabled" 상태인가?');
console.log('   ❓ Google Client ID가 입력되어 있는가?');
console.log('      → 현재 설정된 ID: 264154438039-0gjglspsg0btsrfp49dlug60evvh01im.apps.googleusercontent.com');
console.log('   ❓ Google Client Secret이 입력되어 있는가?');
console.log('      → Client Secret은 Google Cloud Console에서 확인 가능');
console.log('');

console.log('4️⃣ Kakao Provider 설정 확인');
console.log('   ❓ Kakao Provider가 "Enabled" 상태인가?');
console.log('   ❓ Kakao Client ID (REST API Key)가 입력되어 있는가?');
console.log('   ❓ Kakao Client Secret이 입력되어 있는가?');
console.log('      → Kakao Developers에서 확인 가능');
console.log('');

console.log('⚠️ 중요: Provider가 Enabled 상태여도 Client ID/Secret이 없으면 작동하지 않습니다!\n');

console.log('5️⃣ Google Client Secret 확인 방법');
console.log('=====================================');
console.log('1. https://console.cloud.google.com 접속');
console.log('2. 프로젝트 선택 (inmyleague)');
console.log('3. APIs & Services → Credentials');
console.log('4. OAuth 2.0 Client IDs 섹션에서 "inmyleague" 클릭');
console.log('5. Client secret 확인 및 복사');
console.log('6. Supabase Dashboard의 Google Provider 설정에 붙여넣기');
console.log('');

console.log('6️⃣ Kakao Client Secret 확인 방법');
console.log('=====================================');
console.log('1. https://developers.kakao.com 접속');
console.log('2. 내 애플리케이션 → MAAS 앱 선택');
console.log('3. 앱 설정 → 앱 키');
console.log('4. REST API 키 복사 → Supabase의 Kakao Client ID에 붙여넣기');
console.log('5. 앱 설정 → 보안');
console.log('6. Client Secret 생성 (없으면 "코드 생성" 클릭)');
console.log('7. 생성된 Secret을 Supabase의 Kakao Client Secret에 붙여넣기');
console.log('');

console.log('7️⃣ 설정 후 확인 방법');
console.log('=====================================');
console.log('1. Supabase Dashboard에서 모든 설정 저장');
console.log('2. 약 30초 대기 (설정 반영 시간)');
console.log('3. https://maas-eight.vercel.app/debug-oauth 접속');
console.log('4. "연결 테스트 실행" 클릭');
console.log('5. OAuth URL에 accounts.google.com 또는 kauth.kakao.com이 포함되는지 확인');
console.log('');

console.log('💡 추가 팁');
console.log('=====================================');
console.log('• Supabase에서 Provider를 처음 설정하는 경우 Save를 두 번 클릭해야 할 수 있음');
console.log('• Client Secret은 보안상 한 번만 표시되므로 안전한 곳에 보관');
console.log('• 설정 변경 후 브라우저 캐시 삭제 권장 (Ctrl+Shift+Delete)');
console.log('');

console.log('🔥 문제 해결 순서');
console.log('=====================================');
console.log('1. Supabase Dashboard에서 Google/Kakao Provider 설정 확인');
console.log('2. Client ID와 Client Secret 모두 입력되어 있는지 확인');
console.log('3. 저장 후 30초 대기');
console.log('4. /debug-oauth 페이지에서 재테스트');
console.log('5. 여전히 문제가 있으면 브라우저 캐시 삭제 후 재시도');
console.log('');

console.log('현재 상황: OAuth URL이 Provider로 전달되지 않고 있음');
console.log('원인: Supabase Dashboard의 Provider 설정이 불완전함');
console.log('해결책: 위 단계를 따라 Client ID와 Secret 설정 완료\n');