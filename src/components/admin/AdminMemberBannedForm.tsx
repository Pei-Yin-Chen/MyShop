"use client";

import { useActionState } from "react";
import {
  setMemberBannedAction,
  type MemberActionState,
} from "@/app/admin/(panel)/members/actions";
import { Button } from "@/components/ui/button";
import { useActionSuccessToast } from "@/lib/hooks/use-action-success-toast";

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

  useActionSuccessToast(state, "已更新會員狀態");

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
