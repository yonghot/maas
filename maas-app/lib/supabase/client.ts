import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

// 클라이언트 사이드 폴백 값 설정 (Vercel 빌드 시 환경 변수가 주입되지 않을 경우 대비)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hvpyqchgimnzaotwztuy.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2cHlxY2hnaW1uemFvdHd6dHV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NTY4ODgsImV4cCI6MjA3MTAzMjg4OH0.8prtIUesStj4xNabIKY3yVlrbvWseAYIUM11rk7KZX4';

export function createClient() {
  // 클라이언트 사이드에서 환경 변수 상태 확인
  if (typeof window !== 'undefined') {
    console.log('🔍 클라이언트 Supabase 초기화:', {
      urlSource: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'ENV' : 'FALLBACK',
      keySource: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'ENV' : 'FALLBACK'
    });
  }
  
  return createBrowserClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
        storage: {
          getItem: (key: string) => {
            if (typeof window === 'undefined') return null;
            
            try {
              // 먼저 localStorage 확인
              const localStorageValue = window.localStorage.getItem(key);
              if (localStorageValue) return localStorageValue;
              
              // 쿠키에서도 확인 - document.cookie를 직접 읽기
              const cookieString = document.cookie;
              if (cookieString) {
                const cookies = cookieString.split('; ');
                const cookie = cookies.find(c => c.startsWith(`${key}=`));
                if (cookie) {
                  const value = cookie.split('=')[1];
                  return decodeURIComponent(value);
                }
              }
            } catch (error) {
              console.warn('Storage getItem 오류:', key, error);
            }
            
            return null;
          },
          setItem: (key: string, value: string) => {
            if (typeof window === 'undefined') return;
            
            try {
              // localStorage에 저장
              window.localStorage.setItem(key, value);
              
              // 쿠키에도 저장 (PKCE 지원)
              const maxAge = 60 * 60 * 24 * 7; // 7일
              const isSecure = window.location.protocol === 'https:';
              const secureFlag = isSecure ? '; Secure' : '';
              
              // PKCE 쿠키는 더 긴 만료시간 설정
              const cookieMaxAge = key.includes('pkce') || key.includes('code-verifier') ? 60 * 60 : maxAge; // 1시간
              document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=${cookieMaxAge}; SameSite=Lax${secureFlag}`;
              
              // 디버깅용 로그 (PKCE 관련만)
              if (key.includes('pkce') || key.includes('code-verifier') || key.includes('auth-token')) {
                console.log(`🔐 PKCE 쿠키 설정: ${key.substring(0, 30)}...`);
              }
            } catch (error) {
              console.error('Storage setItem 오류:', key, error);
            }
          },
          removeItem: (key: string) => {
            if (typeof window === 'undefined') return;
            
            try {
              // localStorage에서 제거
              window.localStorage.removeItem(key);
              
              // 쿠키에서도 제거
              const isSecure = window.location.protocol === 'https:';
              const secureFlag = isSecure ? '; Secure' : '';
              document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secureFlag}`;
            } catch (error) {
              console.error('Storage removeItem 오류:', key, error);
            }
          }
        }
      }
    }
  );
}