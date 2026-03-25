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
  /** Razão social do importador (texto na etiqueta). */
  importer: string;
  /** UUID do importador na tabela `importers`, quando vindo do cadastro. */
  importerId: string;
  /** Linhas de endereço do importador (preenchidas ao selecionar no formulário). */
  importerAddressStreet: string;
  importerAddressCityState: string;
  importerAddressPostal: string;
  /** Linha SAC na etiqueta (e-mail e telefones do importador selecionado). */
  importerSacLine: string;
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
  productName: "",
  code: "",
  brand: "",
  certifierAgeRestriction: "3+",
  ageIndication: "3+",
  importer: "",
  importerId: "",
  importerAddressStreet: "",
  importerAddressCityState: "",
  importerAddressPostal: "",
  importerSacLine: "",
  origin: "",
  packagingType: "Caixa de papelão",
  quantity: "",
  manufactureDate: "",
  batch: "",
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
  importerId: "",
  importerAddressStreet: "",
  importerAddressCityState: "",
  importerAddressPostal: "",
  importerSacLine: "",
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
