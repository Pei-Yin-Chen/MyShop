import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/app/member/profile/profile-form";

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  default_shipping_address: string | null;
  birthday: string | null;
  mobile_phone: string | null;
};

export default async function MemberProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirectTo=/member/profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, default_shipping_address, birthday, mobile_phone")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="space-y-1 px-6">
        <CardTitle className="text-xl font-bold">個人資料</CardTitle>
        <p className="text-sm text-muted-foreground">
          你可以在這裡更新顯示名稱與預設收件地址（結帳可自動帶入）。
        </p>
      </CardHeader>
      <CardContent className="px-6 py-6">
        <ProfileForm
          initial={{
            email: profile?.email ?? user.email ?? "",
            fullName: profile?.full_name ?? "",
            mobilePhone: profile?.mobile_phone ?? "",
            defaultShippingAddress: profile?.default_shipping_address ?? "",
            birthday: profile?.birthday ?? "",
          }}
        />
      </CardContent>
    </Card>
  );
}

