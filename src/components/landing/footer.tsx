import Link from "next/link";
import { SidebarLogoHex } from "@/components/landing/shared";

const LINK_GROUPS = [
  {
    title: "Produto",
    links: [
      { label: "Funcionalidades", href: "#features" },
      { label: "Preços", href: "#pricing" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre", href: "#" },
      { label: "Contato", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Termos", href: "#" },
      { label: "Privacidade", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer
      className="relative z-10 overflow-x-hidden"
      style={{
        background: "oklch(0.12 0 0)",
        borderTop: "1px solid oklch(1 0 0 / 12%)",
      }}
    >
      {/* Subtle top glow line */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(0.75 0 0 / 30%), transparent)",
        }}
        aria-hidden
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Top row: brand + links */}
        <div className="flex flex-col md:flex-row gap-10 md:gap-16">
          {/* Brand */}
          <div className="flex flex-col gap-4 md:max-w-[220px]">
            <div className="flex items-center gap-2.5">
              <SidebarLogoHex className="w-7 h-7 text-white/90" />
              <span className="font-semibold text-base text-white/90 tracking-tight">
                LabelStudio Elite
              </span>
            </div>
            <p className="text-sm text-white/45 leading-relaxed">
              Crie e gerencie rótulos de produtos com precisão, inteligência e
              design profissional.
            </p>
          </div>

          {/* Link groups */}
          <div className="flex flex-col sm:flex-row gap-8 md:gap-14 md:ml-auto">
            {LINK_GROUPS.map((group) => (
              <div key={group.title} className="flex flex-col gap-3">
                <span className="text-xs font-semibold text-white/55 uppercase tracking-widest">
                  {group.title}
                </span>
                {group.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm text-white/65 hover:text-white/95 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div
          className="my-10"
          style={{ borderTop: "1px solid oklch(1 0 0 / 8%)" }}
        />

        {/* Bottom row: copyright */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-white/35">
            © {new Date().getFullYear()} LabelStudio Elite. Todos os direitos
            reservados.
          </p>
          <p className="text-xs text-white/25">
            Feito com precisão e design profissional.
          </p>
        </div>
      </div>
    </footer>
  );
}
