import { filterDefinitions } from "./data.js";
import {
  readMenus,
  saveMenu,
  deleteMenu,
  importMenus,
  preparePhoto,
} from "./storage.js";

const $ = (selector) => document.querySelector(selector);
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const SESSION = "desserter-demo-admin";
const authenticated = () => {
  try {
    return sessionStorage.getItem(SESSION) === "yes";
  } catch {
    return false;
  }
};

export function setupAdmin({ onMenusChanged }) {
  let menus = [];
  let photo = "";
  let editingId = "";
  let photoPreparing = false;
  let listScroll = 0;
  let oldView = "home";
  let saving = false;
  const editor = $("#menu-form");
  const status = (message, error = false) => {
    $("#admin-status").textContent = message;
    $("#admin-status").classList.toggle("is-error", error);
  };
  const requireLogin = () => {
    if (!authenticated()) {
      location.hash = "login";
      throw new Error("관리자 로그인이 필요해요.");
    }
  };
  const syncButton = () => {
    $("#admin-entry").textContent = authenticated()
      ? "메뉴 관리"
      : "관리자 로그인";
  };

  function showView() {
    let view = location.hash.slice(1);
    if (view !== "login" && view !== "admin") view = "home";
    if (view === "admin" && !authenticated()) {
      location.hash = "login";
      return;
    }
    if (view === "login" && authenticated()) {
      location.hash = "admin";
      return;
    }
    if (oldView === "home" && view !== "home") listScroll = window.scrollY;
    $("#home-view").hidden = view !== "home";
    $("#login-view").hidden = view !== "login";
    $("#admin-view").hidden = view !== "admin";
    $("#admin-entry").hidden = view !== "home";
    document.querySelector(".site-header").hidden = view !== "home";
    document.querySelector(".site-footer").hidden = view !== "home";
    if (view !== oldView) {
      window.scrollTo({
        top: view === "home" ? listScroll : 0,
        behavior: "instant",
      });
      const target =
        view === "login"
          ? $("#login-id")
          : view === "admin"
            ? $("#admin-title")
            : $("#admin-entry");
      target.focus({ preventScroll: true });
    }
    document.title =
      view === "login"
        ? "관리자 로그인 — desserter"
        : view === "admin"
          ? "메뉴 관리 — desserter"
          : "desserter — 내 취향의 케이크";
    oldView = view;
    syncButton();
  }

  function tasteOptions() {
    const category = editor.elements.category.value;
    const group = filterDefinitions[category][0];
    $("#admin-taste-label").textContent = group.label;
    editor.elements.taste.innerHTML = group.options
      .map((value) => `<option value="${value}">${value}</option>`)
      .join("");
  }

  function resetEditor() {
    editor.reset();
    editingId = "";
    photo = "";
    tasteOptions();
    $("#photo-preview").hidden = true;
    $("#photo-placeholder").hidden = false;
    $("#editor-title").textContent = "새 케이크 등록";
    $("#save-menu").textContent = "케이크 등록";
    $("#cancel-edit").hidden = true;
  }

  function showPreview() {
    $("#photo-preview").src = photo;
    $("#photo-preview").hidden = false;
    $("#photo-placeholder").hidden = true;
  }

  function renderAdminList() {
    $("#admin-menu-count").textContent =
      `기본 예시 24개 · 이 브라우저에 등록한 메뉴 ${menus.length}개`;
    $("#admin-empty").hidden = menus.length !== 0;
    $("#admin-menus").innerHTML = menus
      .map(
        (menu) =>
          `<article class="admin-menu-item"><img src="${escape(menu.imageUrl)}" alt="${escape(menu.name)} 등록 사진" /><div><span>${menu.category === "chocolate" ? "초코케이크" : "치즈케이크"}</span><h3>${escape(menu.name)}</h3><p>${escape(menu.shopName)} · ${menu.price.toLocaleString("ko-KR")}원</p></div><div class="admin-item-actions"><button type="button" data-edit-menu="${escape(menu.id)}" aria-label="${escape(menu.name)} 수정">수정</button><button type="button" data-delete-menu="${escape(menu.id)}" aria-label="${escape(menu.name)} 삭제">삭제</button></div></article>`,
      )
      .join("");
  }

  async function refreshMenus() {
    menus = await readMenus();
    renderAdminList();
    onMenusChanged(menus);
  }

  $("#admin-entry").addEventListener("click", () => {
    location.hash = authenticated() ? "admin" : "login";
  });
  document.querySelectorAll("[data-home]").forEach((button) =>
    button.addEventListener("click", () => {
      location.hash = "";
    }),
  );
  $("#login-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (
      form.elements.username.value === "adimin" &&
      form.elements.password.value === "0000"
    ) {
      try {
        sessionStorage.setItem(SESSION, "yes");
      } catch {
        $("#login-error").textContent =
          "브라우저의 저장 권한을 허용한 뒤 다시 시도해 주세요.";
        return;
      }
      form.reset();
      $("#login-error").textContent = "";
      location.hash = "admin";
    } else {
      $("#login-error").textContent = "아이디 또는 비밀번호가 올바르지 않아요.";
      form.elements.password.focus();
    }
  });
  $("#logout").addEventListener("click", () => {
    sessionStorage.removeItem(SESSION);
    resetEditor();
    status("");
    location.hash = "login";
  });
  editor.elements.category.addEventListener("change", tasteOptions);
  $("#cancel-edit").addEventListener("click", () => {
    resetEditor();
    status("");
  });
  editor.elements.photo.addEventListener("change", async (event) => {
    if (!event.target.files[0]) return;
    photoPreparing = true;
    $("#save-menu").disabled = true;
    status("사진을 준비하고 있어요…");
    try {
      photo = await preparePhoto(event.target.files[0]);
      showPreview();
      status("사진이 준비됐어요.");
    } catch (error) {
      event.target.value = "";
      status(error.message, true);
    } finally {
      photoPreparing = false;
      $("#save-menu").disabled = false;
    }
  });
  editor.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (saving || photoPreparing) return;
    try {
      requireLogin();
      if (!photo) throw new Error("케이크 사진을 선택해 주세요.");
      const fields = Object.fromEntries(new FormData(editor));
      const menu = {
        id: editingId || `local-${crypto.randomUUID()}`,
        category: fields.category,
        name: fields.name.trim(),
        shopName: fields.shopName.trim(),
        price: Number(fields.price),
        imageUrl: photo,
        components: [fields.component1, fields.component2, fields.component3]
          .map((v) => v.trim())
          .filter(Boolean),
        taste: fields.taste,
        texture: fields.texture,
        style: fields.style,
        description: fields.description.trim(),
        shopAddress: fields.shopAddress.trim(),
        shopHours: fields.shopHours.trim(),
        shopContact: fields.shopContact.trim(),
        shopWebsite: fields.shopWebsite.trim(),
        isCustom: true,
      };
      saving = true;
      $("#save-menu").disabled = true;
      const wasEditing = Boolean(editingId);
      await saveMenu(menu);
      await refreshMenus();
      resetEditor();
      status(
        wasEditing
          ? "메뉴가 수정됐어요. 홈페이지 목록에도 반영됐어요."
          : "메뉴가 등록됐어요. 홈페이지 목록에서 확인할 수 있어요.",
      );
    } catch (error) {
      status(error.message, true);
    } finally {
      saving = false;
      $("#save-menu").disabled = false;
    }
  });
  $("#admin-menus").addEventListener("click", async (event) => {
    try {
      requireLogin();
      const edit = event.target.closest("[data-edit-menu]");
      if (edit) {
        const menu = menus.find((m) => m.id === edit.dataset.editMenu);
        if (!menu) return;
        editingId = menu.id;
        editor.elements.category.value = menu.category;
        tasteOptions();
        for (const key of [
          "name",
          "shopName",
          "price",
          "taste",
          "texture",
          "style",
          "description",
          "shopAddress",
          "shopHours",
          "shopContact",
          "shopWebsite",
        ])
          editor.elements[key].value = menu[key] || "";
        menu.components.forEach((value, index) => {
          editor.elements[`component${index + 1}`].value = value;
        });
        if (menu.components.length === 2) editor.elements.component3.value = "";
        editor.elements.photo.value = "";
        photo = menu.imageUrl;
        showPreview();
        $("#editor-title").textContent = "케이크 정보 수정";
        $("#save-menu").textContent = "수정 저장";
        $("#cancel-edit").hidden = false;
        status("");
        editor.scrollIntoView({ block: "start" });
        editor.elements.name.focus({ preventScroll: true });
      }
      const remove = event.target.closest("[data-delete-menu]");
      if (remove) {
        const menu = menus.find((m) => m.id === remove.dataset.deleteMenu);
        if (!menu || !confirm(`‘${menu.name}’ 메뉴를 삭제할까요?`)) return;
        await deleteMenu(menu.id);
        if (editingId === menu.id) resetEditor();
        await refreshMenus();
        status("메뉴가 삭제됐어요.");
      }
    } catch (error) {
      status(error.message, true);
    }
  });
  $("#export-menus").addEventListener("click", () => {
    try {
      requireLogin();
      const url = URL.createObjectURL(
        new Blob([JSON.stringify({ version: 1, menus }, null, 2)], {
          type: "application/json",
        }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = "desserter-menus-backup.json";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      status("사진을 포함한 메뉴 백업을 내려받았어요.");
    } catch (error) {
      status(error.message, true);
    }
  });
  $("#import-menus").addEventListener("change", async (event) => {
    try {
      requireLogin();
      const file = event.target.files[0];
      if (!file) return;
      if (file.size > 30 * 1024 * 1024)
        throw new Error("백업 파일은 30MB 이하로 선택해 주세요.");
      const data = JSON.parse(await file.text());
      if (data.version !== 1 || !Array.isArray(data.menus))
        throw new Error("desserter 메뉴 백업 파일을 선택해 주세요.");
      await importMenus(data.menus);
      await refreshMenus();
      status(
        "백업 메뉴를 불러왔어요. 같은 ID의 메뉴는 백업 내용으로 갱신됐어요.",
      );
    } catch (error) {
      status(error.message, true);
    } finally {
      event.target.value = "";
    }
  });
  window.addEventListener("hashchange", showView);
  tasteOptions();
  showView();
  refreshMenus().catch((error) => status(error.message, true));
}
