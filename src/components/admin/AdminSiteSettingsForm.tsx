"use client";

import { useActionState, useEffect, useState, startTransition, type FormEvent } from "react";
import { AdminFormFooterActions } from "@/components/admin/AdminFormFooterActions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useActionSuccessToast } from "@/lib/hooks/use-action-success-toast";
import { updateSiteSettingsAction, type SiteSettingsFormState } from "@/app/admin/(panel)/settings/actions";
import type { SiteSettings } from "@/lib/site-settings";
import { AdminImageUploadField } from "@/components/admin/AdminImageUploadField";

const labelClass = "mb-1.5 block text-xs font-medium text-muted-foreground";
const inputClass = (invalid?: boolean) =>
  cn(
    "w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none transition-all",
    invalid ? "border-destructive ring-2 ring-destructive/10" : "border-border focus:ring-2 focus:ring-primary/20",
  );

export function AdminSiteSettingsForm({ initial }: { initial: SiteSettings }) {
  const [state, formAction, pending] = useActionState(
    updateSiteSettingsAction,
    undefined as SiteSettingsFormState | undefined,
  );
  useActionSuccessToast(state, "已儲存");

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  const serverError = state && !state.ok ? state.error : undefined;
  const showServerError = Boolean(serverError) && Object.keys(fieldErrors ?? {}).length === 0;

  const [siteTitle, setSiteTitle] = useState(initial.siteTitle);
  const [siteDescription, setSiteDescription] = useState(initial.siteDescription);
  const [siteLogoUrl, setSiteLogoUrl] = useState(initial.siteLogoUrl);
  const [footerLogoUrl, setFooterLogoUrl] = useState(initial.footerLogoUrl);
  const [footerTagline, setFooterTagline] = useState(initial.footerTagline);
  const [footerContactAddress, setFooterContactAddress] = useState(initial.footerContactAddress);
  const [footerContactPhone, setFooterContactPhone] = useState(initial.footerContactPhone);
  const [footerContactEmail, setFooterContactEmail] = useState(initial.footerContactEmail);

  useEffect(() => {
    if (!state?.ok) return;
    setSiteTitle(state.content.siteTitle);
    setSiteDescription(state.content.siteDescription);
    setSiteLogoUrl(state.content.siteLogoUrl);
    setFooterLogoUrl(state.content.footerLogoUrl);
    setFooterTagline(state.content.footerTagline);
    setFooterContactAddress(state.content.footerContactAddress);
    setFooterContactPhone(state.content.footerContactPhone);
    setFooterContactEmail(state.content.footerContactEmail);
  }, [state]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => formAction(fd));
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-4">
      <div>
        <label className={labelClass} htmlFor="site-title">
          網站標題
        </label>
        <input
          id="site-title"
          name="siteTitle"
          value={siteTitle}
          onChange={(e) => setSiteTitle(e.target.value)}
          className={inputClass(!!fieldErrors?.siteTitle)}
          autoComplete="off"
        />
        {fieldErrors?.siteTitle ? (
          <p className="mt-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
            {fieldErrors.siteTitle}
          </p>
        ) : null}
      </div>

      <div>
        <label className={labelClass} htmlFor="site-desc">
          網站描述（SEO）
        </label>
        <textarea
          id="site-desc"
          name="siteDescription"
          rows={3}
          value={siteDescription}
          onChange={(e) => setSiteDescription(e.target.value)}
          className={cn(inputClass(!!fieldErrors?.siteDescription), "h-auto py-2.5")}
        />
        {fieldErrors?.siteDescription ? (
          <p className="mt-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
            {fieldErrors.siteDescription}
          </p>
        ) : null}
      </div>

      <AdminImageUploadField
        label="網站 Logo（選填）"
        name="siteLogoUrl"
        value={siteLogoUrl}
        onValueChange={setSiteLogoUrl}
        storagePrefix="site/logo"
        error={fieldErrors?.siteLogoUrl}
        previewImageClassName="object-contain"
        helpText="上傳後會顯示於前台導覽列；未上傳時將以文字顯示網站標題。建議使用透明背景 PNG。"
      />

      <div>
        <label className={labelClass} htmlFor="footer-tagline">
          Footer 簡短說明
        </label>
        <textarea
          id="footer-tagline"
          name="footerTagline"
          rows={3}
          value={footerTagline}
          onChange={(e) => setFooterTagline(e.target.value)}
          className={cn(inputClass(!!fieldErrors?.footerTagline), "h-auto py-2.5")}
        />
        {fieldErrors?.footerTagline ? (
          <p className="mt-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
            {fieldErrors.footerTagline}
          </p>
        ) : null}
        <p className="mt-1 text-xs text-muted-foreground">
          顯示於頁尾品牌區塊；預設為通用範例文案，可自行改寫。
        </p>
      </div>

      <AdminImageUploadField
        label="Footer Logo（選填）"
        name="footerLogoUrl"
        value={footerLogoUrl}
        onValueChange={setFooterLogoUrl}
        storagePrefix="site/footer-logo"
        error={fieldErrors?.footerLogoUrl}
        previewImageClassName="object-contain"
        helpText="不必另外上傳：未設定時會自動沿用「網站 Logo」；若希望頁尾顯示不同圖檔再上傳。兩者皆空則頁尾顯示網站標題文字。"
      />

      <div className="space-y-4 rounded-xl border border-border/80 bg-muted/10 p-4">
        <p className="text-sm font-semibold text-foreground">頁尾「聯絡我們」</p>
        <p className="text-xs text-muted-foreground">
          以下皆選填；若三項皆空白，前台將不顯示「聯絡我們」區塊。
        </p>
        <div>
          <label className={labelClass} htmlFor="footer-contact-address">
            地址
          </label>
          <textarea
            id="footer-contact-address"
            name="footerContactAddress"
            rows={2}
            value={footerContactAddress}
            onChange={(e) => setFooterContactAddress(e.target.value)}
            className={cn(inputClass(!!fieldErrors?.footerContactAddress), "h-auto py-2.5")}
            placeholder="例：台北市〇〇區〇〇路〇號"
          />
          {fieldErrors?.footerContactAddress ? (
            <p className="mt-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
              {fieldErrors.footerContactAddress}
            </p>
          ) : null}
        </div>
        <div>
          <label className={labelClass} htmlFor="footer-contact-phone">
            電話
          </label>
          <input
            id="footer-contact-phone"
            name="footerContactPhone"
            value={footerContactPhone}
            onChange={(e) => setFooterContactPhone(e.target.value)}
            className={inputClass(!!fieldErrors?.footerContactPhone)}
            autoComplete="tel"
            placeholder="例：02-2345-6789"
          />
          {fieldErrors?.footerContactPhone ? (
            <p className="mt-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
              {fieldErrors.footerContactPhone}
            </p>
          ) : null}
        </div>
        <div>
          <label className={labelClass} htmlFor="footer-contact-email">
            電子郵件
          </label>
          <input
            id="footer-contact-email"
            name="footerContactEmail"
            type="email"
            value={footerContactEmail}
            onChange={(e) => setFooterContactEmail(e.target.value)}
            className={inputClass(!!fieldErrors?.footerContactEmail)}
            autoComplete="email"
            placeholder="例：hello@example.com"
          />
          {fieldErrors?.footerContactEmail ? (
            <p className="mt-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
              {fieldErrors.footerContactEmail}
            </p>
          ) : null}
        </div>
      </div>

      {showServerError ? <p className="text-sm text-destructive">{serverError}</p> : null}

      <AdminFormFooterActions backHref="/admin/settings">
        <Button type="submit" disabled={pending} size="lg" className="min-h-9 min-w-[9rem] rounded-full">
          {pending ? "儲存中…" : "儲存設定"}
        </Button>
      </AdminFormFooterActions>
    </form>
  );
}

