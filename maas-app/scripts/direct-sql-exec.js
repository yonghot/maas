#!/usr/bin/env node

/**
 * Supabase 직접 SQL 실행 스크립트
 * Service Role Key를 사용하여 SQL을 직접 실행합니다
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// .env.local 파일 로드
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

// Admin 클라이언트 생성
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
});

async function executeSqlFile(filePath) {
  try {
    console.log('📂 SQL 파일 읽는 중...');
    const sqlContent = fs.readFileSync(filePath, 'utf-8');
    
    // SQL 문을 세미콜론으로 분리
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📝 ${statements.length}개의 SQL 문 발견\n`);
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // 주석 제거
      const cleanStatement = statement
        .split('\n')
        .filter(line => !line.trim().startsWith('--'))
        .join('\n')
        .trim();
      
      if (!cleanStatement) continue;
      
      // SQL 타입 확인
      const sqlType = cleanStatement.split(/\s+/)[0].toUpperCase();
      console.log(`실행 중 [${i + 1}/${statements.length}]: ${sqlType}...`);
      
      try {
        // PostgreSQL 직접 연결을 통한 SQL 실행
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_raw_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({
            query: cleanStatement + ';'
          })
        });
        
        if (!response.ok) {
          // RPC 함수가 없는 경우 대체 방법 시도
          if (response.status === 404) {
            console.log('⚠️  RPC 함수가 없습니다. 대체 방법 시도...');
            
            // ALTER TABLE 등 DDL 명령어는 직접 실행 불가
            if (sqlType === 'ALTER' || sqlType === 'CREATE' || sqlType === 'DROP') {
              errors.push({
                statement: sqlType,
                error: 'DDL 명령어는 Dashboard에서 실행 필요'
              });
              errorCount++;
              console.log(`⚠️  ${sqlType} 명령어는 Dashboard에서 실행해야 합니다.`);
              continue;
            }
          } else {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
          }
        }
        
        successCount++;
        console.log(`✅ 성공`);
        
      } catch (error) {
        errorCount++;
        errors.push({
          statement: sqlType,
          error: error.message
        });
        console.log(`❌ 실패: ${error.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`📊 실행 결과: 성공 ${successCount}개, 실패 ${errorCount}개\n`);
    
    if (errorCount > 0) {
      console.log('❌ 실패한 명령어들:');
      errors.forEach(e => {
        console.log(`  - ${e.statement}: ${e.error}`);
      });
      console.log('\n💡 해결 방법:');
      console.log('1. 아래 명령어로 RPC 함수를 먼저 생성하세요:');
      console.log('   node scripts/direct-sql-exec.js --create-function\n');
      console.log('2. 또는 Dashboard에서 직접 SQL을 실행하세요:');
      console.log('   https://supabase.com/dashboard/project/hvpyqchgimnzaotwztuy/sql/new');
    }
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
    process.exit(1);
  }
}

async function createRpcFunction() {
  const createFunctionSql = `
-- RPC 함수 생성 (Supabase Dashboard에서 실행)
CREATE OR REPLACE FUNCTION public.exec_raw_sql(query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- SQL 실행
  EXECUTE query;
  
  -- 성공 응답
  RETURN json_build_object(
    'success', true,
    'message', 'Query executed successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- 오류 응답
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'detail', SQLSTATE
    );
END;
$$;

-- 함수 권한 설정
GRANT EXECUTE ON FUNCTION public.exec_raw_sql(text) TO service_role;
`;

  console.log('📦 RPC 함수 생성 SQL:\n');
  console.log('=' .repeat(50));
  console.log(createFunctionSql);
  console.log('=' .repeat(50));
  console.log('\n위 SQL을 Supabase Dashboard에서 실행하세요:');
  console.log('https://supabase.com/dashboard/project/hvpyqchgimnzaotwztuy/sql/new');
  
  // 클립보드에 복사 시도
  try {
    require('child_process').execSync('clip', { input: createFunctionSql });
    console.log('\n✅ SQL이 클립보드에 복사되었습니다!');
  } catch {
    // 클립보드 복사 실패는 무시
  }
}

// 메인 실행
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help') {
    console.log('사용법:');
    console.log('  node scripts/direct-sql-exec.js <SQL파일>');
    console.log('  node scripts/direct-sql-exec.js --create-function');
    console.log('\n예시:');
    console.log('  node scripts/direct-sql-exec.js supabase/migrations/20240820000001_fix_database_issues.sql');
    process.exit(0);
  }
  
  if (args[0] === '--create-function') {
    await createRpcFunction();
    return;
  }
  
  const sqlFile = path.resolve(args[0]);
  
  if (!fs.existsSync(sqlFile)) {
    console.error(`❌ 파일을 찾을 수 없습니다: ${sqlFile}`);
    process.exit(1);
  }
  
  await executeSqlFile(sqlFile);
}

main().catch(console.error);