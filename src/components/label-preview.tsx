"use client";

import {
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import { LabelData } from "@/types/label";
import { labelLoteValidadeLine, labelProductTitleLine } from "@/lib/label-field-display";
import { indicationBodyFromAgeSelect } from "@/constants/age-options";
import type { LabelBlockLayouts } from "@/types/label-layout";
import { mergeLabelBlockLayouts } from "@/types/label-layout";
import { LabelBlockCanvas } from "@/components/label-block-canvas";

import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  WidthType,
  BorderStyle,
  TextRun,
  ImageRun,
  AlignmentType,
  HeightRule,
  VerticalAlign,
} from "docx";
import { saveAs } from "file-saver";

export interface LabelPreviewHandle {
  exportDocx: () => Promise<void>;
}

type LabelPreviewProps = {
  data: LabelData;
  /** Persiste posição/tamanho dos blocos da etiqueta. */
  onLabelBlockLayoutsChange?: (layouts: LabelBlockLayouts) => void;
};

export const LabelPreview = forwardRef<LabelPreviewHandle, LabelPreviewProps>(
  function LabelPreview({ data, onLabelBlockLayoutsChange }, ref) {
    const [seloImage, setSeloImage] = useState<string | null>(null);
    const [barcodeImage, setBarcodeImage] = useState<string | null>(null);

    const mergedBlockLayouts = useMemo(
      () =>
        mergeLabelBlockLayouts(data.proportion, data.labelBlockLayouts ?? null),
      [data.proportion, data.labelBlockLayouts],
    );

    const handleLayoutsChange = useCallback(
      (next: LabelBlockLayouts) => {
        onLabelBlockLayoutsChange?.(next);
      },
      [onLabelBlockLayoutsChange],
    );

    const handleImageUpload = (
      e: React.ChangeEvent<HTMLInputElement>,
      setter: (val: string | null) => void,
    ) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setter(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    };

    useImperativeHandle(ref, () => ({ exportDocx: handleExportDocx }));

    async function handleExportDocx() {
      // Helper to load image for docx
      const loadImage = async (dataUrl: string) => {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        return blob.arrayBuffer();
      };

      const isSquare = data.proportion === "1:1 (Quadrado)";
      const baseSpacing = isSquare ? 300 : 100;

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: { top: 720, right: 720, bottom: 720, left: 720 },
              },
            },
            children: [
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    height: isSquare
                      ? { value: 6000, rule: HeightRule.ATLEAST }
                      : undefined,
                    children: [
                      // Left Cell
                      new TableCell({
                        width: { size: 50, type: WidthType.PERCENTAGE },
                        // Cria "respiro" horizontal antes da linha divisória central.
                        margins: { right: 80 },
                        borders: {
                          top: {
                            style: BorderStyle.SINGLE,
                            size: 3,
                            color: "000000",
                          },
                          left: {
                            style: BorderStyle.SINGLE,
                            size: 3,
                            color: "000000",
                          },
                          right: {
                            style: BorderStyle.SINGLE,
                            size: 1,
                            color: "000000",
                          },
                          bottom: { style: BorderStyle.NONE },
                        },
                        shading: { fill: "FFFFFF" },
                        children: [
                          // Selo Image
                          ...(seloImage
                            ? [
                                new Paragraph({
                                  children: [
                                    new ImageRun({
                                      data: await loadImage(seloImage),
                                      transformation: {
                                        width: 140,
                                        height: 50,
                                      },
                                      // @ts-ignore
                                      type: "png",
                                    }),
                                  ],
                                  alignment: AlignmentType.CENTER,
                                  spacing: { before: baseSpacing },
                                }),
                              ]
                            : []),
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: "Importador: ",
                                bold: true,
                                size: 14,
                              }),
                              new TextRun({
                                text: data.importer,
                                size: 14,
                              }),
                            ],
                            spacing: { before: baseSpacing },
                          }),
                          ...(data.importerAddressStreet
                            ? [
                                new Paragraph({
                                  children: [
                                    new TextRun({
                                      text: data.importerAddressStreet,
                                      size: 14,
                                    }),
                                  ],
                                }),
                              ]
                            : []),
                          ...(data.importerAddressCityState
                            ? [
                                new Paragraph({
                                  children: [
                                    new TextRun({
                                      text: data.importerAddressCityState,
                                      size: 14,
                                    }),
                                  ],
                                }),
                              ]
                            : []),
                          ...(data.importerAddressPostal
                            ? [
                                new Paragraph({
                                  children: [
                                    new TextRun({
                                      text: data.importerAddressPostal,
                                      size: 14,
                                    }),
                                  ],
                                }),
                              ]
                            : []),
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: "Origem: ",
                                bold: true,
                                size: 14,
                              }),
                              new TextRun({
                                text: data.origin,
                                size: 14,
                              }),
                            ],
                            border: {
                              bottom: {
                                style: BorderStyle.SINGLE,
                                size: 1,
                                color: "000000",
                              },
                            },
                            spacing: { after: baseSpacing },
                          }),

                          new Paragraph({
                            children: [
                              new TextRun({
                                text: "Quantidade: ",
                                bold: true,
                                size: 14,
                              }),
                              new TextRun({
                                text: data.quantity,
                                size: 14,
                              }),
                            ],
                            spacing: { before: baseSpacing },
                          }),
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: "Data de Fabricação: ",
                                bold: true,
                                size: 14,
                              }),
                              new TextRun({
                                text: data.manufactureDate,
                                size: 14,
                              }),
                            ],
                          }),
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: "Lote: ",
                                bold: true,
                                size: 14,
                              }),
                              new TextRun({
                                text: labelLoteValidadeLine(data),
                                size: 14,
                              }),
                            ],
                          }),
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: "SAC: ",
                                bold: true,
                                size: 14,
                              }),
                              new TextRun({
                                text: data.importerSacLine,
                                size: 14,
                              }),
                            ],
                          }),

                          new Paragraph({
                            children: [
                              new TextRun({
                                text: labelProductTitleLine(data),
                                bold: true,
                                size: 20,
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                            spacing: { before: isSquare ? 1200 : 800 },
                          }),
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: `MARCA: ${data.brand}`,
                                bold: true,
                                size: 18,
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),

                          ...(barcodeImage
                            ? [
                                new Paragraph({
                                  children: [
                                    new ImageRun({
                                      data: await loadImage(barcodeImage),
                                      transformation: {
                                        width: 140,
                                        height: 40,
                                      },
                                      // @ts-ignore
                                      type: "png",
                                    }),
                                  ],
                                  alignment: AlignmentType.CENTER,
                                  spacing: { before: isSquare ? 800 : 400 },
                                }),
                              ]
                            : []),
                          // Spacer for Square
                          ...(isSquare
                            ? [
                                new Paragraph({
                                  text: "",
                                  spacing: { after: 800 },
                                }),
                              ]
                            : []),
                        ],
                      }),
                      // Right Cell
                      new TableCell({
                        width: { size: 50, type: WidthType.PERCENTAGE },
                        // Cria "respiro" horizontal antes da linha divisória central.
                        margins: { left: 80 },
                        borders: {
                          top: {
                            style: BorderStyle.SINGLE,
                            size: 3,
                            color: "000000",
                          },
                          right: {
                            style: BorderStyle.SINGLE,
                            size: 3,
                            color: "000000",
                          },
                          left: { style: BorderStyle.NONE },
                          bottom: { style: BorderStyle.NONE },
                        },
                        shading: { fill: "FFFFFF" },
                        children: [
                          // Nested Table for Icon + Attention text
                          new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            borders: {
                              top: { style: BorderStyle.NONE },
                              bottom: { style: BorderStyle.NONE },
                              left: { style: BorderStyle.NONE },
                              right: { style: BorderStyle.NONE },
                              insideHorizontal: { style: BorderStyle.NONE },
                              insideVertical: { style: BorderStyle.NONE },
                            },
                            rows: [
                              new TableRow({
                                children: [
                                  new TableCell({
                                    width: {
                                      size: 15,
                                      type: WidthType.PERCENTAGE,
                                    },
                                    children: [
                                      new Paragraph({
                                        children: [
                                          new ImageRun({
                                            data: await loadImage(
                                              "/assets/chorão_para_fundo_branco.webp",
                                            ),
                                            transformation: {
                                              width: 35,
                                              height: 35,
                                            },
                                            // @ts-ignore
                                            type: "png",
                                          }),
                                        ],
                                        alignment: AlignmentType.LEFT,
                                        spacing: { before: 200 },
                                        indent: { left: 120 },
                                      }),
                                    ],
                                  }),
                                  new TableCell({
                                    width: {
                                      size: 85,
                                      type: WidthType.PERCENTAGE,
                                    },
                                    children: [
                                      new Paragraph({
                                        children: [
                                          new TextRun({
                                            text: " ATENÇÃO!",
                                            bold: true,
                                            size: 20,
                                            color: "FF0000",
                                          }),
                                        ],
                                        spacing: { before: 200 },
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: `NÃO RECOMENDÁVEL PARA CRIANÇAS MENORES DE ${data.functionType === "MANUAL" ? "03 (TRÊS)" : "03"} ANOS POR CONTER PARTES PEQUENAS QUE PODEM SER ENGOLIDAS OU ASPIRADAS. ESTE PRODUTO DEVE SER MONTADO POR UM ADULTO ANTES DE SER ENTREGUE À CRIANÇA.`,
                                size: 15,
                              }),
                            ],
                            indent: { left: 100 },
                            spacing: { before: isSquare ? 200 : 100 },
                            alignment: AlignmentType.LEFT,
                          }),
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: "INDICAÇÃO!",
                                bold: true,
                                size: 20,
                                color: "FF0000",
                              }),
                              new TextRun({
                                text: `\n${indicationBodyFromAgeSelect(data.ageIndication ?? "")}`,
                                size: 15,
                              }),
                              ...(data.certifierAgeRestriction?.trim()
                                ? [
                                    new TextRun({
                                      text: `\nRESTRIÇÃO DE IDADE (ÓRGÃO CERTIFICADOR): ${data.certifierAgeRestriction}.`,
                                      size: 15,
                                    }),
                                  ]
                                : []),
                            ],
                            indent: { left: 100 },
                            spacing: { before: isSquare ? 500 : 300 },
                          }),
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: "ADVERTÊNCIA!",
                                bold: true,
                                size: 20,
                                color: "FF0000",
                              }),
                            ],
                            indent: { left: 100 },
                            spacing: { before: isSquare ? 800 : 400 },
                          }),
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: "COMO RETIRAR E COMO COLOCAR AS PILHAS E AS BATERIAS SUBSTITUÍVEIS: AS PILHAS NÃO DEVEM SER RECARREGADAS; AS BATERIAS DEVEM SER RETIRADAS DO BRINQUEDO ANTES DE SEREM RECARREGADAS; AS BATERIAS SOMENTE DEVEM SER RECARREGADAS SOB A SUPERVISÃO DE UM ADULTO; DIFERENTES TIPOS DE PILHAS E BATERIAS NOVAS E USADAS NÃO DEVEM SER MISTURADAS; SÓ DEVEM SER USADAS PILHAS E BATERIAS DO TIPO RECOMENDADO OU UM SIMILAR; AS PILHAS E BATERIAS DEVEM SER COLOCADAS RESPEITANDO A POLARIDADE; AS PILHAS E BATERIAS DESCARREGADAS DEVEM SER RETIRADAS DO BRINQUEDO; OS TERMINAIS DE UMA PILHA OU BATERIA NÃO DEVEM SER COLOCADOS EM CURTO-CIRCUITO.",
                                size: 14,
                              }),
                            ],
                            alignment: AlignmentType.JUSTIFIED,
                            indent: { left: 100, right: 100 },
                            spacing: { before: isSquare ? 400 : 100 },
                          }),
                        ],
                      }),
                    ],
                  }),
                  // Footer Row
                  new TableRow({
                    children: [
                      new TableCell({
                        columnSpan: 2,
                        borders: {
                          top: {
                            style: BorderStyle.SINGLE,
                            size: 3,
                            color: "000000",
                          },
                          bottom: {
                            style: BorderStyle.SINGLE,
                            size: 3,
                            color: "000000",
                          },
                          left: {
                            style: BorderStyle.SINGLE,
                            size: 3,
                            color: "000000",
                          },
                          right: {
                            style: BorderStyle.SINGLE,
                            size: 3,
                            color: "000000",
                          },
                        },
                        shading: { fill: "FFFFFF" },
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: '"GUARDAR A EMBALAGEM POR CONTER INFORMAÇÕES IMPORTANTES"',
                                bold: true,
                                italics: true,
                                size: 16,
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 40, after: 40 },
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `Label - ${data.productName || "Sem Nome"}.docx`);
    }

    return (
      <div className="h-full w-full font-sans tracking-wide">
        <div
          className="relative box-border h-full w-full overflow-visible bg-white p-1 text-black"
          style={{ border: "3px solid #000000" }}
        >
          <div className="relative h-[calc(100%-18px)] w-full min-h-[200px] overflow-visible">
            <LabelBlockCanvas
              data={data}
              layouts={mergedBlockLayouts}
              onLayoutsChange={handleLayoutsChange}
              seloImage={seloImage}
              barcodeImage={barcodeImage}
              setSeloImage={setSeloImage}
              setBarcodeImage={setBarcodeImage}
              handleImageUpload={handleImageUpload}
            />
          </div>

          {/* Footer Warning */}
          <div
            className="absolute bottom-0 left-0 z-10 flex w-full items-center justify-center bg-white py-0.5 box-border"
            style={{ borderTop: "3px solid #000000" }}
          >
            <span className="pb-[2px] text-[9px] font-black uppercase tracking-wider italic text-black">
              &quot;GUARDAR A EMBALAGEM POR CONTER INFORMAÇÕES IMPORTANTES&quot;
            </span>
          </div>
        </div>
      </div>
    );
  },
);
