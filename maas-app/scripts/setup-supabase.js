#!/usr/bin/env node

/**
 * Supabase 초기 설정 확인 스크립트
 * 사용법: node scripts/setup-supabase.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function checkSupabaseConnection() {
  log('\n=== Supabase 연결 테스트 ===\n', 'blue');

  // 1. 환경 변수 확인
  log('1. 환경 변수 확인...', 'yellow');
  
  if (!SUPABASE_URL) {
    log('❌ NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.', 'red');
    return false;
  }
  
  if (!SUPABASE_ANON_KEY) {
    log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되지 않았습니다.', 'red');
    return false;
  }
  
  log('✅ 환경 변수가 설정되었습니다.', 'green');
  log(`   URL: ${SUPABASE_URL}`, 'blue');
  log(`   Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...`, 'blue');

  // 2. Supabase 연결 테스트
  log('\n2. Supabase 연결 테스트...', 'yellow');
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // 간단한 쿼리로 연결 테스트
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116은 빈 테이블 에러 (정상)
      log(`❌ 데이터베이스 연결 실패: ${error.message}`, 'red');
      return false;
    }
    
    log('✅ Supabase 연결 성공!', 'green');
    
    // 3. 테이블 존재 확인
    log('\n3. 테이블 확인...', 'yellow');
    
    const tables = ['users', 'profiles', 'subscriptions', 'payments', 'daily_views', 'profile_views'];
    
    for (const table of tables) {
      const { error: tableError } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (tableError && !tableError.message.includes('no rows')) {
        log(`   ❌ ${table} 테이블이 없습니다.`, 'red');
        log('      → supabase_schema.sql을 실행해주세요.', 'yellow');
      } else {
        log(`   ✅ ${table} 테이블 확인`, 'green');
      }
    }
    
    return true;
  } catch (err) {
    log(`❌ 오류 발생: ${err.message}`, 'red');
    return false;
  }
}

async function main() {
  log('MAAS Supabase 설정 확인 도구', 'blue');
  log('================================\n', 'blue');

  const success = await checkSupabaseConnection();
  
  if (success) {
    log('\n✅ 모든 설정이 완료되었습니다!', 'green');
    log('   npm run dev로 개발 서버를 시작하세요.\n', 'yellow');
  } else {
    log('\n❌ 설정이 완료되지 않았습니다.', 'red');
    log('\n다음 단계를 따라주세요:', 'yellow');
    log('1. https://supabase.com에서 프로젝트 생성', 'blue');
    log('2. .env.local 파일에 Supabase URL과 Key 입력', 'blue');
    log('3. Supabase SQL Editor에서 supabase_schema.sql 실행', 'blue');
    log('4. 이 스크립트를 다시 실행: node scripts/setup-supabase.js\n', 'blue');
  }
}

main().catch(console.error);