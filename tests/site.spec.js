import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});
const filter = (page, group, value, area = "첫 화면") =>
  page.getByRole("button", { name: `${area} ${group}: ${value}`, exact: true });
const cards = (page) => page.locator(".cake-card");

test("category switching resets taste filters and shows the correct six menus", async ({
  page,
}) => {
  await expect(cards(page)).toHaveCount(6);
  await filter(page, "단맛", "달지 않음").click();
  await expect(cards(page)).toHaveCount(3);
  await page.getByRole("button", { name: "cheesecake" }).click();
  await expect(cards(page)).toHaveCount(6);
  await expect(page.locator("#hero-filters")).toContainText("치즈 풍미");
  await expect(page.locator("#active-filters button")).toHaveCount(0);
  await filter(page, "치즈 풍미", "치즈맛 강함").click();
  await expect(cards(page)).toHaveCount(3);
  await page.getByRole("button", { name: "chococake" }).click();
  await expect(cards(page)).toHaveCount(6);
  await expect(page.locator("#hero-filters")).toContainText("단맛");
});

test("AND filters, toggle-off, mutually exclusive options and synchronized result controls", async ({
  page,
}) => {
  await filter(page, "단맛", "달지 않음").click();
  await filter(page, "식감", "꾸덕함").click();
  await expect(cards(page)).toHaveCount(2);
  await filter(page, "스타일", "클래식파", "목록").click();
  await expect(cards(page)).toHaveCount(1);
  await expect(cards(page).first()).toContainText("딥 다크 가나슈");
  await expect(filter(page, "스타일", "클래식파")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await filter(page, "스타일", "클래식파").click();
  await expect(cards(page)).toHaveCount(2);
  await filter(page, "단맛", "달콤함").click();
  await expect(filter(page, "단맛", "달지 않음")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(cards(page)).toHaveCount(1);
  await page
    .getByRole("button", { name: "필터 초기화", exact: true })
    .first()
    .click();
  await expect(cards(page)).toHaveCount(6);
});

test("GO scrolls to all menus when no filter is selected", async ({ page }) => {
  await page.getByRole("button", { name: "GO" }).click();
  await expect(page.locator("#results-title")).toBeFocused();
  await expect(cards(page)).toHaveCount(6);
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(200);
});

test("search, filters and price order work together; default order restores", async ({
  page,
}) => {
  await filter(page, "단맛", "달지 않음").click();
  await page.getByRole("searchbox").fill("오렌지");
  await expect(cards(page)).toHaveCount(1);
  await expect(cards(page).first()).toContainText("시트러스 룸");
  await page
    .getByRole("button", { name: "검색어 지우기", exact: true })
    .click();
  await page.getByLabel("정렬", { exact: true }).selectOption("asc");
  await expect(cards(page).first()).toContainText("7,800원");
  await page.getByLabel("정렬", { exact: true }).selectOption("desc");
  await expect(cards(page).first()).toContainText("8,900원");
  await page.getByLabel("정렬", { exact: true }).selectOption("default");
  await expect(cards(page).first()).toContainText("딥 다크 가나슈");
  await page.getByRole("searchbox").fill("브라운 노트");
  await expect(cards(page)).toHaveCount(1);
  await page.getByRole("searchbox").fill("가나슈");
  await expect(cards(page)).toHaveCount(1);
});

test("empty states let users reset filters and clear a failing search", async ({
  page,
}) => {
  await filter(page, "단맛", "달지 않음").click();
  await filter(page, "식감", "부드러움").click();
  await filter(page, "스타일", "클래식파").click();
  await expect(page.locator("#empty-state")).toBeVisible();
  await expect(page.locator("#empty-state")).toContainText(
    "선택한 맛에 맞는 케이크가 없어요",
  );
  await page
    .locator("#empty-state")
    .getByRole("button", { name: "필터 초기화" })
    .click();
  await expect(cards(page)).toHaveCount(6);
  await page.getByRole("searchbox").fill("없는케이크");
  await page
    .locator("#empty-state")
    .getByRole("button", { name: "검색어 지우기" })
    .click();
  await expect(cards(page)).toHaveCount(6);
  await expect(page.getByRole("searchbox")).toHaveValue("");
});

test("details show data, trap focus, close by ESC and preserve filters and scroll", async ({
  page,
}) => {
  await filter(page, "단맛", "달지 않음").click();
  await page.getByRole("searchbox").fill("초코");
  await page.getByLabel("정렬", { exact: true }).selectOption("desc");
  const card = cards(page).first();
  await card.scrollIntoViewIfNeeded();
  const before = await page.evaluate(() => window.scrollY);
  await card.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator("#detail-title")).toHaveText("오렌지 다크 쇼콜라");
  await expect(page.locator("#detail-content")).toContainText("8,900원");
  await expect(page.locator("#detail-content .taste-tags span")).toHaveCount(3);
  await expect(
    page.getByRole("button", { name: "상세 보기 닫기" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "상세 보기 닫기" }),
  ).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(
    page.getByRole("button", { name: "상세 보기 닫기" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(card).toBeFocused();
  expect(await page.evaluate(() => window.scrollY)).toBeCloseTo(before, 0);
  await expect(filter(page, "단맛", "달지 않음")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByRole("searchbox")).toHaveValue("초코");
  await expect(page.getByLabel("정렬", { exact: true })).toHaveValue("desc");
  await card.click();
  await page.getByRole("button", { name: "상세 보기 닫기" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("image failure keeps photo space and fallback in cards and details", async ({
  page,
}) => {
  await page.route("**/images/cakes.png", (route) => route.abort());
  await page.reload();
  await expect(
    page.locator(".cake-card").first().locator(".image-fallback"),
  ).toBeVisible();
  const box = await page
    .locator(".cake-card")
    .first()
    .locator(".cake-photo")
    .boundingBox();
  expect(box.height).toBeGreaterThan(100);
  await cards(page).first().click();
  await expect(page.locator("#detail-content .image-fallback")).toBeVisible();
});

test("main controls respond to keyboard space, enter and tab", async ({
  page,
}) => {
  const taste = filter(page, "단맛", "달지 않음");
  await taste.focus();
  await page.keyboard.press("Space");
  await expect(taste).toHaveAttribute("aria-pressed", "true");
  await expect(cards(page)).toHaveCount(3);
  await page.keyboard.press("Space");
  await expect(taste).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "cheesecake" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#result-count")).toContainText("치즈케이크");
  await cards(page).first().focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(cards(page).first()).toBeFocused();
});

for (const width of [320, 375, 768, 1280]) {
  test(`responsive layout has no horizontal overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    if (width < 700) {
      const grid = await page
        .locator(".cake-grid")
        .evaluate(
          (el) => getComputedStyle(el).gridTemplateColumns.split(" ").length,
        );
      expect(grid).toBe(1);
    }
    await page.getByRole("button", { name: "cheesecake" }).click();
    await filter(page, "치즈 풍미", "치즈맛 강하지 않음").click();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    await cards(page).first().click();
    const modal = await page.getByRole("dialog").boundingBox();
    expect(modal.x).toBeGreaterThanOrEqual(0);
    expect(modal.x + modal.width).toBeLessThanOrEqual(width);
    await page.keyboard.press("Escape");
  });
}
