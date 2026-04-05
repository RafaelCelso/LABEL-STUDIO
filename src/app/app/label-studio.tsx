"use client";

import {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
} from "react";
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
  ArrowLeft,
  Save,
  Download,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
  GripHorizontal,
  RotateCcw,
  AlignLeft,
  AlignCenter,
  AlignJustify,
  AlignRight,
  Bold,
  Italic,
  PanelLeftOpen,
  PanelLeftClose,
} from "lucide-react";
import { UserButton } from "@neondatabase/auth/react";

import {
  initialLabelData,
  emptyLabelData,
  LabelData,
  stripWizardDraft,
} from "@/types/label";
import {
  LABEL_PREVIEW_DESIGN_W_PX,
  labelPreviewOuterHeightPx,
  getDefaultLabelBlockLayouts,
  type LabelBlockFmt,
  type LabelBlockLayouts,
} from "@/types/label-layout";
import { ModelConfig } from "@/components/model-config";
import {
  LabelPreview,
  type LabelPreviewHandle,
} from "@/components/label-preview";
import { ImporterManager } from "@/components/importer-manager";
import { AppGradientLayer } from "@/components/app-gradient-layer";
import { Home } from "@/components/home";
import { ExpandableChatDemo } from "@/components/expandable-chat-demo";
import {
  NewProjectWizard,
  WIZARD_SECTION_COUNT,
} from "@/components/new-project-wizard";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import {
  saveProject,
  updateProject,
  getProjects,
  deleteProject,
} from "@/app/actions/project";
import { toast } from "sonner";

/** Logo hexagonal (contorno) como no mock LabelStudio Elite */
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

const FORM_COL_MIN = 240;
const FORM_COL_MAX = 640;
const FORM_COL_DEFAULT = 320;
const ZOOM_MIN = 0.25;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.05;
const DOT_GRID_BASE = 24;

const CANVAS_BG = "#1a1a1b";
/** Cor fixa das linhas-guia (seletor de cor removido da UI). */
const GUIDE_LINE_COLOR = "#000000";

type GuideLineOrientation = "h" | "v";
type GuideLine = {
  id: string;
  orientation: GuideLineOrientation;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  thickness: number;
};

type EditorSnapshot = {
  guideLines: GuideLine[];
  labelBlockLayouts: LabelBlockLayouts | null;
};

function cloneEditorSnapshot(s: EditorSnapshot): EditorSnapshot {
  return {
    guideLines: structuredClone(s.guideLines),
    labelBlockLayouts:
      s.labelBlockLayouts == null ? null : structuredClone(s.labelBlockLayouts),
  };
}

function isEditableTarget(t: EventTarget | null): boolean {
  if (!(t instanceof HTMLElement)) return false;
  const tag = t.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return Boolean(t.closest("[contenteditable=true]"));
}

