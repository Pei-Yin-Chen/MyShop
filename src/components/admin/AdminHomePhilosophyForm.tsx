"use client";

import { useActionState, useEffect, useState, startTransition, type FormEvent } from "react";
import { AdminFormFooterActions } from "@/components/admin/AdminFormFooterActions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BrandPhilosophySectionContent } from "@/data/home-page-defaults";
import { useActionSuccessToast } from "@/lib/hooks/use-action-success-toast";
import { updatePhilosophyAction, type PhilosophyFormState } from "@/app/admin/(panel)/settings/actions";
import { FormMenuSelect } from "@/components/ui/select";
import type { LucideIcon } from "lucide-react";
import {
  Award,
  ChefHat,
  Cookie,
  Handshake,
  Heart,
  Leaf,
  Lightbulb,
  Shield,
  Sparkles,
  Star,
  Trash2,
  Users,
  Wheat,
} from "lucide-react";

const labelClass = "mb-1.5 block text-xs font-medium text-muted-foreground";
const inputClass = (invalid?: boolean) =>
  cn(
    "w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none transition-all",
    invalid ? "border-destructive ring-2 ring-destructive/10" : "border-border focus:ring-2 focus:ring-primary/20",
  );

const ICON_OPTIONS = [
  { value: "wheat", label: "小麥" },
  { value: "chef_hat", label: "廚師帽" },
  { value: "heart", label: "愛心" },
  { value: "cookie", label: "餅乾" },
  { value: "sparkles", label: "火花" },
  { value: "shield", label: "盾牌" },
  { value: "users", label: "團隊" },
  { value: "handshake", label: "握手" },
  { value: "leaf", label: "自然" },
  { value: "award", label: "獎章" },
  { value: "star", label: "星星" },
  { value: "lightbulb", label: "靈感" },
];

const PHILOSOPHY_ICON_MAP: Record<string, LucideIcon> = {
  wheat: Wheat,
  chef_hat: ChefHat,
  heart: Heart,
  cookie: Cookie,
  sparkles: Sparkles,
  shield: Shield,
  users: Users,
  handshake: Handshake,
  leaf: Leaf,
  award: Award,
  star: Star,
  lightbulb: Lightbulb,
};

function renderPhilosophyOptionIcon(value: string) {
  const Icon = PHILOSOPHY_ICON_MAP[value];
  if (!Icon) return null;
  return <Icon className="size-4 shrink-0 text-primary" aria-hidden />;
}

const BG_OPTIONS = [
  { value: "cream", label: "奶油（cream）" },
  { value: "peach", label: "蜜桃（peach）" },
  { value: "rose", label: "玫瑰（rose）" },
  { value: "sage", label: "鼠尾草（sage）" },
];

type PhilosophyItem = BrandPhilosophySectionContent["items"][number];

