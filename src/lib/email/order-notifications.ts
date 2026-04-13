import type { SupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { fetchSiteSettingsWithClient } from "@/lib/supabase/fetch-site-settings";
import { getAppBaseUrl } from "@/lib/payuni/config";
import { shippingCarrierLabel } from "@/lib/orders/shipping-carriers";

function trimEnv(v: string | undefined): string {
  return String(v ?? "").trim();
}

function getResend(): Resend | null {
  const key = trimEnv(process.env.RESEND_API_KEY);
  if (!key) return null;
  return new Resend(key);
}

function getFromAddress(): string | null {
  const from = trimEnv(process.env.RESEND_FROM);
  return from || null;
}

function getAdminNotificationEmail(): string | null {
  return trimEnv(process.env.ADMIN_NOTIFICATION_EMAIL) || null;
}

function formatTwd(n: number): string {
  return `NT$ ${Math.round(n).toLocaleString("zh-TW")}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shippingMethodLabel(method: "home" | "store"): string {
  return method === "home" ? "宅配" : "門市自取";
}

export type NewOrderEmailLineItem = {
  product_name: string;
  quantity: number;
  line_total: number;
};

async function sendPaymentSuccessNotificationEmails(opts: {
  siteTitle: string;
  orderId: string;
  orderNumber: string;
  recipientName: string;
  customerEmail: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  shippingMethod: "home" | "store";
  items: NewOrderEmailLineItem[];
}): Promise<void> {
  const resend = getResend();
  const from = getFromAddress();
  if (!resend || !from) return;

  const base = getAppBaseUrl();
  const adminEmail = getAdminNotificationEmail();
  const { siteTitle, orderId, orderNumber, recipientName, customerEmail } = opts;

  const itemsRows = opts.items
    .map(
      (it) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #eee">${escapeHtml(it.product_name)}</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${it.quantity}</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${formatTwd(it.line_total)}</td></tr>`,
    )
    .join("");

  const customerHtml = `
  <p>${escapeHtml(recipientName)} 您好，</p>
  <p>您的訂單（${escapeHtml(orderNumber)}）已付款成功，感謝您的購買。</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">
    <thead><tr><th align="left" style="padding:8px 0;border-bottom:1px solid #ccc">品項</th><th align="right" style="padding:8px 0;border-bottom:1px solid #ccc">數量</th><th align="right" style="padding:8px 0;border-bottom:1px solid #ccc">小計</th></tr></thead>
    <tbody>${itemsRows}</tbody>
  </table>
  <p>小計：${formatTwd(opts.subtotal)}<br/>運費：${formatTwd(opts.shippingFee)}<br/><strong>合計：${formatTwd(opts.total)}</strong></p>
  <p>配送方式：${shippingMethodLabel(opts.shippingMethod)}</p>
  <p><a href="${base}/member/orders/${encodeURIComponent(orderId)}">查看訂單</a></p>
  <p style="color:#666;font-size:13px">${escapeHtml(siteTitle)}</p>
  `;

  const adminHtml = `
  <p>有新訂單已完成付款。</p>
  <p><strong>訂單編號：</strong>${escapeHtml(orderNumber)}<br/>
  <strong>收件人：</strong>${escapeHtml(recipientName)}<br/>
  <strong>Email：</strong>${escapeHtml(customerEmail)}<br/>
  <strong>合計：</strong>${formatTwd(opts.total)}<br/>
  <strong>配送：</strong>${shippingMethodLabel(opts.shippingMethod)}</p>
  <p><a href="${base}/admin/orders/${encodeURIComponent(orderId)}">後台查看訂單</a></p>
  <p style="color:#666;font-size:13px">${escapeHtml(siteTitle)}</p>
  `;

  const sends: Promise<unknown>[] = [
    resend.emails.send({
      from,
      to: customerEmail,
      subject: `【${siteTitle}】訂單已付款（${orderNumber}）`,
      html: customerHtml,
    }),
  ];

  if (adminEmail) {
    sends.push(
      resend.emails.send({
        from,
        to: adminEmail,
        subject: `【${siteTitle}】新訂單已付款：${orderNumber}`,
        html: adminHtml,
      }),
    );
  }

  const results = await Promise.allSettled(sends);
  for (const r of results) {
    if (r.status === "rejected") {
      console.error("[email] sendPaymentSuccessNotificationEmails failed:", r.reason);
      throw r.reason;
    }
  }
}

/**
 * PAYUNi notify／return 皆可能將訂單改為已付款；以 DB 欄位原子更新避免重複寄信。
 * 寄送失敗時會清除欄位，利於後續 callback 重試。
 */
