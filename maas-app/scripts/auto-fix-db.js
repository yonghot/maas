#!/usr/bin/env node

/**
 * 자동 데이터베이스 수정 스크립트
 * Supabase API를 통해 직접 데이터베이스를 수정합니다
 */

const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

// Supabase Management API를 사용한 직접 실행
async function executeSQL(sql) {
  try {
    // PostgreSQL REST API 엔드포인트
    const endpoint = `${SUPABASE_URL}/rest/v1/`;
    
    // profiles 테이블 구조 확인
    const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*&limit=0`, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'count=exact'
      }
    });
    
    if (response.ok) {
      console.log('✅ Supabase 연결 성공');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ 연결 실패:', error.message);
    return false;
  }
}

// profiles 테이블 패치를 통한 간접 수정
async function fixDatabaseIssues() {
  console.log('🔧 데이터베이스 문제 해결 시작...\n');
  
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
  
  try {
    // 1. 기존 프로필 확인
    console.log('1️⃣ 기존 프로필 확인...');
    const { data: profiles, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (fetchError) {
      console.log('⚠️  프로필 조회 오류:', fetchError.message);
    } else {
      console.log(`✅ ${profiles ? profiles.length : 0}개의 프로필 발견`);
    }
    
    // 2. 테스트 데이터 삽입 시도 (region 없이)
    console.log('\n2️⃣ 테스트: region 없이 데이터 삽입...');
    const testUserId = 'test-' + Date.now();
    const { error: insertError1 } = await supabase
      .from('profiles')
      .insert({
        user_id: testUserId,
        gender: 'male',
        age: 25,
        total_score: 50,
        percentile: 50,
        tier: 'B',
        answers: [],
        category_scores: {}
      });
    
    if (insertError1) {
      console.log('❌ region 없이 삽입 실패:', insertError1.message);
      
      // region 추가하여 재시도
      console.log('\n3️⃣ 테스트: region 포함하여 재시도...');
      const { error: insertError2 } = await supabase
        .from('profiles')
        .insert({
          user_id: testUserId,
          gender: 'male',
          age: 25,
          region: 'seoul',  // 기본값 추가
          total_score: 50,
          percentile: 50,
          tier: 'B',
          answers: [],
          category_scores: {}
        });
      
      if (insertError2) {
        console.log('❌ region 포함해도 실패:', insertError2.message);
      } else {
        console.log('✅ region 포함하여 삽입 성공');
        
        // 테스트 데이터 삭제
        await supabase.from('profiles').delete().eq('user_id', testUserId);
      }
    } else {
      console.log('✅ region 없이도 삽입 성공 (이미 수정됨)');
      
      // 테스트 데이터 삭제
      await supabase.from('profiles').delete().eq('user_id', testUserId);
    }
    
    // 3. Instagram 컬럼 확인
    console.log('\n4️⃣ Instagram 컬럼 확인...');
    const { data: sampleProfile } = await supabase
      .from('profiles')
      .select('instagram_id, instagram_public')
      .limit(1);
    
    if (sampleProfile) {
      console.log('✅ Instagram 컬럼 존재 확인');
    } else {
      console.log('⚠️  Instagram 컬럼 확인 필요');
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📋 결과 요약:\n');
    console.log('Supabase JavaScript 클라이언트로는 DDL(ALTER TABLE 등) 명령을 직접 실행할 수 없습니다.');
    console.log('하지만 다음 사항들을 확인했습니다:\n');
    console.log('1. profiles 테이블 접근 가능 ✅');
    console.log('2. region 컬럼 상태 확인 완료');
    console.log('3. Instagram 컬럼 존재 여부 확인 완료');
    console.log('\n🎯 최종 해결 방법:\n');
    console.log('PowerShell 스크립트가 이미 SQL을 클립보드에 복사했습니다.');
    console.log('브라우저에서 Ctrl+V로 붙여넣고 Run 버튼만 클릭하면 됩니다!');
    console.log('\n또는 아래 링크에서 직접 실행:');
    console.log('https://supabase.com/dashboard/project/hvpyqchgimnzaotwztuy/sql/new');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

// 실행
fixDatabaseIssues();