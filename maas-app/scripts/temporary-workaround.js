#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function temporaryWorkaround() {
  console.log('🔧 임시 우회 해결책 실행...\n');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  try {
    // 1. 각 auth.users 사용자에 대해 public.users 레코드를 강제로 생성
    console.log('1️⃣ public.users에 임시 Instagram ID로 사용자 생성...');
    
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    
    for (const user of authUsers.users) {
      // 이미 존재하는지 확인
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();
        
      if (!existingUser) {
        console.log(`   📝 사용자 생성: ${user.email}`);
        
        // 임시 Instagram ID 생성 (고유값 보장)
        const tempInstagramId = `temp_${user.id.substring(0, 8)}_${Date.now()}`;
        
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            instagram_id: tempInstagramId, // 임시 고유 ID
            instagram_public: false,
            created_at: user.created_at,
            updated_at: user.updated_at || user.created_at
          });
          
        if (insertError) {
          console.error(`   ❌ ${user.email} 생성 실패:`, insertError.message);
        } else {
          console.log(`   ✅ ${user.email} 생성 성공 (임시 ID: ${tempInstagramId})`);
        }
      } else {
        console.log(`   ✅ ${user.email} 이미 존재`);
      }
    }
    
    // 2. 프로필 생성
    console.log('\n2️⃣ 프로필 생성...');
    
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
    
    // 3. 최종 확인
    console.log('\n3️⃣ 최종 상태...');
    const { data: users } = await supabase.from('users').select('*');
    const { data: profiles } = await supabase.from('profiles').select('*');
    
    console.log(`✅ Users: ${users?.length || 0}/${authUsers.users.length}`);
    console.log(`✅ Profiles: ${profiles?.length || 0}/${authUsers.users.length}`);
    
    if (users?.length === authUsers.users.length && 
        profiles?.length === authUsers.users.length) {
      console.log('\n🎉 임시 우회 해결 완료!');
      console.log('⚠️ 나중에 Supabase Dashboard에서 instagram_id 제약 조건을 NULL 허용으로 변경하세요.');
    }
    
  } catch (error) {
    console.error('❌ 임시 우회 실행 중 오류:', error);
  }
}

temporaryWorkaround().catch(console.error);