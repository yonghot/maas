const { chromium } = require('playwright');

async function testOAuthFlow() {
  console.log('🚀 브라우저 자동 테스트 시작...\n');
  
  const browser = await chromium.launch({ 
    headless: false, // 브라우저 UI 표시
    slowMo: 500 // 각 액션마다 500ms 대기
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 1. 홈페이지 접속
    console.log('1️⃣ 홈페이지 접속...');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(1000);
    
    // 2. 테스트 시작
    console.log('2️⃣ 테스트 페이지로 이동...');
    await page.click('text=테스트 시작');
    await page.waitForTimeout(1000);
    
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
    
    // 5. 질문에 대답 (간단하게 몇 개만)
    console.log('5️⃣ 질문 답변...');
    
    // 스크롤하면서 답변
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('PageDown');
      await page.waitForTimeout(500);
    }
    
    // 6. 제출
    console.log('6️⃣ 테스트 제출...');
    const submitButton = await page.locator('button:has-text("제출")');
    if (await submitButton.isVisible()) {
      await submitButton.click();
      console.log('   ✅ 제출 완료');
    }
    
    // 7. 회원가입 페이지 확인
    console.log('7️⃣ 회원가입 페이지 확인...');
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    console.log('   현재 URL:', currentUrl);
    
    // 8. 쿠키 확인
    console.log('8️⃣ 쿠키 상태 확인...');
    const cookies = await context.cookies();
    const supabaseCookies = cookies.filter(c => c.name.includes('sb-'));
    
    console.log(`   ✅ Supabase 쿠키 ${supabaseCookies.length}개 발견:`);
    supabaseCookies.forEach(cookie => {
      console.log(`      - ${cookie.name}: ${cookie.value.substring(0, 20)}...`);
    });
    
    // 9. localStorage 확인
    console.log('9️⃣ localStorage 확인...');
    const localStorage = await page.evaluate(() => {
      const items = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        items[key] = window.localStorage.getItem(key)?.substring(0, 50) + '...';
      }
      return items;
    });
    
    console.log('   localStorage 항목:', Object.keys(localStorage).length);
    Object.entries(localStorage).forEach(([key, value]) => {
      console.log(`      - ${key}: ${value}`);
    });
    
    console.log('\n✅ 테스트 완료!');
    console.log('💡 브라우저 창을 직접 조작하여 OAuth 로그인을 테스트해보세요.');
    
    // 브라우저를 열어둠 (수동 테스트 가능)
    await page.waitForTimeout(60000); // 60초 대기
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error);
  } finally {
    await browser.close();
  }
}

testOAuthFlow().catch(console.error);