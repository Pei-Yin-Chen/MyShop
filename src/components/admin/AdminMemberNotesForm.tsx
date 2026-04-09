"use client";

import { useActionState } from "react";
import {
  addMemberAdminNoteAction,
  type MemberActionState,
} from "@/app/admin/(panel)/members/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatOrderDateTimeZh } from "@/lib/format-order-datetime";
import { ADMIN_MEMBER_NOTE_MAX_CHARS } from "@/lib/admin/admin-member-notes";
import { useActionSuccessToast } from "@/lib/hooks/use-action-success-toast";

export type AdminMemberNoteRow = {
  id: string;
  body: string;
  created_at: string;
  created_by: string | null;
  authorLabel: string;
};

export function AdminMemberNotesForm({
  memberId,
  notes,
}: {
  memberId: string;
  notes: AdminMemberNoteRow[];
}) {
  const [state, formAction, pending] = useActionState(
    addMemberAdminNoteAction,
    undefined as MemberActionState | undefined,
  );

  useActionSuccessToast(state, "已新增備註");

  const fieldErrors =
    state && !state.ok ? state.fieldErrors : undefined;
  const bodyError = fieldErrors?.body;
  const serverError =
    state && !state.ok && state.error && !bodyError ? state.error : undefined;

  return (
    <div className="space-y-4">
      {notes.length > 0 ? (
        <ul className="max-h-80 space-y-3 overflow-y-auto pr-1 md:max-h-96">
          {notes.map((n) => (
            <li
              key={n.id}
              className="rounded-lg border border-border/80 bg-muted/20 px-3 py-2.5 text-sm"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                <span className="tabular-nums">{formatOrderDateTimeZh(n.created_at)}</span>
                <span className="font-medium text-foreground/90">{n.authorLabel}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-foreground">{n.body}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">尚無備註紀錄。</p>
      )}

      <form action={formAction} className="flex flex-col gap-3 border-t border-border pt-4">
        <input type="hidden" name="member_id" value={memberId} />
        <div>
          <label
            htmlFor="admin_note_body"
            className="mb-1.5 block text-xs font-medium text-muted-foreground"
          >
            新增備註（僅管理員可見）
          </label>
          <textarea
            id="admin_note_body"
            name="body"
            rows={3}
            placeholder="聯絡紀錄、注意事項…"
            className={cn(
              "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 disabled:opacity-60",
              bodyError
                ? "border-destructive ring-2 ring-destructive/10"
                : "border-border focus-visible:ring-2 focus-visible:ring-primary/20",
            )}
            disabled={pending}
            maxLength={ADMIN_MEMBER_NOTE_MAX_CHARS}
            aria-invalid={bodyError ? true : undefined}
            aria-describedby={bodyError ? "admin_note_body_error" : undefined}
          />
          {bodyError ? (
            <p
              id="admin_note_body_error"
              className="mt-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200"
            >
              {bodyError}
            </p>
          ) : null}
        </div>
        {serverError ? (
          <p className="text-sm text-destructive">{serverError}</p>
        ) : null}
        <Button type="submit" size="lg" className="rounded-full" disabled={pending}>
          {pending ? "送出中…" : "新增備註"}
        </Button>
      </form>
    </div>
  );
}
