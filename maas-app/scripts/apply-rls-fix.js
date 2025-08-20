const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function applyRLSFix() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
    console.log('필요한 환경 변수:');
    console.log('  - NEXT_PUBLIC_SUPABASE_URL');
    console.log('  - SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('🔧 RLS 성능 최적화 시작...\n');

    // SQL 파일 읽기
    const sqlPath = path.join(__dirname, 'fix-rls-performance.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // SQL 실행
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: sqlContent
    }).single();

    if (error) {
      // exec_sql RPC가 없는 경우 대안
      console.log('ℹ️  직접 SQL 실행이 불가능합니다.');
      console.log('📋 다음 단계를 따라주세요:\n');
      console.log('1. Supabase Dashboard 접속');
      console.log('2. SQL Editor 탭 이동');
      console.log('3. scripts/fix-rls-performance.sql 파일 내용 복사');
      console.log('4. SQL Editor에 붙여넣기 후 실행\n');
      console.log('또는 다음 링크에서 직접 실행:');
      console.log(`${supabaseUrl.replace('.supabase.co', '.supabase.com')}/project/_/sql\n`);
    } else {
      console.log('✅ RLS 정책이 성능 최적화되었습니다!');
      console.log('\n변경 사항:');
      console.log('  - users 테이블 RLS 정책 최적화');
      console.log('  - profiles 테이블 RLS 정책 최적화');
      console.log('  - auth.uid() 함수 호출 최소화\n');
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    console.log('\n📋 수동으로 적용하려면:');
    console.log('1. Supabase Dashboard → SQL Editor');
    console.log('2. scripts/fix-rls-performance.sql 내용 실행\n');
  }
}

// 스크립트 실행
applyRLSFix();