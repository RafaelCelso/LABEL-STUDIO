import {
  UpdateNameCard,
  ChangeEmailCard,
  ChangePasswordCard,
  SessionsCard,
  DeleteAccountCard,
} from "@neondatabase/auth/react";
import { accountViewPaths } from "@neondatabase/auth/react/ui/server";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(accountViewPaths).map((path) => ({ path }));
}

const PAGE_TITLES: Record<string, string> = {
  settings: "Conta",
  security: "Segurança",
};

export default async function AccountPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;
  const title = PAGE_TITLES[path] ?? "Conta";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-foreground">{title}</h1>

      {path === "settings" && (
        <>
          <UpdateNameCard />
          <ChangeEmailCard />
        </>
      )}

      {path === "security" && (
        <>
          <ChangePasswordCard />
          <SessionsCard />
          <DeleteAccountCard />
        </>
      )}
    </div>
  );
}
