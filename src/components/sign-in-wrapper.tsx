"use client";

import { useRouter } from "next/navigation";
import { SignInComponent } from "@/components/ui/sign-in";

export function SignInWrapper() {
  const router = useRouter();
  return (
    <SignInComponent
      onSignUp={() => router.push("/auth/sign-up")}
      onForgotPassword={(email) =>
        router.push(
          `/auth/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ""}`,
        )
      }
    />
  );
}
