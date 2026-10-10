import test from "node:test";
import assert from "node:assert/strict";
import { cakes, filterDefinitions, selectCakes } from "../src/data.js";

test("12 menus use valid categories, unique IDs, prices and category-specific taste values", () => {
  assert.equal(cakes.length, 12);
  assert.equal(new Set(cakes.map((cake) => cake.id)).size, 12);
  for (const category of ["chocolate", "cheesecake"]) {
    const menus = cakes.filter((cake) => cake.category === category);
    assert.equal(menus.length, 6);
    for (const cake of menus) {
      assert.ok(Number.isInteger(cake.price) && cake.price > 0);
      assert.ok(cake.components.length >= 2 && cake.components.length <= 3);
      assert.ok(
        cake.imageUrl && cake.name && cake.shopName && cake.description,
      );
      for (const group of filterDefinitions[category])
        assert.ok(group.options.includes(cake[group.key]));
    }
  }
});

test("all combinations apply AND, including unset options, without modifying source order", () => {
  const originalIds = cakes.map((cake) => cake.id);
  for (const category of ["chocolate", "cheesecake"]) {
    const definitions = filterDefinitions[category];
    for (const taste of ["", ...definitions[0].options]) {
      for (const texture of ["", ...definitions[1].options]) {
        for (const style of ["", ...definitions[2].options]) {
          const filters = { taste, texture, style };
          const actual = selectCakes({ category, filters });
          const expected = cakes.filter(
            (c) =>
              c.category === category &&
              (!taste || c.taste === taste) &&
              (!texture || c.texture === texture) &&
              (!style || c.style === style),
          );
          assert.deepEqual(actual, expected);
        }
      }
    }
  }
  assert.deepEqual(
    cakes.map((cake) => cake.id),
    originalIds,
  );
});

test("search covers names, shops, ingredients and combines with price sorting and filters", () => {
  const base = { category: "chocolate", filters: {} };
  for (const query of ["오렌지 다크", "시트러스", "오렌지 제스트"])
    assert.equal(selectCakes({ ...base, search: query })[0].id, "choco-05");
  assert.equal(
    selectCakes({ ...base, search: "오렌지", filters: { taste: "달콤함" } })
      .length,
    0,
  );
  for (const sort of ["asc", "desc"]) {
    const result = selectCakes({ ...base, search: "초코", sort });
    assert.ok(result.length > 1);
    for (let i = 1; i < result.length; i++)
      assert.ok(
        sort === "asc"
          ? result[i - 1].price <= result[i].price
          : result[i - 1].price >= result[i].price,
      );
  }
});