export default function LabelStudio() {
  const [data, setData] = useState<LabelData>(initialLabelData);
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const [labelTitle, setLabelTitle] = useState("Renderização Nordic Blueprint");
  const [currentView, setCurrentView] = useState<
    "projects" | "importer" | "home" | "newProjectWizard"
  >("home");
  const [wizardData, setWizardData] = useState<LabelData>(emptyLabelData);
  const [wizardLabelTitle, setWizardLabelTitle] = useState("");
  const [wizardDraftProjectId, setWizardDraftProjectId] = useState<
    string | null
  >(null);
  const [wizardInitialSectionIdx, setWizardInitialSectionIdx] = useState(0);
  const [wizardSessionNonce, setWizardSessionNonce] = useState(0);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sidebarDeleteProjectId, setSidebarDeleteProjectId] = useState<
    string | null
  >(null);
  const [sidebarDeleteProjectName, setSidebarDeleteProjectName] =
    useState<string>("");
  const [isResetLayoutModalOpen, setIsResetLayoutModalOpen] = useState(false);
  const [isFormPanelOpen, setIsFormPanelOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [formColumnWidth, setFormColumnWidth] = useState(FORM_COL_DEFAULT);
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [canvasPanX, setCanvasPanX] = useState(0);
  const [canvasPanY, setCanvasPanY] = useState(0);
  const [labelOffsetX, setLabelOffsetX] = useState(0);
  const [labelOffsetY, setLabelOffsetY] = useState(0);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [altHeld, setAltHeld] = useState(false);
  const [canvasPointerMode, setCanvasPointerMode] = useState<
    "idle" | "pan" | "label"
  >("idle");
  const spaceHeldRef = useRef(false);

  const labelPreviewRef = useRef<LabelPreviewHandle>(null);
  const canvasMainRef = useRef<HTMLElement | null>(null);
  const labelViewportInnerRef = useRef<HTMLDivElement | null>(null);

  type GuideTool = "none" | "line-h" | "line-v";
  type SelectedTextTools = {
    selectedBlockId: string | null;
    fmt: LabelBlockFmt | null;
    onUpdateFmt: ((patch: Partial<LabelBlockFmt>) => void) | null;
    isTextSelectionMode?: boolean;
  };

  const [guideTool, setGuideTool] = useState<GuideTool>("none");
  const [guideLines, setGuideLines] = useState<GuideLine[]>([]);
  const [draftGuideLine, setDraftGuideLine] = useState<GuideLine | null>(null);

  const [lineThickness, setLineThickness] = useState(2);

  const guideDrawRef = useRef<{
    active: boolean;
    id: string;
    orientation: GuideLineOrientation;
    startX: number;
    startY: number;
    color: string;
    thickness: number;
  } | null>(null);

  const guideLinesRef = useRef<GuideLine[]>([]);
  const editorHistoryRef = useRef<{
    past: EditorSnapshot[];
    future: EditorSnapshot[];
    current: EditorSnapshot;
  }>({
    past: [],
    future: [],
    current: { guideLines: [], labelBlockLayouts: null },
  });

  const dataRef = useRef(data);
  dataRef.current = data;
  const applyingEditorHistoryRef = useRef(false);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [selectedTextTools, setSelectedTextTools] = useState<SelectedTextTools>(
    {
      selectedBlockId: null,
      fmt: null,
      onUpdateFmt: null,
    },
  );

  useEffect(() => {
    guideLinesRef.current = guideLines;
  }, [guideLines]);

  useEffect(() => {
    const onSelectionEvent = (ev: Event) => {
      const custom = ev as CustomEvent<SelectedTextTools>;
      if (!custom.detail) return;
      setSelectedTextTools((prev) => {
        const next = custom.detail;
        const prevFmt = JSON.stringify(prev.fmt ?? {});
        const nextFmt = JSON.stringify(next.fmt ?? {});
        const unchanged =
          prev.selectedBlockId === next.selectedBlockId &&
          prev.isTextSelectionMode === next.isTextSelectionMode &&
          prevFmt === nextFmt;
        return unchanged ? prev : next;
      });
    };
    window.addEventListener(
      "label-block-selection-change",
      onSelectionEvent as EventListener,
    );
    return () => {
      window.removeEventListener(
        "label-block-selection-change",
        onSelectionEvent as EventListener,
      );
    };
  }, []);

  // Histórico unificado: guias + layout dos blocos (posição, tamanho, fmt). Não inclui campos do formulário.

  const applyEditorSnapshot = useCallback((snap: EditorSnapshot) => {
    setGuideLines(snap.guideLines);
    applyingEditorHistoryRef.current = true;
    setData((prev) => ({ ...prev, labelBlockLayouts: snap.labelBlockLayouts }));
    setDraftGuideLine(null);
    setGuideTool("none");
    guideDrawRef.current = null;
    queueMicrotask(() => {
      applyingEditorHistoryRef.current = false;
    });
  }, []);

  const commitEditorSnapshot = useCallback(
    (next: EditorSnapshot) => {
      const hist = editorHistoryRef.current;
      hist.past.push(cloneEditorSnapshot(hist.current));
      hist.future = [];
      hist.current = cloneEditorSnapshot(next);
      applyEditorSnapshot(hist.current);
      setCanUndo(hist.past.length > 0);
      setCanRedo(false);
    },
    [applyEditorSnapshot],
  );

  const undoEditor = useCallback(() => {
    const hist = editorHistoryRef.current;
    if (hist.past.length === 0) return;
    const prev = hist.past.pop()!;
    hist.future.unshift(hist.current);
    hist.current = cloneEditorSnapshot(prev);
    applyEditorSnapshot(hist.current);
    setCanUndo(hist.past.length > 0);
    setCanRedo(hist.future.length > 0);
  }, [applyEditorSnapshot]);

  const redoEditor = useCallback(() => {
    const hist = editorHistoryRef.current;
    if (hist.future.length === 0) return;
    const next = hist.future.shift()!;
    hist.past.push(hist.current);
    hist.current = cloneEditorSnapshot(next);
    applyEditorSnapshot(hist.current);
    setCanUndo(hist.past.length > 0);
    setCanRedo(hist.future.length > 0);
  }, [applyEditorSnapshot]);

  const handleLabelBlockLayoutsChange = useCallback(
    (layouts: LabelBlockLayouts) => {
      if (applyingEditorHistoryRef.current) {
        setData((prev) => ({ ...prev, labelBlockLayouts: layouts }));
        return;
      }
      if (
        JSON.stringify(dataRef.current.labelBlockLayouts) ===
        JSON.stringify(layouts)
      )
        return;
      commitEditorSnapshot({
        guideLines: structuredClone(guideLinesRef.current),
        labelBlockLayouts: structuredClone(layouts),
      });
    },
    [commitEditorSnapshot],
  );

  /** Chamado ao criar ou abrir projeto — não usar só em selectedProjectId (salvar projeto novo mudaria o id e apagaria o histórico). */
  const resetEditorHistoryForSession = useCallback(
    (labelBlockLayouts: LabelBlockLayouts | null) => {
      setGuideLines([]);
      editorHistoryRef.current = {
        past: [],
        future: [],
        current: {
          guideLines: [],
          labelBlockLayouts:
            labelBlockLayouts == null
              ? null
              : structuredClone(labelBlockLayouts),
        },
      };
      setCanUndo(false);
      setCanRedo(false);
    },
    [],
  );
  const panDragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    originPanX: number;
    originPanY: number;
  }>({ active: false, startX: 0, startY: 0, originPanX: 0, originPanY: 0 });
  const labelDragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  }>({ active: false, startX: 0, startY: 0, originX: 0, originY: 0 });

  useEffect(() => {
    try {
      const w = localStorage.getItem("label-studio-editor-form-width");
      const z = localStorage.getItem("label-studio-editor-canvas-zoom");
      if (w) {
        const n = Number.parseInt(w, 10);
        if (!Number.isNaN(n))
          setFormColumnWidth(Math.min(FORM_COL_MAX, Math.max(FORM_COL_MIN, n)));
      }
      if (z) {
        const f = Number.parseFloat(z);
        if (!Number.isNaN(f))
          setCanvasZoom(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, f)));
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "label-studio-editor-form-width",
        String(formColumnWidth),
      );
    } catch {
      /* ignore */
    }
  }, [formColumnWidth]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "label-studio-editor-canvas-zoom",
        String(canvasZoom),
      );
    } catch {
      /* ignore */
    }
  }, [canvasZoom]);

  const startResizeFormColumn = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startW = formColumnWidth;
      const onMove = (ev: MouseEvent) => {
        const delta = ev.clientX - startX;
        setFormColumnWidth((w) =>
          Math.min(FORM_COL_MAX, Math.max(FORM_COL_MIN, startW + delta)),
        );
      };
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [formColumnWidth],
  );

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    const result = await getProjects();
    setProjects(result);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  /** Ctrl/Cmd + rolagem: listener nativo com { passive: false } — o onWheel do React é passivo e impede preventDefault. */
  useLayoutEffect(() => {
    if (currentView !== "projects") return;
    const el = canvasMainRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      e.stopPropagation();
      let dy = e.deltaY;
      if (e.deltaMode === WheelEvent.DOM_DELTA_LINE) {
        dy *= 16;
      } else if (e.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
        dy *= 120;
      }
      const delta = -dy * 0.002;
      setCanvasZoom((z) => {
        const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z + delta));
        return Math.round(next * 100) / 100;
      });
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, [currentView]);

  /** Pan / mover etiqueta: listeners globais */
  useEffect(() => {
    if (currentView !== "projects") return;

    const onMove = (e: MouseEvent) => {
      if (panDragRef.current.active) {
        const r = panDragRef.current;
        setCanvasPanX(r.originPanX + (e.clientX - r.startX));
        setCanvasPanY(r.originPanY + (e.clientY - r.startY));
      }
      if (labelDragRef.current.active) {
        const r = labelDragRef.current;
        setLabelOffsetX(r.originX + (e.clientX - r.startX));
        setLabelOffsetY(r.originY + (e.clientY - r.startY));
      }
    };

    const onUp = () => {
      if (panDragRef.current.active || labelDragRef.current.active) {
        panDragRef.current.active = false;
        labelDragRef.current.active = false;
        setCanvasPointerMode("idle");
        document.body.style.removeProperty("cursor");
        document.body.style.removeProperty("user-select");
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("blur", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("blur", onUp);
    };
  }, [currentView]);

  /** Espaço / Alt: modo pan (cursor) e evitar scroll por Space */
  useEffect(() => {
    if (currentView !== "projects") return;

    const onKeyDown = (e: KeyboardEvent) => {
      const isCtrlZ =
        (e.ctrlKey || e.metaKey) &&
        !e.shiftKey &&
        (e.key === "z" || e.key === "Z");
      const isCtrlShiftZ =
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.key === "z" || e.key === "Z");
      const isCtrlY =
        (e.ctrlKey || e.metaKey) && (e.key === "y" || e.key === "Y");

      if (!isEditableTarget(e.target) && (isCtrlZ || isCtrlShiftZ || isCtrlY)) {
        e.preventDefault();
        e.stopPropagation();
        if (isCtrlZ) undoEditor();
        else redoEditor();
      }

      if (e.code === "AltLeft" || e.code === "AltRight") setAltHeld(true);
      if (e.code === "Space" && !isEditableTarget(e.target)) {
        e.preventDefault();
        spaceHeldRef.current = true;
        setSpaceHeld(true);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "AltLeft" || e.code === "AltRight") setAltHeld(false);
      if (e.code === "Space") {
        spaceHeldRef.current = false;
        setSpaceHeld(false);
      }
    };

    window.addEventListener("keydown", onKeyDown, { capture: true });
    window.addEventListener("keyup", onKeyUp, { capture: true });
    return () => {
      window.removeEventListener("keydown", onKeyDown, { capture: true });
      window.removeEventListener("keyup", onKeyUp, { capture: true });
    };
  }, [currentView, undoEditor, redoEditor]);

  const startCanvasPan = useCallback(
    (e: React.MouseEvent) => {
      if (guideTool !== "none") return;
      const t = e.target as HTMLElement;
      if (t.closest("[data-label-drag-handle]")) return;
      if (t.closest("[data-canvas-ui]")) return;
      if (
        e.button === 1 ||
        (e.button === 0 && (e.altKey || spaceHeldRef.current))
      ) {
        e.preventDefault();
        e.stopPropagation();
        panDragRef.current = {
          active: true,
          startX: e.clientX,
          startY: e.clientY,
          originPanX: canvasPanX,
          originPanY: canvasPanY,
        };
        setCanvasPointerMode("pan");
        document.body.style.cursor = "move";
        document.body.style.userSelect = "none";
      }
    },
    [canvasPanX, canvasPanY, guideTool],
  );

  const startLabelMove = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      labelDragRef.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        originX: labelOffsetX,
        originY: labelOffsetY,
      };
      setCanvasPointerMode("label");
      document.body.style.cursor = "move";
      document.body.style.userSelect = "none";
    },
    [labelOffsetX, labelOffsetY],
  );

  const resetCanvasView = useCallback(() => {
    setCanvasPanX(0);
    setCanvasPanY(0);
    setLabelOffsetX(0);
    setLabelOffsetY(0);
    setCanvasPointerMode("idle");
    setGuideTool("none");
  }, []);

  const handleNewProject = () => {
    setSelectedProjectId(null);
    setWizardDraftProjectId(null);
    setWizardInitialSectionIdx(0);
    setWizardSessionNonce((n) => n + 1);
    const next = { ...emptyLabelData };
    setWizardData(next);
    setWizardLabelTitle("");
    setCurrentView("newProjectWizard");
    setIsNavDrawerOpen(false);
  };

  const handleWizardSaveProgress = useCallback(
    async (args: {
      labelTitle: string;
      data: LabelData;
      existingProjectId: string | null;
    }) => {
      const name = args.labelTitle.trim() || "Rascunho";
      try {
        if (args.existingProjectId) {
          const r = await updateProject(
            args.existingProjectId,
            name,
            args.data,
          );
          if (r.success) await loadProjects();
          return {
            success: r.success,
            error: r.error,
          };
        }
        const r = await saveProject(name, args.data);
        if (r.success && r.project?.id) {
          setWizardDraftProjectId(r.project.id as string);
          await loadProjects();
          return { success: true };
        }
        return {
          success: false,
          error: r.error ?? "Não foi possível criar o rascunho.",
        };
      } catch {
        return { success: false, error: "Erro ao salvar o rascunho." };
      }
    },
    [loadProjects],
  );

  const finishWizardToEditor = useCallback(
    (result: {
      labelTitle: string;
      data: LabelData;
      projectId: string | null;
    }) => {
      setWizardDraftProjectId(null);
      setSelectedProjectId(result.projectId);
      setLabelTitle(result.labelTitle);
      setData(result.data);
      resetEditorHistoryForSession(result.data.labelBlockLayouts ?? null);
      setCurrentView("projects");
      setIsNavDrawerOpen(false);
      void loadProjects();
    },
    [resetEditorHistoryForSession, loadProjects],
  );

  const handleOpenProject = (project: any) => {
    const merged: LabelData = {
      ...emptyLabelData,
      ...project.label_data,
    };
    const wd = merged.wizardDraft;
    if (
      wd &&
      typeof wd.sectionIdx === "number" &&
      Number.isFinite(wd.sectionIdx)
    ) {
      setWizardLabelTitle(project.name ?? "");
      setWizardData(merged);
      setWizardDraftProjectId(project.id ?? null);
      setWizardInitialSectionIdx(
        Math.min(
          Math.max(0, Math.floor(wd.sectionIdx)),
          WIZARD_SECTION_COUNT - 1,
        ),
      );
      setWizardSessionNonce((n) => n + 1);
      setCurrentView("newProjectWizard");
      setIsNavDrawerOpen(false);
      return;
    }
    setWizardDraftProjectId(null);
    setLabelTitle(project.name);
    setSelectedProjectId(project.id);
    setData(stripWizardDraft(merged));
    resetEditorHistoryForSession(project.label_data?.labelBlockLayouts ?? null);
    setCurrentView("projects");
    setIsNavDrawerOpen(false);
  };

  const handleSaveProject = async () => {
    setIsSaving(true);
    try {
      if (selectedProjectId) {
        const result = await updateProject(selectedProjectId, labelTitle, data);
        if (result.success) toast.success("A label foi atualizada.");
      } else {
        const result = await saveProject(labelTitle, data);
        if (result.success) {
          if (result.project) setSelectedProjectId(result.project.id);
          toast.success("A label foi salva.");
        }
      }
    } finally {
      await loadProjects();
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProjectId) return;
    const result = await deleteProject(selectedProjectId);
    if (result.success) {
      toast.success("Projeto excluído com sucesso.");
      loadProjects();
      setCurrentView("home");
      setSelectedProjectId(null);
      setIsDeleteModalOpen(false);
    }
  };

  const handleSidebarDeleteProject = async () => {
    if (!sidebarDeleteProjectId) return;
    const result = await deleteProject(sidebarDeleteProjectId);
    if (result.success) {
      toast.success("Projeto excluído com sucesso.");
      if (selectedProjectId === sidebarDeleteProjectId) {
        setCurrentView("home");
        setSelectedProjectId(null);
      }
      loadProjects();
      setSidebarDeleteProjectId(null);
    }
  };

  const handleChange = (field: keyof LabelData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLabelPatch = useCallback((patch: Partial<LabelData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  }, []);

  const labelCanvasPxH = labelPreviewOuterHeightPx(data.proportion);

  const handleGuideCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (guideTool === "none") return;
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();

      const el = labelViewportInnerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();

      const clampX = (x: number) =>
        Math.max(0, Math.min(LABEL_PREVIEW_DESIGN_W_PX, x));
      const clampY = (y: number) => Math.max(0, Math.min(labelCanvasPxH, y));

      const toUnscaled = (clientX: number, clientY: number) => {
        const xUnscaled = (clientX - rect.left) / canvasZoom;
        const yUnscaled = (clientY - rect.top) / canvasZoom;
        return { x: clampX(xUnscaled), y: clampY(yUnscaled) };
      };

      const pt = toUnscaled(e.clientX, e.clientY);
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const orientation: GuideLineOrientation =
        guideTool === "line-h" ? "h" : "v";

      const startX = pt.x;
      const startY = pt.y;
      const draft: GuideLine = {
        id,
        orientation,
        x1: startX,
        y1: startY,
        x2: startX,
        y2: startY,
        color: GUIDE_LINE_COLOR,
        thickness: lineThickness,
      };

      guideDrawRef.current = {
        active: true,
        id,
        orientation,
        startX,
        startY,
        color: GUIDE_LINE_COLOR,
        thickness: lineThickness,
      };
      setDraftGuideLine(draft);

      const onMove = (ev: MouseEvent) => {
        const cur = guideDrawRef.current;
        if (!cur?.active) return;
        const nextPt = toUnscaled(ev.clientX, ev.clientY);
        if (cur.orientation === "h") {
          setDraftGuideLine((prev) =>
            prev
              ? {
                  ...prev,
                  x2: nextPt.x,
                  y2: cur.startY,
                }
              : prev,
          );
        } else {
          setDraftGuideLine((prev) =>
            prev
              ? {
                  ...prev,
                  x2: cur.startX,
                  y2: nextPt.y,
                }
              : prev,
          );
        }
      };

      const cleanup = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        window.removeEventListener("blur", onBlur);
      };

      const onBlur = () => {
        const cur = guideDrawRef.current;
        cleanup();
        guideDrawRef.current = null;

        if (!cur?.active) return;
        setDraftGuideLine(null);
        setGuideTool("none");
      };

      const onUp = (ev: MouseEvent) => {
        const cur = guideDrawRef.current;
        cleanup();
        guideDrawRef.current = null;

        if (!cur?.active) return;

        const finalPt = toUnscaled(ev.clientX, ev.clientY);
        const minLen = 2;
        const length =
          cur.orientation === "h"
            ? Math.abs(finalPt.x - cur.startX)
            : Math.abs(finalPt.y - cur.startY);
        if (length < minLen) {
          setDraftGuideLine(null);
          setGuideTool("none");
          return;
        }

        const finalized: GuideLine =
          cur.orientation === "h"
            ? {
                id: cur.id,
                orientation: cur.orientation,
                x1: cur.startX,
                y1: cur.startY,
                x2: finalPt.x,
                y2: cur.startY,
                color: cur.color,
                thickness: cur.thickness,
              }
            : {
                id: cur.id,
                orientation: cur.orientation,
                x1: cur.startX,
                y1: cur.startY,
                x2: cur.startX,
                y2: finalPt.y,
                color: cur.color,
                thickness: cur.thickness,
              };

        const nextLines = [...guideLinesRef.current, finalized];
        commitEditorSnapshot({
          guideLines: nextLines,
          labelBlockLayouts:
            dataRef.current.labelBlockLayouts == null
              ? null
              : structuredClone(dataRef.current.labelBlockLayouts),
        });
        setDraftGuideLine(null);
        setGuideTool("none");
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
      window.addEventListener("blur", onBlur);
    },
    [
      canvasZoom,
      guideTool,
      labelCanvasPxH,
      lineThickness,
      commitEditorSnapshot,
    ],
  );

  const NavItems = ({
    compact = false,
    variant = "default",
  }: {
    compact?: boolean;
    variant?: "default" | "glass";
  }) => {
    const glass = variant === "glass";
    return (
      <nav className="space-y-1">
        <button
          type="button"
          onClick={() => {
            setCurrentView("home");
            setIsNavDrawerOpen(false);
          }}
          className={`flex w-full items-center cursor-pointer transition-all ${
            compact ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
          } text-sm font-medium ${
            glass
              ? currentView === "home"
                ? "rounded-xl glass-nav-btn glass-nav-btn-active text-foreground"
                : "rounded-xl glass-nav-btn text-foreground/85 hover:text-foreground"
              : currentView === "home"
                ? "rounded-md bg-blue-50 text-blue-700"
                : "rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <LayoutDashboard
            className={`h-5 w-5 shrink-0 ${
              currentView === "home"
                ? glass
                  ? "text-foreground"
                  : "text-blue-600"
                : glass
                  ? "text-foreground/85"
                  : "text-gray-400"
            }`}
          />
          {!compact && <span>Início</span>}
        </button>

        <div className="flex flex-col space-y-1">
          <button
            type="button"
            onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
            className={`flex w-full items-center cursor-pointer text-sm font-medium ${
              compact
                ? "justify-center px-0 py-2.5"
                : "justify-between px-3 py-2.5"
            } ${
              glass
                ? "rounded-xl glass-nav-ghost text-foreground"
                : "rounded-md bg-gray-50 text-blue-600 transition-colors"
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
              <button
                type="button"
                onClick={handleNewProject}
                className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-medium ${
                  glass
                    ? "glass-nav-dashed text-foreground/90 hover:text-foreground"
                    : "border border-dashed border-border bg-muted/40 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                }`}
              >
                <Plus className="h-4 w-4 shrink-0 opacity-90" />
                Novo Projeto
              </button>
              {isLoading ? (
                <div
                  className={`flex items-center gap-2 px-2 py-2 text-sm ${glass ? "text-foreground/80" : "text-muted-foreground"}`}
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Carregando...</span>
                </div>
              ) : (
                projects.map((project) => {
                  const isActive =
                    currentView === "projects" &&
                    project.id === selectedProjectId;
                  return (
                    <div
                      key={project.id}
                      className={`group flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-left cursor-pointer ${
                        glass
                          ? isActive
                            ? "glass-nav-sublink glass-nav-sublink-active text-foreground"
                            : "glass-nav-sublink text-foreground/88 hover:text-foreground"
                          : isActive
                            ? "bg-blue-50/50 text-blue-700 transition-colors"
                            : "text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenProject(project)}
                        className="flex min-w-0 flex-1 cursor-pointer items-center gap-2"
                      >
                        <FileText
                          className={`h-4 w-4 shrink-0 ${
                            isActive
                              ? glass
                                ? "text-foreground"
                                : "text-blue-600"
                              : glass
                                ? "text-foreground/80"
                                : "opacity-50"
                          }`}
                        />
                        <span className="truncate">{project.name}</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsNavDrawerOpen(false);
                          setTimeout(() => {
                            setSidebarDeleteProjectId(project.id);
                            setSidebarDeleteProjectName(project.name);
                          }, 150);
                        }}
                        className="ml-auto shrink-0 cursor-pointer opacity-0 group-hover:opacity-100 transition-all rounded-md p-1 text-foreground/50 hover:text-destructive hover:bg-white/30 hover:border hover:border-white/50 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)]"
                        title="Excluir projeto"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-1">
          <button
            type="button"
            onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
            className={`flex w-full items-center cursor-pointer text-sm font-medium ${
              compact
                ? "justify-center px-0 py-2.5"
                : "justify-between px-3 py-2.5"
            } ${
              glass
                ? "rounded-xl glass-nav-ghost text-foreground"
                : "rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            }`}
          >
            <div className={`flex items-center ${compact ? "" : "gap-3"}`}>
              <Settings className="h-5 w-5 shrink-0" />
              {!compact && <span>Configurações</span>}
            </div>
            {!compact && (
              <ChevronDown
                className={`h-4 w-4 shrink-0 transition-transform duration-200 ${!glass ? "text-gray-400" : ""} ${isSettingsExpanded ? "rotate-180" : ""}`}
              />
            )}
          </button>

          {!compact && isSettingsExpanded && (
            <div className="ml-3 flex flex-col space-y-0.5 border-l border-foreground/20 py-1 pl-4 pr-1 dark:border-white/35">
              <button
                type="button"
                onClick={() => {
                  setCurrentView("importer");
                  setIsNavDrawerOpen(false);
                }}
                className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium ${
                  glass
                    ? currentView === "importer"
                      ? "glass-nav-sublink glass-nav-sublink-active text-foreground"
                      : "glass-nav-sublink text-foreground/88 hover:text-foreground"
                    : currentView === "importer"
                      ? "bg-blue-50/50 text-blue-700 transition-colors"
                      : "text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                }`}
              >
                <Ship
                  className={`h-4 w-4 shrink-0 ${
                    currentView === "importer"
                      ? glass
                        ? "text-foreground"
                        : "text-blue-600"
                      : glass
                        ? "text-foreground/80"
                        : "opacity-70"
                  }`}
                />
                <span>Importador</span>
              </button>
            </div>
          )}
        </div>
      </nav>
    );
  };
