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
import { UserButton, useAuthenticate } from "@neondatabase/auth/react";

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
  const { data: session } = useAuthenticate({ enabled: true });
  const user = session?.user;
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
    if (!user) return;
    setIsLoading(true);
    const result = await getProjects();
    setProjects(result);
    setIsLoading(false);
  }, [user]);

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
      if (!user) {
        return { success: false, error: "Faça login para salvar o rascunho." };
      }
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
    [user, loadProjects],
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
    if (!user) return;
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
                          setSidebarDeleteProjectId(project.id);
                          setSidebarDeleteProjectName(project.name);
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

  /* ─── EDITOR VIEW (project open) ─── */
  if (currentView === "projects") {
    return (
      <div className="relative flex h-screen w-full flex-col overflow-hidden bg-card font-sans text-foreground">
        <AppGradientLayer idPrefix="editor-shell" />

        {/* Top Bar */}
        <header className="relative z-30 flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border/70 bg-background/65 px-3 backdrop-blur-xl">
          {/* Left: back */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setCurrentView("home")}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Voltar ao início"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="mx-1 h-5 w-px bg-border" />
          </div>

          {/* Center: project title */}
          <div className="flex flex-1 items-center justify-center min-w-0">
            <input
              type="text"
              value={labelTitle}
              onChange={(e) => setLabelTitle(e.target.value)}
              className="w-full max-w-xs truncate border-b border-transparent bg-transparent px-2 py-0.5 text-center text-sm font-semibold text-foreground transition-colors hover:border-border focus:border-primary focus:outline-none"
              placeholder="Nome do Projeto..."
            />
          </div>

          {/* Right: actions + user */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => void handleSaveProject()}
              disabled={isSaving}
              className="flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-border bg-background/80 px-3 text-xs font-semibold text-primary shadow-sm transition-colors hover:border-primary/30 hover:bg-primary/10 disabled:pointer-events-none disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Salvar
            </button>
            <button
              onClick={() => void labelPreviewRef.current?.exportDocx()}
              className="flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-border bg-background/80 px-3 text-xs font-semibold text-emerald-600 shadow-sm transition-colors hover:border-emerald-500/40 hover:bg-emerald-500/10 dark:text-emerald-400"
            >
              <Download className="h-3.5 w-3.5" />
              Exportar
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-border bg-background/80 px-3 text-xs font-semibold text-destructive shadow-sm transition-colors hover:border-destructive/40 hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Excluir
            </button>
          </div>
        </header>

        {/* Body */}
        <div className="relative z-10 flex flex-1 overflow-hidden">
          {/* Sidebar colapsável */}
          <aside
            onMouseEnter={() => setIsSidebarCollapsed(false)}
            onMouseLeave={() => setIsSidebarCollapsed(true)}
            className={`liquid-glass-sidebar flex h-full shrink-0 flex-col transition-all duration-300 ${isSidebarCollapsed ? "w-16 p-2" : "w-64 p-4"}`}
          >
            <div
              className={`flex items-center pb-3 ${isSidebarCollapsed ? "justify-center" : "gap-2.5 px-1"}`}
            >
              {!isSidebarCollapsed && (
                <>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center text-primary drop-shadow-sm">
                    <SidebarLogoHex className="h-9 w-9" />
                  </div>
                  <span className="text-base font-bold leading-tight tracking-tight text-foreground">
                    LabelStudio Elite
                  </span>
                </>
              )}
            </div>
            <div className="-mr-1 flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
              <NavItems variant="glass" compact={isSidebarCollapsed} />
            </div>
            <div className="mt-4 flex shrink-0 items-center border-t border-border/40 pt-4">
              <div className="glass-user-wrap rounded-xl p-0.5 [&_*]:cursor-pointer">
                <UserButton size="icon" />
              </div>
            </div>
          </aside>
          <aside
            className="flex shrink-0 flex-col overflow-y-auto border-r border-border/60 bg-background/50 backdrop-blur-xl"
            style={{ width: formColumnWidth }}
          >
            <div className="p-5">
              <ModelConfig
                data={data}
                onChange={handleChange}
                onLabelPatch={handleLabelPatch}
              />
            </div>
          </aside>

          {/* Divisor redimensionável */}
          <button
            type="button"
            aria-label="Redimensionar painel do formulário"
            onMouseDown={startResizeFormColumn}
            className="group relative z-10 w-1.5 shrink-0 cursor-col-resize border-0 bg-transparent p-0 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border group-hover:bg-muted-foreground/40" />
          </button>

          {/* Canvas: fundo em grade + zoom + pan */}
          <main
            ref={canvasMainRef}
            onMouseDownCapture={startCanvasPan}
            className={`relative flex-1 overflow-hidden select-none ${
              canvasPointerMode === "idle" && (spaceHeld || altHeld)
                ? "cursor-move"
                : ""
            } ${
              canvasPointerMode === "pan" || canvasPointerMode === "label"
                ? "cursor-move"
                : ""
            }`}
            style={{
              backgroundColor: CANVAS_BG,
              backgroundImage:
                "radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
              backgroundSize: `${DOT_GRID_BASE * canvasZoom}px ${DOT_GRID_BASE * canvasZoom}px`,
              backgroundPosition: `${canvasPanX}px ${canvasPanY}px`,
            }}
          >
            <div className="pointer-events-auto absolute inset-0 overflow-hidden">
              <div
                className="absolute left-1/2 top-1/2"
                style={{
                  transform: `translate(calc(-50% + ${canvasPanX}px), calc(-50% + ${canvasPanY}px)) translate(${labelOffsetX}px, ${labelOffsetY}px)`,
                }}
              >
                <div className="flex flex-col items-center gap-1">
                  <button
                    type="button"
                    data-label-drag-handle
                    title="Arrastar para mover a etiqueta no canvas"
                    onMouseDown={startLabelMove}
                    className="flex h-7 w-[min(100%,11rem)] shrink-0 cursor-grab items-center justify-center gap-1.5 rounded-md border border-white/15 bg-zinc-800/90 px-2 text-[10px] font-medium text-zinc-400 shadow-md hover:border-white/25 hover:bg-zinc-800 hover:text-zinc-200 active:cursor-grabbing"
                  >
                    <GripHorizontal
                      className="h-3.5 w-3.5 opacity-70"
                      aria-hidden
                    />
                    Mover etiqueta
                  </button>
                  {/*
                    zoom no CSS quebra ResizeObserver/react-rnd dentro da label.
                    scale() + tamanho explícito mantém medições em px reais.
                  */}
                  <div
                    className="shrink-0 shadow-2xl"
                    style={{
                      width: LABEL_PREVIEW_DESIGN_W_PX * canvasZoom,
                      height: labelCanvasPxH * canvasZoom,
                    }}
                  >
                    <div
                      ref={labelViewportInnerRef}
                      className="relative"
                      style={{
                        width: LABEL_PREVIEW_DESIGN_W_PX,
                        height: labelCanvasPxH,
                        transform: `scale(${canvasZoom})`,
                        transformOrigin: "top left",
                      }}
                    >
                      <LabelPreview
                        ref={labelPreviewRef}
                        data={data}
                        onLabelBlockLayoutsChange={
                          handleLabelBlockLayoutsChange
                        }
                      />

                      {(guideLines.length > 0 || draftGuideLine) && (
                        <svg
                          className="pointer-events-none absolute inset-0 z-[6]"
                          width="100%"
                          height="100%"
                        >
                          {guideLines.map((l) => (
                            <line
                              key={l.id}
                              x1={l.x1}
                              y1={l.y1}
                              x2={l.x2}
                              y2={l.y2}
                              stroke={l.color}
                              strokeWidth={l.thickness}
                              strokeLinecap="round"
                              opacity={0.95}
                            />
                          ))}
                          {draftGuideLine && (
                            <line
                              x1={draftGuideLine.x1}
                              y1={draftGuideLine.y1}
                              x2={draftGuideLine.x2}
                              y2={draftGuideLine.y2}
                              stroke={draftGuideLine.color}
                              strokeWidth={draftGuideLine.thickness}
                              strokeLinecap="round"
                              opacity={0.6}
                              strokeDasharray="6 5"
                            />
                          )}
                        </svg>
                      )}

                      {/* Camada clicável para inserir guias */}
                      <div
                        onMouseDown={handleGuideCanvasMouseDown}
                        className={`absolute inset-0 z-[10] ${
                          guideTool === "none"
                            ? "pointer-events-none cursor-default"
                            : "pointer-events-auto cursor-crosshair"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Toolbar de guias (linhas, réguas) */}
            <div
              data-canvas-ui
              className="pointer-events-auto absolute right-4 top-16 z-20 flex w-40 flex-col gap-3"
            >
              <div className="w-40 rounded-lg border border-white/10 bg-[#252526]/95 px-2 py-2 shadow-lg backdrop-blur-sm">
                <div className="px-2 text-[10px] font-semibold text-zinc-300">
                  Guias
                </div>
                <div className="mt-2 flex flex-col gap-2">
                  <div className="px-1">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] text-zinc-300">Espessura</div>
                      <div className="text-[10px] text-zinc-200 tabular-nums">
                        {lineThickness}px
                      </div>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={8}
                      step={1}
                      value={lineThickness}
                      onChange={(e) => setLineThickness(Number(e.target.value))}
                      className="w-full mt-1 accent-blue-500"
                      aria-label="Espessura da linha"
                    />
                  </div>

                  <button
                    type="button"
                    title="Linha horizontal: clique e arraste para definir local e comprimento"
                    onClick={() => {
                      setGuideTool((t) => (t === "line-h" ? "none" : "line-h"));
                    }}
                    className={`flex h-8 items-center justify-start rounded-md border px-2 text-[12px] transition-colors ${
                      guideTool === "line-h"
                        ? "border-blue-400/60 bg-blue-500/10 text-blue-200"
                        : "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                    }`}
                  >
                    Linha Horizontal
                  </button>
                  <button
                    type="button"
                    title="Linha vertical: clique e arraste para definir local e comprimento"
                    onClick={() => {
                      setGuideTool((t) => (t === "line-v" ? "none" : "line-v"));
                    }}
                    className={`flex h-8 items-center justify-start rounded-md border px-2 text-[12px] transition-colors ${
                      guideTool === "line-v"
                        ? "border-blue-400/60 bg-blue-500/10 text-blue-200"
                        : "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                    }`}
                  >
                    Linha Vertical
                  </button>
                  <button
                    type="button"
                    title="Limpar guias"
                    onClick={() => {
                      commitEditorSnapshot({
                        guideLines: [],
                        labelBlockLayouts:
                          dataRef.current.labelBlockLayouts == null
                            ? null
                            : structuredClone(
                                dataRef.current.labelBlockLayouts,
                              ),
                      });
                      setGuideTool("none");
                    }}
                    className="flex h-8 items-center justify-start rounded-md border border-white/10 bg-red-500/0 px-2 text-[12px] text-zinc-200 hover:bg-red-500/10 transition-colors"
                  >
                    Limpar
                  </button>

                  <button
                    type="button"
                    title="Resetar layout para o padrão"
                    onClick={() => setIsResetLayoutModalOpen(true)}
                    className="mt-2 flex h-8 items-center justify-start rounded-md border border-orange-400/30 bg-orange-500/10 px-2 text-[12px] text-orange-200 hover:bg-orange-500/20 transition-colors"
                  >
                    <RotateCcw className="mr-2 h-3 w-3" />
                    Resetar Layout
                  </button>

                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      title="Desfazer: guias e layout da etiqueta (Ctrl+Z)"
                      onClick={() => undoEditor()}
                      disabled={!canUndo}
                      className={`flex-1 h-8 items-center justify-center rounded-md border px-2 text-[12px] transition-colors ${
                        canUndo
                          ? "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                          : "border-white/5 bg-white/0 text-zinc-500 cursor-not-allowed"
                      }`}
                    >
                      Desfazer
                    </button>
                    <button
                      type="button"
                      title="Refazer: guias e layout da etiqueta (Ctrl+Shift+Z)"
                      onClick={() => redoEditor()}
                      disabled={!canRedo}
                      className={`flex-1 h-8 items-center justify-center rounded-md border px-2 text-[12px] transition-colors ${
                        canRedo
                          ? "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                          : "border-white/5 bg-white/0 text-zinc-500 cursor-not-allowed"
                      }`}
                    >
                      Refazer
                    </button>
                  </div>
                </div>
              </div>

              <div className="w-40 rounded-lg border border-white/10 bg-[#252526]/95 px-2 py-2 shadow-lg backdrop-blur-sm">
                <div className="px-2 text-[10px] font-semibold text-zinc-300">
                  Texto
                </div>
                {selectedTextTools.selectedBlockId &&
                selectedTextTools.fmt &&
                selectedTextTools.onUpdateFmt ? (
                  <div className="mt-2 flex flex-col gap-2">
                    <div className="rounded border border-white/10 bg-white/5 px-1.5 py-1 text-[10px] leading-snug text-zinc-400">
                      {selectedTextTools.isTextSelectionMode
                        ? "Duplo clique ativo: formata apenas o texto selecionado."
                        : "Clique simples: formata todo o texto do elemento."}
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      <button
                        type="button"
                        title="Alinhar à esquerda"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() =>
                          selectedTextTools.onUpdateFmt?.({ textAlign: "left" })
                        }
                        className={`h-7 rounded border text-[11px] ${
                          (selectedTextTools.fmt.textAlign ?? "left") === "left"
                            ? "border-blue-400/60 bg-blue-500/10 text-blue-200"
                            : "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                        }`}
                      >
                        <AlignLeft className="mx-auto h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="Centralizar"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() =>
                          selectedTextTools.onUpdateFmt?.({
                            textAlign: "center",
                          })
                        }
                        className={`h-7 rounded border text-[11px] ${
                          selectedTextTools.fmt.textAlign === "center"
                            ? "border-blue-400/60 bg-blue-500/10 text-blue-200"
                            : "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                        }`}
                      >
                        <AlignCenter className="mx-auto h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="Justificar"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() =>
                          selectedTextTools.onUpdateFmt?.({
                            textAlign: "justify",
                          })
                        }
                        className={`h-7 rounded border text-[11px] ${
                          selectedTextTools.fmt.textAlign === "justify"
                            ? "border-blue-400/60 bg-blue-500/10 text-blue-200"
                            : "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                        }`}
                      >
                        <AlignJustify className="mx-auto h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="Alinhar à direita"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() =>
                          selectedTextTools.onUpdateFmt?.({
                            textAlign: "right",
                          })
                        }
                        className={`h-7 rounded border text-[11px] ${
                          selectedTextTools.fmt.textAlign === "right"
                            ? "border-blue-400/60 bg-blue-500/10 text-blue-200"
                            : "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                        }`}
                      >
                        <AlignRight className="mx-auto h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        type="button"
                        title="Negrito"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() =>
                          selectedTextTools.onUpdateFmt?.({
                            bold: !selectedTextTools.fmt?.bold,
                          })
                        }
                        className={`h-7 rounded border text-[11px] font-bold ${
                          selectedTextTools.fmt.bold
                            ? "border-blue-400/60 bg-blue-500/10 text-blue-200"
                            : "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                        }`}
                      >
                        <Bold className="mx-auto h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="Itálico"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() =>
                          selectedTextTools.onUpdateFmt?.({
                            italic: !selectedTextTools.fmt?.italic,
                          })
                        }
                        className={`h-7 rounded border text-[11px] italic ${
                          selectedTextTools.fmt.italic
                            ? "border-blue-400/60 bg-blue-500/10 text-blue-200"
                            : "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                        }`}
                      >
                        <Italic className="mx-auto h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 rounded-md border border-white/10 bg-white/5 px-2 py-2 text-[10px] leading-snug text-zinc-400">
                    Selecione um elemento da label para editar o texto.
                  </div>
                )}
              </div>
            </div>

            {/* Controles de zoom */}
            <div
              data-canvas-ui
              className="pointer-events-auto absolute bottom-4 left-4 z-10 flex items-center gap-1 rounded-lg border border-white/10 bg-[#252526]/95 px-1.5 py-1 shadow-lg backdrop-blur-sm"
            >
              <button
                type="button"
                title="Diminuir zoom"
                className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-300 hover:bg-white/10 hover:text-white"
                onClick={() =>
                  setCanvasZoom((z) =>
                    Math.max(ZOOM_MIN, Math.round((z - ZOOM_STEP) * 100) / 100),
                  )
                }
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                type="button"
                title="Restaurar 100%"
                className="min-w-[3.25rem] px-1 text-center text-xs font-medium tabular-nums text-zinc-300 hover:text-white"
                onClick={() => setCanvasZoom(1)}
              >
                {Math.round(canvasZoom * 100)}%
              </button>
              <button
                type="button"
                title="Aumentar zoom"
                className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-300 hover:bg-white/10 hover:text-white"
                onClick={() =>
                  setCanvasZoom((z) =>
                    Math.min(ZOOM_MAX, Math.round((z + ZOOM_STEP) * 100) / 100),
                  )
                }
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <div className="mx-0.5 h-5 w-px bg-white/15" aria-hidden />
              <button
                type="button"
                title="Repor posição do canvas e da etiqueta (mantém o zoom)"
                className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-300 hover:bg-white/10 hover:text-white"
                onClick={resetCanvasView}
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            <p
              data-canvas-ui
              className="pointer-events-none absolute right-4 top-4 z-10 max-w-[15rem] text-right text-[10px] leading-snug text-zinc-500"
            >
              Ctrl + rolagem: zoom · Espaço ou Alt + arrastar: mover canvas ·
              Botão do meio: mover canvas · Arrastar a barra acima da label para
              mover a etiqueta
            </p>
          </main>
        </div>

        <ExpandableChatDemo />
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteProject}
          title="Excluir Projeto"
          description={`Você tem certeza que deseja excluir o projeto "${labelTitle}"? Esta ação não pode ser desfeita.`}
        />
        <ConfirmationModal
          isOpen={!!sidebarDeleteProjectId}
          onClose={() => setSidebarDeleteProjectId(null)}
          onConfirm={handleSidebarDeleteProject}
          title="Excluir Projeto"
          description={`Você tem certeza que deseja excluir o projeto "${sidebarDeleteProjectName}"? Esta ação não pode ser desfeita.`}
        />
        <ConfirmationModal
          isOpen={isResetLayoutModalOpen}
          onClose={() => setIsResetLayoutModalOpen(false)}
          onConfirm={() => {
            const defaultLayouts = getDefaultLabelBlockLayouts(data.proportion);
            commitEditorSnapshot({
              guideLines: structuredClone(guideLinesRef.current),
              labelBlockLayouts: structuredClone(defaultLayouts),
            });
          }}
          title="Resetar Layout"
          description="Deseja resetar o layout para o padrão? Suas posições manuais serão perdidas."
          confirmText="Resetar"
          cancelText="Cancelar"
        />
      </div>
    );
  }

  /* ─── NEW PROJECT WIZARD (full-screen) ─── */
  if (currentView === "newProjectWizard") {
    return (
      <NewProjectWizard
        key={`wizard-${wizardSessionNonce}`}
        initialLabelTitle={wizardLabelTitle}
        initialData={wizardData}
        initialSectionIdx={wizardInitialSectionIdx}
        draftProjectId={wizardDraftProjectId}
        onSaveProgress={handleWizardSaveProgress}
        onCancel={() => setCurrentView("home")}
        onFinish={(result) => finishWizardToEditor(result)}
      />
    );
  }

  /* ─── HOME / IMPORTER VIEW ─── */
  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-card font-sans text-foreground">
      <AppGradientLayer idPrefix="app-shell" />

      <div className="relative z-10 flex min-h-0 flex-1 overflow-hidden">
        <aside className="liquid-glass-sidebar flex h-full w-64 shrink-0 flex-col p-4">
          <div className="flex items-center gap-2.5 px-1 pb-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center text-primary drop-shadow-sm">
              <SidebarLogoHex className="h-9 w-9" />
            </div>
            <span className="text-base font-bold leading-tight tracking-tight text-foreground">
              LabelStudio Elite
            </span>
          </div>
          <div className="-mr-1 flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
            <NavItems variant="glass" />
          </div>
          <div className="mt-4 flex shrink-0 items-center border-t border-border/40 pt-4">
            <div className="glass-user-wrap rounded-xl p-0.5 [&_*]:cursor-pointer">
              <UserButton size="icon" />
            </div>
          </div>
        </aside>

        <main className="flex-1 min-h-0 overflow-hidden flex flex-col bg-transparent">
          {currentView === "home" ? (
            <Home
              displayName={
                user?.name?.trim() ||
                user?.email?.split("@")[0]?.trim() ||
                undefined
              }
              lastProject={projects[0]}
              onCreateNew={handleNewProject}
              onOpenProject={(p) => handleOpenProject(p)}
              onOpenImporter={() => setCurrentView("importer")}
            />
          ) : (
            <ImporterManager />
          )}
        </main>
      </div>

      <ExpandableChatDemo />
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteProject}
        title="Excluir Projeto"
        description={`Você tem certeza que deseja excluir o projeto "${labelTitle}"? Esta ação não pode ser desfeita.`}
      />
      <ConfirmationModal
        isOpen={!!sidebarDeleteProjectId}
        onClose={() => setSidebarDeleteProjectId(null)}
        onConfirm={handleSidebarDeleteProject}
        title="Excluir Projeto"
        description={`Você tem certeza que deseja excluir o projeto "${sidebarDeleteProjectName}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}
