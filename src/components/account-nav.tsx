"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Shield } from "lucide-react";

const NAV_ITEMS = [
  { href: "/account/settings", label: "Conta", icon: User },
  { href: "/account/security", label: "Segurança", icon: Shield },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 border-b border-white/10">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
              active
                ? "border-foreground text-foreground"
                : "border-transparent text-foreground/50 hover:text-foreground/80 hover:border-foreground/30"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
