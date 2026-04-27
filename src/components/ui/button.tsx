"use client"

import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import type { VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button-variants"

type ButtonProps = ButtonPrimitive.Props & VariantProps<typeof buttonVariants> & {
  /**
   * 與 Radix/shadcn 慣用 API 相容：以單一子元素（多為 <Link>）合成按鈕外觀。
   * Base UI 使用 `render`，此處轉寫，避免把 `asChild` 洩漏到 DOM。
   */
  asChild?: boolean
}

function Button({
  className,
  variant = "default",
  size = "default",
  nativeButton = true,
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  if (asChild) {
    return (
      <ButtonPrimitive
        data-slot="button"
        render={React.Children.only(children) as React.ReactElement<Record<string, unknown>>}
        nativeButton={false}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    )
  }
  return (
    <ButtonPrimitive
      data-slot="button"
      nativeButton={nativeButton}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </ButtonPrimitive>
  )
}

export { Button }
