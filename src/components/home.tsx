"use client"

import { FileText, Plus, Clock, ChevronRight, LayoutDashboard, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HomeProps {
  lastProject?: any
  onCreateNew: () => void
  onOpenProject: (project: any) => void
  onOpenImporter: () => void
}

export function Home({ lastProject, onCreateNew, onOpenProject, onOpenImporter }: HomeProps) {
  return (
    <div className="w-full h-full flex flex-col p-8 overflow-y-auto custom-scrollbar bg-slate-50/30">
      <div className="max-w-5xl w-full mx-auto space-y-12 pb-20">
        
        {/* Welcome Header */}
        <div className="space-y-2">
          <h2 className="text-4xl font-light text-slate-800">
            Olá, <span className="font-semibold text-slate-900">Rafael</span>
          </h2>
          <p className="text-slate-500 text-lg">Bem-vindo de volta ao LabelStudio Elite. O que vamos criar hoje?</p>
        </div>

        {/* Quick Actions / Featured */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Create New Project Card */}
          <button 
            onClick={onCreateNew}
            className="group relative flex flex-col items-center justify-center p-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-200 transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
            <div className="relative mb-4 p-3 bg-white/10 rounded-xl">
              <Plus className="w-8 h-8" />
            </div>
            <span className="text-lg font-semibold">Novo Projeto</span>
            <span className="text-blue-100 text-sm mt-1">Crie labels do zero</span>
          </button>

          {/* Importer Card */}
          <button 
            onClick={onOpenImporter}
            className="group flex flex-col items-center justify-center p-8 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          >
            <div className="mb-4 p-3 bg-slate-100 rounded-xl text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
              <Settings className="w-8 h-8" />
            </div>
            <span className="text-lg font-semibold text-slate-800">Configurações</span>
            <span className="text-slate-500 text-sm mt-1">Gerencie importadores</span>
          </button>
          
          {/* Help Card */}
          <button 
            className="group flex flex-col items-center justify-center p-8 rounded-2xl bg-slate-100 border border-transparent hover:border-slate-200 opacity-60 hover:opacity-100 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          >
            <div className="mb-4 p-3 bg-white rounded-xl text-slate-400 group-hover:text-slate-600 transition-all shadow-sm">
              <Clock className="w-8 h-8" />
            </div>
            <span className="text-lg font-semibold text-slate-800 italic">Em Breve...</span>
            <span className="text-slate-400 text-sm mt-1 italic tracking-widest uppercase text-[10px]">Analytics</span>
          </button>
        </div>

        {/* Main Sections Row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          
          {/* Last Project Section (Left, larger) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-2 text-slate-800 mb-2">
              <LayoutDashboard className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold">Continuar editando</h3>
            </div>
            
            {lastProject ? (
              <div
                onClick={() => onOpenProject(lastProject)}
                className="group relative bg-white p-1 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-8">
                    <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-2 h-2 rounded-full bg-slate-100" />
                      ))}
                    </div>
                  </div>
                  
                  <h4 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight mb-2">
                    {lastProject.name}
                  </h4>
                  <p className="text-slate-500 mb-6 line-clamp-2 text-sm leading-relaxed">
                    Última alteração: {lastProject.updated_at ? new Date(lastProject.updated_at).toLocaleDateString("pt-BR") : "recentemente"}. Clique para continuar editando.
                  </p>
                  
                  <div className="flex items-center justify-between border-t pt-4">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Projeto Ativo</span>
                    <div className="flex items-center text-sm font-semibold text-blue-600 border b-2">
                       Abrir Projeto
                       <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400">
                <FileText className="w-8 h-8 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Nenhum projeto ainda. Crie o seu primeiro!</p>
              </div>
            )}
          </div>

          {/* Recent History / Mini List (Right, smaller) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-slate-800 mb-2">
              <Clock className="w-5 h-5 text-slate-500" />
              <h3 className="text-lg font-bold">Mais recentes</h3>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
              {['Action Figure Hero', 'Puzzle Master 1000'].map((project, idx) => (
                <button 
                  key={idx}
                  onClick={() => onOpenProject(project)}
                  className="w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-slate-50 rounded text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 transition-all">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-slate-700 font-medium truncate text-sm">{project}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
              <button 
                className="w-full p-4 text-center text-blue-600 font-semibold text-xs hover:bg-slate-50 transition-colors uppercase tracking-widest"
              >
                Ver todos os projetos
              </button>
            </div>
          </div>

        </div>

        {/* Footer info/stats */}
        <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
           <div className="p-4 bg-white rounded-xl border border-slate-100 text-center">
              <div className="text-2xl font-bold text-slate-900">12</div>
              <div className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Projetos</div>
           </div>
           <div className="p-4 bg-white rounded-xl border border-slate-100 text-center">
              <div className="text-2xl font-bold text-slate-900">1.2k</div>
              <div className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Labels Geradas</div>
           </div>
           <div className="p-4 bg-white rounded-xl border border-slate-100 text-center">
              <div className="text-2xl font-bold text-slate-900">24</div>
              <div className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Modelos</div>
           </div>
           <div className="p-4 bg-white rounded-xl border border-slate-100 text-center">
              <div className="text-2xl font-bold text-slate-900">99.9%</div>
              <div className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Uptime</div>
           </div>
        </div>

      </div>
    </div>
  )
}
