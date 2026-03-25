"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  memo,
} from "react";
import { Rnd } from "react-rnd";
import { Upload, Barcode, Trash2 } from "lucide-react";
import type { LabelData } from "@/types/label";
import { indicationBodyFromAgeSelect } from "@/constants/age-options";
import {
  LABEL_PREVIEW_DESIGN_W_PX,
  labelBlockCanvasAreaHeightPx,
  LABEL_BLOCK_ORDER,
  type LabelBlockFmt,
  type LabelBlockId,
  type LabelBlockLayouts,
} from "@/types/label-layout";
import { cn } from "@/lib/utils";

/** Alinha posição ao grid de px antes de converter p/ % — evita “pulo” no remount do Rnd. */
function pxToLayoutPct(px: number, eff: number): number {
  return (Math.round(px) / eff) * 100;
}

type LabelBlockCanvasProps = {
  data: LabelData;
  layouts: LabelBlockLayouts;
  onLayoutsChange: (next: LabelBlockLayouts) => void;
  seloImage: string | null;
  barcodeImage: string | null;
  setSeloImage: (v: string | null) => void;
  setBarcodeImage: (v: string | null) => void;
  handleImageUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (v: string | null) => void,
  ) => void;
};

// ─── Bloco individual (Rnd + formatação) ─────────────────────────────────────

type RndBlockProps = {
  id: LabelBlockId;
  effW: number;
  effH: number;
  layoutPx: { x: number; y: number; w: number; h: number };
  fmt: LabelBlockFmt;
  isSelected: boolean;
  updateRect: (
    id: LabelBlockId,
    patch: Partial<LabelBlockLayouts[LabelBlockId]>,
  ) => void;
  onDragComplete: (id: LabelBlockId, dropX: number, dropY: number) => void;
  onSelect: (id: LabelBlockId) => void;
  onTop: (id: LabelBlockId | null) => void;
  topZ: boolean;
  children: React.ReactNode;
};

const RndBlock = memo(function RndBlock({
  id,
  effW,
  effH,
  layoutPx,
  fmt,
  isSelected,
  updateRect,
  onDragComplete,
  onSelect,
  onTop,
  topZ,
  children,
}: RndBlockProps) {
  const rndW = Math.max(1, Math.round(layoutPx.w));
  const rndH = Math.max(1, Math.round(layoutPx.h));
  const [isDragging, setIsDragging] = useState(false);

  const fmtStyle: React.CSSProperties = {
    textAlign: fmt.textAlign ?? "left",
    fontWeight: fmt.bold ? "bold" : undefined,
    fontStyle: fmt.italic ? "italic" : undefined,
    color: fmt.color ?? undefined,
  };

  return (
    <Rnd
      default={{
        x: Math.round(layoutPx.x),
        y: Math.round(layoutPx.y),
        width: rndW,
        height: rndH,
      }}
      minWidth={20}
      minHeight={10}
      dragGrid={[1, 1]}
      resizeGrid={[1, 1]}
      className={cn(
        // Não usar transition-all: o Rnd posiciona via transform; animar tudo causa salto ao soltar.
        "border border-slate-300 bg-white/95 transition-[box-shadow,border-radius] duration-150",
        isSelected
          ? "ring-2 ring-blue-500 ring-offset-0"
          : "ring-1 ring-inset ring-gray-300/80",
        isDragging && "rounded-md shadow-2xl ring-2 ring-blue-300",
      )}
      style={{ zIndex: topZ || isSelected ? 100 : 10 }}
      onDragStart={() => {
        setIsDragging(true);
        onSelect(id);
        onTop(id);
      }}
      onDragStop={(_e, d) => {
        setIsDragging(false);
        const nx = pxToLayoutPct(d.x, effW);
        const ny = pxToLayoutPct(d.y, effH);
        onDragComplete(id, nx, ny);
        onTop(null);
      }}
      onResizeStart={() => {
        onSelect(id);
        onTop(id);
      }}
      onResizeStop={(_e, _dir, el, _delta, pos) => {
        const nw = pxToLayoutPct(el.offsetWidth, effW);
        const nh = pxToLayoutPct(el.offsetHeight, effH);
        const nx = pxToLayoutPct(pos.x, effW);
        const ny = pxToLayoutPct(pos.y, effH);
        updateRect(id, { x: nx, y: ny, w: nw, h: nh });
        onTop(null);
      }}
    >
      <div
        className={cn("h-full w-full overflow-auto p-0.5")}
        style={fmtStyle}
        onMouseDown={() => onSelect(id)}
      >
        {children}
      </div>
    </Rnd>
  );
});

