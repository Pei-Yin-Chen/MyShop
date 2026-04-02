'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const UpdateProfileSchema = z.object({
  full_name: z.string().trim().min(2, '姓名至少需 2 個字').max(80, '姓名過長'),
  mobile_phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ?? '').replace(/\D/g, ''))
    .refine((v) => !v || (v.length >= 8 && v.length <= 15), '電話格式不正確'),
  birthday: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), '生日格式不正確'),
  default_shipping_address: z
    .string()
    .trim()
    .max(200, '地址過長')
    .optional()
    .or(z.literal('')),
})

export type UpdateProfileState =
  | { ok: true }
  | { ok: false; fieldErrors?: Record<string, string>; error?: string }

export async function updateMyProfile(
  _prev: UpdateProfileState | undefined,
  formData: FormData
): Promise<UpdateProfileState> {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) return { ok: false, error: '請先登入' }

  const parsed = UpdateProfileSchema.safeParse({
    full_name: formData.get('full_name'),
    mobile_phone: formData.get('mobile_phone'),
    birthday: formData.get('birthday'),
    default_shipping_address: formData.get('default_shipping_address'),
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form')
      fieldErrors[key] = issue.message
    }
    return { ok: false, fieldErrors }
  }

  const { full_name, mobile_phone, birthday, default_shipping_address } = parsed.data

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      full_name,
      mobile_phone: mobile_phone?.trim() ? mobile_phone.trim() : null,
      birthday: birthday?.trim() ? birthday.trim() : null,
      default_shipping_address: default_shipping_address?.trim()
        ? default_shipping_address.trim()
        : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (updateError) return { ok: false, error: updateError.message }

  // Ensure Server Components re-fetch fresh profile data immediately
  revalidatePath('/member')
  revalidatePath('/member/profile')
  revalidatePath('/checkout')

  return { ok: true }
}

