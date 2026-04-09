"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { fetchUserIsAdmin } from "@/lib/supabase/is-admin";
import { ADMIN_ORDER_STATUS_FILTER_VALUES } from "@/lib/admin/admin-orders-list";
import {
  ADMIN_ORDER_NOTE_MAX_CHARS,
  ORDER_ADMIN_NOTE_HANDLING_VALUES,
} from "@/lib/admin/admin-order-notes";
import { isValidShippingCarrier } from "@/lib/orders/shipping-carriers";

const MARK_SHIPPABLE_ORDER_STATUSES = ["paid", "processing"] as const;
const MAX_TRACKING_LEN = 120;

async function requireAdminSupabase() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase: null, error: "未登入" as const };
  const ok = await fetchUserIsAdmin(supabase, user.id);
  if (!ok) return { supabase: null, error: "需要管理員權限" as const };
  return { supabase, error: null as null };
}

export type OrderProcessingActionState =
  | { ok: true; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/** 訂單狀態與後台備註一次儲存（單一表單） */
export async function saveAdminOrderProcessingAction(
  _prev: OrderProcessingActionState | undefined,
  formData: FormData,
): Promise<OrderProcessingActionState> {
  const { supabase, error: authError } = await requireAdminSupabase();
  if (!supabase || authError) return { ok: false, error: authError ?? "未授權" };

  const orderId = String(formData.get("order_id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const bodyRaw = String(formData.get("body") ?? "");
  const body = bodyRaw.trim();
  const handlingStatus = String(formData.get("handling_status") ?? "").trim();

  if (!orderId) return { ok: false, error: "缺少訂單 ID" };
  if (!ADMIN_ORDER_STATUS_FILTER_VALUES.includes(status as (typeof ADMIN_ORDER_STATUS_FILTER_VALUES)[number])) {
    return { ok: false, error: "無效的訂單狀態" };
  }
  if (
    !ORDER_ADMIN_NOTE_HANDLING_VALUES.includes(
      handlingStatus as (typeof ORDER_ADMIN_NOTE_HANDLING_VALUES)[number],
    )
  ) {
    return { ok: false, error: "無效的備註處理狀態" };
  }
  if (body.length > ADMIN_ORDER_NOTE_MAX_CHARS) {
    return {
      ok: false,
      error: "請修正備註內容",
      fieldErrors: { body: `備註最長 ${ADMIN_ORDER_NOTE_MAX_CHARS} 字` },
    };
  }

  const nextBody = body.length > 0 ? body : null;

  /** 無備註時固定為 none；有備註時不可維持 none（改為待處理） */
  let effectiveHandling = handlingStatus as (typeof ORDER_ADMIN_NOTE_HANDLING_VALUES)[number];
  if (nextBody === null) {
    effectiveHandling = "none";
  } else if (effectiveHandling === "none") {
    effectiveHandling = "pending";
  }

  const { data: current, error: loadError } = await supabase
    .from("orders")
    .select("status, admin_note_body, admin_note_handling_status")
    .eq("id", orderId)
    .maybeSingle<{
      status: string;
      admin_note_body: string | null;
      admin_note_handling_status: string;
    }>();

  if (loadError) return { ok: false, error: loadError.message };
  if (!current) return { ok: false, error: "找不到訂單" };

  const prevBody = current.admin_note_body?.trim() ? current.admin_note_body.trim() : null;
  const bodyUnchanged = prevBody === nextBody;

  const patch: {
    status?: string;
    admin_note_body?: string | null;
    admin_note_handling_status?: string;
    updated_at: string;
  } = {
    updated_at: new Date().toISOString(),
  };

  if (status !== current.status) patch.status = status;
  if (!bodyUnchanged) patch.admin_note_body = nextBody;
  if (effectiveHandling !== current.admin_note_handling_status) {
    patch.admin_note_handling_status = effectiveHandling;
  }

  const keys = Object.keys(patch).filter((k) => k !== "updated_at");
  if (keys.length === 0) {
    return { ok: true, message: "沒有變更" };
  }

  const { error } = await supabase.from("orders").update(patch).eq("id", orderId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true, message: "已儲存" };
}

export type MarkOrderFulfilledActionState =
  | { ok: true; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/**
 * 登記出貨／門市可取貨：`fulfillment_kind` = home（宅配，需物流與追蹤號）| store_pickup（門市自取）
 */
export async function markOrderFulfilledAction(
  _prev: MarkOrderFulfilledActionState | undefined,
  formData: FormData,
): Promise<MarkOrderFulfilledActionState> {
  const { supabase, error: authError } = await requireAdminSupabase();
  if (!supabase || authError) return { ok: false, error: authError ?? "未授權" };

  const orderId = String(formData.get("order_id") ?? "").trim();
  const kind = String(formData.get("fulfillment_kind") ?? "home").trim();

  if (!orderId) return { ok: false, error: "缺少訂單 ID" };

  const { data: row, error: loadError } = await supabase
    .from("orders")
    .select("id, status, shipping_method, shipped_at, user_id")
    .eq("id", orderId)
    .maybeSingle<{
      id: string;
      status: string;
      shipping_method: string;
      shipped_at: string | null;
      user_id: string | null;
    }>();

  if (loadError) return { ok: false, error: loadError.message };
  if (!row) return { ok: false, error: "找不到訂單" };

  if (!(MARK_SHIPPABLE_ORDER_STATUSES as readonly string[]).includes(row.status)) {
    return { ok: false, error: "此訂單狀態無法標記（需為已付款或處理中）" };
  }
  if (row.shipped_at) {
    return { ok: false, error: "此訂單已登記出貨／可取貨" };
  }

  let carrier: string | null = null;
  let tracking: string | null = null;

  if (kind === "store_pickup") {
    if (row.shipping_method !== "store") {
      return { ok: false, error: "僅門市自取訂單可使用此流程" };
    }
  } else if (kind === "home") {
    if (row.shipping_method !== "home") {
      return { ok: false, error: "僅宅配訂單可使用出貨流程" };
    }
    const carrierRaw = String(formData.get("carrier") ?? "").trim();
    const trackingRaw = String(formData.get("tracking_number") ?? "").trim();
    const fieldErrors: Record<string, string> = {};
    if (!carrierRaw) {
      fieldErrors.carrier = "請選擇物流公司";
    } else if (!isValidShippingCarrier(carrierRaw)) {
      fieldErrors.carrier = "無效的物流公司";
    }
    if (!trackingRaw) {
      fieldErrors.tracking_number = "請輸入追蹤號碼";
    } else if (trackingRaw.length > MAX_TRACKING_LEN) {
      fieldErrors.tracking_number = `追蹤號碼最長 ${MAX_TRACKING_LEN} 字`;
    }
    if (Object.keys(fieldErrors).length > 0) {
      return { ok: false, error: "請修正欄位內容", fieldErrors };
    }
    carrier = carrierRaw;
    tracking = trackingRaw;
  } else {
    return { ok: false, error: "無效的出貨類型" };
  }

  const shippedAt = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("orders")
    .update({
      status: "shipped",
      shipping_carrier: carrier,
      shipping_tracking_number: tracking,
      shipped_at: shippedAt,
      updated_at: shippedAt,
    })
    .eq("id", orderId);

  if (updateError) return { ok: false, error: updateError.message };

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/member/orders");
  if (row.user_id) {
    revalidatePath(`/member/orders/${orderId}`);
  }
  return {
    ok: true,
    message: kind === "store_pickup" ? "已標記門市可取貨" : "已登記出貨",
  };
}

export type MarkStoreOrderPickedUpActionState =
  | { ok: true; message?: string }
  | { ok: false; error: string };

/** 門市自取：顧客已取貨後將訂單標記為已完成 */
export async function markStoreOrderPickedUpAction(
  _prev: MarkStoreOrderPickedUpActionState | undefined,
  formData: FormData,
): Promise<MarkStoreOrderPickedUpActionState> {
  const { supabase, error: authError } = await requireAdminSupabase();
  if (!supabase || authError) return { ok: false, error: authError ?? "未授權" };

  const orderId = String(formData.get("order_id") ?? "").trim();
  if (!orderId) return { ok: false, error: "缺少訂單 ID" };

  const { data: row, error: loadError } = await supabase
    .from("orders")
    .select("id, status, shipping_method, user_id")
    .eq("id", orderId)
    .maybeSingle<{
      id: string;
      status: string;
      shipping_method: string;
      user_id: string | null;
    }>();

  if (loadError) return { ok: false, error: loadError.message };
  if (!row) return { ok: false, error: "找不到訂單" };

  if (row.shipping_method !== "store") {
    return { ok: false, error: "僅門市自取訂單可使用此流程" };
  }
  if (row.status !== "shipped") {
    return { ok: false, error: "請先標記門市可取貨，或於「訂單處理」變更狀態" };
  }

  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("orders")
    .update({
      status: "completed",
      updated_at: now,
    })
    .eq("id", orderId);

  if (updateError) return { ok: false, error: updateError.message };

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/member/orders");
  if (row.user_id) {
    revalidatePath(`/member/orders/${orderId}`);
  }
  return { ok: true, message: "已標記為已完成" };
}
