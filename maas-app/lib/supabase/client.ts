import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
        storage: {
          getItem: (key: string) => {
            if (typeof window === 'undefined') return null;
            
            // 먼저 localStorage 확인
            const localStorageValue = window.localStorage.getItem(key);
            if (localStorageValue) return localStorageValue;
            
            // 쿠키에서도 확인
            const cookies = document.cookie.split('; ');
            const cookie = cookies.find(c => c.startsWith(`${key}=`));
            if (cookie) {
              const value = cookie.split('=')[1];
              return decodeURIComponent(value);
            }
            
            return null;
          },
          setItem: (key: string, value: string) => {
            if (typeof window === 'undefined') return;
            
            // localStorage에 저장
            window.localStorage.setItem(key, value);
            
            // 쿠키에도 저장 (PKCE 지원)
            const maxAge = 60 * 60 * 24 * 7; // 7일
            // HTTPS 환경에서는 Secure 플래그 추가
            const isSecure = window.location.protocol === 'https:';
            const secureFlag = isSecure ? '; Secure' : '';
            document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}`;
          },
          removeItem: (key: string) => {
            if (typeof window === 'undefined') return;
            
            // localStorage에서 제거
            window.localStorage.removeItem(key);
            
            // 쿠키에서도 제거
            const isSecure = window.location.protocol === 'https:';
            const secureFlag = isSecure ? '; Secure' : '';
            document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secureFlag}`;
          }
        }
      }
    }
  );
}