export function AdminHomePhilosophyForm({ initial }: { initial: BrandPhilosophySectionContent }) {
  const [state, formAction, pending] = useActionState(
    updatePhilosophyAction,
    undefined as PhilosophyFormState | undefined,
  );
  useActionSuccessToast(state, "已儲存");

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  const serverError = state && !state.ok ? state.error : undefined;
  const showServerError = Boolean(serverError) && Object.keys(fieldErrors ?? {}).length === 0;

  const [enabled, setEnabled] = useState(initial.enabled !== false);
  const [title, setTitle] = useState(initial.title);
  const [subtitle, setSubtitle] = useState(initial.subtitle);
  const [items, setItems] = useState(() =>
    (initial.items.length > 0 ? initial.items : []).map((it) => ({
      iconKey: it.iconKey,
      bgVariant: it.bgVariant,
      title: it.title,
      description: it.description,
    })),
  );

  useEffect(() => {
    if (!state?.ok) return;
    setEnabled(state.content.enabled !== false);
    setTitle(state.content.title);
    setSubtitle(state.content.subtitle);
    setItems(
      state.content.items.map((it) => ({
        iconKey: it.iconKey,
        bgVariant: it.bgVariant,
        title: it.title,
        description: it.description,
      })),
    );
  }, [state]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => formAction(fd));
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-6">
      <input type="hidden" name="item_count" value={String(items.length)} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>顯示此區塊</label>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/80 bg-muted/20 px-3 py-3">
            <input
              type="checkbox"
              name="enabled"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 rounded border-border text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            />
            <span className="text-sm leading-snug text-foreground">
              在首頁顯示此區塊
              <span className="mt-1 block text-xs font-normal text-muted-foreground">關閉後首頁將不顯示此區塊。</span>
            </span>
          </label>
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="ph-title">
            標題
          </label>
          <input
            id="ph-title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass(!!fieldErrors?.title)}
          />
          {fieldErrors?.title ? (
            <p className="mt-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
              {fieldErrors.title}
            </p>
          ) : null}
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="ph-subtitle">
            副標
          </label>
          <textarea
            id="ph-subtitle"
            name="subtitle"
            rows={3}
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className={cn(inputClass(!!fieldErrors?.subtitle), "h-auto py-2.5")}
          />
          {fieldErrors?.subtitle ? (
            <p className="mt-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
              {fieldErrors.subtitle}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-muted/15 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-semibold text-foreground">介紹卡片</h3>
          <Button
            type="button"
            onClick={() =>
              setItems((prev) => [
                ...prev,
                { iconKey: "wheat", bgVariant: "cream", title: "", description: "" },
              ])
            }
            aria-label="新增"
            title="新增"
          >
            新增
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {items.map((it, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">第 {i + 1} 張</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={items.length <= 1}
                  title="移除此卡片"
                  aria-label={`移除此卡片（第 ${i + 1} 張）`}
                  onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor={`ph_item_${i}_icon`}>
                    Icon
                  </label>
                  <FormMenuSelect
                    id={`ph_item_${i}_icon`}
                    name={`item${i}IconKey`}
                    defaultValue={it.iconKey}
                    options={ICON_OPTIONS}
                    invalid={!!(fieldErrors as any)?.[`item${i}IconKey`]}
                    renderOptionIcon={renderPhilosophyOptionIcon}
                    optionIconPlacement="end"
                    onValueChange={(v) =>
                      setItems((prev) =>
                        prev.map((p, idx) =>
                          idx === i ? { ...p, iconKey: v as PhilosophyItem["iconKey"] } : p,
                        ),
                      )
                    }
                    positionerClassName="z-[220]"
                  />
                  {(fieldErrors as any)?.[`item${i}IconKey`] ? (
                    <p className="mt-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
                      {(fieldErrors as any)[`item${i}IconKey`]}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label className={labelClass} htmlFor={`ph_item_${i}_bg`}>
                    底色
                  </label>
                  <FormMenuSelect
                    id={`ph_item_${i}_bg`}
                    name={`item${i}BgVariant`}
                    defaultValue={it.bgVariant}
                    options={BG_OPTIONS}
                    invalid={!!(fieldErrors as any)?.[`item${i}BgVariant`]}
                    onValueChange={(v) =>
                      setItems((prev) =>
                        prev.map((p, idx) =>
                          idx === i ? { ...p, bgVariant: v as PhilosophyItem["bgVariant"] } : p,
                        ),
                      )
                    }
                    positionerClassName="z-[220]"
                  />
                  {(fieldErrors as any)?.[`item${i}BgVariant`] ? (
                    <p className="mt-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
                      {(fieldErrors as any)[`item${i}BgVariant`]}
                    </p>
                  ) : null}
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor={`ph_item_${i}_title`}>
                    卡片標題
                  </label>
                  <input
                    id={`ph_item_${i}_title`}
                    name={`item${i}Title`}
                    value={it.title}
                    onChange={(e) =>
                      setItems((prev) => prev.map((p, idx) => (idx === i ? { ...p, title: e.target.value } : p)))
                    }
                    className={inputClass(!!(fieldErrors as any)?.[`item${i}Title`])}
                  />
                  {(fieldErrors as any)?.[`item${i}Title`] ? (
                    <p className="mt-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
                      {(fieldErrors as any)[`item${i}Title`]}
                    </p>
                  ) : null}
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor={`ph_item_${i}_desc`}>
                    卡片描述
                  </label>
                  <textarea
                    id={`ph_item_${i}_desc`}
                    name={`item${i}Description`}
                    rows={3}
                    value={it.description}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((p, idx) => (idx === i ? { ...p, description: e.target.value } : p)),
                      )
                    }
                    className={cn(inputClass(!!(fieldErrors as any)?.[`item${i}Description`]), "h-auto py-2.5")}
                  />
                  {(fieldErrors as any)?.[`item${i}Description`] ? (
                    <p className="mt-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
                      {(fieldErrors as any)[`item${i}Description`]}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
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

