"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateMyProfile, type UpdateProfileState } from "@/app/member/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BirthdayInput } from "@/app/member/profile/birthday-input";
import { useActionSuccessToast } from "@/lib/hooks/use-action-success-toast";

type Props = {
  initial: {
    email: string;
    fullName: string;
    mobilePhone: string;
    defaultShippingAddress: string;
    birthday: string;
  };
};

const initialState: UpdateProfileState = { ok: false };

export function ProfileForm({ initial }: Props) {
  const [state, action, isPending] = useActionState(updateMyProfile, initialState);
  const router = useRouter();
  const [mobilePhone, setMobilePhone] = useState(() => initial.mobilePhone);

  useActionSuccessToast(state.ok === true ? state : undefined, "已更新個人資料");

  useEffect(() => {
    if (!state?.ok) return;
    window.dispatchEvent(new Event("profile-updated"));
    queueMicrotask(() => {
      router.refresh();
    });
  }, [router, state]);

  const fieldErrors = (state && !state.ok ? state.fieldErrors : undefined) ?? {};
  const serverError = state && !state.ok ? state.error : undefined;

  return (
    <form
      key={`${initial.fullName}::${initial.mobilePhone}::${initial.defaultShippingAddress}::${initial.birthday}`}
      action={action}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground block" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            value={initial.email}
            readOnly
            className="w-full h-10 rounded-lg border bg-muted/30 px-3 text-sm outline-none text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground block" htmlFor="full_name">
            名稱
          </label>
          <input
            id="full_name"
            name="full_name"
            defaultValue={initial.fullName}
            className={cn(
              "w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none transition-all",
              fieldErrors.full_name
                ? "border-destructive ring-2 ring-destructive/10"
                : "border-border focus:ring-2 focus:ring-primary/20",
            )}
            placeholder="例如：王小明"
          />
          {fieldErrors.full_name && (
            <p className="text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
              {fieldErrors.full_name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground block" htmlFor="mobile_phone">
            手機
          </label>
          <input
            id="mobile_phone"
            name="mobile_phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            value={mobilePhone}
            onChange={(e) => setMobilePhone(e.target.value.replace(/\D/g, ""))}
            className={cn(
              "w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none transition-all",
              fieldErrors.mobile_phone
                ? "border-destructive ring-2 ring-destructive/10"
                : "border-border focus:ring-2 focus:ring-primary/20",
            )}
            placeholder="0912345678"
          />
          {fieldErrors.mobile_phone && (
            <p className="text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
              {fieldErrors.mobile_phone}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground block" htmlFor="birthday">
            生日
          </label>
          <BirthdayInput
            name="birthday"
            defaultValue={initial.birthday}
            error={fieldErrors.birthday}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground block" htmlFor="default_shipping_address">
          預設收件地址（結帳自動帶入）
        </label>
        <input
          id="default_shipping_address"
          name="default_shipping_address"
          defaultValue={initial.defaultShippingAddress}
          className={cn(
            "w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none transition-all",
            fieldErrors.default_shipping_address
              ? "border-destructive ring-2 ring-destructive/10"
              : "border-border focus:ring-2 focus:ring-primary/20",
          )}
          placeholder="例如：台北市信義區松仁路 100 號 10 樓"
        />
        {fieldErrors.default_shipping_address && (
          <p className="text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
            {fieldErrors.default_shipping_address}
          </p>
        )}
      </div>

      {serverError && (
        <div className="text-sm text-red-500 font-medium bg-red-50 p-3 rounded-md border border-red-100">
          {serverError}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" className="rounded-full font-semibold" disabled={isPending}>
          {isPending ? "更新中..." : "儲存變更"}
        </Button>
      </div>
    </form>
  );
}

