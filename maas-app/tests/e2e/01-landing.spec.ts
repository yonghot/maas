import { test, expect } from '@playwright/test';

test.describe('랜딩 페이지 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('랜딩 페이지 기본 요소 확인', async ({ page }) => {
    // 타이틀 확인
    await expect(page).toHaveTitle(/MAAS/);
    
    // 제목 확인
    await expect(page.locator('h1')).toContainText('나의 결혼 점수는?');
    
    // 설명 텍스트 확인
    await expect(page.locator('text=불편한 진실')).toBeVisible();
    
    // 시작 버튼 확인
    await expect(page.locator('button:has-text("지금 바로 시작하기")')).toBeVisible();
  });

  test('테스트 시작 플로우', async ({ page }) => {
    // 시작 버튼 클릭
    await page.click('button:has-text("지금 바로 시작하기")');
    
    // /test 페이지로 이동 확인
    await expect(page).toHaveURL('/test');
    
    // 테스트 페이지 로드 확인 (성별 선택이나 질문이 표시됨)
    await expect(page.locator('main')).toBeVisible();
  });

  test('통계 카드 표시 확인', async ({ page }) => {
    // 통계 카드들이 표시되는지 확인
    await expect(page.locator('text=참여자 수')).toBeVisible();
    await expect(page.locator('text=평균 점수')).toBeVisible();
    await expect(page.locator('text=만족도')).toBeVisible();
  });

  test('모바일 반응형 확인', async ({ page }) => {
    // 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 812 });
    
    // 모바일에서도 모든 요소가 표시되는지 확인
    await expect(page).toHaveTitle(/MAAS/);
    await expect(page.locator('button:has-text("지금 바로 시작하기")')).toBeVisible();
    await expect(page.locator('text=객관적 평가')).toBeVisible();
  });
});