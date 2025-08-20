const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function applyRLSFix() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false
    }
  });

  console.log('🔧 RLS 성능 최적화 시작...\n');

  const policies = [
    // users 테이블 정책
    {
      drop: `DROP POLICY IF EXISTS "Users can view their own data" ON public.users`,
      create: `CREATE POLICY "Users can view their own data" ON public.users FOR SELECT USING (id = (SELECT auth.uid()))`
    },
    {
      drop: `DROP POLICY IF EXISTS "Users can update their own data" ON public.users`,
      create: `CREATE POLICY "Users can update their own data" ON public.users FOR UPDATE USING (id = (SELECT auth.uid())) WITH CHECK (id = (SELECT auth.uid()))`
    },
    {
      drop: `DROP POLICY IF EXISTS "Users can insert their own data" ON public.users`,
      create: `CREATE POLICY "Users can insert their own data" ON public.users FOR INSERT WITH CHECK (id = (SELECT auth.uid()))`
    },
    {
      drop: `DROP POLICY IF EXISTS "Users can delete their own data" ON public.users`,
      create: `CREATE POLICY "Users can delete their own data" ON public.users FOR DELETE USING (id = (SELECT auth.uid()))`
    },
    // profiles 테이블 정책
    {
      drop: `DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles`,
      create: `CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (user_id = (SELECT auth.uid()))`
    },
    {
      drop: `DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles`,
      create: `CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()))`
    },
    {
      drop: `DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles`,
      create: `CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()))`
    },
    {
      drop: `DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles`,
      create: `CREATE POLICY "Users can delete their own profile" ON public.profiles FOR DELETE USING (user_id = (SELECT auth.uid()))`
    }
  ];

  let successCount = 0;
  let errorCount = 0;

  // 각 정책을 개별적으로 실행
  for (const policy of policies) {
    try {
      // 기존 정책 삭제
      const { error: dropError } = await supabase.rpc('exec_sql', { sql: policy.drop });
      if (dropError && !dropError.message?.includes('does not exist')) {
        console.log(`⚠️  정책 삭제 실패: ${dropError.message}`);
      }

      // 새 정책 생성
      const { error: createError } = await supabase.rpc('exec_sql', { sql: policy.create });
      if (createError) {
        console.log(`⚠️  정책 생성 실패: ${createError.message}`);
        errorCount++;
      } else {
        successCount++;
        console.log(`✅ 정책 최적화 완료: ${policy.create.match(/CREATE POLICY "(.*?)"/)[1]}`);
      }
    } catch (error) {
      errorCount++;
      console.log(`❌ 오류: ${error.message}`);
    }
  }

  console.log('\n📊 결과:');
  console.log(`  - 성공: ${successCount}개 정책`);
  console.log(`  - 실패: ${errorCount}개 정책`);

  if (errorCount > 0) {
    console.log('\n⚠️  일부 정책 적용에 실패했습니다.');
    console.log('📋 수동 적용 방법:');
    console.log('1. Supabase Dashboard 접속');
    console.log(`2. 링크: ${supabaseUrl.replace('.supabase.co', '.supabase.com')}/project/_/sql`);
    console.log('3. scripts/fix-rls-performance.sql 파일 내용 실행');
    
    // SQL 파일 내용 표시
    console.log('\n📄 실행할 SQL:');
    console.log('----------------------------------------');
    const fs = require('fs');
    const path = require('path');
    const sqlContent = fs.readFileSync(path.join(__dirname, 'fix-rls-performance.sql'), 'utf8');
    console.log(sqlContent);
    console.log('----------------------------------------');
  } else {
    console.log('\n🎉 모든 RLS 정책이 성공적으로 최적화되었습니다!');
  }
}

// 스크립트 실행
applyRLSFix().catch(console.error);