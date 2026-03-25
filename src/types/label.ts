import type { LabelBlockLayouts } from "@/types/label-layout"

export interface LabelData {
  proportion: string;
  /** Posições/tamanhos dos blocos na etiqueta (%). `null`/omitido = layout padrão. */
  labelBlockLayouts?: LabelBlockLayouts | null;
  productName: string;
  code: string;
  brand: string;
  /** Restrição de idade segundo o órgão certificador (faixa etária). */
  certifierAgeRestriction: string;
  /** Indicação por faixa etária. */
  ageIndication: string;
  importer: string;
  origin: string;
  /** Tipo de embalagem do produto (selecionável no formulário). */
  packagingType: string;
  quantity: string;
  manufactureDate: string;
  batch: string;
  functionType: string;
  hasBatteries: string;
  batteryType: string;
  batteryQuantity: string;
  batteriesIncluded: string;
  hasMetalFastener: string;
  hasLargePlasticBag: string;
  hasSmallBalls: string;
  hasLongString: string;
  hasBalloonOrBall: string;
  hasProjectilesOrWaterGun: string;
  hasSoundMusicNoise: string;
  /** Nível em decibéis (quando há som/música/ruídos). */
  soundDecibels: string;
  expiryDate: string;
  isExpiryIndeterminate: boolean;
}

export const initialLabelData: LabelData = {
  proportion: "5:2 (Padrão)",
  labelBlockLayouts: null,
  productName: "Toy Set - Plastic Spinning Top",
  code: "YD-920",
  brand: "ETITOYS",
  certifierAgeRestriction: "3+",
  ageIndication: "3+",
  importer: "ETILUX IMPORTAÇÃO E DISTRIBUIÇÃO",
  origin: "CHINA",
  packagingType: "Caixa de papelão",
  quantity: "1 Conjunto c/ 02 Peç",
  manufactureDate: "Outubro/2025",
  batch: "202510",
  functionType: "MANUAL",
  hasBatteries: "SIM",
  batteryType: "SIM",
  batteryQuantity: "SIM",
  batteriesIncluded: "SIM",
  hasMetalFastener: "SIM",
  hasLargePlasticBag: "SIM",
  hasSmallBalls: "SIM",
  hasLongString: "SIM",
  hasBalloonOrBall: "Não",
  hasProjectilesOrWaterGun: "Não",
  hasSoundMusicNoise: "Não",
  soundDecibels: "",
  expiryDate: "",
  isExpiryIndeterminate: true,
};

export const emptyLabelData: LabelData = {
  proportion: "5:2 (Padrão)",
  labelBlockLayouts: null,
  productName: "",
  code: "",
  brand: "",
  certifierAgeRestriction: "",
  ageIndication: "",
  importer: "",
  origin: "",
  packagingType: "",
  quantity: "",
  manufactureDate: "",
  batch: "",
  functionType: "",
  hasBatteries: "",
  batteryType: "",
  batteryQuantity: "",
  batteriesIncluded: "",
  hasMetalFastener: "",
  hasLargePlasticBag: "",
  hasSmallBalls: "",
  hasLongString: "",
  hasBalloonOrBall: "",
  hasProjectilesOrWaterGun: "",
  hasSoundMusicNoise: "",
  soundDecibels: "",
  expiryDate: "",
  isExpiryIndeterminate: false,
};
