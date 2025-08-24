#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function traceOAuthIssue() {
  console.log('🔍 OAuth 문제 추적 시작...\n');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  try {
    // 1. 최신 사용자들의 상세 정보 확인
    console.log('1️⃣ auth.users에서 최신 사용자들 확인...');
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ 사용자 목록 조회 실패:', usersError);
      return;
    }
    
    console.log(`✅ 총 ${users.users.length}명의 사용자 발견`);
    users.users.forEach((user, i) => {
      console.log(`   ${i+1}. ${user.email} | ${user.app_metadata?.provider} | ${user.created_at}`);
      console.log(`      User ID: ${user.id}`);
      console.log(`      Last Sign In: ${user.last_sign_in_at}`);
      console.log('');
    });
    
    // 2. 각 사용자의 프로필 존재 여부 확인
    console.log('2️⃣ 각 사용자의 프로필 존재 여부 확인...');
    for (const user of users.users) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (profileError && profileError.code !== 'PGRST116') {
        console.error(`   ❌ ${user.email}: 프로필 조회 오류 -`, profileError.message);
      } else if (profile) {
        console.log(`   ✅ ${user.email}: 프로필 존재 (점수: ${profile.total_score})`);
      } else {
        console.log(`   ⚠️ ${user.email}: 프로필 없음 - 여기가 문제!`);
      }
    }
    
    // 3. profiles 테이블의 최근 변경 이력 확인
    console.log('\n3️⃣ profiles 테이블 최근 생성/수정 이력...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (profilesError) {
      console.error('❌ 프로필 목록 조회 실패:', profilesError);
    } else {
      console.log(`✅ 총 ${profiles.length}개의 프로필 발견`);
      profiles.forEach((profile, i) => {
        console.log(`   ${i+1}. User: ${profile.user_id}`);
        console.log(`      Created: ${profile.created_at}`);
        console.log(`      Updated: ${profile.updated_at}`);
        console.log(`      Score: ${profile.total_score} | Gender: ${profile.gender}`);
        console.log('');
      });
    }
    
    // 4. RLS 정책 테스트 (직접 INSERT 시도)
    console.log('4️⃣ RLS 정책 테스트 - 빈 프로필 생성 시도...');
    const testUserId = '00000000-1111-2222-3333-444444444444';
    const testProfile = {
      user_id: testUserId,
      gender: 'male',
      age: 25,
      region: 'seoul',
      total_score: 0,
      tier: 'F',
      grade: 'F',
      evaluation_data: {},
      category_scores: {},
      instagram_id: null,
      instagram_public: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: insertResult, error: insertError } = await supabase
      .from('profiles')
      .insert(testProfile)
      .select();
      
    if (insertError) {
      console.error('❌ 테스트 프로필 생성 실패:', insertError);
      console.error('   Message:', insertError.message);
      console.error('   Code:', insertError.code);
      console.error('   Details:', insertError.details);
      console.error('   Hint:', insertError.hint);
    } else {
      console.log('✅ 테스트 프로필 생성 성공');
      
      // 테스트 데이터 정리
      await supabase
        .from('profiles')
        .delete()
        .eq('user_id', testUserId);
      console.log('✅ 테스트 데이터 정리 완료');
    }
    
  } catch (error) {
    console.error('❌ 추적 중 오류:', error);
  }
}

traceOAuthIssue().catch(console.error);