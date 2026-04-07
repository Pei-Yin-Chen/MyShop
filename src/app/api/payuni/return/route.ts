import { NextResponse } from "next/server";
import { parsePayuniPostBody } from "@/lib/payuni/parse-post";
import { processPayuniReturn } from "./process";

/** PAYUNi 以 Form POST 前景通知；部分情境可能改以 GET 帶 EncryptInfo／HashInfo */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const encryptInfo =
    url.searchParams.get("EncryptInfo") ?? url.searchParams.get("encryptInfo") ?? "";
  const hashInfo =
    url.searchParams.get("HashInfo") ?? url.searchParams.get("hashInfo") ?? "";
  if (!encryptInfo || !hashInfo) {
    return NextResponse.redirect(
      new URL("/checkout?pay=missing_get", new URL(req.url).origin),
    );
  }
  return processPayuniReturn(req, { EncryptInfo: encryptInfo, HashInfo: hashInfo });
}

export async function POST(req: Request) {
  let body: Record<string, string>;
  try {
    body = await parsePayuniPostBody(req);
  } catch {
    return NextResponse.redirect(
      new URL("/checkout?pay=bad", new URL(req.url).origin),
    );
  }
  return processPayuniReturn(req, body);
}
