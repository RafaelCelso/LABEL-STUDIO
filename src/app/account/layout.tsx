import { AppGradientLayer } from "@/components/app-gradient-layer";
import { AppSidebar } from "@/components/app-sidebar";
import { AccountNav } from "@/components/account-nav";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <AppGradientLayer idPrefix="account" />
      <AppSidebar />
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
        {/* Spacer for mobile topbar */}
        <div className="md:hidden h-[57px] shrink-0" />
        <main className="relative z-10 flex-1 overflow-y-auto">
          <div className="max-w-xl mx-auto px-4 pt-8 md:pt-10 pb-8">
            <AccountNav />
            <div className="mt-6">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
