#!/usr/bin/env node

/**
 * 즉시 실행 가능한 데이터베이스 수정 스크립트
 * Supabase JavaScript 클라이언트로 가능한 작업들을 수행합니다
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// 환경 변수 로드
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixDatabase() {
  console.log('🚀 데이터베이스 수정 시작...\n');
  
  try {
    // 1. 테스트 유저 생성
    console.log('1️⃣ 테스트 유저 생성 중...');
    const testEmail = `test${Date.now()}@example.com`;
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'Test123!@#',
      email_confirm: true
    });
    
    if (authError) {
      console.log('⚠️  테스트 유저 생성 실패:', authError.message);
    } else {
      console.log('✅ 테스트 유저 생성 성공:', authUser.user.id);
      
      // 2. 프로필 생성 테스트 (region 없이)
      console.log('\n2️⃣ 프로필 생성 테스트 (region 없이)...');
      const { error: profileError1 } = await supabase
        .from('profiles')
        .insert({
          user_id: authUser.user.id,
          gender: 'male',
          age: 25,
          total_score: 75,
          percentile: 80,
          tier: 'A',
          answers: [],
          category_scores: {},
          instagram_id: 'test_user',
          instagram_public: true
        });
      
      if (profileError1) {
        console.log('❌ region 없이 실패:', profileError1.message);
        
        // region 추가하여 재시도
        console.log('\n3️⃣ 프로필 생성 재시도 (region 포함)...');
        const { error: profileError2 } = await supabase
          .from('profiles')
          .insert({
            user_id: authUser.user.id,
            gender: 'male',
            age: 25,
            region: 'seoul',
            total_score: 75,
            percentile: 80,
            tier: 'A',
            answers: [],
            category_scores: {},
            instagram_id: 'test_user',
            instagram_public: true
          });
        
        if (profileError2) {
          console.log('❌ region 포함해도 실패:', profileError2.message);
        } else {
          console.log('✅ 프로필 생성 성공 (region 필수)');
        }
      } else {
        console.log('✅ 프로필 생성 성공 (region 선택적)');
      }
      
      // 4. 생성된 프로필 확인
      console.log('\n4️⃣ 생성된 프로필 확인...');
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authUser.user.id)
        .single();
      
      if (fetchError) {
        console.log('❌ 프로필 조회 실패:', fetchError.message);
      } else {
        console.log('✅ 프로필 데이터:');
        console.log('  - user_id:', profile.user_id);
        console.log('  - instagram_id:', profile.instagram_id);
        console.log('  - instagram_public:', profile.instagram_public);
        console.log('  - region:', profile.region);
        console.log('  - tier:', profile.tier);
      }
      
      // 5. 정리 - 테스트 데이터 삭제
      console.log('\n5️⃣ 테스트 데이터 정리...');
      await supabase.from('profiles').delete().eq('user_id', authUser.user.id);
      await supabase.auth.admin.deleteUser(authUser.user.id);
      console.log('✅ 테스트 데이터 삭제 완료');
    }
    
    // 6. 모든 프로필 수 확인
    console.log('\n6️⃣ 전체 프로필 통계...');
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (!countError) {
      console.log(`✅ 총 ${count || 0}개의 프로필이 존재합니다.`);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 테스트 결과 요약:\n');
    console.log('✅ JavaScript 클라이언트로 가능한 작업:');
    console.log('  - 데이터 CRUD (생성, 읽기, 수정, 삭제)');
    console.log('  - 사용자 인증 관리');
    console.log('  - RLS 정책이 적용된 상태에서 작업');
    console.log('\n❌ Dashboard에서만 가능한 작업:');
    console.log('  - ALTER TABLE (컬럼 수정)');
    console.log('  - CREATE/DROP INDEX');
    console.log('  - RLS 정책 생성/수정');
    console.log('  - 외래키 제약 조건 변경');
    console.log('\n💡 해결 방법:');
    console.log('앞서 PowerShell 스크립트로 복사한 SQL을 Dashboard에서 실행하세요!');
    console.log('https://supabase.com/dashboard/project/hvpyqchgimnzaotwztuy/sql/new');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

// 실행
fixDatabase();