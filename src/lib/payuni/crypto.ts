import crypto from "crypto";
import querystring from "querystring";

/**
 * PAYUNi 官方 Node.js 文件 AES-GCM 範例（#/7/312）：
 * https://docs.payuni.com.tw/web/#/7/312
 *
 * - encrypt：密文以 utf8→base64；authTag 以 base64；組成 `cipherText:::tag` 字串後整段轉 hex
 * - decrypt：hex 解回字串，以 `:::` 拆成 base64 密文與 base64 tag
 * - SHA256：`HashKey + EncryptInfo + HashIV`（字串相接）再 digest hex 大寫
 */

function trimKeyMaterial(s: string): string {
  return s.trim();
}

function aesKeyBuffer(hashKey: string): Buffer {
  const t = Buffer.from(trimKeyMaterial(hashKey), "utf8");
  if (t.length !== 32) {
    throw new Error("PAYUNI_HASH_KEY 須為 32 個位元組（UTF-8），請確認後台 Hash Key");
  }
  return t;
}

function aesIvBuffer(hashIv: string): Buffer {
  const t = Buffer.from(trimKeyMaterial(hashIv), "utf8");
  if (t.length !== 12 && t.length !== 16) {
    throw new Error("PAYUNI_HASH_IV 須為 12 或 16 個位元組（UTF-8），請確認後台 Hash IV");
  }
  return t;
}

export function encryptPayuniPayload(
  fields: Record<string, string | number>,
  hashKey: string,
  hashIv: string,
): string {
  const plaintext = querystring.stringify(
    Object.fromEntries(
      Object.entries(fields).map(([k, v]) => [k, String(v)]),
    ),
  );

  const key = aesKeyBuffer(hashKey);
  const iv = aesIvBuffer(hashIv);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  let cipherText = cipher.update(plaintext, "utf8", "base64");
  cipherText += cipher.final("base64");
  const tag = cipher.getAuthTag().toString("base64");

  return Buffer.from(`${cipherText}:::${tag}`).toString("hex").trim();
}

export function hashPayuniEncryptInfo(
  encryptStr: string,
  key: string,
  iv: string,
): string {
  const k = trimKeyMaterial(key);
  const v = trimKeyMaterial(iv);
  return crypto
    .createHash("sha256")
    .update(`${k}${encryptStr}${v}`)
    .digest("hex")
    .toUpperCase();
}

export function decryptPayuniPayload(
  encryptStr: string,
  hashKey: string,
  hashIv: string,
): Record<string, string> {
  const inner = Buffer.from(encryptStr, "hex").toString("utf8");
  const sep = ":::";
  const idx = inner.indexOf(sep);
  if (idx < 0) {
    throw new Error("Invalid EncryptInfo format");
  }
  const encryptData = inner.slice(0, idx);
  const tag = inner.slice(idx + sep.length);

  const key = aesKeyBuffer(hashKey);
  const iv = aesIvBuffer(hashIv);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(Buffer.from(tag, "base64"));

  let decipherText = decipher.update(encryptData, "base64", "utf8");
  decipherText += decipher.final("utf8");

  return querystring.parse(decipherText) as Record<string, string>;
}

export function verifyPayuniHash(
  encryptInfoHex: string,
  hashInfo: string,
  hashKey: string,
  hashIv: string,
): boolean {
  const expected = hashPayuniEncryptInfo(encryptInfoHex, hashKey, hashIv);
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(String(hashInfo).trim(), "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
