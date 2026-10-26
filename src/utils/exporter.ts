import * as XLSX from 'xlsx';
import { FilterState } from '../types/inventory';
import { PivotResult } from './pivot';

export function exportMatrixToExcel(
  pivotData: PivotResult,
  filter: FilterState,
  presetName?: string
): void {
  const wb = XLSX.utils.book_new();

  // 1. Build Data array for Sheet 1: Matriz de Saldo
  const headers = [
    'Código Produto',
    'Códigos De-Para / Vinculados',
    'Descrição do Produto',
    'Marca',
    'Volume',
    ...pivotData.unitColumns.map((u) => u.label),
    'Saldo Total',
  ];

  const matrixSheetData: (string | number)[][] = [headers];

  // SKU rows
  for (const row of pivotData.rows) {
    const rowValues: (string | number)[] = [
      row.productCode,
      row.codes && row.codes.length > 0 ? row.codes.join(', ') : row.productCode,
      row.description,
      row.brand || '-',
      row.volume || '-',
    ];

    for (const u of pivotData.unitColumns) {
      rowValues.push(row.units[u.key] || 0);
    }

    rowValues.push(row.total);
    matrixSheetData.push(rowValues);
  }

  // Footer summary row
  const footerRow: (string | number)[] = ['TOTAL GERAL', '', '', '', ''];
  for (const u of pivotData.unitColumns) {
    footerRow.push(pivotData.columnTotals[u.key] || 0);
  }
  footerRow.push(pivotData.grandTotal);
  matrixSheetData.push(footerRow);

  const wsMatrix = XLSX.utils.aoa_to_sheet(matrixSheetData);

  // Calculate auto column widths
  const colWidths = headers.map((header, colIdx) => {
    let maxLen = header.length;
    for (let r = 0; r < matrixSheetData.length; r++) {
      const cellVal = matrixSheetData[r][colIdx];
      if (cellVal !== undefined && cellVal !== null) {
        const str = String(cellVal);
        if (str.length > maxLen) maxLen = str.length;
      }
    }
    return { wch: Math.min(Math.max(maxLen + 2, 10), 60) };
  });
  wsMatrix['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, wsMatrix, 'Matriz de Saldo');

  // 2. Sheet 2: Parâmetros e Resumo do Filtro
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR');

  const groupingLabel =
    filter.groupingMode === 'by-description'
      ? 'Consolidado por Descrição (Unifica Versões)'
      : filter.groupingMode === 'by-depara'
      ? 'Unificado por Tabela De-Para'
      : 'Individual por Código (Detalhado)';

  const metaData = [
    ['Parâmetro', 'Valor Aplicado'],
    ['Data/Hora de Geração', dateStr],
    ['Modo de Agrupamento', groupingLabel],
    ['Regra / Preset', presetName || filter.presetId],
    ['Expressão de Inclusão', filter.inclusionRegex || '(Nenhuma)'],
    ['Expressão de Exclusão Estrita', filter.exclusionRegex || '(Nenhuma)'],
    ['Filtro de Volume', filter.volumeRegex || '(Todos)'],
    ['Filtro de Marca', filter.brandRegex || '(Todas)'],
    ['Busca Livre', filter.customSearchText || '(Vazio)'],
    ['Total de Linhas Consolidadas', pivotData.filteredCount],
    ['Total de Peças em Estoque', pivotData.grandTotal],
    ['Quantidade de Unidades Mapeadas', pivotData.unitColumns.length],
  ];

  const wsMeta = XLSX.utils.aoa_to_sheet(metaData);
  wsMeta['!cols'] = [{ wch: 30 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(wb, wsMeta, 'Regras e Resumo');

  // 3. Format Date for Filename: Saldo_Rapido_YYYY-MM-DD.xlsx
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const fileName = `Saldo_Rapido_${yyyy}-${mm}-${dd}.xlsx`;

  // Download directly in browser
  XLSX.writeFile(wb, fileName);
}
