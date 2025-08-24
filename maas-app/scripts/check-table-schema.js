#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function getTableSchema() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  // profiles 테이블 구조 확인
  console.log('🔍 profiles 테이블 구조 확인...');
  
  try {
    // 실제 프로필 데이터 하나 조회해서 구조 파악
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
      
    if (error) {
      console.log('❌ 조회 오류:', error.message);
    } else if (data && data.length > 0) {
      console.log('✅ 실제 profiles 테이블 구조:');
      const profile = data[0];
      Object.keys(profile).forEach(key => {
        console.log(`   - ${key}: ${typeof profile[key]} | ${profile[key]}`);
      });
    } else {
      console.log('프로필 데이터가 없습니다.');
    }
    
    // 빈 INSERT로 스키마 오류 확인
    console.log('\n🔍 INSERT 스키마 오류 확인...');
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({});
      
    if (insertError) {
      console.log('INSERT 오류:', insertError.message);
      console.log('Code:', insertError.code);
      console.log('Details:', insertError.details);
    }
  } catch (err) {
    console.log('오류:', err.message);
  }
}

getTableSchema().catch(console.error);