const { chromium } = require('playwright');

async function manualTestGuide() {
  console.log('🚀 수동 OAuth 테스트 가이드 시작...\n');
  console.log('=====================================');
  console.log('이 스크립트는 브라우저를 열고 수동 테스트를 안내합니다.');
  console.log('각 단계를 따라하며 OAuth 문제를 진단해보세요.');
  console.log('=====================================\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true // 개발자 도구 자동 열기
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 콘솔 로그 캡처
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      console.log('❌ 브라우저 에러:', text);
    } else if (text.includes('OAuth') || text.includes('PKCE') || text.includes('cookie')) {
      console.log('📌', text);
    }
  });
  
  // 네트워크 요청 모니터링
  page.on('request', request => {
    const url = request.url();
    if (url.includes('supabase') || url.includes('auth') || url.includes('oauth')) {
      console.log('🌐 네트워크 요청:', request.method(), url.substring(0, 100));
    }
  });
  
  page.on('response', response => {
    const url = response.url();
    if (url.includes('auth/callback')) {
      console.log('📥 콜백 응답:', response.status(), url);
    }
  });
  
  try {
    console.log('📋 테스트 단계:\n');
    console.log('1. 홈페이지 접속 중...');
    await page.goto('http://localhost:3000');
    
    console.log('\n2. 개발자 도구 열기 (F12)');
    console.log('   - Network 탭으로 이동');
    console.log('   - Console 탭도 확인\n');
    
    console.log('3. 테스트 진행:');
    console.log('   a) "지금 바로 시작하기" 클릭');
    console.log('   b) 성별 선택 (아무거나)');
    console.log('   c) 나이 입력 (아무 숫자)');
    console.log('   d) "다음" 클릭');
    console.log('   e) 질문에 아무렇게나 답변');
    console.log('   f) "제출" 클릭\n');
    
    console.log('4. 회원가입 페이지 도착 후:');
    console.log('   a) 인스타그램 아이디 입력 (test123 등)');
    console.log('   b) Google 또는 Kakao 로그인 클릭\n');
    
    console.log('5. OAuth 팝업/리다이렉트 확인:');
    console.log('   - URL에 code_challenge 파라미터가 있는지 확인');
    console.log('   - 개발자 도구 Network 탭에서 auth/callback 요청 확인');
    console.log('   - 쿠키 탭에서 sb- 로 시작하는 쿠키 확인\n');
    
    console.log('💡 디버깅 팁:');
    console.log('   - Console에 빨간 에러가 있는지 확인');
    console.log('   - Network 탭에서 실패한 요청(빨간색) 확인');
    console.log('   - Application > Cookies에서 쿠키 상태 확인\n');
    
    console.log('🔍 현재 페이지에서 쿠키 확인하기:');
    const cookies = await context.cookies();
    console.log(`   현재 쿠키 개수: ${cookies.length}`);
    cookies.forEach(cookie => {
      if (cookie.name.includes('sb-') || cookie.name.includes('pkce')) {
        console.log(`   - ${cookie.name}: ${cookie.value.substring(0, 30)}...`);
      }
    });
    
    console.log('\n⏰ 브라우저는 5분 후에 자동으로 닫힙니다.');
    console.log('   수동으로 테스트를 진행해보세요!\n');
    
    // JavaScript 코드 주입 - 쿠키 모니터링
    await page.evaluate(() => {
      console.log('🔧 쿠키 모니터링 시작...');
      
      // 원래 document.cookie setter 저장
      const originalCookieSetter = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie').set;
      
      // document.cookie setter 오버라이드
      Object.defineProperty(document, 'cookie', {
        set: function(value) {
          console.log('🍪 쿠키 설정 시도:', value);
          originalCookieSetter.call(this, value);
        },
        get: function() {
          return document.cookie;
        }
      });
      
      // localStorage 모니터링
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = function(key, value) {
        if (key.includes('supabase') || key.includes('test')) {
          console.log('💾 localStorage 설정:', key, value?.substring(0, 50));
        }
        originalSetItem.call(this, key, value);
      };
    });
    
    // 5분 대기
    await page.waitForTimeout(300000);
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error.message);
  } finally {
    console.log('\n✅ 테스트 종료');
    await browser.close();
  }
}

manualTestGuide().catch(console.error);