#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function emergencyFix() {
  console.log('🚨 긴급 스키마 수정 시작...\n');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  try {
    // 1. 스키마 수정을 위한 SQL 실행
    console.log('1️⃣ users 테이블 스키마 수정...');
    
    // instagram_id를 NULL 허용으로 변경
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.users 
        ALTER COLUMN instagram_id DROP NOT NULL;
      `
    });
    
    if (alterError) {
      console.error('❌ 스키마 수정 실패:', alterError.message);
      // 직접적인 방법으로 시도
      console.log('⚠️ RPC 방식 실패, 직접 수정 시도...');
    } else {
      console.log('✅ 스키마 수정 성공');
    }
    
    // 2. auth.users 사용자들을 public.users에 동기화
    console.log('\n2️⃣ 사용자 동기화 재시도...');
    
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    
    for (const user of authUsers.users) {
      // 이미 존재하는지 확인
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();
        
      if (!existingUser) {
        console.log(`   📝 사용자 추가 시도: ${user.email}`);
        
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            instagram_id: null, // NULL 허용으로 변경됨
            instagram_public: false,
            created_at: user.created_at,
            updated_at: user.updated_at || user.created_at
          });
          
        if (insertError) {
          console.error(`   ❌ ${user.email} 추가 실패:`, insertError.message);
        } else {
          console.log(`   ✅ ${user.email} 추가 성공`);
        }
      } else {
        console.log(`   ✅ ${user.email} 이미 존재`);
      }
    }
    
    // 3. 프로필 생성 재시도
    console.log('\n3️⃣ 프로필 생성 재시도...');
    
    for (const user of authUsers.users) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (!profile) {
        console.log(`   📝 프로필 생성: ${user.email}`);
        
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
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
            created_at: user.created_at,
            updated_at: new Date().toISOString()
          });
          
        if (profileError) {
          console.error(`   ❌ ${user.email} 프로필 실패:`, profileError.message);
        } else {
          console.log(`   ✅ ${user.email} 프로필 성공`);
        }
      } else {
        console.log(`   ✅ ${user.email} 프로필 이미 존재`);
      }
    }
    
    // 4. 최종 상태 확인
    console.log('\n4️⃣ 최종 상태 확인...');
    
    const { data: finalUsers } = await supabase.from('users').select('*');
    const { data: finalProfiles } = await supabase.from('profiles').select('*');
    
    console.log(`✅ public.users: ${finalUsers?.length || 0}명`);
    console.log(`✅ profiles: ${finalProfiles?.length || 0}명`);
    
    if (finalUsers?.length === authUsers.users.length && 
        finalProfiles?.length === authUsers.users.length) {
      console.log('\n🎉 모든 동기화 완료!');
    } else {
      console.log('\n⚠️ 일부 동기화 실패, 수동 확인 필요');
    }
    
  } catch (error) {
    console.error('❌ 긴급 수정 중 오류:', error);
  }
}

emergencyFix().catch(console.error);