"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarLogoHex } from "@/components/landing/shared";

const NAV_LINKS = [
  { href: "#features", label: "Funcionalidades" },
  { href: "#how-it-works", label: "Como funciona" },
  { href: "#pricing", label: "Preços" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change / link click
  function handleNavClick(href: string) {
    setOpen(false);
    // anchor links — let browser handle scroll
    if (href.startsWith("#")) {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(href);
    }
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backdropFilter: "blur(14px) saturate(165%)",
        WebkitBackdropFilter: "blur(14px) saturate(165%)",
        backgroundColor:
          scrolled || open
            ? "oklch(from var(--background) l c h / 82%)"
            : "oklch(from var(--background) l c h / 32%)",
        borderBottom: "1px solid oklch(from var(--foreground) l c h / 10%)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-4">
          {/* Logo + name */}
          <div className="flex items-center gap-2 shrink-0">
            <SidebarLogoHex className="h-6 w-6 sm:h-7 sm:w-7 text-foreground" />
            <span className="text-sm font-semibold tracking-tight text-foreground">
              LabelStudio Elite
            </span>
          </div>

          {/* Anchor links — desktop only */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                {label}
              </a>
            ))}
          </div>

          {/* Auth buttons — desktop */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <button
              onClick={() => router.push("/auth/sign-in")}
              className="text-sm px-4 py-1.5 rounded-full text-foreground/80 hover:text-foreground transition-colors duration-200"
            >
              Entrar
            </button>
            <button
              onClick={() => router.push("/auth/sign-up")}
              className="text-sm px-4 py-1.5 rounded-full auth-frost-panel hover:opacity-90 transition-opacity duration-200 text-foreground font-medium"
            >
              Criar conta
            </button>
          </div>

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5 shrink-0"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
          >
            <span
              className={`block h-0.5 w-5 bg-foreground/80 transition-all duration-200 ${open ? "rotate-45 translate-y-2" : ""}`}
            />
            <span
              className={`block h-0.5 w-5 bg-foreground/80 transition-all duration-200 ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`block h-0.5 w-5 bg-foreground/80 transition-all duration-200 ${open ? "-rotate-45 -translate-y-2" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-foreground/10 px-4 py-4 flex flex-col gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <button
              key={href}
              onClick={() => handleNavClick(href)}
              className="text-left text-sm text-muted-foreground hover:text-foreground py-2.5 transition-colors"
            >
              {label}
            </button>
          ))}
          <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-foreground/10">
            <button
              onClick={() => {
                setOpen(false);
                router.push("/auth/sign-in");
              }}
              className="w-full text-sm py-2.5 rounded-full text-foreground/80 border border-foreground/15 hover:border-foreground/30 transition-colors"
            >
              Entrar
            </button>
            <button
              onClick={() => {
                setOpen(false);
                router.push("/auth/sign-up");
              }}
              className="w-full text-sm py-2.5 rounded-full auth-cta-glow bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-medium"
            >
              Criar conta
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
