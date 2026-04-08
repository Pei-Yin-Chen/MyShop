"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { fetchUserIsAdmin } from "@/lib/supabase/is-admin";
import { ADMIN_MEMBER_NOTE_MAX_CHARS } from "@/lib/admin/admin-member-notes";

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

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** profiles.full_name 需至少 2 字元 */
function ensureFullName(raw: string): string {
  const t = raw.trim();
  if (t.length >= 2) return t;
  if (t.length === 1) return `${t}·`;
  return "會員";
}

export type MemberActionState =
  | { ok: true; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function importMemberFromOrderAction(
  _prev: MemberActionState | undefined,
  formData: FormData,
): Promise<MemberActionState> {
  const { supabase, error: authError } = await requireAdminSupabase();
  if (!supabase || authError) return { ok: false, error: authError ?? "未授權" };

  let service;
  try {
    service = createServiceClient();
  } catch {
    return {
      ok: false,
      error: "伺服器未設定 SUPABASE_SERVICE_ROLE_KEY，無法從訂單建立帳號",
    };
  }

  const orderKey = String(formData.get("order_key") ?? "").trim();
  if (!orderKey) return { ok: false, error: "請輸入訂單編號或訂單 ID" };

  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      orderKey,
    );

  let orderQuery = service.from("orders").select(
    "id, user_id, order_number, recipient_name, recipient_phone, recipient_email, shipping_address, shipping_method",
  );
  if (isUuid) {
    orderQuery = orderQuery.eq("id", orderKey);
  } else {
    orderQuery = orderQuery.eq("order_number", orderKey);
  }

  const { data: order, error: orderError } = await orderQuery.maybeSingle();

  if (orderError || !order) {
    return { ok: false, error: "找不到此訂單" };
  }

  const email = normalizeEmail(order.recipient_email);
  if (!email || !email.includes("@")) {
    return { ok: false, error: "訂單缺少有效 Email，無法建立會員" };
  }

  const fullName = ensureFullName(order.recipient_name);

  const { data: existingByEmail } = await service
    .from("profiles")
    .select("id")
    .ilike("email", email)
    .maybeSingle();

  const targetUserId = existingByEmail?.id as string | undefined;

  if (targetUserId) {
    if (order.user_id && order.user_id !== targetUserId) {
      return {
        ok: false,
        error: "此訂單已綁定其他會員，請先於訂單處理解除綁定",
      };
    }

    const { error: updOrderErr } = await service
      .from("orders")
      .update({ user_id: targetUserId, updated_at: new Date().toISOString() })
      .eq("id", order.id);

    if (updOrderErr) {
      return { ok: false, error: updOrderErr.message };
    }

    const { error: profErr } = await service
      .from("profiles")
      .update({
        member_source: "purchase",
        full_name: fullName,
        mobile_phone: order.recipient_phone?.trim() || null,
        default_shipping_address:
          order.shipping_method === "home"
            ? order.shipping_address?.trim() || null
            : null,
        email,
        updated_at: new Date().toISOString(),
      })
      .eq("id", targetUserId);

    if (profErr) {
      return { ok: false, error: profErr.message };
    }

    revalidatePath("/admin/members");
    revalidatePath(`/admin/members/${targetUserId}`);
    return {
      ok: true,
      message: `已將訂單綁定至既有會員（${email}），並標註為購買會員`,
    };
  }

  if (order.user_id) {
    return { ok: false, error: "此訂單已綁定會員，且 Email 與現有帳號不一致" };
  }

  const password = randomBytes(24).toString("base64url");

  const { data: created, error: createErr } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    },
  });

  if (createErr || !created.user) {
    return {
      ok: false,
      error: createErr?.message ?? "建立帳號失敗",
    };
  }

  const newId = created.user.id;

  const { error: profErr } = await service
    .from("profiles")
    .update({
      member_source: "purchase",
      full_name: fullName,
      mobile_phone: order.recipient_phone?.trim() || null,
      email,
      default_shipping_address:
        order.shipping_method === "home"
          ? order.shipping_address?.trim() || null
          : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", newId);

  if (profErr) {
    return { ok: false, error: profErr.message };
  }

  const { error: linkErr } = await service
    .from("orders")
    .update({ user_id: newId, updated_at: new Date().toISOString() })
    .eq("id", order.id);

  if (linkErr) {
    return { ok: false, error: linkErr.message };
  }

  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${newId}`);
  return {
    ok: true,
    message:
      "已建立購買會員並綁定訂單。請通知顧客使用「忘記密碼」以 Email 重設密碼後登入。",
  };
}

export async function addMemberAdminNoteAction(
  _prev: MemberActionState | undefined,
  formData: FormData,
): Promise<MemberActionState> {
  const { supabase, error: authError } = await requireAdminSupabase();
  if (!supabase || authError) return { ok: false, error: authError ?? "未授權" };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const memberId = String(formData.get("member_id") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!memberId) return { ok: false, error: "缺少會員 ID" };
  if (!body) {
    return {
      ok: false,
      error: "請修正備註內容",
      fieldErrors: { body: "請輸入備註內容" },
    };
  }
  if (body.length > ADMIN_MEMBER_NOTE_MAX_CHARS) {
    return {
      ok: false,
      error: "請修正備註內容",
      fieldErrors: { body: `備註最長 ${ADMIN_MEMBER_NOTE_MAX_CHARS} 字` },
    };
  }

  const { error } = await supabase.from("profile_admin_note_entries").insert({
    profile_id: memberId,
    body,
    created_by: user?.id ?? null,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${memberId}`);
  return { ok: true, message: "備註已新增" };
}

export async function setMemberBannedAction(
  _prev: MemberActionState | undefined,
  formData: FormData,
): Promise<MemberActionState> {
  const { supabase, error: authError } = await requireAdminSupabase();
  if (!supabase || authError) return { ok: false, error: authError ?? "未授權" };

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const memberId = String(formData.get("member_id") ?? "").trim();
  const bannedRaw = String(formData.get("banned") ?? "");
  const banned = bannedRaw === "true" || bannedRaw === "on";

  if (!memberId) return { ok: false, error: "缺少會員 ID" };

  if (banned && currentUser?.id === memberId) {
    return { ok: false, error: "無法將目前登入帳號標記為停用" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      is_banned: banned,
      updated_at: new Date().toISOString(),
    })
    .eq("id", memberId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${memberId}`);
  return { ok: true, message: banned ? "已標記為停用" : "已解除停用" };
}
