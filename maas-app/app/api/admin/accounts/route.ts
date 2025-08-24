import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// 관리자 계정 정보 조회 API
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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const gender = searchParams.get('gender') || ''
    const offset = (page - 1) * limit

    const supabase = createClient()

    // 통합 쿼리: auth.users + profiles 조인
    // 새로운 스키마에서는 profiles.user_id → auth.users.id 직접 참조
    let query = `
      SELECT 
        au.id as user_id,
        au.email,
        au.created_at as auth_created_at,
        au.last_sign_in_at,
        au.app_metadata->>'provider' as provider,
        
        p.gender,
        p.age,
        p.region,
        p.total_score,
        p.tier,
        p.grade,
        p.instagram_id,
        p.instagram_public,
        p.category_scores,
        p.evaluation_data,
        p.last_evaluated_at,
        p.created_at as profile_created_at,
        p.updated_at as profile_updated_at
      FROM auth.users au
      LEFT JOIN public.profiles p ON au.id = p.user_id
      WHERE 1=1
    `

    // 검색 조건 추가
    const params: any[] = []
    let paramIndex = 1

    if (search) {
      query += ` AND (au.email ILIKE $${paramIndex} OR p.instagram_id ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    if (gender) {
      query += ` AND p.gender = $${paramIndex}`
      params.push(gender)
      paramIndex++
    }

    // 정렬 및 페이지네이션
    query += ` ORDER BY au.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    console.log('🔍 Admin 계정 조회 쿼리:', query)
    console.log('📊 쿼리 파라미터:', params)

    // Supabase에서 직접 SQL 실행
    const { data, error } = await supabase.rpc('exec_admin_accounts_query', {
      query_text: query,
      query_params: params
    })

    // RPC 함수가 없는 경우 대안 방법 사용
    if (error?.message?.includes('Could not find the function')) {
      console.log('⚠️ RPC 함수 없음, 대안 방법 사용')
      
      // profiles 테이블에서 조회 후 auth 정보 매핑
      let profileQuery = supabase
        .from('profiles')
        .select('*')

      if (gender) {
        profileQuery = profileQuery.eq('gender', gender)
      }

      if (search) {
        profileQuery = profileQuery.or(`instagram_id.ilike.%${search}%`)
      }

      const { data: profilesData, error: profilesError } = await profileQuery
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (profilesError) {
        throw profilesError
      }

      // auth.users 정보 추가 (Service Role로 접근)
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

      if (authError) {
        throw authError
      }

      // 데이터 조인
      const combinedData = profilesData?.map(profile => {
        const authUser = authUsers.users.find(u => u.id === profile.user_id)
        return {
          user_id: profile.user_id,
          email: authUser?.email || 'N/A',
          auth_created_at: authUser?.created_at,
          last_sign_in_at: authUser?.last_sign_in_at,
          provider: authUser?.app_metadata?.provider || 'unknown',
          
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
      })

      // 전체 개수 조회
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        throw countError
      }

      return NextResponse.json({
        success: true,
        data: combinedData || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
          hasMore: (count || 0) > offset + limit
        }
      })
    }

    // 성공 응답
    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: data?.length || 0, // TODO: 별도 count 쿼리 필요
        totalPages: Math.ceil((data?.length || 0) / limit),
        hasMore: (data?.length || 0) === limit
      }
    })

  } catch (error: any) {
    console.error('❌ Admin 계정 조회 오류:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '계정 정보 조회 중 오류가 발생했습니다.',
        details: error.message 
      },
      { status: 500 }
    )
  }
}