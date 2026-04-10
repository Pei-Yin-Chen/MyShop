"use client";

import { useActionState, useEffect, useMemo, useState, startTransition, type FormEvent } from "react";
import { AdminFormFooterActions } from "@/components/admin/AdminFormFooterActions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HeroSectionContent } from "@/data/home-page-defaults";
import { useActionSuccessToast } from "@/lib/hooks/use-action-success-toast";
import { updateHeroAction, type HeroFormState } from "@/app/admin/(panel)/settings/actions";
import { AdminImageUploadField } from "@/components/admin/AdminImageUploadField";

const labelClass = "mb-1.5 block text-xs font-medium text-muted-foreground";
const inputClass = (invalid?: boolean) =>
  cn(
    "w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none transition-all",
    invalid ? "border-destructive ring-2 ring-destructive/10" : "border-border focus:ring-2 focus:ring-primary/20",
  );

export function AdminHomeHeroForm({ initial }: { initial: HeroSectionContent }) {
  const [state, formAction, pending] = useActionState(
    updateHeroAction,
    undefined as HeroFormState | undefined,
  );
  useActionSuccessToast(state, "已儲存");

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  const serverError = state && !state.ok ? state.error : undefined;
  const showServerError = Boolean(serverError) && Object.keys(fieldErrors ?? {}).length === 0;

  const [form, setForm] = useState(() => ({
    eyebrow: initial.eyebrow,
    badgeLabel: initial.badgeLabel,
    badgeText: initial.badgeText,
    titleLine1: initial.titleLine1,
    titleLine2Accent: initial.titleLine2Accent,
    description: initial.description,
    primaryCtaLabel: initial.primaryCta.label,
    primaryCtaHref: initial.primaryCta.href,
    secondaryCtaLabel: initial.secondaryCta.label,
    secondaryCtaHref: initial.secondaryCta.href,
    image1Url: initial.images[0]?.url ?? "",
    image2Url: initial.images[1]?.url ?? "",
    image3Url: initial.images[2]?.url ?? "",
  }));

  useEffect(() => {
    if (!state?.ok) return;
    const c = state.content;
    setForm({
      eyebrow: c.eyebrow,
      badgeLabel: c.badgeLabel,
      badgeText: c.badgeText,
      titleLine1: c.titleLine1,
      titleLine2Accent: c.titleLine2Accent,
      description: c.description,
      primaryCtaLabel: c.primaryCta.label,
      primaryCtaHref: c.primaryCta.href,
      secondaryCtaLabel: c.secondaryCta.label,
      secondaryCtaHref: c.secondaryCta.href,
      image1Url: c.images[0]?.url ?? "",
      image2Url: c.images[1]?.url ?? "",
      image3Url: c.images[2]?.url ?? "",
    });
  }, [state]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => formAction(fd));
  }

  const imageFields = useMemo(
    () => [
      { title: "圖片 1（主圖）", urlKey: "image1Url" },
      { title: "圖片 2（右上）", urlKey: "image2Url" },
      { title: "圖片 3（右下）", urlKey: "image3Url" },
    ] as const,
    [],
  );

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="hero-eyebrow">
            眉標
          </label>
          <input
            id="hero-eyebrow"
            name="eyebrow"
            value={form.eyebrow}
            onChange={(e) => setForm((p) => ({ ...p, eyebrow: e.target.value }))}
            className={inputClass(!!fieldErrors?.eyebrow)}
          />
          {fieldErrors?.eyebrow ? (
            <p className="mt-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
              {fieldErrors.eyebrow}
            </p>
          ) : null}
        </div>
        <div>
          <label className={labelClass} htmlFor="hero-badgeLabel">
            Badge 標籤
          </label>
          <input
            id="hero-badgeLabel"
            name="badgeLabel"
            value={form.badgeLabel}
            onChange={(e) => setForm((p) => ({ ...p, badgeLabel: e.target.value }))}
            className={inputClass(!!fieldErrors?.badgeLabel)}
          />
          {fieldErrors?.badgeLabel ? (
            <p className="mt-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
              {fieldErrors.badgeLabel}
            </p>
          ) : null}
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="hero-badgeText">
            Badge 文字
          </label>
          <input
            id="hero-badgeText"
            name="badgeText"
            value={form.badgeText}
            onChange={(e) => setForm((p) => ({ ...p, badgeText: e.target.value }))}
            className={inputClass(!!fieldErrors?.badgeText)}
          />
          {fieldErrors?.badgeText ? (
            <p className="mt-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
              {fieldErrors.badgeText}
            </p>
          ) : null}
        </div>
        <div>
          <label className={labelClass} htmlFor="hero-titleLine1">
            主標第一行
          </label>
          <input
            id="hero-titleLine1"
            name="titleLine1"
            value={form.titleLine1}
            onChange={(e) => setForm((p) => ({ ...p, titleLine1: e.target.value }))}
            className={inputClass(!!fieldErrors?.titleLine1)}
          />
          {fieldErrors?.titleLine1 ? (
            <p className="mt-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
              {fieldErrors.titleLine1}
            </p>
          ) : null}
        </div>
        <div>
          <label className={labelClass} htmlFor="hero-titleLine2Accent">
            主標強調行
          </label>
          <input
            id="hero-titleLine2Accent"
            name="titleLine2Accent"
            value={form.titleLine2Accent}
            onChange={(e) => setForm((p) => ({ ...p, titleLine2Accent: e.target.value }))}
            className={inputClass(!!fieldErrors?.titleLine2Accent)}
          />
          {fieldErrors?.titleLine2Accent ? (
            <p className="mt-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
              {fieldErrors.titleLine2Accent}
            </p>
          ) : null}
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="hero-description">
            描述
          </label>
          <textarea
            id="hero-description"
            name="description"
            rows={4}
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            className={cn(inputClass(!!fieldErrors?.description), "h-auto py-2.5")}
          />
          {fieldErrors?.description ? (
            <p className="mt-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
              {fieldErrors.description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="hero-primaryCtaLabel">
            主要按鈕文字
          </label>
          <input
            id="hero-primaryCtaLabel"
            name="primaryCtaLabel"
            value={form.primaryCtaLabel}
            onChange={(e) => setForm((p) => ({ ...p, primaryCtaLabel: e.target.value }))}
            className={inputClass(!!fieldErrors?.primaryCtaLabel)}
          />
          {fieldErrors?.primaryCtaLabel ? (
            <p className="mt-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
              {fieldErrors.primaryCtaLabel}
            </p>
          ) : null}
        </div>
        <div>
          <label className={labelClass} htmlFor="hero-primaryCtaHref">
            主要按鈕連結
          </label>
          <input
            id="hero-primaryCtaHref"
            name="primaryCtaHref"
            value={form.primaryCtaHref}
            onChange={(e) => setForm((p) => ({ ...p, primaryCtaHref: e.target.value }))}
            className={cn(inputClass(!!fieldErrors?.primaryCtaHref), "font-mono text-xs")}
          />
          {fieldErrors?.primaryCtaHref ? (
            <p className="mt-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
              {fieldErrors.primaryCtaHref}
            </p>
          ) : null}
        </div>
        <div>
          <label className={labelClass} htmlFor="hero-secondaryCtaLabel">
            次要按鈕文字
          </label>
          <input
            id="hero-secondaryCtaLabel"
            name="secondaryCtaLabel"
            value={form.secondaryCtaLabel}
            onChange={(e) => setForm((p) => ({ ...p, secondaryCtaLabel: e.target.value }))}
            className={inputClass(!!fieldErrors?.secondaryCtaLabel)}
          />
          {fieldErrors?.secondaryCtaLabel ? (
            <p className="mt-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
              {fieldErrors.secondaryCtaLabel}
            </p>
          ) : null}
        </div>
        <div>
          <label className={labelClass} htmlFor="hero-secondaryCtaHref">
            次要按鈕連結
          </label>
          <input
            id="hero-secondaryCtaHref"
            name="secondaryCtaHref"
            value={form.secondaryCtaHref}
            onChange={(e) => setForm((p) => ({ ...p, secondaryCtaHref: e.target.value }))}
            className={cn(inputClass(!!fieldErrors?.secondaryCtaHref), "font-mono text-xs")}
          />
          {fieldErrors?.secondaryCtaHref ? (
            <p className="mt-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
              {fieldErrors.secondaryCtaHref}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-muted/15 p-4">
        <h3 className="text-sm font-semibold text-foreground">主視覺圖片（3 張）</h3>
        <div className="grid grid-cols-1 gap-4">
          {imageFields.map((f) => (
            <AdminImageUploadField
              key={f.urlKey}
              label={f.title}
              name={f.urlKey}
              value={(form as any)[f.urlKey]}
              onValueChange={(url) => setForm((p) => ({ ...p, [f.urlKey]: url } as any))}
              storagePrefix={`home/hero`}
              disabled={pending}
              error={(fieldErrors as any)?.[f.urlKey]}
            />
          ))}
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

