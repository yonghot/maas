import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Excel 파일 생성을 위한 함수
function generateExcelData(accounts: any[]) {
  // CSV 형식으로 생성 (Excel에서 열 수 있음)
  const headers = [
    '사용자ID',
    '이메일', 
    '제공자',
    '성별',
    '나이',
    '지역',
    '총점',
    '티어',
    '등급',
    'Instagram ID',
    'Instagram 공개',
    '최근 평가일',
    '가입일',
    '최근 로그인'
  ]

  const rows = accounts.map(account => [
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
    account.auth_created_at ? new Date(account.auth_created_at).toLocaleDateString('ko-KR') : '-',
    account.last_sign_in_at ? new Date(account.last_sign_in_at).toLocaleDateString('ko-KR') : '-'
  ])

  // CSV 문자열 생성
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')

  // UTF-8 BOM 추가 (Excel에서 한글 깨짐 방지)
  return '\uFEFF' + csvContent
}

// 관리자 계정 정보 Excel 다운로드 API
export async function GET(request: NextRequest) {
  try {
    // 관리자 권한 확인
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.includes('Bearer admin-maas-2025')) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 401 }
      )
    }

    const supabase = createClient()

    console.log('📊 Excel 다운로드: 전체 계정 정보 조회 시작')

    // 모든 계정 정보 조회 (페이지네이션 없이)
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profilesError) {
      throw profilesError
    }

    console.log(`📊 조회 완료: profiles ${profilesData?.length}개`)

    // 데이터 포맷팅 (auth.admin API 사용하지 않음)
    const combinedData = profilesData?.map(profile => {
      return {
        user_id: profile.user_id,
        email: profile.email || 'N/A',
        auth_created_at: profile.created_at,
        last_sign_in_at: profile.updated_at,
        provider: 'oauth',
        
        gender: profile.gender,
        age: profile.age,
        region: profile.region,
        total_score: profile.total_score,
        tier: profile.tier,
        grade: profile.grade,
        instagram_id: profile.instagram_id,
        instagram_public: profile.instagram_public,
        category_scores: profile.category_scores,
        evaluation_data: profile.evaluation_data,
        last_evaluated_at: profile.last_evaluated_at,
        profile_created_at: profile.created_at,
        profile_updated_at: profile.updated_at
      }
    }) || []

    // Excel 데이터 생성
    const excelContent = generateExcelData(combinedData)
    
    console.log(`✅ Excel 파일 생성 완료: ${combinedData.length}개 계정`)

    // 현재 날짜로 파일명 생성
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const filename = `MAAS_계정정보_${today}.csv`

    // CSV 파일로 응답
    return new NextResponse(excelContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error: any) {
    console.error('❌ Excel 다운로드 오류:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Excel 다운로드 중 오류가 발생했습니다.',
        details: error.message 
      },
      { status: 500 }
    )
  }
}