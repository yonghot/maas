const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '.env.local' });

/**
 * Service Role Key를 사용하여 직접 SQL 실행
 * RLS를 우회하여 테이블 생성 및 데이터 삽입
 */
async function executeSQLDirect() {
  console.log('=== SQL 직접 실행 시작 ===');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('환경 변수가 설정되지 않았습니다.');
  }
  
  console.log('Supabase URL:', supabaseUrl);
  console.log('Service Key 확인:', supabaseServiceKey.substring(0, 20) + '...');
  
  // Service Role Key로 관리자 클라이언트 생성
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  try {
    // SQL 파일 읽기
    const sqlPath = path.join(__dirname, 'create-table-direct.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
    
    console.log('1. SQL 파일 읽기 완료');
    console.log('실행할 SQL 미리보기:', sqlContent.substring(0, 200) + '...');
    
    // REST API를 통한 SQL 실행 시도
    console.log('2. PostgreSQL REST API로 SQL 실행 시도...');
    
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sql: sqlContent
      })
    });
    
    if (!response.ok) {
      console.log('REST API 실행 실패, 다른 방법 시도...');
      
      // 개별 테이블 생성 시도
      console.log('3. 개별 작업으로 테이블 생성 시도...');
      
      const { data: createResult, error: createError } = await supabase
        .from('scoring_weights')
        .select('*')
        .limit(1);
        
      if (createError && createError.code === 'PGRST205') {
        console.log('❌ 테이블이 존재하지 않습니다.');
        console.log('📋 수동 생성이 필요합니다:');
        console.log('1. https://supabase.com/dashboard 접속');
        console.log('2. 프로젝트 선택 → SQL Editor');
        console.log('3. 다음 SQL 실행:');
        console.log('\n' + sqlContent);
        return;
      }
      
      // 테이블이 있다면 데이터만 삽입
      const defaultWeights = {
        male: { wealth: 0.6, sense: 0.3, physical: 0.1 },
        female: {
          young: { age: 0.2, appearance: 0.4, values: 0.4 },
          old: { age: 0.4, appearance: 0.2, values: 0.4 }
        }
      };
      
      const { error: upsertError } = await supabase
        .from('scoring_weights')
        .upsert([{
          name: 'default',
          weights: defaultWeights,
          description: '시스템 기본 가중치 설정',
          is_active: true
        }], { onConflict: 'name' });
        
      if (upsertError) {
        throw new Error(`데이터 삽입 실패: ${upsertError.message}`);
      }
      
      console.log('✅ 기본 가중치 데이터 설정 완료');
    } else {
      const result = await response.json();
      console.log('✅ SQL 실행 성공:', result);
    }
    
    // 4. 결과 확인
    console.log('4. 테이블 생성 결과 확인...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('scoring_weights')
      .select('*')
      .eq('is_active', true)
      .single();
    
    if (verifyError) {
      throw new Error(`검증 실패: ${verifyError.message}`);
    }
    
    console.log('✅ scoring_weights 테이블 생성 및 설정 완료!');
    console.log('- 활성 가중치:', verifyData.name);
    console.log('- 가중치 데이터:', JSON.stringify(verifyData.weights, null, 2));
    
  } catch (error) {
    console.error('❌ SQL 실행 실패:', error.message);
    
    // 자세한 가이드 제공
    console.log('\n📋 수동 설정 가이드:');
    console.log('1. https://supabase.com/dashboard 접속');
    console.log('2. 해당 프로젝트 선택');
    console.log('3. 왼쪽 메뉴에서 "SQL Editor" 클릭');
    console.log('4. 새 쿼리 작성 후 다음 SQL 실행:');
    
    const sqlPath = path.join(__dirname, 'create-table-direct.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
    console.log('\n' + sqlContent);
    
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  executeSQLDirect().catch(console.error);
}

module.exports = { executeSQLDirect };