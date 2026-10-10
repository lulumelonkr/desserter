import "@fontsource-variable/noto-sans-kr";
import "./style.css";
import "./admin.css";
import { cakes, filterDefinitions, selectCakes } from "./data.js";
import { setupAdmin } from "./admin.js";

let menuCatalog = [...cakes];

const state = {
  category: "chocolate",
  filters: { taste: "", texture: "", style: "" },
  search: "",
  sort: "default",
};
const $ = (selector) => document.querySelector(selector);
const money = (amount) => `${new Intl.NumberFormat("ko-KR").format(amount)}원`;
const categoryName = () =>
  state.category === "chocolate" ? "초코케이크" : "치즈케이크";
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const dialog = $("#cake-dialog");
let previousFocus;
let previousScroll = 0;

function filtersMarkup(prefix) {
  return filterDefinitions[state.category]
    .map(
      (group) => `
    <fieldset class="filter-group"><legend>${group.label}</legend>
      <div class="filter-options">${group.options
        .map(
          (option) => `
        <button type="button" class="filter-option" data-filter="${group.key}" data-value="${option}" aria-pressed="false" aria-label="${prefix} ${group.label}: ${option}">
          <span class="option-indicator" aria-hidden="true"></span><span>${option}</span>
        </button>`,
        )
        .join("")}</div>
    </fieldset>`,
    )
    .join("");
}

function mountFilters() {
  $("#hero-filters").innerHTML = filtersMarkup("첫 화면");
  $("#results-filters").innerHTML = filtersMarkup("목록");
  $("#hero-category-label").textContent = categoryName();
}

function imageMarkup(cake, eager = false) {
  const sprite = Number.isInteger(cake.imagePosition);
  const column = sprite ? cake.imagePosition % 3 : 0;
  const row = sprite ? Math.floor(cake.imagePosition / 3) : 0;
  return `<div class="cake-photo ${sprite ? "is-sprite" : ""} ${cake.imageTileRatio === 1 ? "is-square-atlas" : ""}">
    <div class="image-fallback" role="img" aria-label="${escape(cake.name)} 이미지를 불러오지 못했어요" hidden><img src="./images/cake.svg" alt="" /><span>이미지를 준비하고 있어요</span></div>
    <img class="menu-image" src="${escape(cake.imageUrl)}" alt="${escape(cake.name)} ${cake.id.startsWith("local-") ? "등록 사진" : "예시 이미지"}" loading="${eager ? "eager" : "lazy"}" style="--column:${column};--row:${row}" />
    <span class="sample-label">${cake.id.startsWith("local-") ? "내가 등록한 메뉴" : "예시 이미지"}</span>
  </div>`;
}

function wireImageFallbacks(root) {
  root.querySelectorAll(".menu-image").forEach((img) => {
    const fallback = () => {
      img.hidden = true;
      img.parentElement.classList.add("image-failed");
      img.previousElementSibling.hidden = false;
    };
    img.addEventListener("error", fallback, { once: true });
    if (img.complete && img.naturalWidth === 0) fallback();
  });
}

function tagsMarkup(cake) {
  return `<div class="taste-tags">${[cake.taste, cake.texture, cake.style].map((tag) => `<span>${escape(tag)}</span>`).join("")}</div>`;
}

function renderResults() {
  const result = selectCakes(state, menuCatalog);
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(state.filters[button.dataset.filter] === button.dataset.value),
    );
  });
  document
    .querySelectorAll("[data-category]")
    .forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(state.category === button.dataset.category),
      ),
    );
  $("#result-count").textContent =
    `${categoryName()} · ${result.length}개의 케이크`;
  $("#active-filters").innerHTML = Object.entries(state.filters)
    .filter(([, value]) => value)
    .map(
      ([key, value]) =>
        `<button type="button" class="active-chip" data-remove="${key}" aria-label="${value} 필터 해제">✓ ${value} <span aria-hidden="true">×</span></button>`,
    )
    .join("");
  $("#clear-search").hidden = !state.search;
  $("#empty-clear-search").hidden = !state.search;
  $("#empty-state").hidden = result.length !== 0;
  $("#cake-grid").innerHTML = result
    .map(
      (cake, index) => `
    <button type="button" class="cake-card" data-cake="${cake.id}" aria-label="${escape(cake.name)} 상세 보기" style="--order:${index}">
      ${imageMarkup(cake)}
      <div class="card-content"><p class="shop-name">${escape(cake.shopName)}</p>
        <h3>${escape(cake.name)}</h3>
        <p class="card-price">${money(cake.price)} <span>/ 한 조각</span></p>
        <p class="components">${cake.components.map(escape).join(" · ")}</p>
        ${tagsMarkup(cake)}
      </div><span class="card-arrow" aria-hidden="true">↗</span>
    </button>`,
    )
    .join("");
  wireImageFallbacks($("#cake-grid"));
}

