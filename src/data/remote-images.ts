/**
 * Unsplash 圖片（已簡化 query，與 next/image 相容）
 */
function u(photoPath: string, w: number) {
  return `https://images.unsplash.com/${photoPath}?auto=format&fit=crop&q=80&w=${w}`;
}

/**
 * 所有圖檔的 Unsplash `photo-…` 路徑（寬度一律在下方 `u(…, w)` 指定）。
 */
const PHOTOS = {
  /** Hero 左、userCake800：草莓果粒麵包桌面 */
  strawberryBreadDesktop: "photo-1574241449413-b5c96d31e391",
  /** Hero 右上、userBakery*、userBakery900：店內麵包陳列 */
  bakeryShelves: "photo-1505976378723-9726b54e9bb9",
  /** Hero 右下、croissant 品項 */
  croissant: "photo-1555507036-ab1f4038808a",
  /** 馬卡龍拼盤、macarons */
  macaronSpread: "photo-1702234695529-953c109b19f9",
  /** 酸種鄉村麵包品項 */
  countryLoaf: "photo-1509440159596-0249088772ff",
  /** 草莓奶油小杯蛋糕、跑馬燈 */
  strawberryCupcakeCup: "photo-1563729784474-d77dbb933a9e",
  /** 肉桂捲品項、跑馬燈 */
  cinnamonRoll: "photo-1509365465985-25d11c17e812",
  /** 季節水果塔 */
  fruitTart: "photo-1565958011703-44f9829ba187",
  /** 新鮮麵包排排站 */
  breadLoaves: "photo-1549931319-a545dcf3bc73",
} as const;

/** Hero 三格主視覺（1200w） */
export const heroCakeFeatured = u(PHOTOS.strawberryBreadDesktop, 1200);
export const heroBreadFeatured = u(PHOTOS.bakeryShelves, 1200);
export const heroCroissantFeatured = u(PHOTOS.croissant, 1200);

export const macaronPlate = u(PHOTOS.macaronSpread, 800);

/** 列表、跑馬燈、卡片（800w／900w） */
export const shopImages = {
  userBakery900: u(PHOTOS.bakeryShelves, 900),
  userCake800: u(PHOTOS.strawberryBreadDesktop, 800),
  userBakery800: u(PHOTOS.bakeryShelves, 800),
  bread: u(PHOTOS.countryLoaf, 800),
  croissant: u(PHOTOS.croissant, 800),
  seasonSundae: u(PHOTOS.strawberryCupcakeCup, 800),
  macarons: macaronPlate,
  cinnamonRoll: u(PHOTOS.cinnamonRoll, 800),
  fruitTart: u(PHOTOS.fruitTart, 800),
  breadLoaves: u(PHOTOS.breadLoaves, 800),
} as const;
