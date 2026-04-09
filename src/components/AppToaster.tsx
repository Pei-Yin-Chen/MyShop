"use client";

import { Toaster } from "sonner";

/** 全站成功／一般提示：頂部置中，數秒後自動消失（見 `useActionSuccessToast`） */
export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      richColors
      duration={4000}
      expand={false}
      gap={10}
      offset="1rem"
    />
  );
}
