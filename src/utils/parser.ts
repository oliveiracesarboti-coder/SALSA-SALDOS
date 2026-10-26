import * as XLSX from 'xlsx';
import { ColumnMapping, NormalizedStockRow, RawStockRow, UnitType } from '../types/inventory';
import { normalizeText } from './rules';

/**
 * Normalizes number strings from Brazilian/Retaguarda format:
 * '1.250,00' -> 1250
 * '12,5' -> 12.5
 * '' / null / undefined / '0' -> 0
 */
export function parseStockNumber(val: unknown): number {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;

  const str = String(val).trim();
  if (!str) return 0;

  // If format has both dots and commas, e.g. 1.250,50 -> remove dots, replace comma with dot
  if (str.includes('.') && str.includes(',')) {
    const clean = str.replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? 0 : parsed;
  }

  // If format is 1250,50
  if (str.includes(',')) {
    const clean = str.replace(',', '.');
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? 0 : parsed;
  }

  // Plain number or dot decimal
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Extracts unit code, type and standard label using regex:
 * Examples:
 * 'Loja: 14417' -> { code: '14417', type: 'Loja', label: 'Loja 14417' }
 * 'ER: 6848'    -> { code: '6848',  type: 'ER',   label: 'ER 6848' }
 * 'VD 102'      -> { code: '102',   type: 'VD',   label: 'VD 102' }
 * 'HBD: 01'     -> { code: '01',    type: 'HBD',  label: 'HBD 01' }
 * '14417'       -> { code: '14417', type: 'Loja', label: 'Unidade 14417' }
 */
export function extractUnitInfo(rawUnit: unknown): { code: string; type: UnitType; label: string; unitName?: string } {
  if (rawUnit === undefined || rawUnit === null) {
    return { code: '0000', type: 'Outro', label: 'Geral' };
  }

  const str = String(rawUnit).trim();
  const upper = str.toUpperCase();

  // Extract store company/franchisee name if present after hyphen
  // Example: "Loja: 4919 - 4919 MARIA NILCE S. DE SOUSA ME" -> "MARIA NILCE S. DE SOUSA ME"
  let unitName = '';
  const hyphenParts = str.split('-');
  if (hyphenParts.length > 1) {
    const rawName = hyphenParts.slice(1).join('-').trim();
    // remove repeated store code at start of name if present
    unitName = rawName.replace(/^\d+\s+/, '').trim();
  }

  // Pattern matching ER, VD, LOJA, HBD followed by optional : and digits
  const erMatch = upper.match(/ER[:\s\-]*([A-Z0-9]+)/i);
  if (erMatch) {
    return { code: erMatch[1], type: 'ER', label: `ER ${erMatch[1]}`, unitName };
  }

  const vdMatch = upper.match(/VD[:\s\-]*([A-Z0-9]+)/i);
  if (vdMatch) {
    return { code: vdMatch[1], type: 'VD', label: `VD ${vdMatch[1]}`, unitName };
  }

  const lojaMatch = upper.match(/(?:LOJA|LJ|FRANQUIA)[:\s\-]*([A-Z0-9]+)/i);
  if (lojaMatch) {
    return { code: lojaMatch[1], type: 'Loja', label: `Loja ${lojaMatch[1]}`, unitName };
  }

  const hbdMatch = upper.match(/(?:HBD|HUB|CD)[:\s\-]*([A-Z0-9]+)/i);
  if (hbdMatch) {
    return { code: hbdMatch[1], type: 'HBD', label: `HBD ${hbdMatch[1]}`, unitName };
  }

  // Check if just digits
  const digitMatch = str.match(/\d+/);
  if (digitMatch) {
    const code = digitMatch[0];
    const type: UnitType = code.length >= 5 ? 'Loja' : 'ER';
    return { code, type, label: `${type} ${code}`, unitName };
  }

  return { code: str, type: 'Outro', label: str, unitName };
}

/**
 * Auto-detects columns from raw header keys
 */
export function detectColumnMapping(headers: string[]): ColumnMapping {
  let codeCol = '';
  let descCol = '';
  let stockCol = '';
  let unitCol = '';

  // 1. First Pass: Look for exact known names from Retaguarda GB
  for (const h of headers) {
    const norm = normalizeText(h);

    // Code
    if (!codeCol && (norm === 'CODIGO' || norm === 'COD_PRODUTO' || norm === 'COD' || norm === 'SKU')) {
      codeCol = h;
    }

    // Description
    if (!descCol && (norm === 'DESCRICAO' || norm === 'DESCRI' || norm.startsWith('DESCRI'))) {
      descCol = h;
    }

    // Stock
    if (!stockCol && (norm === 'ESTOQUE' || norm === 'SALDO' || norm === 'SALDO/ESTOQUE' || norm === 'ESTOQUE DISPONIVEL')) {
      stockCol = h;
    }

    // Unit / Branch / Quebra
    if (!unitCol && (norm === 'QUEBRA 1' || norm === 'QUEBRA' || norm === 'UNIDADE' || norm === 'LOJA' || norm === 'FILIAL')) {
      unitCol = h;
    }
  }

  // 2. Second Pass: Substring search if not yet found
  for (const h of headers) {
    const norm = normalizeText(h);

    // Code
    if (!codeCol && (norm.includes('COD') || norm.includes('SKU') || norm.includes('PROD') || norm === 'ID')) {
      codeCol = h;
    }

    // Description
    if (!descCol && (norm.includes('DESC') || norm.includes('NOME') || norm.includes('ITEM') || norm.includes('PRODUTO'))) {
      if (norm !== codeCol) {
        descCol = h;
      }
    }

    // Stock - ensure we do NOT pick 'EST. MINIMO' or 'EST. MAXIMO'
    if (!stockCol) {
      if (norm.includes('SALD') || (norm.includes('ESTOQ') && !norm.includes('MIN') && !norm.includes('MAX'))) {
        stockCol = h;
      }
    }

    // Unit / Branch
    if (!unitCol && (
      norm.includes('QUEBRA') ||
      norm.includes('UNID') ||
      norm.includes('LOJA') ||
      norm.includes('FILIAL') ||
      norm.includes('CANAL') ||
      norm.includes('LOCAL') ||
      norm.includes('ER') ||
      norm.includes('VD')
    )) {
      unitCol = h;
    }
  }

  // Fallback defaults if not matched
  if (!codeCol && headers.length > 0) codeCol = headers[0];
  if (!descCol && headers.length > 1) descCol = headers[1];
  if (!stockCol && headers.length > 2) stockCol = headers[2];
  if (!unitCol && headers.length > 3) unitCol = headers[3];

  return { codeCol, descCol, stockCol, unitCol };
}

/**
 * Normalizes rows into standard NormalizedStockRow list
 */
export function normalizeStockData(rawRows: RawStockRow[], mapping: ColumnMapping): NormalizedStockRow[] {
  const result: NormalizedStockRow[] = [];

  rawRows.forEach((row, idx) => {
    const codeRaw = row[mapping.codeCol];
    const descRaw = row[mapping.descCol];
    const stockRaw = row[mapping.stockCol];
    const unitRaw = row[mapping.unitCol];

    if (!codeRaw && !descRaw) {
      // Empty line skip
      return;
    }

    const productCode = String(codeRaw || '').trim();
    const description = String(descRaw || '').trim();
    const quantity = parseStockNumber(stockRaw);
    const unitInfo = extractUnitInfo(unitRaw);

    result.push({
      id: `${productCode}-${unitInfo.code}-${idx}`,
      productCode,
      description,
      unitCode: unitInfo.code,
      unitType: unitInfo.type,
      unitLabel: unitInfo.label,
      quantity,
      originalIndex: idx + 1,
    });
  });

  return result;
}

/**
 * Parses raw CSV string (supporting CRLF, Latin-1, semicolons)
 */
export function parseStockCsvString(
  text: string,
  fileName = 'arquivo.csv'
): {
  rawRows: RawStockRow[];
  headers: string[];
  mapping: ColumnMapping;
  fileName: string;
} {
  // Normalize Windows/Mac line breaks
  const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Determine separator: count ';' vs ',' vs '\t' in first 10 lines
  const rawLines = normalizedText.split('\n');
  const sample = rawLines.slice(0, 10).join('\n');
  const semiCount = (sample.match(/;/g) || []).length;
  const commaCount = (sample.match(/,/g) || []).length;
  const tabCount = (sample.match(/\t/g) || []).length;

  let delimiter = ';';
  if (commaCount > semiCount && commaCount > tabCount) delimiter = ',';
  if (tabCount > semiCount && tabCount > commaCount) delimiter = '\t';

  // Strip dirty report banners / preamble lines (e.g., "RELATÓRIO DE SALDOS...", "Filtro: ...", ";;;;;")
  let cleanStartIndex = 0;
  for (let i = 0; i < Math.min(rawLines.length, 15); i++) {
    const lineNorm = normalizeText(rawLines[i]);
    // The real header line contains "COD" or "QUEBRA" or "DESCR" or "ESTOQ"
    if (
      (lineNorm.includes('COD') || lineNorm.includes('QUEBRA')) &&
      (lineNorm.includes('DESC') || lineNorm.includes('PROD') || lineNorm.includes('ESTOQ'))
    ) {
      cleanStartIndex = i;
      break;
    }
  }

  const cleanText = cleanStartIndex > 0 ? rawLines.slice(cleanStartIndex).join('\n') : normalizedText;

  // Read with XLSX
  const workbook = XLSX.read(cleanText, { type: 'string', raw: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json<RawStockRow>(sheet, { defval: '' });

  const headers = rawRows.length > 0 ? Object.keys(rawRows[0]) : [];
  const mapping = detectColumnMapping(headers);

  return {
    rawRows,
    headers,
    mapping,
    fileName,
  };
}

/**
 * Parses file Buffer/ArrayBuffer (CSV or XLSX)
 */
export async function parseStockFile(file: File): Promise<{
  rawRows: RawStockRow[];
  headers: string[];
  mapping: ColumnMapping;
  fileName: string;
}> {
  const fileName = file.name;
  const isCsv = fileName.toLowerCase().endsWith('.csv');

  if (isCsv) {
    const arrayBuffer = await file.arrayBuffer();
    // Try UTF-8 decoder first
    let text = new TextDecoder('utf-8').decode(arrayBuffer);
    // If invalid UTF-8 replacement character appears, decode with ISO-8859-1 (Latin1)
    if (text.includes('\uFFFD')) {
      text = new TextDecoder('iso-8859-1').decode(arrayBuffer);
    }
    return parseStockCsvString(text, fileName);
  } else {
    // XLSX or XLS
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json<RawStockRow>(sheet, { defval: '' });
    const headers = rawRows.length > 0 ? Object.keys(rawRows[0]) : [];
    const mapping = detectColumnMapping(headers);

    return {
      rawRows,
      headers,
      mapping,
      fileName,
    };
  }
}

/**
 * Loads the user's real Retaguarda CSV file located in public assets
 */
export async function loadRealStockFile(): Promise<{
  rawRows: RawStockRow[];
  headers: string[];
  mapping: ColumnMapping;
  fileName: string;
}> {
  const res = await fetch('/assets/aistudio/saldo-estoque-24-10-2026_e4eec8be.csv');
  if (!res.ok) {
    throw new Error(`Falha ao ler arquivo local: HTTP ${res.status}`);
  }
  const buffer = await res.arrayBuffer();
  // Real Retaguarda file is ISO-8859-1 encoded with CRLF
  const text = new TextDecoder('iso-8859-1').decode(buffer);
  return parseStockCsvString(text, 'saldo-estoque-24-10-2026.csv (Base Real Retaguarda - 24 Lojas)');
}
