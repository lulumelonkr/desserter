import { test, expect } from "@playwright/test";
import { fileURLToPath } from "node:url";

const imagePath = fileURLToPath(
  new URL("../public/images/cakes.png", import.meta.url),
);
async function login(page) {
  await page.goto("/#login");
  await page.getByLabel("아이디", { exact: false }).fill("adimin");
  await page.getByLabel("비밀번호", { exact: false }).fill("0000");
  await page.getByRole("button", { name: "로그인", exact: true }).click();
  await expect(page.locator("#admin-view")).toBeVisible();
}
async function fillMenu(page, category = "chocolate") {
  await page.locator("#admin-view").getByLabel("케이크 종류", { exact: false }).selectOption(category);
  await page
    .locator("#admin-view").getByLabel("케이크 이름", { exact: false })
    .fill("내 테스트 케이크");
  await page.locator("#admin-view").getByLabel("가게 이름", { exact: false }).fill("테스트 가게");
  await page.locator("#admin-view").getByLabel("한 조각 가격 (원)", { exact: false }).fill("9700");
  await page.locator("#admin-view").getByLabel("구성요소 1", { exact: false }).fill("테스트 크림");
  await page.locator("#admin-view").getByLabel("구성요소 2", { exact: false }).fill("버터 쿠키");
  await page
    .locator("#admin-view").getByLabel("맛과 재료 소개", { exact: false })
    .fill("직접 등록한 케이크의 맛과 재료 소개입니다.");
  await page.locator("#admin-view").getByLabel("가게 주소", { exact: false }).fill("서울 테스트길 12");
  await page.locator("#admin-view").getByLabel("영업 시간", { exact: false }).fill("11:00–20:00");
  await page.locator("#admin-view").getByLabel("연락처", { exact: false }).fill("02-123-4567");
  await page
    .locator("#admin-view").getByLabel("가게 홈페이지", { exact: false })
    .fill("https://example.com");
}
async function register(page, category = "chocolate") {
  await fillMenu(page, category);
  await page
    .locator("#admin-view").getByLabel("케이크 사진", { exact: false })
    .setInputFiles(imagePath);
  await expect(page.locator("#admin-status")).toHaveText("사진이 준비됐어요.");
  await page.getByRole("button", { name: "케이크 등록", exact: true }).click();
  await expect(page.locator("#admin-status")).toContainText(
    "메뉴가 등록됐어요.",
  );
}

test("admin login blocks direct access and invalid credentials; logout removes editor access", async ({
  page,
}) => {
  await page.goto("/#admin");
  await expect(page.locator("#login-view")).toBeVisible();
  await expect(page.locator("#admin-view")).toBeHidden();
  await page.getByLabel("아이디", { exact: false }).fill("admin");
  await page.getByLabel("비밀번호", { exact: false }).fill("wrong");
  await page.getByRole("button", { name: "로그인", exact: true }).click();
  await expect(page.locator("#login-error")).toContainText("올바르지 않아요");
  await login(page);
  await page.getByRole("button", { name: "로그아웃", exact: true }).click();
  await expect(page.locator("#login-view")).toBeVisible();
  await page.goto("/#admin");
  await expect(page.locator("#admin-view")).toBeHidden();
});

test("uploaded menu persists through refresh and appears with photo, category taste and shop details", async ({
  page,
}) => {
  await login(page);
  await register(page, "cheesecake");
  await expect(page.locator("#admin-menu-count")).toContainText(
    "등록한 메뉴 1개",
  );
  await page
    .getByRole("button", { name: "홈페이지 보기", exact: true })
    .click();
  await page.getByRole("button", { name: "cheesecake" }).click();
  await expect(page.locator(".cake-card")).toHaveCount(13);
  await page.getByRole("searchbox").fill("내 테스트 케이크");
  await expect(page.locator(".cake-card")).toHaveCount(1);
  await page.locator(".cake-card").click();
  await expect(page.locator("#detail-content")).toContainText(
    "서울 테스트길 12",
  );
  await expect(page.locator("#detail-content")).toContainText("11:00–20:00");
  await expect(page.locator("#detail-content .taste-tags")).toContainText(
    "치즈맛 강함",
  );
  await expect(page.locator("#detail-content .menu-image")).toHaveAttribute(
    "src",
    /^data:image\/jpeg;base64,/,
  );
  await expect(page.locator("#detail-content .cake-photo")).not.toHaveClass(
    /is-sprite/,
  );
  await page.keyboard.press("Escape");
  await page.reload();
  await page.getByRole("button", { name: "cheesecake" }).click();
  await expect(page.locator(".cake-card")).toHaveCount(13);
  await page.getByRole("button", { name: "메뉴 관리", exact: true }).click();
  await expect(page.locator("#admin-menus")).toContainText("내 테스트 케이크");
});

