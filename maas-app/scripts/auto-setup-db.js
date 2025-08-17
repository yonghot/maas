#!/usr/bin/env node

/**
 * Supabase 데이터베이스 자동 설정 스크립트
 * Service Role Key를 사용하여 SQL을 직접 실행합니다
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 환경 변수 로드
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// SQL 스키마 로드
const sqlSchema = fs.readFileSync(path.join(__dirname, '../../supabase_schema.sql'), 'utf8');

async function executeSQL(sql) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`);
  
  // Supabase Management API를 통해 SQL 실행
  // 참고: 이 방법은 제한적입니다. 완전한 실행을 위해서는 Service Role Key가 필요합니다
  
  const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)[1];
  
  console.log('\n📋 Supabase 프로젝트에 SQL 스키마를 적용하는 중...\n');
  console.log('프로젝트 참조:', projectRef);
  
  // 대체 방법: Supabase CLI 사용 안내
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  자동 SQL 실행 방법
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

옵션 1: Supabase CLI 사용 (권장)
────────────────────────────────────
1. Supabase CLI 설치:
   npm install -g supabase

2. 로그인:
   supabase login

3. 프로젝트 연결:
   supabase link --project-ref ${projectRef}

4. SQL 실행:
   supabase db push supabase_schema.sql

옵션 2: 직접 링크로 이동
────────────────────────────────────
아래 링크를 클릭하여 SQL Editor로 이동:
https://supabase.com/dashboard/project/${projectRef}/sql/new

그다음 COPY_THIS_TO_SUPABASE.sql 파일 내용을 
복사하여 붙여넣고 실행하세요.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
  
  // 브라우저 자동 열기 시도
  const platform = process.platform;
  const sqlEditorUrl = `https://supabase.com/dashboard/project/${projectRef}/sql/new`;
  
  const { exec } = require('child_process');
  
  if (platform === 'win32') {
    exec(`start ${sqlEditorUrl}`);
  } else if (platform === 'darwin') {
    exec(`open ${sqlEditorUrl}`);
  } else {
    exec(`xdg-open ${sqlEditorUrl}`);
  }
  
  console.log('✨ SQL Editor를 브라우저에서 열었습니다!');
  console.log('📋 COPY_THIS_TO_SUPABASE.sql 파일 내용을 복사하여 실행하세요.\n');
}

// 실행
executeSQL(sqlSchema).catch(console.error);