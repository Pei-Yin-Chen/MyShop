"use client";

import { useActionState } from "react";
import {
  setMemberAdminRoleAction,
  type MemberActionState,
} from "@/app/admin/(panel)/members/actions";
import { Button } from "@/components/ui/button";
import { useActionSuccessToast } from "@/lib/hooks/use-action-success-toast";

export function AdminMemberAdminRoleForm({
  memberId,
  isAdmin,
  adminCount,
}: {
  memberId: string;
  isAdmin: boolean;
  /** 目前系統內管理員總數（含此會員若為管理員） */
  adminCount: number;
}) {
  const [state, formAction, pending] = useActionState(
    setMemberAdminRoleAction,
    undefined as MemberActionState | undefined,
  );

  useActionSuccessToast(state, "已更新管理員權限");

  const canDemote = isAdmin && adminCount > 1;

  return (
    <div className="flex flex-col gap-3">
      {state?.ok === false && state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      {!isAdmin ? (
        <form action={formAction} className="flex flex-col gap-2">
          <input type="hidden" name="member_id" value={memberId} />
          <input type="hidden" name="is_admin" value="true" />
          <Button type="submit" size="lg" className="w-fit rounded-full" disabled={pending}>
            {pending ? "更新中…" : "設為管理員"}
          </Button>
        </form>
      ) : null}

      {isAdmin && canDemote ? (
        <form action={formAction} className="flex flex-col gap-2">
          <input type="hidden" name="member_id" value={memberId} />
          <input type="hidden" name="is_admin" value="false" />
          <Button
            type="submit"
            size="lg"
            variant="outline"
            className="w-fit rounded-full"
            disabled={pending}
          >
            {pending ? "更新中…" : "取消管理員權限"}
          </Button>
        </form>
      ) : null}

      {isAdmin && !canDemote ? (
        <p className="text-sm text-amber-800 dark:text-amber-200">
          目前為系統唯一管理員，無法在此取消管理員權限。請先將另一位會員設為管理員後，再取消此帳號權限。
        </p>
      ) : null}
    </div>
  );
}