test("edit, confirmed deletion and JSON backup restore preserve the uploaded menu and image", async ({
  page,
}) => {
  await login(page);
  await register(page);
  await page
    .getByRole("button", { name: "내 테스트 케이크 수정", exact: true })
    .click();
  await page.locator("#admin-view").getByLabel("케이크 이름", { exact: false }).fill("수정한 케이크");
  await page.locator("#admin-view").getByLabel("한 조각 가격 (원)", { exact: false }).fill("10500");
  await page.getByRole("button", { name: "수정 저장", exact: true }).click();
  await expect(page.locator("#admin-status")).toContainText(
    "메뉴가 수정됐어요.",
  );
  await expect(page.locator("#admin-menus")).toContainText("10,500원");
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "백업 내보내기", exact: true })
    .click();
  const download = await downloadPromise;
  const path = await download.path();
  page.once("dialog", (dialog) => dialog.dismiss());
  await page
    .getByRole("button", { name: "수정한 케이크 삭제", exact: true })
    .click();
  await expect(page.locator("#admin-menus .admin-menu-item")).toHaveCount(1);
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "수정한 케이크 삭제", exact: true })
    .click();
  await expect(page.locator("#admin-menus .admin-menu-item")).toHaveCount(0);
  await page
    .locator("#admin-view").getByLabel("메뉴 백업 불러오기", { exact: false })
    .setInputFiles(path);
  await expect(page.locator("#admin-status")).toContainText(
    "백업 메뉴를 불러왔어요.",
  );
  await expect(page.locator("#admin-menus .admin-menu-item")).toHaveCount(1);
  await expect(page.locator("#admin-menus")).toContainText("수정한 케이크");
});

test("missing photos, unsupported files and malformed backups display errors without saving", async ({
  page,
}) => {
  await login(page);
  await fillMenu(page);
  await page.getByRole("button", { name: "케이크 등록", exact: true }).click();
  await expect(page.locator("#admin-status")).toContainText(
    "사진을 선택해 주세요",
  );
  await page
    .locator("#admin-view").getByLabel("케이크 사진", { exact: false })
    .setInputFiles({
      name: "not-photo.svg",
      mimeType: "image/svg+xml",
      buffer: Buffer.from("<svg/>"),
    });
  await expect(page.locator("#admin-status")).toContainText("JPEG·PNG·WebP");
  await page
    .locator("#admin-view").getByLabel("메뉴 백업 불러오기", { exact: false })
    .setInputFiles({
      name: "bad.json",
      mimeType: "application/json",
      buffer: Buffer.from('{"version":1,"menus":[{"id":"bad"}]}'),
    });
  await expect(page.locator("#admin-status")).toContainText(
    "케이크 종류를 확인",
  );
  await expect(page.locator("#admin-menus .admin-menu-item")).toHaveCount(0);
});

for (const width of [320, 375, 1280]) {
  test(`admin login and editor fit the ${width}px viewport`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    await page
      .getByRole("button", { name: "관리자 로그인", exact: true })
      .click();
    await expect(page.locator("#login-view")).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    await login(page);
    await fillMenu(page, "cheesecake");
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    await expect(page.locator("#admin-view").getByLabel("치즈 풍미", { exact: false })).toBeVisible();
  });
}