function resetFilters() {
  state.filters = { taste: "", texture: "", style: "" };
  renderResults();
}

document.addEventListener("click", (event) => {
  const category = event.target.closest("[data-category]");
  if (category && category.dataset.category !== state.category) {
    state.category = category.dataset.category;
    resetFilters();
    mountFilters();
    renderResults();
  }
  const option = event.target.closest("[data-filter]");
  if (option) {
    const { filter, value } = option.dataset;
    state.filters[filter] = state.filters[filter] === value ? "" : value;
    renderResults();
  }
  const chip = event.target.closest("[data-remove]");
  if (chip) {
    state.filters[chip.dataset.remove] = "";
    renderResults();
    $(`#results-filters [data-filter="${chip.dataset.remove}"]`).focus({
      preventScroll: true,
    });
  }
  if (event.target.closest("[data-reset]")) resetFilters();
  const card = event.target.closest("[data-cake]");
  if (card)
    openDetails(menuCatalog.find((cake) => cake.id === card.dataset.cake));
});

$("#search").addEventListener("input", (event) => {
  state.search = event.target.value;
  renderResults();
});
$("#sort").addEventListener("change", (event) => {
  state.sort = event.target.value;
  renderResults();
});
function clearSearch() {
  state.search = "";
  $("#search").value = "";
  renderResults();
  $("#search").focus({ preventScroll: true });
}
$("#clear-search").addEventListener("click", clearSearch);
$("#empty-clear-search").addEventListener("click", clearSearch);
$("#go").addEventListener("click", () => {
  $("#results").scrollIntoView({
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth",
    block: "start",
  });
  $("#results-title").setAttribute("tabindex", "-1");
  $("#results-title").focus({ preventScroll: true });
});

function openDetails(cake) {
  previousFocus = document.activeElement;
  previousScroll = window.scrollY;
  $("#detail-content").innerHTML =
    `${imageMarkup(cake, true)}<div class="detail-copy">
    <span class="eyebrow">A SLICE FOR YOU</span><p class="shop-name">${escape(cake.shopName)}</p>
    <h2 id="detail-title">${escape(cake.name)}</h2><p class="detail-price">${money(cake.price)} <span>/ 한 조각</span></p>
    <h3>이 한 조각의 구성</h3><p class="detail-components">${cake.components.map(escape).join(" · ")}</p>
    <h3>맛의 특징</h3>${tagsMarkup(cake)}<p id="detail-description">${escape(cake.description)}</p>
    ${
      cake.id.startsWith("local-")
        ? `<h3>가게 정보</h3><dl class="shop-details">${[
            ["주소", cake.shopAddress],
            ["영업 시간", cake.shopHours],
            ["연락처", cake.shopContact],
          ]
            .filter(([, value]) => value)
            .map(
              ([label, value]) =>
                `<div><dt>${label}</dt><dd>${escape(value)}</dd></div>`,
            )
            .join(
              "",
            )}</dl>${cake.shopWebsite ? `<a class="shop-website" href="${escape(cake.shopWebsite)}" target="_blank" rel="noopener noreferrer">가게 홈페이지 ↗</a>` : ""}<p class="detail-notice">이 브라우저에 직접 등록한 메뉴입니다.<br />다른 방문자에게 공개되지 않습니다.</p>`
        : '<p class="detail-notice">데모 메뉴이며 실제 판매 정보가 아닙니다.<br />사진은 AI로 만든 예시 이미지입니다.</p>'
    }
  </div>`;
  wireImageFallbacks($("#detail-content"));
  document.body.style.top = `-${previousScroll}px`;
  document.body.classList.add("modal-open");
  dialog.showModal();
  dialog.scrollTop = 0;
  $("#close-dialog").focus();
}

$("#close-dialog").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    const bounds = dialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      dialog.close();
  }
});
dialog.addEventListener("keydown", (event) => {
  if (event.key !== "Tab") return;
  const focusable = [
    ...dialog.querySelectorAll(
      'button, a[href], input, select, [tabindex="0"]',
    ),
  ].filter((el) => !el.disabled && !el.hidden);
  const first = focusable[0],
    last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
dialog.addEventListener("close", () => {
  document.body.classList.remove("modal-open");
  document.body.style.top = "";
  window.scrollTo({ top: previousScroll, behavior: "instant" });
  previousFocus?.focus({ preventScroll: true });
});

mountFilters();
renderResults();
setupAdmin({
  onMenusChanged: (menus) => {
    menuCatalog = [...cakes, ...menus];
    renderResults();
  },
});
