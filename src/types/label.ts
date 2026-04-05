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
  /** Tipo de embalagem do produto (Blister, Color Box, Outro, …). */
  packagingType: string;
  /** Quando `packagingType` é Color Box: Caixa ou Windowbox. */
  packagingColorBoxVariant: string;
  /** Quando `packagingType` é Outro: nome livre da embalagem. */
  packagingOther: string;
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
  /** Rascunho do assistente de novo projeto: etapa atual no servidor (retomar depois). */
  wizardDraft?: { sectionIdx: number };
}

/** Remove metadados do assistente antes de editar / exibir a etiqueta final. */
export function stripWizardDraft(data: LabelData): LabelData {
  const { wizardDraft: _wd, ...rest } = data;
  return rest as LabelData;
}

export const initialLabelData: LabelData = {
  proportion: "cm:10x4",
  labelBlockLayouts: null,
  productName: "",
  code: "",
  brand: "",
  certifierAgeRestriction: "0-3",
  ageIndication: "3+",
  importer: "",
  importerId: "",
  importerAddressStreet: "",
  importerAddressCityState: "",
  importerAddressPostal: "",
  importerSacLine: "",
  origin: "",
  packagingType: "Blister",
  packagingColorBoxVariant: "",
  packagingOther: "",
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
  proportion: "cm:10x4",
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
  packagingColorBoxVariant: "",
  packagingOther: "",
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
