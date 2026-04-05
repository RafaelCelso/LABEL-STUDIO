import { AuthView } from "@neondatabase/auth/react";
import { SignInWrapper } from "@/components/sign-in-wrapper";
import { AuthComponent } from "@/components/ui/sign-up";

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    { path: "sign-in" },
    { path: "sign-up" },
    { path: "sign-out" },
    { path: "forgot-password" },
    { path: "reset-password" },
  ];
}

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;

  if (path === "sign-in") {
    return <SignInWrapper />;
  }

  if (path === "sign-up") {
    return <AuthComponent />;
  }

  return (
    <main className="container mx-auto flex grow flex-col items-center justify-center gap-3 self-center p-4 md:p-6">
      <AuthView path={path} />
    </main>
  );
}