export async function trySendPaymentSuccessNotificationEmailsOnce(
  supabase: SupabaseClient,
  orderId: string,
): Promise<void> {
  const resend = getResend();
  const from = getFromAddress();
  if (!resend || !from) return;

  const now = new Date().toISOString();
  const { data: claimed, error: claimErr } = await supabase
    .from("orders")
    .update({ payment_notification_sent_at: now })
    .eq("id", orderId)
    .eq("status", "paid")
    .is("payment_notification_sent_at", null)
    .select("id")
    .maybeSingle();

  if (claimErr) {
    console.error("[email] claim payment notification:", claimErr);
    return;
  }
  if (!claimed?.id) return;

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select(
      "id, order_number, recipient_name, recipient_email, subtotal, shipping_fee, total, shipping_method",
    )
    .eq("id", orderId)
    .maybeSingle<{
      id: string;
      order_number: string;
      recipient_name: string;
      recipient_email: string;
      subtotal: number;
      shipping_fee: number;
      total: number;
      shipping_method: string;
    }>();

  if (orderErr || !order) {
    console.error("[email] load order for payment notification:", orderErr);
    await supabase
      .from("orders")
      .update({ payment_notification_sent_at: null })
      .eq("id", orderId);
    return;
  }

  const { data: itemRows, error: itemsErr } = await supabase
    .from("order_items")
    .select("product_name, quantity, line_total")
    .eq("order_id", orderId);

  if (itemsErr) {
    console.error("[email] load order_items for payment notification:", itemsErr);
    await supabase
      .from("orders")
      .update({ payment_notification_sent_at: null })
      .eq("id", orderId);
    return;
  }

  const shipMethod: "home" | "store" =
    order.shipping_method === "store" ? "store" : "home";

  try {
    const site = await fetchSiteSettingsWithClient(supabase);
    await sendPaymentSuccessNotificationEmails({
      siteTitle: site.siteTitle,
      orderId: order.id,
      orderNumber: order.order_number,
      recipientName: order.recipient_name,
      customerEmail: order.recipient_email,
      subtotal: Number(order.subtotal),
      shippingFee: Number(order.shipping_fee),
      total: Number(order.total),
      shippingMethod: shipMethod,
      items: (itemRows ?? []).map((r) => ({
        product_name: String(r.product_name),
        quantity: Number(r.quantity),
        line_total: Number(r.line_total),
      })),
    });
  } catch (e) {
    console.error("[email] sendPaymentSuccessNotificationEmails:", e);
    await supabase
      .from("orders")
      .update({ payment_notification_sent_at: null })
      .eq("id", orderId);
  }
}

export async function sendOrderShippedNotificationEmail(opts: {
  siteTitle: string;
  orderId: string;
  orderNumber: string;
  recipientName: string;
  customerEmail: string;
  fulfillmentKind: "home" | "store_pickup";
  carrier: string | null;
  tracking: string | null;
}): Promise<void> {
  const resend = getResend();
  const from = getFromAddress();
  if (!resend || !from) return;

  const base = getAppBaseUrl();
  const { siteTitle, orderId, orderNumber, recipientName, customerEmail, fulfillmentKind } =
    opts;

  const detailHtml =
    fulfillmentKind === "home"
      ? `<p><strong>物流公司：</strong>${escapeHtml(shippingCarrierLabel(opts.carrier))}<br/>
      <strong>追蹤號碼：</strong>${escapeHtml(opts.tracking ?? "")}</p>`
      : `<p>您的訂單已可於門市取貨，請攜帶證件前往取貨。</p>`;

  const html = `
  <p>${escapeHtml(recipientName)} 您好，</p>
  <p>訂單 <strong>${escapeHtml(orderNumber)}</strong> 已${fulfillmentKind === "home" ? "出貨" : "可於門市取貨"}。</p>
  ${detailHtml}
  <p><a href="${base}/member/orders/${encodeURIComponent(orderId)}">查看訂單</a></p>
  <p style="color:#666;font-size:13px">${escapeHtml(siteTitle)}</p>
  `;

  const subject =
    fulfillmentKind === "home"
      ? `【${siteTitle}】訂單已出貨（${orderNumber}）`
      : `【${siteTitle}】門市可取貨（${orderNumber}）`;

  try {
    await resend.emails.send({
      from,
      to: customerEmail,
      subject,
      html,
    });
  } catch (e) {
    console.error("[email] sendOrderShippedNotificationEmail failed:", e);
  }
}
