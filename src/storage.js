import { filterDefinitions } from "./data.js";

const DB_NAME = "desserter-local-menus";
const STORE = "cakes";
let connection;

function openDatabase() {
  if (!connection)
    connection = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () =>
        request.result.createObjectStore(STORE, { keyPath: "id" });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        connection = undefined;
        reject(
          new Error(
            "브라우저 저장소를 열 수 없어요. 브라우저의 저장 권한을 확인해 주세요.",
          ),
        );
      };
    });
  return connection;
}

export function validateMenu(menu) {
  if (!menu || !filterDefinitions[menu.category])
    throw new Error("케이크 종류를 확인해 주세요.");
  for (const field of ["id", "name", "shopName", "description"]) {
    if (
      typeof menu[field] !== "string" ||
      !menu[field].trim() ||
      menu[field].length > 1000
    )
      throw new Error("메뉴 이름, 가게 이름, 소개를 확인해 주세요.");
  }
  if (!/^local-[a-zA-Z0-9-]+$/.test(menu.id))
    throw new Error("올바른 등록 메뉴 ID가 아니에요.");
  if (!Number.isInteger(menu.price) || menu.price <= 0 || menu.price > 1000000)
    throw new Error("가격은 1~1,000,000원 사이의 정수로 입력해 주세요.");
  if (
    !Array.isArray(menu.components) ||
    menu.components.length < 2 ||
    menu.components.length > 3 ||
    menu.components.some(
      (v) => typeof v !== "string" || !v.trim() || v.length > 80,
    )
  )
    throw new Error("구성요소는 2~3개를 입력해 주세요.");
  for (const group of filterDefinitions[menu.category]) {
    if (!group.options.includes(menu[group.key]))
      throw new Error("선택한 맛의 특징을 확인해 주세요.");
  }
  if (
    typeof menu.imageUrl !== "string" ||
    !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(
      menu.imageUrl,
    ) ||
    menu.imageUrl.length > 4000000
  )
    throw new Error("등록 사진은 JPEG·PNG·WebP 이미지여야 해요.");
  for (const key of [
    "shopAddress",
    "shopHours",
    "shopContact",
    "shopWebsite",
  ]) {
    if (
      menu[key] !== undefined &&
      (typeof menu[key] !== "string" || menu[key].length > 300)
    )
      throw new Error("가게 정보가 너무 길거나 형식이 잘못됐어요.");
  }
  if (menu.shopWebsite && !/^https?:\/\//i.test(menu.shopWebsite))
    throw new Error(
      "가게 홈페이지는 http:// 또는 https:// 주소로 입력해 주세요.",
    );
  return menu;
}

async function transaction(mode, operation) {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE, mode);
    let value;
    const request = operation(tx.objectStore(STORE));
    if (request)
      request.onsuccess = () => {
        value = request.result;
      };
    tx.oncomplete = () => resolve(value);
    tx.onerror = () =>
      reject(
        new Error(
          "저장에 실패했어요. 브라우저 저장 공간과 권한을 확인해 주세요.",
        ),
      );
    tx.onabort = tx.onerror;
  });
}

export const readMenus = () =>
  transaction("readonly", (store) => store.getAll());
export const saveMenu = (menu) =>
  transaction("readwrite", (store) => store.put(validateMenu(menu)));
export const deleteMenu = (id) =>
  transaction("readwrite", (store) => store.delete(id));
export async function importMenus(menus) {
  if (!Array.isArray(menus) || menus.length > 200)
    throw new Error("한 번에 최대 200개의 메뉴를 불러올 수 있어요.");
  menus.forEach(validateMenu);
  if (new Set(menus.map((m) => m.id)).size !== menus.length)
    throw new Error("중복된 메뉴 ID가 있어요.");
  return transaction("readwrite", (store) => {
    menus.forEach((menu) => store.put(menu));
  });
}

export async function preparePhoto(file) {
  if (!file || !["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("JPEG·PNG·WebP 사진을 선택해 주세요.");
  if (file.size > 10 * 1024 * 1024)
    throw new Error("사진은 10MB 이하로 선택해 주세요.");
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const scale = Math.min(
      1,
      1600 / Math.max(image.naturalWidth, image.naturalHeight),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    context.fillStyle = "#fffdf9";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.84);
  } catch {
    throw new Error("사진을 읽지 못했어요. 다른 사진 파일을 선택해 주세요.");
  } finally {
    URL.revokeObjectURL(url);
  }
}
