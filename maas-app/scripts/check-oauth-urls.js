#!/usr/bin/env node

/**
 * OAuth 리다이렉트 URL 설정 확인 스크립트
 * 사용법: node scripts/check-oauth-urls.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function checkOAuthUrls() {
  log('\n=== OAuth 리다이렉트 URL 설정 확인 ===\n', 'blue');

  // 1. 현재 환경 확인
  log('1. 현재 환경 설정:', 'yellow');
  log(`   Supabase URL: ${SUPABASE_URL}`, 'cyan');
  
  // 2. 필요한 리다이렉트 URL 목록
  log('\n2. 설정해야 할 리다이렉트 URL:', 'yellow');
  const requiredUrls = [
    'https://maas-eight.vercel.app/auth/callback',  // 프로덕션
    'http://localhost:3000/auth/callback',          // 로컬 개발
  ];
  
  requiredUrls.forEach(url => {
    log(`   ✅ ${url}`, 'green');
  });
  
  // 3. Supabase 설정 위치
  log('\n3. Supabase 대시보드 설정 위치:', 'yellow');
  const projectId = SUPABASE_URL?.split('//')[1]?.split('.')[0];
  log(`   🔗 https://app.supabase.com/project/${projectId}/auth/url-configuration`, 'cyan');
  
  // 4. Site URL 설정
  log('\n4. Site URL 설정:', 'yellow');
  log('   프로덕션: https://maas-eight.vercel.app', 'green');
  log('   개발환경: http://localhost:3000', 'green');
  
  // 5. OAuth Provider 설정
  log('\n5. OAuth Provider별 설정:', 'yellow');
  log('   Google OAuth Console:', 'cyan');
  log('   - https://console.developers.google.com', 'cyan');
  log('   - 승인된 리디렉션 URI:', 'cyan');
  log(`     ${SUPABASE_URL}/auth/v1/callback`, 'green');
  
  log('\n   Kakao Developers:', 'cyan');
  log('   - https://developers.kakao.com', 'cyan');
  log('   - Redirect URI:', 'cyan');
  log(`     ${SUPABASE_URL}/auth/v1/callback`, 'green');
  
  // 6. 테스트 방법
  log('\n6. 설정 후 테스트:', 'yellow');
  log('   1. 프로덕션에서 소셜 로그인 테스트', 'cyan');
  log('   2. 로컬에서 npm run dev 후 소셜 로그인 테스트', 'cyan');
  log('   3. 브라우저 개발자 도구에서 리다이렉트 URL 확인', 'cyan');
  
  // 7. 현재 패키지.json 포트 확인
  try {
    const fs = require('fs');
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const devScript = packageJson.scripts?.dev;
    
    log('\n7. 현재 개발 서버 설정:', 'yellow');
    log(`   dev script: ${devScript}`, 'cyan');
    
    if (devScript?.includes('-p 3000')) {
      log('   ✅ 포트 3000으로 올바르게 설정됨', 'green');
    } else {
      log('   ⚠️  포트 설정을 3000으로 변경 권장', 'yellow');
    }
  } catch (error) {
    log('   ⚠️  package.json 읽기 실패', 'yellow');
  }
  
  log('\n✅ 확인 완료! 위 설정들을 Supabase 대시보드에서 적용하세요.\n', 'green');
}

checkOAuthUrls().catch(console.error);