import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/lib/supabase/database.types'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/result'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // OAuth 에러 처리
  if (error) {
    console.error('❌ OAuth 에러:', error, errorDescription)
    return NextResponse.redirect(`${origin}/signup-result?error=auth_failed&desc=${encodeURIComponent(errorDescription || error)}`)
  }

  if (code) {
    const cookieStore = await cookies()
    
    // Supabase 클라이언트 생성 - 쿠키 처리 개선
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const cookie = cookieStore.get(name)
            console.log(`🍪 쿠키 읽기: ${name} = ${cookie?.value?.substring(0, 20)}...`)
            return cookie?.value
          },
          set(name: string, value: string, options) {
            console.log(`🍪 쿠키 설정: ${name} = ${value?.substring(0, 20)}...`)
            try {
              cookieStore.set({ name, value, ...options })
            } catch (error) {
              console.error(`쿠키 설정 실패 ${name}:`, error)
            }
          },
          remove(name: string, options) {
            console.log(`🍪 쿠키 제거: ${name}`)
            try {
              cookieStore.delete(name)
            } catch (error) {
              console.error(`쿠키 제거 실패 ${name}:`, error)
            }
          },
        },
      }
    )
    
    try {
      // 세션 교환 시도
      console.log('🔄 세션 교환 시작...')
      const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (sessionError) {
        console.error('❌ 세션 교환 실패:', sessionError.message)
        
        // PKCE 오류인 경우 다른 방법 시도
        if (sessionError.message?.includes('code verifier')) {
          console.log('⚠️ PKCE 검증 실패, 대체 방법 시도...')
          
          // 쿠키에서 PKCE 코드 직접 확인
          const allCookies = cookieStore.getAll()
          const pkceCookies = allCookies.filter(c => 
            c.name.includes('pkce') || 
            c.name.includes('code-verifier') ||
            c.name.includes('sb-')
          )
          
          console.log('🔍 PKCE 관련 쿠키:', pkceCookies.map(c => c.name))
        }
        
        return NextResponse.redirect(`${origin}/signup-result?error=session_failed&desc=${encodeURIComponent(sessionError.message)}`)
      }
      
      if (data?.session) {
        console.log('✅ 세션 생성 성공!')
        
        // 사용자 정보 가져오기
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          console.log('✅ 사용자 정보 확인:', user.id, user.email)
          
          // 프로필 확인
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single()
          
          if (profileError && profileError.code !== 'PGRST116') {
            console.error('프로필 조회 오류:', profileError)
          }
          
          if (profile) {
            // 기존 사용자 - 바로 결과 페이지로
            console.log('✅ 기존 프로필 있음, 결과 페이지로 이동')
            return NextResponse.redirect(`${origin}/result`)
          } else {
            // 신규 사용자 - 테스트 결과 확인 후 처리
            console.log('⚠️ 프로필 없음, 테스트 결과 확인 중...')
            
            // 다양한 위치에서 테스트 결과 확인
            const testResultCookie = cookieStore.get('test_result')
            const localStorage = cookieStore.get('maas-test-storage')
            
            if (testResultCookie || localStorage) {
              console.log('✅ 테스트 결과 발견, save 페이지로 이동')
              return NextResponse.redirect(`${origin}/result/save`)
            } else {
              console.log('⚠️ 테스트 결과 없음, 회원가입 결과 페이지로 이동')
              return NextResponse.redirect(`${origin}/signup-result?message=소셜 로그인이 완료되었습니다. 테스트를 진행해주세요.`)
            }
          }
        } else {
          console.error('❌ 사용자 정보 없음')
          return NextResponse.redirect(`${origin}/signup-result?error=no_user`)
        }
      } else {
        console.error('❌ 세션 데이터 없음')
        return NextResponse.redirect(`${origin}/signup-result?error=no_session`)
      }
    } catch (error: any) {
      console.error('❌ 예상치 못한 오류:', error)
      return NextResponse.redirect(`${origin}/signup-result?error=unexpected&desc=${encodeURIComponent(error.message || 'Unknown error')}`)
    }
  }

  // code 파라미터가 없는 경우
  console.error('❌ OAuth code 없음')
  return NextResponse.redirect(`${origin}/signup-result?error=no_code`)
}