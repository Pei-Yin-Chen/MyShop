import { Suspense } from "react";
import LoginClient from "./login-client";

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <LoginClient />
    </Suspense>
  );
}
