const { chromium } = require('playwright');

async function testOAuthSimple() {
  console.log('🚀 간단한 OAuth 테스트 시작...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 1. 홈페이지 직접 접속
    console.log('1️⃣ 홈페이지 접속...');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    // 2. 쿠키 상태 확인
    console.log('\n2️⃣ 초기 쿠키 상태:');
    let cookies = await context.cookies();
    console.log(`   전체 쿠키: ${cookies.length}개`);
    cookies.forEach(c => {
      if (c.name.includes('sb-') || c.name.includes('supabase')) {
        console.log(`   - ${c.name}: ${c.value.substring(0, 30)}...`);
      }
    });
    
    // 3. 테스트 시작
    console.log('\n3️⃣ 테스트 시작...');
    await page.click('button:has-text("지금 바로 시작하기")');
    await page.waitForTimeout(2000);
    
    // 4. 간단한 테스트 진행
    console.log('4️⃣ 간단한 테스트 진행...');
    
    // 성별 선택 시도
    try {
      const maleButton = await page.waitForSelector('button:has-text("♂")', { timeout: 3000 });
      await maleButton.click();
      console.log('   ✅ 성별 선택 완료');
    } catch (e) {
      console.log('   ⚠️ 성별 선택 버튼 없음');
    }
    
    // 나이 입력 시도
    try {
      const ageInput = await page.waitForSelector('input[type="number"]', { timeout: 3000 });
      await ageInput.fill('30');
      console.log('   ✅ 나이 입력 완료');
    } catch (e) {
      console.log('   ⚠️ 나이 입력 필드 없음');
    }
    
    // 다음 버튼 클릭
    try {
      await page.click('button:has-text("다음")');
      await page.waitForTimeout(2000);
      console.log('   ✅ 다음 버튼 클릭');
    } catch (e) {
      console.log('   ⚠️ 다음 버튼 없음');
    }
    
    // 몇 개 질문에 간단히 답변
    console.log('5️⃣ 질문 답변 시도...');
    
    // 슬라이더가 있으면 조작
    const sliders = await page.locator('input[type="range"]').all();
    for (let i = 0; i < Math.min(2, sliders.length); i++) {
      await sliders[i].fill('50');
    }
    console.log(`   슬라이더 ${sliders.length}개 조작`);
    
    // 제출 버튼 찾기
    try {
      const submitButton = await page.waitForSelector('button:has-text("제출")', { timeout: 3000 });
      await submitButton.click();
      console.log('   ✅ 제출 완료');
      await page.waitForTimeout(3000);
    } catch (e) {
      console.log('   ⚠️ 제출 버튼 없음');
    }
    
    // 5. signup-result 페이지 확인
    console.log('\n6️⃣ 현재 페이지 확인...');
    const currentUrl = page.url();
    console.log('   URL:', currentUrl);
    
    if (currentUrl.includes('signup-result')) {
      console.log('   ✅ 회원가입 페이지 도착!');
      
      // 인스타그램 아이디 입력
      try {
        const instagramInput = await page.waitForSelector('input[placeholder*="instagram"]', { timeout: 3000 });
        await instagramInput.fill('test_user_123');
        console.log('   ✅ 인스타그램 아이디 입력');
      } catch (e) {
        console.log('   ⚠️ 인스타그램 입력 필드 없음');
      }
      
      // 7. OAuth 버튼 확인
      console.log('\n7️⃣ OAuth 버튼 확인...');
      
      const googleButton = await page.locator('button:has-text("Google")').first();
      const kakaoButton = await page.locator('button:has-text("카카오")').first();
      
      if (await googleButton.isVisible()) {
        console.log('   ✅ Google 로그인 버튼 있음');
      }
      if (await kakaoButton.isVisible()) {
        console.log('   ✅ Kakao 로그인 버튼 있음');
      }
      
      // 8. 쿠키 재확인
      console.log('\n8️⃣ 최종 쿠키 상태:');
      cookies = await context.cookies();
      console.log(`   전체 쿠키: ${cookies.length}개`);
      
      const supabaseCookies = cookies.filter(c => 
        c.name.includes('sb-') || 
        c.name.includes('supabase') ||
        c.name.includes('pkce') ||
        c.name.includes('test_result')
      );
      
      console.log(`   관련 쿠키: ${supabaseCookies.length}개`);
      supabaseCookies.forEach(c => {
        console.log(`   - ${c.name}: ${c.value.substring(0, 30)}...`);
      });
      
      // 9. localStorage 확인
      console.log('\n9️⃣ localStorage 확인:');
      const localStorage = await page.evaluate(() => {
        const items = {};
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key?.includes('supabase') || key?.includes('test')) {
            items[key] = window.localStorage.getItem(key)?.substring(0, 50) + '...';
          }
        }
        return items;
      });
      
      console.log('   항목 개수:', Object.keys(localStorage).length);
      Object.entries(localStorage).forEach(([key, value]) => {
        console.log(`   - ${key}: ${value}`);
      });
      
      // 10. Google 로그인 시도
      console.log('\n🔟 Google OAuth 시도...');
      console.log('   클릭 전 대기...');
      await page.waitForTimeout(2000);
      
      // 네트워크 요청 모니터링 시작
      const requestPromise = page.waitForRequest(request => 
        request.url().includes('supabase') && request.url().includes('auth'),
        { timeout: 10000 }
      ).catch(() => null);
      
      // Google 버튼 클릭
      if (await googleButton.isVisible()) {
        console.log('   Google 버튼 클릭...');
        await googleButton.click();
        
        // 네트워크 요청 대기
        const request = await requestPromise;
        if (request) {
          console.log('   ✅ OAuth 요청 감지:', request.url().substring(0, 100));
        }
        
        await page.waitForTimeout(3000);
        
        // 현재 URL 확인
        const afterClickUrl = page.url();
        console.log('   클릭 후 URL:', afterClickUrl);
        
        if (afterClickUrl.includes('accounts.google.com')) {
          console.log('   ✅ Google OAuth 페이지로 리다이렉트됨!');
        } else if (afterClickUrl.includes('supabase')) {
          console.log('   ✅ Supabase Auth 페이지로 리다이렉트됨!');
        } else {
          console.log('   ⚠️ 예상과 다른 페이지:', afterClickUrl);
        }
      }
    } else {
      console.log('   ❌ signup-result 페이지가 아님');
    }
    
    console.log('\n✅ 테스트 완료!');
    console.log('💡 브라우저를 열어두고 수동으로 계속 테스트할 수 있습니다.');
    
    // 30초 대기
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('\n❌ 테스트 오류:', error.message);
  } finally {
    await browser.close();
  }
}

testOAuthSimple().catch(console.error);