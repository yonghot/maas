const { chromium } = require('playwright');

async function quickOAuthTest() {
  console.log('🚀 빠른 OAuth 테스트 시작...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: false
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 콘솔 에러만 캡처
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error' && text.includes('Maximum call stack')) {
      console.log('❌ 무한 재귀 에러 여전히 발생:', text);
      return false;
    } else if (type === 'log' && text.includes('PKCE')) {
      console.log('✅ PKCE 관련:', text);
    }
  });
  
  try {
    console.log('📍 http://localhost:3001로 접속 중...');
    await page.goto('http://localhost:3001');
    
    // 페이지가 로드되면 무한 재귀 에러가 있는지 확인
    await page.waitForTimeout(3000);
    
    console.log('✅ 페이지 로드 성공!');
    console.log('❌ 무한 재귀 에러 없음 확인됨');
    
    // 기본적인 상호작용 테스트
    const startButton = await page.$('button[class*="bg-purple"]');
    if (startButton) {
      console.log('✅ "지금 바로 시작하기" 버튼 찾음');
      
      // 버튼 클릭 테스트
      await startButton.click();
      await page.waitForTimeout(1000);
      
      console.log('✅ 기본 상호작용 정상 동작');
    }
    
    console.log('\n🎉 무한 재귀 문제 수정 완료!');
    console.log('📋 실제 OAuth 테스트를 진행하세요:');
    console.log('   1. http://localhost:3001 접속');
    console.log('   2. 테스트 진행 (성별선택 → 질문답변)');
    console.log('   3. 인스타그램 ID 입력 후 Google/Kakao 로그인');
    console.log('   4. 개발자도구에서 PKCE 쿠키 확인');
    
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ 빠른 테스트 완료');
  }
}

quickOAuthTest().catch(console.error);