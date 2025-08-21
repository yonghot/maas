const { chromium } = require('playwright');

async function testOAuthFlow() {
  console.log('🚀 OAuth 상세 테스트 시작...\n');
  
  const browser = await chromium.launch({ 
    headless: false, // 브라우저 UI 표시
    slowMo: 1000 // 각 액션마다 1초 대기
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 콘솔 로그 캡처
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ 브라우저 콘솔 에러:', msg.text());
    }
  });
  
  try {
    // 1. 홈페이지 접속
    console.log('1️⃣ 홈페이지 접속...');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    // 2. 테스트 시작
    console.log('2️⃣ 테스트 시작 버튼 클릭...');
    await page.click('button:has-text("지금 바로 시작하기")');
    await page.waitForTimeout(2000);
    
    // 3. 성별 선택 (남성)
    console.log('3️⃣ 성별 선택...');
    const maleButton = await page.locator('button:has-text("♂")').first();
    if (await maleButton.isVisible()) {
      await maleButton.click();
      console.log('   ✅ 남성 선택');
    }
    
    // 4. 나이 입력
    console.log('4️⃣ 나이 입력...');
    await page.fill('input[type="number"]', '30');
    await page.waitForTimeout(1000);
    
    // 5. 다음 버튼 클릭하여 질문 페이지로
    console.log('5️⃣ 다음 버튼 클릭...');
    await page.click('button:has-text("다음")');
    await page.waitForTimeout(2000);
    
    // 6. 몇 개 질문에 답변 (간단하게)
    console.log('6️⃣ 질문에 답변...');
    
    // 첫 번째 질문 - 슬라이더가 있으면 조작
    const sliders = await page.locator('input[type="range"]').all();
    for (let i = 0; i < Math.min(3, sliders.length); i++) {
      await sliders[i].fill('70');
      await page.waitForTimeout(500);
    }
    
    // 라디오 버튼이 있으면 선택
    const radioButtons = await page.locator('input[type="radio"]').all();
    for (let i = 0; i < Math.min(3, radioButtons.length); i += 2) {
      await radioButtons[i].click();
      await page.waitForTimeout(500);
    }
    
    // 7. 제출 버튼 찾기
    console.log('7️⃣ 제출 버튼 클릭...');
    const submitButton = await page.locator('button:has-text("제출")').first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      console.log('   ✅ 제출 완료');
      await page.waitForTimeout(3000);
    }
    
    // 8. signup-result 페이지 확인
    console.log('8️⃣ 회원가입 페이지 도착 확인...');
    const currentUrl = page.url();
    console.log('   현재 URL:', currentUrl);
    
    if (currentUrl.includes('signup-result')) {
      console.log('   ✅ 회원가입 페이지 도착!');
      
      // 9. 쿠키 상태 확인
      console.log('\n9️⃣ 쿠키 상태 확인...');
      const cookies = await context.cookies();
      
      console.log('   전체 쿠키 개수:', cookies.length);
      
      // Supabase 관련 쿠키 확인
      const supabaseCookies = cookies.filter(c => c.name.includes('sb-'));
      console.log('   Supabase 쿠키 개수:', supabaseCookies.length);
      
      // PKCE 관련 쿠키 확인
      const pkceCookies = cookies.filter(c => 
        c.name.includes('pkce') || 
        c.name.includes('code-verifier') ||
        c.name.includes('auth-token')
      );
      console.log('   PKCE 관련 쿠키 개수:', pkceCookies.length);
      
      // 쿠키 상세 정보
      console.log('\n   📋 쿠키 상세 정보:');
      cookies.forEach(cookie => {
        if (cookie.name.includes('sb-') || cookie.name.includes('pkce') || cookie.name.includes('code')) {
          console.log(`      - ${cookie.name}: ${cookie.value.substring(0, 30)}...`);
          console.log(`        Domain: ${cookie.domain}, Path: ${cookie.path}, HttpOnly: ${cookie.httpOnly}`);
        }
      });
      
      // 10. localStorage 확인
      console.log('\n🔟 localStorage 확인...');
      const localStorage = await page.evaluate(() => {
        const items = {};
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          items[key] = window.localStorage.getItem(key);
        }
        return items;
      });
      
      console.log('   localStorage 항목 개수:', Object.keys(localStorage).length);
      if (localStorage['test-result']) {
        console.log('   ✅ test-result 데이터 있음');
      }
      
      // 11. 소셜 로그인 버튼 클릭 시도
      console.log('\n1️⃣1️⃣ 소셜 로그인 버튼 확인...');
      
      // Google 로그인 버튼 찾기
      const googleButton = await page.locator('button:has-text("Google")').first();
      if (await googleButton.isVisible()) {
        console.log('   ✅ Google 로그인 버튼 발견');
        
        // 클릭하기 전에 네트워크 모니터링 시작
        console.log('\n1️⃣2️⃣ OAuth 리다이렉트 모니터링...');
        
        // 새 탭이 열리는 것을 감지
        const [popup] = await Promise.all([
          context.waitForEvent('page'),
          googleButton.click()
        ]);
        
        if (popup) {
          console.log('   ✅ OAuth 팝업/탭 열림');
          const oauthUrl = popup.url();
          console.log('   OAuth URL:', oauthUrl);
          
          // OAuth URL 파라미터 분석
          if (oauthUrl.includes('supabase.co/auth')) {
            console.log('   ✅ Supabase Auth 페이지 도달');
            
            // URL 파라미터 확인
            const url = new URL(oauthUrl);
            const hasCodeChallenge = url.searchParams.has('code_challenge');
            const hasChallengeMethod = url.searchParams.has('code_challenge_method');
            
            console.log('   PKCE 파라미터:');
            console.log(`      - code_challenge: ${hasCodeChallenge ? '있음' : '❌ 없음'}`);
            console.log(`      - code_challenge_method: ${hasChallengeMethod ? '있음' : '❌ 없음'}`);
            
            if (!hasCodeChallenge || !hasChallengeMethod) {
              console.log('\n   ⚠️ 경고: PKCE 파라미터가 누락되었습니다!');
              console.log('   이것이 "code verifier should be non-empty" 오류의 원인일 수 있습니다.');
            }
          }
          
          // 팝업 닫기
          await popup.close();
        }
      }
      
      // 12. 최종 분석
      console.log('\n1️⃣2️⃣ 최종 분석 결과:');
      console.log('======================================');
      
      if (pkceCookies.length === 0) {
        console.log('❌ 문제 발견: PKCE 쿠키가 설정되지 않음');
        console.log('   → signInWithOAuth 호출 시 쿠키가 제대로 설정되지 않는 것으로 보임');
      }
      
      if (!localStorage['test-result']) {
        console.log('⚠️ 경고: localStorage에 test-result 데이터 없음');
        console.log('   → 테스트 결과가 저장되지 않았을 수 있음');
      }
      
      console.log('\n💡 권장 해결 방법:');
      console.log('   1. Supabase 클라이언트 생성 시 쿠키 옵션 확인');
      console.log('   2. signInWithOAuth 호출 전 PKCE 쿠키 명시적 설정');
      console.log('   3. 서버 컴포넌트와 클라이언트 컴포넌트 간 쿠키 동기화');
      
    } else {
      console.log('   ❌ signup-result 페이지가 아님:', currentUrl);
    }
    
    console.log('\n✅ 테스트 완료!');
    console.log('브라우저를 열어두고 수동으로 추가 테스트 가능합니다.');
    
    // 브라우저를 열어둠 (수동 테스트 가능)
    await page.waitForTimeout(60000); // 60초 대기
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error.message);
  } finally {
    await browser.close();
  }
}

testOAuthFlow().catch(console.error);