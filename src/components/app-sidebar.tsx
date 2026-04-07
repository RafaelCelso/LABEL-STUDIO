"use client";

import { useState, useEffect, useRef } from "react";
import {
  Folder,
  Settings,
  ChevronDown,
  Plus,
  FileText,
  Ship,
  LayoutDashboard,
  Loader2,
  Menu,
  X,
  PanelLeftOpen,
  PanelLeftClose,
} from "lucide-react";
import { UserButton } from "@neondatabase/auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getProjects } from "@/app/actions/project";

function SidebarLogoHex({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M16 4l10.39 6v12L16 28 5.61 22V10L16 4z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M16 10l5.2 3v6L16 22l-5.2-3v-6L16 10z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity={0.85}
      />
    </svg>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);

  const expanded = !isSidebarCollapsed || isSidebarHovered || isUserMenuOpen;

  useEffect(() => {
    getProjects().then((p) => {
      setProjects(p);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!isSidebarCollapsed) return;
    const observer = new MutationObserver(() => {
      const hasPopover = !!document.querySelector(
        "[data-radix-popper-content-wrapper], [data-radix-dropdown-menu-content], [role='menu']",
      );
      setIsUserMenuOpen(hasPopover);
    });
    observer.observe(document.body, { childList: true, subtree: false });
    return () => observer.disconnect();
  }, [isSidebarCollapsed]);

  const NavItems = ({ compact = false }: { compact?: boolean }) => (
    <nav className="space-y-1">
      <Link
        href="/app"
        className={`flex w-full items-center cursor-pointer transition-all ${
          compact ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
        } text-sm font-medium rounded-xl ${
          pathname === "/app"
            ? "glass-nav-btn glass-nav-btn-active text-foreground"
            : "glass-nav-btn text-foreground/85 hover:text-foreground"
        }`}
      >
        <LayoutDashboard
          className={`h-5 w-5 shrink-0 ${pathname === "/app" ? "text-foreground" : "text-foreground/85"}`}
        />
        {!compact && <span>Início</span>}
      </Link>

      <div className="flex flex-col space-y-1">
        <button
          type="button"
          onClick={() => setIsProjectsExpanded((v) => !v)}
          className={`flex w-full items-center cursor-pointer text-sm font-medium rounded-xl glass-nav-ghost text-foreground ${
            compact
              ? "justify-center px-0 py-2.5"
              : "justify-between px-3 py-2.5"
          }`}
        >
          <div className={`flex items-center ${compact ? "" : "gap-3"}`}>
            <Folder className="h-5 w-5 shrink-0" />
            {!compact && <span>Projetos</span>}
          </div>
          {!compact && (
            <ChevronDown
              className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isProjectsExpanded ? "rotate-180" : ""}`}
            />
          )}
        </button>

        {!compact && isProjectsExpanded && (
          <div className="ml-3 flex flex-col space-y-0.5 border-l border-foreground/20 py-1 pl-4 pr-1 dark:border-white/35">
            <Link
              href="/app"
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-medium glass-nav-dashed text-foreground/90 hover:text-foreground"
            >
              <Plus className="h-4 w-4 shrink-0 opacity-90" />
              Novo Projeto
            </Link>
            {isLoading ? (
              <div className="flex items-center gap-2 px-2 py-2 text-sm text-foreground/80">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Carregando...</span>
              </div>
            ) : (
              projects.map((project) => (
                <Link
                  key={project.id}
                  href="/app"
                  className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium glass-nav-sublink text-foreground/88 hover:text-foreground"
                >
                  <FileText className="h-4 w-4 shrink-0 text-foreground/80" />
                  <span className="truncate">{project.name}</span>
                </Link>
              ))
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col space-y-1">
        <button
          type="button"
          onClick={() => setIsSettingsExpanded((v) => !v)}
          className={`flex w-full items-center cursor-pointer text-sm font-medium rounded-xl glass-nav-ghost text-foreground ${
            compact
              ? "justify-center px-0 py-2.5"
              : "justify-between px-3 py-2.5"
          }`}
        >
          <div className={`flex items-center ${compact ? "" : "gap-3"}`}>
            <Settings className="h-5 w-5 shrink-0" />
            {!compact && <span>Configurações</span>}
          </div>
          {!compact && (
            <ChevronDown
              className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isSettingsExpanded ? "rotate-180" : ""}`}
            />
          )}
        </button>

        {!compact && isSettingsExpanded && (
          <div className="ml-3 flex flex-col space-y-0.5 border-l border-foreground/20 py-1 pl-4 pr-1 dark:border-white/35">
            <Link
              href="/app"
              className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium ${
                pathname.includes("/app")
                  ? "glass-nav-sublink glass-nav-sublink-active text-foreground"
                  : "glass-nav-sublink text-foreground/88 hover:text-foreground"
              }`}
            >
              <Ship className="h-4 w-4 shrink-0 text-foreground/80" />
              <span>Importador</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────────────────── */}
      <aside
        className={`hidden md:flex flex-col shrink-0 h-full z-20 transition-all duration-300 liquid-glass-sidebar-dark ${
          expanded ? "w-60" : "w-16"
        }`}
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
      >
        <div
          className={`flex items-center gap-2.5 px-3 py-4 border-b border-white/8 ${!expanded ? "justify-center" : ""}`}
        >
          <SidebarLogoHex className="h-7 w-7 shrink-0 text-white/80" />
          {expanded && (
            <span className="text-sm font-semibold tracking-tight truncate text-white/85">
              LabelStudio Elite
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-3 px-2">
          <NavItems compact={!expanded} />
        </div>

        <div className="p-2 border-t border-white/8">
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed((v) => !v)}
            className="flex w-full items-center justify-center rounded-xl p-2 text-white/50 hover:text-white/90 hover:bg-white/8 transition-colors cursor-pointer"
            title={isSidebarCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="p-3 border-t border-white/8">
          <div
            className={`flex items-center ${!expanded ? "justify-center" : "gap-2"} [&_button]:cursor-pointer [&_*]:cursor-pointer`}
          >
            {!expanded ? <UserButton size="icon" /> : <UserButton />}
          </div>
        </div>
      </aside>

      {/* ── Mobile nav drawer ───────────────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          isNavDrawerOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            isNavDrawerOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsNavDrawerOpen(false)}
        />
        <div
          className={`absolute left-0 top-0 h-full w-72 liquid-glass-sidebar-dark-mobile flex flex-col transition-all duration-300 ${
            isNavDrawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/8">
            <div className="flex items-center gap-2.5">
              <SidebarLogoHex className="h-6 w-6 text-white/80" />
              <span className="text-sm font-semibold text-white/85">
                LabelStudio Elite
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsNavDrawerOpen(false)}
              className="text-white/50 hover:text-white/90"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-3 px-3">
            <NavItems />
          </div>
          <div className="p-3 border-t border-white/8">
            <UserButton />
          </div>
        </div>
      </div>

      {/* ── Mobile topbar ───────────────────────────────────────────────────── */}
      <header className="md:hidden flex items-center gap-3 px-4 py-3 shrink-0 liquid-glass-sidebar-dark border-b border-white/8 fixed top-0 left-0 right-0 z-30">
        <button
          type="button"
          onClick={() => setIsNavDrawerOpen(true)}
          className="text-foreground/70 hover:text-foreground"
        >
          <Menu className="h-5 w-5" />
        </button>
        <SidebarLogoHex className="h-6 w-6 text-foreground" />
        <span className="text-sm font-semibold truncate flex-1">
          LabelStudio Elite
        </span>
      </header>
    </>
  );
}
