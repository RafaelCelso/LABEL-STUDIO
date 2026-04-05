"use client";

import { cn } from "@/lib/utils";
import {
  FileText,
  Plus,
  Clock,
  ChevronRight,
  LayoutDashboard,
  Settings,
} from "lucide-react";

/** Projeto na lista / cartão “continuar editando” (campos usados pela UI). */
export interface HomeProjectPreview {
  name: string;
  updated_at?: string | null;
}

interface HomeProps {
  /** Nome ou apelido exibido no cabeçalho (ex.: sessão Neon Auth). */
  displayName?: string;
  lastProject?: HomeProjectPreview;
  recentProjects?: HomeProjectPreview[];
  onCreateNew: () => void;
  onOpenProject: (project: HomeProjectPreview | string) => void;
  onOpenImporter: () => void;
}

export function Home({
  displayName = "Rafael",
  lastProject,
  recentProjects = [],
  onCreateNew,
  onOpenProject,
  onOpenImporter,
}: HomeProps) {
  const greetingName = displayName.trim() || "Rafael";

  return (
    <div className="relative z-10 flex min-h-full w-full flex-col overflow-y-auto custom-scrollbar">
      <div className="mx-auto w-full max-w-5xl space-y-10 p-4 sm:p-8 pb-20">
        <div className="space-y-3 text-center sm:text-left">
          <h2 className="font-serif text-3xl font-light tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Olá, {greetingName}
          </h2>
          <p className="mx-auto max-w-2xl text-base font-medium leading-relaxed text-muted-foreground sm:mx-0">
            Bem-vindo de volta ao LabelStudio Elite. O que vamos criar hoje?
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <button
            type="button"
            onClick={onCreateNew}
            className={cn(
              "auth-cta-glow group relative flex min-h-[168px] cursor-pointer flex-col justify-between overflow-hidden rounded-[1.65rem] p-7 text-left text-primary-foreground transition-all duration-300",
              "bg-gradient-to-br from-primary via-primary to-chart-3",
              "hover:-translate-y-0.5",
            )}
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary-foreground/20 ring-2 ring-primary-foreground/35 shadow-[inset_0_2px_8px_rgba(255,255,255,0.2)]">
              <Plus className="h-8 w-8" strokeWidth={2.5} />
            </div>
            <div className="relative">
              <span className="block text-lg font-semibold tracking-tight">
                Novo Projeto
              </span>
              <span className="mt-0.5 block text-sm font-medium text-primary-foreground/88">
                Crie labels do zero.
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenImporter}
            className={cn(
              "auth-frost-panel group flex min-h-[168px] cursor-pointer flex-col justify-between p-7 text-left transition-all duration-300",
              "hover:-translate-y-0.5 hover:bg-background/15",
            )}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-foreground/8 text-foreground ring-1 ring-border shadow-inner transition-all group-hover:bg-foreground/12">
              <Settings className="h-7 w-7" strokeWidth={1.75} />
            </div>
            <div>
              <span className="block text-lg font-semibold tracking-tight text-foreground">
                Configurações
              </span>
              <span className="mt-0.5 block text-sm font-medium text-muted-foreground">
                Gerencie importadores.
              </span>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-3">
            <div className="flex items-center gap-2 text-foreground">
              <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold tracking-tight">
                Continuar editando
              </h3>
            </div>

            {lastProject ? (
              <div
                role="button"
                tabIndex={0}
                onClick={() => onOpenProject(lastProject)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onOpenProject(lastProject);
                  }
                }}
                className={cn(
                  "auth-frost-panel-strong group cursor-pointer overflow-hidden rounded-[1.65rem] p-1 transition-all duration-300",
                  "hover:-translate-y-0.5",
                )}
              >
                <div className="p-6">
                  <div className="mb-8 flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/20 shadow-inner">
                      <FileText className="h-8 w-8" />
                    </div>
                    <div className="flex gap-1.5 pt-1">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-2 w-2 rounded-full bg-muted-foreground/35"
                        />
                      ))}
                    </div>
                  </div>

                  <h4 className="mb-2 text-2xl font-semibold leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary">
                    {lastProject.name}
                  </h4>
                  <p className="mb-6 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    Última alteração:{" "}
                    {lastProject.updated_at
                      ? new Date(lastProject.updated_at).toLocaleDateString(
                          "pt-BR",
                        )
                      : "recentemente"}
                    . Clique para continuar editando.
                  </p>

                  <div className="flex items-center justify-between border-t border-border/60 pt-4">
                    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Projeto ativo
                    </span>
                    <div className="flex items-center text-sm font-semibold text-primary">
                      Abrir projeto
                      <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative pb-1 pt-2">
                <div
                  className="auth-frost-panel pointer-events-none absolute inset-x-4 bottom-2 top-11 rounded-[1.5rem] opacity-55"
                  aria-hidden
                />
                <div
                  className="auth-frost-panel pointer-events-none absolute inset-x-2.5 bottom-1 top-7 rounded-[1.55rem] opacity-70"
                  aria-hidden
                />

                <div className="auth-frost-panel relative rounded-[1.65rem] px-10 py-14 text-center">
                  <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="mx-auto max-w-xs text-sm font-medium leading-relaxed text-muted-foreground">
                    Nenhum projeto ainda. Crie o seu primeiro!
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-2 text-foreground">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold tracking-tight">
                Mais recentes
              </h3>
            </div>

            <div className="auth-frost-panel flex flex-col overflow-hidden rounded-[1.65rem]">
              {recentProjects.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum projeto ainda.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {recentProjects.map((project, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onOpenProject(project)}
                      className="group flex w-full cursor-pointer items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-foreground/6"
                    >
                      <div className="flex min-w-0 items-center gap-3 overflow-hidden">
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-primary-foreground shadow-md",
                            idx === 0
                              ? "bg-primary auth-cta-glow"
                              : "bg-chart-4",
                          )}
                        >
                          <FileText className="h-4 w-4 opacity-95" />
                        </div>
                        <div className="min-w-0">
                          <span className="block truncate text-sm font-medium text-foreground">
                            {project.name}
                          </span>
                          {project.updated_at && (
                            <span className="block text-xs text-muted-foreground">
                              {new Date(project.updated_at).toLocaleDateString(
                                "pt-BR",
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