// ─── Canvas principal ─────────────────────────────────────────────────────────

export function LabelBlockCanvas({
  data,
  layouts,
  onLayoutsChange,
  seloImage,
  barcodeImage,
  setSeloImage,
  setBarcodeImage,
  handleImageUpload,
}: LabelBlockCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cw, setCw] = useState(0);
  const [ch, setCh] = useState(0);
  /**
   * Monta os blocos Rnd um por vez (via setTimeout de 0ms) para evitar que
   * os ~3 setState internos do react-rnd por componente (draggable.setState +
   * forceUpdate + Resizable.componentDidMount) superem o limite do React (25)
   * quando todos os 13 blocos montam ao mesmo tempo durante o commit.
   */
  const [mountedCount, setMountedCount] = useState(0);
  const [topBlockId, setTopBlockId] = useState<LabelBlockId | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<LabelBlockId | null>(
    null,
  );
  const [editingBlockId, setEditingBlockId] = useState<LabelBlockId | null>(
    null,
  );
  const layoutsRef = useRef(layouts);
  const contentRefs = useRef<
    Partial<Record<LabelBlockId, HTMLDivElement | null>>
  >({});
  layoutsRef.current = layouts;

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const apply = () => {
      const fbW = LABEL_PREVIEW_DESIGN_W_PX;
      const fbH = labelBlockCanvasAreaHeightPx(data.proportion);
      const w = el.clientWidth >= 2 ? el.clientWidth : fbW;
      const h = el.clientHeight >= 2 ? el.clientHeight : fbH;
      setCw(w);
      setCh(h);
    };
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    apply();
    return () => ro.disconnect();
  }, [data.proportion]);

  // Reinicia montagem escalonada sempre que as dimensões do canvas mudam.
  // Só começa quando cw/ch estão definidos (> 0) para garantir que defaultPosition
  // seja calculado com os valores reais do container.
  useEffect(() => {
    if (cw <= 0 || ch <= 0) return;
    setMountedCount(0);
    let cancelled = false;
    const scheduleNext = (n: number) => {
      if (cancelled || n > LABEL_BLOCK_ORDER.length) return;
      setTimeout(() => {
        if (!cancelled) {
          setMountedCount(n);
          scheduleNext(n + 1);
        }
      }, 0);
    };
    scheduleNext(1);
    return () => {
      cancelled = true;
    };
  }, [cw, ch]);

  // Desmarca o bloco selecionado ao clicar fora do canvas da label.
  useEffect(() => {
    const onWindowMouseDown = (ev: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const target = ev.target;
      if (!(target instanceof Node)) return;
      // Não desmarca quando o clique acontece na UI externa do canvas
      // (toolbar de guias/texto), para permitir aplicar formatação.
      if (target instanceof Element && target.closest("[data-canvas-ui]"))
        return;
      if (!el.contains(target)) {
        setSelectedBlockId(null);
        setEditingBlockId(null);
      }
    };
    window.addEventListener("mousedown", onWindowMouseDown);
    return () => window.removeEventListener("mousedown", onWindowMouseDown);
  }, []);

  const updateRect = useCallback(
    (id: LabelBlockId, patch: Partial<LabelBlockLayouts[LabelBlockId]>) => {
      const cur = layoutsRef.current;
      onLayoutsChange({ ...cur, [id]: { ...cur[id], ...patch } });
    },
    [onLayoutsChange],
  );

  const handleDragComplete = useCallback(
    (id: LabelBlockId, nx: number, ny: number) => {
      const moved = layoutsRef.current[id];
      onLayoutsChange({
        ...layoutsRef.current,
        [id]: { ...moved, x: nx, y: ny },
      });
    },
    [onLayoutsChange],
  );

  const updateFmt = useCallback(
    (id: LabelBlockId, patch: Partial<LabelBlockFmt>) => {
      const cur = layoutsRef.current;
      const prev = cur[id];
      onLayoutsChange({
        ...cur,
        [id]: { ...prev, fmt: { ...(prev.fmt ?? {}), ...patch } },
      });
    },
    [onLayoutsChange],
  );

  const isTextSelectionInside = useCallback(
    (blockId: LabelBlockId): boolean => {
      const el = contentRefs.current[blockId];
      if (!el) return false;
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return false;
      const anchor = sel.anchorNode;
      const focus = sel.focusNode;
      return Boolean(
        anchor && focus && el.contains(anchor) && el.contains(focus),
      );
    },
    [],
  );

  const execSelectionCommand = useCallback(
    (patch: Partial<LabelBlockFmt>) => {
      if (!selectedBlockId) return;
      document.execCommand("styleWithCSS", false, "true");
      if (patch.bold !== undefined) {
        document.execCommand("bold");
      }
      if (patch.italic !== undefined) {
        document.execCommand("italic");
      }
      if (patch.color) {
        document.execCommand("foreColor", false, patch.color);
      }
      if (patch.textAlign) {
        const cmd =
          patch.textAlign === "left"
            ? "justifyLeft"
            : patch.textAlign === "center"
              ? "justifyCenter"
              : patch.textAlign === "right"
                ? "justifyRight"
                : "justifyFull";
        document.execCommand(cmd);
      }
    },
    [selectedBlockId],
  );

  const textEditableIds: LabelBlockId[] = [
    "importerAddress",
    "origin",
    "quantity",
    "manufactureDate",
    "batch",
    "sac",
    "productName",
    "brand",
    "attention",
    "indication",
    "warning",
  ];
  const isTextBlock = (id: LabelBlockId) => textEditableIds.includes(id);

  const fallbackCanvasH = labelBlockCanvasAreaHeightPx(data.proportion);
  const effW = cw >= 2 ? cw : LABEL_PREVIEW_DESIGN_W_PX;
  const effH = ch >= 2 ? ch : fallbackCanvasH;

  const textSm = "text-[8px]";
  const textTitle = "text-[12px]";
  const textBrand = "text-[11px]";
  const textWarnHead = "text-[19px]";
  const textWarnBody = "text-[9px]";
  const textIndBody = "text-[8.5px]";
  const textAdv = "text-[8.5px]";
  const iconAlert = "h-10 w-10";

  const toPx = (r: LabelBlockLayouts[LabelBlockId]) => ({
    x: (r.x / 100) * effW,
    y: (r.y / 100) * effH,
    w: (r.w / 100) * effW,
    h: (r.h / 100) * effH,
  });

  const renderBlockContent = (id: LabelBlockId) => {
    switch (id) {
      case "seloUpload":
        return seloImage ? (
          <div
            className="relative flex h-full w-full items-center justify-center overflow-hidden group/img"
            style={{ border: "2px dashed #737373" }}
          >
            <img
              src={seloImage}
              alt="Selo"
              className="max-h-full max-w-full object-contain"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover/img:opacity-100">
              <button
                type="button"
                className="flex cursor-pointer flex-col items-center text-white hover:text-red-400"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => setSeloImage(null)}
              >
                <Trash2 className="mb-1 h-5 w-5" />
                <span className="text-[7px] font-bold uppercase">Remover</span>
              </button>
            </div>
          </div>
        ) : (
          <label
            className="flex h-full w-full cursor-pointer flex-col items-center justify-center text-gray-600 transition-colors hover:bg-black/5 hover:text-black"
            style={{ border: "2px dashed #737373" }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <input
              type="file"
              accept="image/png, image/jpeg"
              className="hidden"
              onChange={(e) => handleImageUpload(e, setSeloImage)}
            />
            <Upload className="mb-0.5 h-4 w-4" strokeWidth={1.5} />
            <span className="text-center text-[8px] font-bold uppercase leading-tight">
              Upload Imagem do Selo
              <br />
              (Proporção 5:2)
            </span>
            <span className="mt-0.5 text-center text-[7px] opacity-80">
              Formatos: PNG, JPEG
            </span>
          </label>
        );

      case "importerAddress":
        return (
          <div className={cn(textSm, "leading-tight text-black")}>
            <div>
              <strong className="font-bold">Importador:</strong>{" "}
              {data.importer ||
                "ETILUX IMPORTACAO E DISTRIBUICAO DE ARTIGOS DE CUTELARIA LTDA"}
            </div>
            <div>
              Avenida Mississippi, nº 371, Armz 01, Sala 05 - Zona Industrial
              Norte,
            </div>
            <div>Joinville - SC</div>
            <div>CEP: 89.219-507 / CNPJ: 50.306.471/0008-77</div>
          </div>
        );

      case "origin":
        return (
          <div className={cn(textSm, "leading-tight text-black")}>
            <strong className="font-bold">Origem:</strong>{" "}
            {data.origin || "CHINA"}
          </div>
        );

      case "quantity":
        return (
          <div className={cn(textSm, "leading-tight text-black")}>
            <strong className="font-bold">Quantidade:</strong>{" "}
            {data.quantity || "1 Conjunto c/ 02 Peças"}
          </div>
        );

      case "manufactureDate":
        return (
          <div className={cn(textSm, "leading-tight text-black")}>
            <strong className="font-bold">Data de Fabricação:</strong>{" "}
            {data.manufactureDate || "Outubro/2025"}
          </div>
        );

      case "batch":
        return (
          <div className={cn(textSm, "leading-tight text-black")}>
            <strong className="font-bold">Lote:</strong>{" "}
            {data.batch || "202510"} / Data de validade:{" "}
            {data.isExpiryIndeterminate
              ? "Indeterminado"
              : data.expiryDate || "Indeterminado"}
          </div>
        );

      case "sac":
        return (
          <div className={cn(textSm, "leading-tight text-black")}>
            <strong className="font-bold">SAC:</strong> sac@etilux.com.br - 4007
            1322 - Capitais e grandes cidades - 0800 607 1322 - Demais regiões
          </div>
        );

      case "productName":
        return (
          <div
            className={cn(
              textTitle,
              "font-extrabold uppercase leading-tight text-black",
            )}
          >
            {data.code || "YD-920"} - BRINQUEDO CONJUNTO{" "}
            {data.productName?.toUpperCase() ||
              "TOY SET - PLASTIC SPINNING TOP"}
          </div>
        );

      case "brand":
        return (
          <div
            className={cn(
              textBrand,
              "font-black uppercase tracking-wider text-black",
            )}
          >
            MARCA: {data.brand || "ETITOYS"}
          </div>
        );

      case "barcodeUpload":
        return barcodeImage ? (
          <div
            className="relative flex h-full w-full items-center justify-center overflow-hidden bg-white group/img"
            style={{ border: "2px dashed #737373" }}
          >
            <img
              src={barcodeImage}
              alt="Barcode"
              className="max-h-full max-w-full object-contain mix-blend-multiply"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover/img:opacity-100">
              <button
                type="button"
                className="flex cursor-pointer flex-col items-center text-white hover:text-red-400"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => setBarcodeImage(null)}
              >
                <Trash2 className="mb-1 h-5 w-5" />
                <span className="text-[7px] font-bold uppercase">Remover</span>
              </button>
            </div>
          </div>
        ) : (
          <label
            className="flex h-full w-full cursor-pointer flex-col items-center justify-center text-gray-600 hover:bg-black/5 hover:text-black"
            style={{ border: "2px dashed #737373" }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <input
              type="file"
              accept="image/png, image/jpeg"
              className="hidden"
              onChange={(e) => handleImageUpload(e, setBarcodeImage)}
            />
            <Barcode className="mb-0.5 h-5 w-5" strokeWidth={1.5} />
            <span className="text-[8px] font-bold uppercase">
              Upload Código de Barras
            </span>
            <span className="mt-0.5 text-[7px] opacity-80">
              Formatos: PNG, JPEG
            </span>
          </label>
        );

      case "attention":
        return (
          <div className="flex h-full w-full gap-2 text-black">
            <div
              className={cn("shrink-0 overflow-hidden", iconAlert)}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <img
                src="/assets/chorão_para_fundo_branco.webp"
                alt=""
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-black uppercase tracking-wide text-black">
                <div className={cn(textWarnHead, "leading-none", "text-red-600")}>
                  ATENÇÃO!
                </div>
              </div>
              <div
                className={cn(
                  textWarnBody,
                  "mt-1 font-medium leading-[1.15] text-gray-900",
                )}
              >
                NÃO RECOMENDÁVEL PARA CRIANÇAS MENORES DE{" "}
                {data.functionType === "MANUAL" ? "03 (TRÊS)" : "03"} ANOS POR
                CONTER PARTES PEQUENAS QUE PODEM SER ENGOLIDAS OU ASPIRADAS.
                ESTE PRODUTO DEVE SER MONTADO POR UM ADULTO ANTES DE SER
                ENTREGUE À CRIANÇA.
              </div>
            </div>
          </div>
        );

      case "indication":
        return (
          <div className="uppercase leading-tight text-black">
            <span className={cn(textWarnHead, "font-bold", "text-red-600")}>
              INDICAÇÃO!
            </span>
            <span
              className={cn(textIndBody, "mt-1 block font-medium normal-case")}
            >
              {indicationBodyFromAgeSelect(data.ageIndication ?? "")}
            </span>
            {(data.certifierAgeRestriction ?? "").trim() !== "" && (
              <span
                className={cn(
                  textIndBody,
                  "mt-1 block font-medium normal-case",
                )}
              >
                RESTRIÇÃO DE IDADE (ÓRGÃO CERTIFICADOR):{" "}
                {data.certifierAgeRestriction}.
              </span>
            )}
          </div>
        );

      case "warning":
        return (
          <div className="text-black">
            <div
              className={cn(
                textWarnHead,
                "mb-1 font-bold uppercase",
                "text-red-600",
              )}
            >
              ADVERTÊNCIA!
            </div>
            <div
              className={cn(textAdv, "font-medium leading-[1.2] text-gray-800")}
            >
              COMO RETIRAR E COMO COLOCAR AS PILHAS E AS BATERIAS SUBSTITUÍVEIS:
              AS PILHAS NÃO DEVEM SER RECARREGADAS; AS BATERIAS DEVEM SER
              RETIRADAS DO BRINQUEDO ANTES DE SEREM RECARREGADAS; AS BATERIAS
              SOMENTE DEVEM SER RECARREGADAS SOB A SUPERVISÃO DE UM ADULTO;
              DIFERENTES TIPOS DE PILHAS E BATERIAS NOVAS E USADAS NÃO DEVEM SER
              MISTURADAS; SÓ DEVEM SER USADAS PILHAS E BATERIAS DO TIPO
              RECOMENDADO OU UM SIMILAR; AS PILHAS E BATERIAS DEVEM SER
              COLOCADAS RESPEITANDO A POLARIDADE; AS PILHAS E BATERIAS
              DESCARREGADAS DEVEM SER RETIRADAS DO BRINQUEDO; OS TERMINAIS DE
              UMA PILHA OU BATERIA NÃO DEVEM SER COLOCADOS EM CURTO-CIRCUITO.
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Expõe seleção + formatter para toolbar externa (na lateral direita do editor).
  useEffect(() => {
    const updateSelectedFmt = (patch: Partial<LabelBlockFmt>) => {
      if (!selectedBlockId) return;

      const applyToSelection =
        editingBlockId === selectedBlockId &&
        isTextSelectionInside(selectedBlockId);

      if (applyToSelection) {
        execSelectionCommand(patch);
        return;
      }

      updateFmt(selectedBlockId, patch);
    };
    window.dispatchEvent(
      new CustomEvent("label-block-selection-change", {
        detail: {
          selectedBlockId,
          fmt: selectedBlockId ? (layouts[selectedBlockId].fmt ?? {}) : null,
          onUpdateFmt: updateSelectedFmt,
          isTextSelectionMode: Boolean(
            selectedBlockId && editingBlockId === selectedBlockId,
          ),
        },
      }),
    );
  }, [
    selectedBlockId,
    editingBlockId,
    layouts,
    updateFmt,
    isTextSelectionInside,
    execSelectionCommand,
  ]);

  return (
    <div
      ref={containerRef}
      className="relative h-full min-h-[120px] w-full overflow-visible"
      onMouseDown={(e) => {
        if (e.target === containerRef.current) setSelectedBlockId(null);
      }}
    >
      {/* ── Blocos arrastáveis (montados um por vez para evitar cascade) ─ */}
      {LABEL_BLOCK_ORDER.slice(0, mountedCount).map((id) => {
        const r = layouts[id];
        const layoutPx = toPx(r);
        /**
         * Rnd é completamente não-controlado (defaultSize + defaultPosition).
         * Key baseado nas coordenadas em % → re-mount automático quando
         * a posição ou dimensão mudam via snap ou drag, sem causar
         * "Maximum update depth exceeded" (evita position/size controlados).
         */
        // Precisão em centésimos de % evita colisão de key e Rnd “preso” com layout desatualizado.
        const rndKey = `${id}-${Math.round(r.x * 100)}-${Math.round(r.y * 100)}-${Math.round(r.w * 100)}-${Math.round(r.h * 100)}`;
        return (
          <RndBlock
            key={rndKey}
            id={id}
            effW={effW}
            effH={effH}
            layoutPx={layoutPx}
            fmt={r.fmt ?? {}}
            isSelected={selectedBlockId === id}
            updateRect={updateRect}
            onDragComplete={handleDragComplete}
            onSelect={setSelectedBlockId}
            onTop={setTopBlockId}
            topZ={topBlockId === id}
          >
            <div
              ref={(el) => {
                contentRefs.current[id] = el;
              }}
              className={cn(
                "h-full w-full overflow-auto p-0.5",
                isTextBlock(id) && editingBlockId === id && "cursor-text",
                r.fmt?.bold && "[&_*]:!font-bold",
              )}
              contentEditable={isTextBlock(id) && editingBlockId === id}
              suppressContentEditableWarning
              onMouseDown={() => {
                setSelectedBlockId(id);
                if (editingBlockId !== id) setEditingBlockId(null);
              }}
              onDoubleClick={() => {
                if (!isTextBlock(id)) return;
                setSelectedBlockId(id);
                setEditingBlockId(id);
                const el = contentRefs.current[id];
                el?.focus();
              }}
              onBlur={() => {
                if (editingBlockId === id) setEditingBlockId(null);
              }}
            >
              {renderBlockContent(id)}
            </div>
          </RndBlock>
        );
      })}
    </div>
  );
}
