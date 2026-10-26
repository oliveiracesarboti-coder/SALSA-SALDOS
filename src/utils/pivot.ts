import { FilterState, NormalizedStockRow, ProductDePara, StockMatrixRow, UnitColumnInfo } from '../types/inventory';
import { getCanonicalDescriptionKey, testProductEligibility } from './rules';

export interface PivotResult {
  rows: StockMatrixRow[];
  unitColumns: UnitColumnInfo[];
  columnTotals: Record<string, number>;
  grandTotal: number;
  filteredCount: number;
  totalInputRows: number;
  excludedCount: number;
}

export function buildStockMatrix(
  normalizedRows: NormalizedStockRow[],
  filter: FilterState,
  productDeParaList: ProductDePara[] = []
): PivotResult {
  const rowMap = new Map<string, StockMatrixRow>();
  const unitMap = new Map<string, UnitColumnInfo>();

  let excludedCount = 0;

  // 1. Identify all units across the dataset to ensure complete column set
  for (const item of normalizedRows) {
    const unitKey = item.unitLabel;
    if (!unitMap.has(unitKey)) {
      // Sort weight: ER = 1, VD = 2, Loja = 3, HBD = 4, Outro = 5
      let weight = 5;
      if (item.unitType === 'ER') weight = 1;
      else if (item.unitType === 'VD') weight = 2;
      else if (item.unitType === 'Loja') weight = 3;
      else if (item.unitType === 'HBD') weight = 4;

      unitMap.set(unitKey, {
        key: unitKey,
        code: item.unitCode,
        type: item.unitType,
        label: item.unitLabel,
        unitName: item.unitName,
        sortOrder: weight,
      });
    }
  }

  // Convert unitMap to sorted array
  const unitColumns = Array.from(unitMap.values()).sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    // numeric sort if possible
    const numA = parseInt(a.code, 10);
    const numB = parseInt(b.code, 10);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    return a.code.localeCompare(b.code);
  });

  // Filter unit columns if user selected specific units
  const activeUnitColumns =
    filter.selectedUnits && filter.selectedUnits.length > 0 && !filter.selectedUnits.includes('__NONE__')
      ? unitColumns.filter((u) => filter.selectedUnits.includes(u.key))
      : filter.selectedUnits && filter.selectedUnits.includes('__NONE__')
      ? []
      : unitColumns;

  // Build fast lookup for De-Para mappings (fromCode -> ProductDePara)
  const deParaMap = new Map<string, ProductDePara>();
  for (const dp of productDeParaList) {
    if (dp.fromCode) deParaMap.set(dp.fromCode.trim(), dp);
  }

  // 2. Filter and group items
  for (const item of normalizedRows) {
    const testResult = testProductEligibility(item.description, filter);
    if (!testResult.eligible) {
      excludedCount++;
      continue;
    }

    let groupKey = '';
    let canonicalCode = item.productCode;
    let canonicalDesc = item.description;

    const mode = filter.groupingMode || 'by-code';

    if (mode === 'by-depara') {
      const dp = deParaMap.get(item.productCode);
      if (dp) {
        canonicalCode = dp.toCode;
        canonicalDesc = dp.targetDescription || item.description;
        groupKey = `depara:::${canonicalCode}`;
      } else {
        groupKey = `code:::${item.productCode}`;
      }
    } else if (mode === 'by-description') {
      const cleanDesc = getCanonicalDescriptionKey(item.description);
      groupKey = `desc:::${cleanDesc}`;
      canonicalDesc = cleanDesc || item.description;
      canonicalCode = item.productCode;
    } else {
      // 'by-code' (individual code level)
      groupKey = `code:::${item.productCode}:::${item.description}`;
    }

    let matrixRow = rowMap.get(groupKey);

    if (!matrixRow) {
      matrixRow = {
        productCode: canonicalCode,
        codes: [item.productCode],
        description: canonicalDesc,
        brand: testResult.brand,
        category: testResult.category,
        volume: testResult.volume,
        units: {},
        total: 0,
        subItems: [],
      };
      // initialize all active columns with 0
      for (const u of activeUnitColumns) {
        matrixRow.units[u.key] = 0;
      }
      rowMap.set(groupKey, matrixRow);
    } else {
      // If row already exists in this group, register code if not yet present
      if (!matrixRow.codes.includes(item.productCode)) {
        matrixRow.codes.push(item.productCode);
      }
    }

    // Add quantity to consolidated matrix row
    const unitKey = item.unitLabel;
    if (matrixRow.units[unitKey] !== undefined) {
      matrixRow.units[unitKey] = (matrixRow.units[unitKey] || 0) + item.quantity;
    } else {
      matrixRow.units[unitKey] = item.quantity;
    }
    matrixRow.total += item.quantity;

    // Track subItems breakdown per individual code
    matrixRow.subItems = matrixRow.subItems || [];
    let sub = matrixRow.subItems.find((s) => s.code === item.productCode);
    if (!sub) {
      sub = {
        code: item.productCode,
        description: item.description,
        units: {},
        total: 0,
      };
      for (const u of activeUnitColumns) {
        sub.units[u.key] = 0;
      }
      matrixRow.subItems.push(sub);
    }
    sub.units[unitKey] = (sub.units[unitKey] || 0) + item.quantity;
    sub.total += item.quantity;
  }

  let rows = Array.from(rowMap.values());

  // Filter 0 totals if option enabled
  if (filter.onlyNonZeroTotal) {
    rows = rows.filter((r) => r.total > 0);
  }

  // Sort rows alphabetically by description
  rows.sort((a, b) => a.description.localeCompare(b.description));

  // 3. Compute footer column totals
  const columnTotals: Record<string, number> = {};
  for (const u of activeUnitColumns) {
    columnTotals[u.key] = 0;
  }

  let grandTotal = 0;
  for (const r of rows) {
    grandTotal += r.total;
    for (const u of activeUnitColumns) {
      columnTotals[u.key] = (columnTotals[u.key] || 0) + (r.units[u.key] || 0);
    }
  }

  return {
    rows,
    unitColumns: activeUnitColumns,
    columnTotals,
    grandTotal,
    filteredCount: rows.length,
    totalInputRows: normalizedRows.length,
    excludedCount,
  };
}
