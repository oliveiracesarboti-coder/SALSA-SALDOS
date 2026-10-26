export type UnitType = 'ER' | 'VD' | 'Loja' | 'HBD' | 'Outro';

export interface RawStockRow {
  [key: string]: string | number | undefined;
}

export interface NormalizedStockRow {
  id: string;
  productCode: string;
  description: string;
  unitCode: string;
  unitType: UnitType;
  unitLabel: string;
  unitName?: string;
  quantity: number;
  originalIndex?: number;
}

export interface StockCodeSubItem {
  code: string;
  description: string;
  units: Record<string, number>;
  total: number;
}

export interface StockMatrixRow {
  productCode: string;
  codes: string[];
  description: string;
  brand: string;
  category: string;
  volume: string;
  units: Record<string, number>;
  total: number;
  subItems?: StockCodeSubItem[];
}

export interface RegexPreset {
  id: string;
  name: string;
  shortDesc: string;
  inclusionPattern: string;
  exclusionPattern: string;
  volumePattern: string;
  brandPattern: string;
  categoryName: string;
}

export interface UnitColumnInfo {
  key: string;
  code: string;
  type: UnitType;
  label: string;
  unitName?: string;
  sortOrder: number;
}

export type GroupingMode = 'by-code' | 'by-description' | 'by-depara';

export interface ProductDePara {
  id: string;
  fromCode: string;
  toCode: string;
  targetDescription: string;
  notes?: string;
}

export interface FilterState {
  presetId: string;
  inclusionRegex: string;
  exclusionRegex: string;
  volumeRegex: string;
  brandRegex: string;
  customSearchText: string;
  onlyNonZeroTotal: boolean;
  selectedUnits: string[]; // empty means all
  groupingMode: GroupingMode;
}

export interface ColumnMapping {
  codeCol: string;
  descCol: string;
  stockCol: string;
  unitCol: string;
}

export interface DeParaEntry {
  sigla: string;
  significado: string;
  tipo: 'categoria' | 'marca' | 'unidade' | 'outro';
}
