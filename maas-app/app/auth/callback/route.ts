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
      // 세션 교환 시도 전 PKCE 쿠키 상태 확인
      console.log('🔄 세션 교환 시작...')
      
      // 모든 쿠키 확인 (디버깅용)
      const allCookies = cookieStore.getAll()
      const authCookies = allCookies.filter(c => 
        c.name.includes('auth') || 
        c.name.includes('pkce') || 
        c.name.includes('code') ||
        c.name.includes('sb-')
      )
      console.log('🍪 인증 관련 쿠키:', authCookies.map(c => ({ name: c.name, hasValue: !!c.value })))
      
      const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (sessionError) {
        console.error('❌ 세션 교환 실패:', sessionError.message)
        
        // PKCE 오류인 경우 상세 정보 로깅
        if (sessionError.message?.includes('code verifier') || 
            sessionError.message?.includes('PKCE') ||
            sessionError.message?.includes('Invalid API key')) {
          console.log('⚠️ PKCE/API 키 관련 오류 감지')
          
          // 환경 정보 확인
          console.log('📍 환경 정보:')
          console.log('- URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...')
          console.log('- Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...')
          console.log('- Origin:', origin)
          console.log('- Protocol:', request.url.startsWith('https') ? 'HTTPS' : 'HTTP')
          
          // PKCE 쿠키가 없는 경우 사용자에게 안내
          const hasPKCECookie = authCookies.some(c => 
            c.name.includes('pkce') || c.name.includes('code-verifier')
          )
          
          if (!hasPKCECookie) {
            console.error('❌ PKCE 쿠키 없음 - 브라우저 설정 또는 네트워크 문제')
            return NextResponse.redirect(`${origin}/signup-result?error=pkce_cookie_missing&desc=${encodeURIComponent('인증 쿠키가 유실되었습니다. 브라우저 쿠키가 활성화되어 있는지 확인해주세요.')}`)
          }
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
          
          // 기존/신규 사용자 상관없이 모두 save 페이지로 통합 처리
          // save 페이지에서 프로필 유무에 따라 적절히 처리됨
          if (profile) {
            console.log('✅ 기존 프로필 있음, save 페이지에서 확인 후 result로 이동')
          } else {
            console.log('⚠️ 프로필 없음, save 페이지에서 데이터 복구 및 프로필 생성')
          }
          
          return NextResponse.redirect(`${origin}/result/save`)
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