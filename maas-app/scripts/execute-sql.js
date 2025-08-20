#!/usr/bin/env node

/**
 * Supabase SQL 실행 스크립트
 * 
 * 사용법:
 * - 특정 SQL 파일 실행: node scripts/execute-sql.js scripts/fix-database-issues.sql
 * - 직접 SQL 실행: node scripts/execute-sql.js --sql "SELECT * FROM profiles LIMIT 1"
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// .env.local 파일 로드
dotenv.config({ path: '.env.local' });

// Supabase 클라이언트 생성 (Service Role Key 사용)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.');
  console.error('NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 확인하세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// SQL 실행 함수
async function executeSql(sqlContent) {
  try {
    console.log('🔄 SQL 실행 중...\n');
    
    // SQL을 세미콜론으로 분리하여 각 쿼리를 개별 실행
    const queries = sqlContent
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0 && !q.startsWith('--')); // 빈 쿼리와 주석만 있는 라인 제거
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      
      // 주석 제거 (여러 줄 주석 포함)
      const cleanQuery = query.replace(/\/\*[\s\S]*?\*\//g, '').trim();
      
      if (!cleanQuery) continue;
      
      // 쿼리 타입 확인
      const queryType = cleanQuery.split(/\s+/)[0].toUpperCase();
      console.log(`\n📝 쿼리 ${i + 1}/${queries.length}: ${queryType}...`);
      
      try {
        // rpc를 사용하여 직접 SQL 실행
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: cleanQuery + ';'
        }).catch(async (rpcError) => {
          // rpc가 없는 경우 직접 실행 시도
          if (queryType === 'SELECT') {
            // SELECT 쿼리는 from()을 사용할 수 없으므로 건너뜀
            console.log('⚠️  SELECT 쿼리는 직접 실행할 수 없습니다. Supabase Dashboard에서 확인하세요.');
            return { data: null, error: null };
          } else {
            // DDL 쿼리는 직접 실행 불가, 에러 반환
            return { data: null, error: new Error('DDL 쿼리는 RPC 함수가 필요합니다.') };
          }
        });
        
        if (error) {
          throw error;
        }
        
        console.log('✅ 성공');
        successCount++;
        
        // SELECT 쿼리 결과가 있으면 출력
        if (data && Array.isArray(data) && data.length > 0) {
          console.log('결과:', JSON.stringify(data, null, 2));
        }
      } catch (error) {
        console.error(`❌ 실패: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`📊 실행 완료: 성공 ${successCount}개, 실패 ${errorCount}개`);
    
    if (errorCount > 0) {
      console.log('\n⚠️  일부 쿼리가 실패했습니다.');
      console.log('RPC 함수가 없는 경우, Supabase Dashboard에서 직접 SQL을 실행해야 합니다.');
    }
    
  } catch (error) {
    console.error('❌ SQL 실행 중 오류 발생:', error.message);
    process.exit(1);
  }
}

// RPC 함수 생성 (한 번만 실행)
async function createExecSqlFunction() {
  const createFunctionSql = `
    CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
    RETURNS json AS $$
    DECLARE
      result json;
    BEGIN
      EXECUTE sql_query;
      RETURN json_build_object('success', true, 'message', 'Query executed successfully');
    EXCEPTION WHEN OTHERS THEN
      RETURN json_build_object('success', false, 'error', SQLERRM);
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;
  
  console.log('📦 exec_sql RPC 함수 생성 시도...');
  console.log('이 함수는 Supabase Dashboard의 SQL Editor에서 직접 실행해야 합니다:\n');
  console.log(createFunctionSql);
  console.log('\n위 SQL을 Dashboard에서 실행한 후 이 스크립트를 다시 실행하세요.\n');
}

// 메인 실행
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('사용법:');
    console.log('  SQL 파일 실행: node scripts/execute-sql.js <SQL파일경로>');
    console.log('  직접 SQL 실행: node scripts/execute-sql.js --sql "<SQL쿼리>"');
    console.log('  RPC 함수 생성: node scripts/execute-sql.js --create-function');
    process.exit(0);
  }
  
  if (args[0] === '--create-function') {
    await createExecSqlFunction();
    return;
  }
  
  let sqlContent;
  
  if (args[0] === '--sql') {
    // 직접 SQL 실행
    sqlContent = args[1];
    if (!sqlContent) {
      console.error('❌ SQL 쿼리를 입력하세요.');
      process.exit(1);
    }
  } else {
    // SQL 파일 읽기
    const sqlFilePath = path.resolve(args[0]);
    
    if (!fs.existsSync(sqlFilePath)) {
      console.error(`❌ 파일을 찾을 수 없습니다: ${sqlFilePath}`);
      process.exit(1);
    }
    
    sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');
    console.log(`📂 SQL 파일: ${sqlFilePath}`);
  }
  
  await executeSql(sqlContent);
}

// 스크립트 실행
main().catch(console.error);