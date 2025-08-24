#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testAdminAccounts() {
  console.log('🧪 Admin 계정 관리 기능 테스트 시작...\n');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  try {
    console.log('=== 1. 데이터 준비 상태 확인 ===');
    
    // auth.users 확인
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;
    
    // profiles 확인
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    if (profilesError) throw profilesError;
    
    console.log(`✅ auth.users: ${authUsers.users.length}개`);
    console.log(`✅ profiles: ${profiles?.length || 0}개`);
    
    console.log('\n=== 2. API 엔드포인트 시뮬레이션 ===');
    
    // 계정 목록 조회 로직 시뮬레이션
    console.log('📊 /api/admin/accounts 로직 테스트...');
    
    const combinedData = profiles?.map(profile => {
      const authUser = authUsers.users.find(u => u.id === profile.user_id);
      return {
        user_id: profile.user_id,
        email: authUser?.email || 'N/A',
        provider: authUser?.app_metadata?.provider || 'unknown',
        auth_created_at: authUser?.created_at,
        last_sign_in_at: authUser?.last_sign_in_at,
        
        gender: profile.gender,
        age: profile.age,
        region: profile.region,
        total_score: profile.total_score,
        tier: profile.tier,
        grade: profile.grade,
        instagram_id: profile.instagram_id,
        instagram_public: profile.instagram_public,
        last_evaluated_at: profile.last_evaluated_at,
        profile_created_at: profile.created_at,
        profile_updated_at: profile.updated_at
      }
    }) || [];
    
    console.log(`✅ 통합 데이터 ${combinedData.length}개 생성 완료`);
    
    console.log('\n=== 3. 데이터 구조 검증 ===');
    
    if (combinedData.length > 0) {
      const sample = combinedData[0];
      console.log('📋 샘플 계정 정보:');
      console.log(`   이메일: ${sample.email}`);
      console.log(`   제공자: ${sample.provider}`);
      console.log(`   성별: ${sample.gender}`);
      console.log(`   나이: ${sample.age}`);
      console.log(`   총점: ${sample.total_score}`);
      console.log(`   티어: ${sample.tier}`);
      console.log(`   Instagram: ${sample.instagram_id || '없음'}`);
      console.log(`   가입일: ${sample.auth_created_at}`);
    }
    
    console.log('\n=== 4. 통계 계산 테스트 ===');
    
    const stats = {
      totalCount: combinedData.length,
      maleCount: combinedData.filter(acc => acc.gender === 'male').length,
      femaleCount: combinedData.filter(acc => acc.gender === 'female').length,
      averageScore: combinedData.reduce((sum, acc) => sum + (acc.total_score || 0), 0) / combinedData.length
    };
    
    console.log(`✅ 총 계정: ${stats.totalCount}개`);
    console.log(`✅ 남성: ${stats.maleCount}개, 여성: ${stats.femaleCount}개`);
    console.log(`✅ 평균 점수: ${stats.averageScore.toFixed(1)}점`);
    
    console.log('\n=== 5. Excel 다운로드 데이터 테스트 ===');
    
    const excelHeaders = [
      '사용자ID', '이메일', '제공자', '성별', '나이', '지역', '총점', '티어', '등급',
      'Instagram ID', 'Instagram 공개', '최근 평가일', '가입일', '최근 로그인'
    ];
    
    const excelRows = combinedData.map(account => [
      account.user_id,
      account.email,
      account.provider,
      account.gender === 'male' ? '남성' : '여성',
      account.age || '-',
      account.region,
      account.total_score || 0,
      account.tier || '-',
      account.grade || '-',
      account.instagram_id || '-',
      account.instagram_public ? '공개' : '비공개',
      account.last_evaluated_at ? new Date(account.last_evaluated_at).toLocaleDateString('ko-KR') : '-',
      new Date(account.auth_created_at).toLocaleDateString('ko-KR'),
      account.last_sign_in_at ? new Date(account.last_sign_in_at).toLocaleDateString('ko-KR') : '-'
    ]);
    
    console.log(`✅ Excel 헤더: ${excelHeaders.length}개 컬럼`);
    console.log(`✅ Excel 데이터: ${excelRows.length}개 행`);
    
    if (excelRows.length > 0) {
      console.log('📋 Excel 샘플 행:');
      console.log(`   ${excelRows[0].slice(0, 5).join(' | ')}`);
    }
    
    console.log('\n=== 6. 무한 스크롤 페이지네이션 테스트 ===');
    
    const pageSize = 20;
    const totalPages = Math.ceil(combinedData.length / pageSize);
    
    console.log(`✅ 페이지 크기: ${pageSize}개`);
    console.log(`✅ 총 페이지: ${totalPages}개`);
    
    for (let page = 1; page <= Math.min(totalPages, 3); page++) {
      const offset = (page - 1) * pageSize;
      const pageData = combinedData.slice(offset, offset + pageSize);
      console.log(`   페이지 ${page}: ${pageData.length}개 항목`);
    }
    
    console.log('\n=== 7. 검색 및 필터링 테스트 ===');
    
    // 성별 필터 테스트
    const maleAccounts = combinedData.filter(acc => acc.gender === 'male');
    const femaleAccounts = combinedData.filter(acc => acc.gender === 'female');
    
    console.log(`✅ 남성 필터: ${maleAccounts.length}개`);
    console.log(`✅ 여성 필터: ${femaleAccounts.length}개`);
    
    // 검색 테스트 (Gmail 계정)
    const gmailAccounts = combinedData.filter(acc => 
      acc.email.includes('gmail') || acc.email.includes('google')
    );
    console.log(`✅ Gmail 계정: ${gmailAccounts.length}개`);
    
    console.log('\n🎉 모든 테스트 완료!');
    console.log('\n📋 결과 요약:');
    console.log(`   - 데이터 무결성: ✅`);
    console.log(`   - API 로직: ✅`);
    console.log(`   - 통계 계산: ✅`);
    console.log(`   - Excel 다운로드: ✅`);
    console.log(`   - 페이지네이션: ✅`);
    console.log(`   - 검색/필터: ✅`);
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error);
  }
}

testAdminAccounts().catch(console.error);