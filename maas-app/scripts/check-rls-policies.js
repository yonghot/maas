#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkRLS() {
  console.log('🔍 RLS 정책 및 프로필 테이블 권한 확인...');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Service role key 사용
  );
  
  // 테스트용 데이터로 프로필 생성 시도
  const testProfile = {
    user_id: '00000000-0000-0000-0000-000000000000', // 테스트용 UUID
    gender: 'male',
    age: 25,
    region: 'seoul',
    total_score: 75,
    percentile: 60,
    tier: 'B',
    answers: [{ questionId: 'test', value: 'test', score: 10 }],
    category_scores: { test: 10 },
    instagram_id: 'test_user',
    instagram_public: true
  };
  
  // 1. INSERT 권한 테스트
  console.log('\n1. INSERT 권한 테스트...');
  const { data: insertData, error: insertError } = await supabase
    .from('profiles')
    .insert(testProfile)
    .select();
    
  if (insertError) {
    console.log('❌ INSERT 실패:', insertError.message);
    console.log('   Code:', insertError.code);
    console.log('   Details:', insertError.details);
  } else {
    console.log('✅ INSERT 성공');
    
    // 테스트 데이터 정리
    await supabase
      .from('profiles')
      .delete()
      .eq('user_id', '00000000-0000-0000-0000-000000000000');
  }
  
  // 2. 기존 프로필 조회
  console.log('\n2. 기존 프로필 조회...');
  const { data: profiles, error: selectError } = await supabase
    .from('profiles')
    .select('user_id, gender, total_score, instagram_id, created_at')
    .limit(5);
    
  if (selectError) {
    console.log('❌ SELECT 실패:', selectError.message);
  } else {
    console.log('✅ SELECT 성공, 프로필 수:', profiles.length);
    profiles.forEach((p, i) => {
      console.log(`   ${i+1}. ${p.user_id} | ${p.gender} | Score: ${p.total_score} | Instagram: ${p.instagram_id || '없음'}`);
    });
  }
  
  // 3. 일반 사용자 권한으로 테스트 (anon key 사용)
  console.log('\n3. 일반 사용자(anon) 권한으로 INSERT 테스트...');
  const anonSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  const { data: anonInsertData, error: anonInsertError } = await anonSupabase
    .from('profiles')
    .insert(testProfile)
    .select();
    
  if (anonInsertError) {
    console.log('❌ Anon INSERT 실패:', anonInsertError.message);
    console.log('   Code:', anonInsertError.code);
  } else {
    console.log('✅ Anon INSERT 성공');
    
    // 테스트 데이터 정리
    await supabase
      .from('profiles')
      .delete()
      .eq('user_id', '00000000-0000-0000-0000-000000000000');
  }
}

checkRLS().catch(console.error);