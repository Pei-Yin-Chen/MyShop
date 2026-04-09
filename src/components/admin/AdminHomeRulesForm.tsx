"use client";

import { useActionState, useEffect, useState, startTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ShoppingRulesSectionContent } from "@/data/home-page-defaults";
import { useActionSuccessToast } from "@/lib/hooks/use-action-success-toast";
import { updateRulesAction, type RulesFormState } from "@/app/admin/(panel)/settings/actions";
import { FormMenuSelect } from "@/components/ui/select";
import type { LucideIcon } from "lucide-react";
import {
  Clock,
  CreditCard,
  Gift,
  Info,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Refrigerator,
  ShieldCheck,
  Store,
  Trash2,
  Truck,
} from "lucide-react";

const labelClass = "mb-1.5 block text-xs font-medium text-muted-foreground";
const inputClass = (invalid?: boolean) =>
  cn(
    "w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none transition-all",
    invalid ? "border-destructive ring-2 ring-destructive/10" : "border-border focus:ring-2 focus:ring-primary/20",
  );

const BG_OPTIONS = [
  { value: "cream", label: "奶油（cream）" },
  { value: "peach", label: "蜜桃（peach）" },
  { value: "rose", label: "玫瑰（rose）" },
  { value: "sage", label: "鼠尾草（sage）" },
];

const ICON_OPTIONS = [
  { value: "truck", label: "物流" },
  { value: "clock", label: "時間" },
  { value: "refrigerator", label: "保存" },
  { value: "credit_card", label: "付款" },
  { value: "package", label: "包裝" },
  { value: "gift", label: "禮盒" },
  { value: "map_pin", label: "地點" },
  { value: "store", label: "門市" },
  { value: "phone", label: "聯絡" },
  { value: "message_circle", label: "訊息" },
  { value: "shield_check", label: "安心" },
  { value: "info", label: "資訊" },
];

const RULE_ICON_MAP: Record<string, LucideIcon> = {
  truck: Truck,
  clock: Clock,
  refrigerator: Refrigerator,
  credit_card: CreditCard,
  package: Package,
  gift: Gift,
  map_pin: MapPin,
  store: Store,
  phone: Phone,
  message_circle: MessageCircle,
  shield_check: ShieldCheck,
  info: Info,
};

function renderShoppingRuleOptionIcon(value: string) {
  const Icon = RULE_ICON_MAP[value];
  if (!Icon) return null;
  return <Icon className="size-4 shrink-0 text-primary" aria-hidden />;
}

type RulesItem = ShoppingRulesSectionContent["items"][number];

export function AdminHomeRulesForm({ initial }: { initial: ShoppingRulesSectionContent }) {
  const [state, formAction, pending] = useActionState(
    updateRulesAction,
    undefined as RulesFormState | undefined,
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
      bgVariant: it.bgVariant ?? "cream",
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
        bgVariant: it.bgVariant ?? "cream",
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
          <label className={labelClass} htmlFor="rules-title">
            標題
          </label>
          <input
            id="rules-title"
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
          <label className={labelClass} htmlFor="rules-subtitle">
            副標
          </label>
          <textarea
            id="rules-subtitle"
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
          <h3 className="text-sm font-semibold text-foreground">說明項目</h3>
          <Button
            type="button"
            onClick={() =>
              setItems((prev) => [
                ...prev,
                { iconKey: "truck", bgVariant: "cream", title: "", description: "" },
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
                <p className="text-sm font-medium text-foreground">第 {i + 1} 條</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={items.length <= 1}
                  title="移除此項目"
                  aria-label={`移除此項目（第 ${i + 1} 條）`}
                  onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor={`rules_item_${i}_icon`}>
                    Icon
                  </label>
                  <FormMenuSelect
                    id={`rules_item_${i}_icon`}
                    name={`item${i}IconKey`}
                    defaultValue={it.iconKey}
                    options={ICON_OPTIONS}
                    invalid={!!(fieldErrors as any)?.[`item${i}IconKey`]}
                    renderOptionIcon={renderShoppingRuleOptionIcon}
                    optionIconPlacement="end"
                    onValueChange={(v) =>
                      setItems((prev) =>
                        prev.map((p, idx) =>
                          idx === i ? { ...p, iconKey: v as RulesItem["iconKey"] } : p,
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
                  <label className={labelClass} htmlFor={`rules_item_${i}_bg`}>
                    底色
                  </label>
                  <FormMenuSelect
                    id={`rules_item_${i}_bg`}
                    name={`item${i}BgVariant`}
                    defaultValue={it.bgVariant}
                    options={BG_OPTIONS}
                    invalid={!!(fieldErrors as any)?.[`item${i}BgVariant`]}
                    onValueChange={(v) =>
                      setItems((prev) =>
                        prev.map((p, idx) =>
                          idx === i ? { ...p, bgVariant: v as RulesItem["bgVariant"] } : p,
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
                  <label className={labelClass} htmlFor={`rules_item_${i}_title`}>
                    標題
                  </label>
                  <input
                    id={`rules_item_${i}_title`}
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
                  <label className={labelClass} htmlFor={`rules_item_${i}_desc`}>
                    描述
                  </label>
                  <textarea
                    id={`rules_item_${i}_desc`}
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

      <div className="flex justify-end border-t border-border/60 pt-4">
        <Button type="submit" disabled={pending} size="lg" className="min-w-[9rem] rounded-full">
          {pending ? "儲存中…" : "儲存設定"}
        </Button>
      </div>
    </form>
  );
}

