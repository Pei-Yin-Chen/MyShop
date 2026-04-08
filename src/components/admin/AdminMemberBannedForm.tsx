"use client";

import { useActionState } from "react";
import {
  setMemberBannedAction,
  type MemberActionState,
} from "@/app/admin/(panel)/members/actions";
import { Button } from "@/components/ui/button";

export function AdminMemberBannedForm({
  memberId,
  isBanned,
  disabled,
}: {
  memberId: string;
  isBanned: boolean;
  disabled: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    setMemberBannedAction,
    undefined as MemberActionState | undefined,
  );

  if (disabled) {
    return (
      <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
        無法從此頁停用目前登入中的管理員帳號。
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="member_id" value={memberId} />
      <input type="hidden" name="banned" value={isBanned ? "false" : "true"} />
      {state?.ok === false && state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {state?.ok && state.message ? (
        <p className="text-sm text-emerald-700 dark:text-emerald-400">{state.message}</p>
      ) : null}
      <Button
        type="submit"
        size="lg"
        variant={isBanned ? "outline" : "destructive"}
        className="rounded-full"
        disabled={pending}
      >
        {pending ? "更新中…" : isBanned ? "解除停用" : "標記為停用"}
      </Button>
    </form>
  );
}
