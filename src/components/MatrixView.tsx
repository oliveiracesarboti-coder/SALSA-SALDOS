import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Download, Filter, Layers, Search, Sparkles } from 'lucide-react';
import { FilterState, GroupingMode } from '../types/inventory';
import { PivotResult } from '../utils/pivot';

interface MatrixViewProps {
  pivotData: PivotResult;
  filter: FilterState;
  onFilterChange: (newFilter: FilterState) => void;
  onExportExcel: () => void;
}

export function MatrixView({
  pivotData,
  filter,
  onFilterChange,
  onExportExcel,
}: MatrixViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeUnitTypeFilter, setActiveUnitTypeFilter] = useState<'ALL' | 'ER' | 'VD' | 'Loja' | 'HBD'>('ALL');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Filter rows by search term
  const displayedRows = useMemo(() => {
    let rows = pivotData.rows;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      rows = rows.filter(
        (r) =>
          r.productCode.toLowerCase().includes(term) ||
          (r.codes && r.codes.some((c) => c.toLowerCase().includes(term))) ||
          r.description.toLowerCase().includes(term) ||
          r.brand.toLowerCase().includes(term)
      );
    }
    return rows;
  }, [pivotData.rows, searchTerm]);

  // Filter unit columns by selected unit type if active
  const displayedUnitColumns = useMemo(() => {
    if (activeUnitTypeFilter === 'ALL') return pivotData.unitColumns;
    return pivotData.unitColumns.filter((u) => u.type === activeUnitTypeFilter);
  }, [pivotData.unitColumns, activeUnitTypeFilter]);

  // Recompute footer sums for displayed rows & displayed unit columns
  const columnSums = useMemo(() => {
    const sums: Record<string, number> = {};
    for (const u of displayedUnitColumns) {
      sums[u.key] = 0;
    }
    let grand = 0;
    for (const row of displayedRows) {
      for (const u of displayedUnitColumns) {
        sums[u.key] = (sums[u.key] || 0) + (row.units[u.key] || 0);
      }
      grand += row.total;
    }
    return { sums, grand };
  }, [displayedRows, displayedUnitColumns]);

  const toggleExpand = (rowKey: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(rowKey)) next.delete(rowKey);
      else next.add(rowKey);
      return next;
    });
  };

  const handleExpandAll = () => {
    const allWithSub = displayedRows
      .filter((r) => r.subItems && r.subItems.length > 1)
      .map((r) => r.productCode);
    setExpandedRows(new Set(allWithSub));
  };

  const handleCollapseAll = () => {
    setExpandedRows(new Set());
  };

  // Styling helper by unit type
  const getUnitTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'ER':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'VD':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'Loja':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'HBD':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const hasAnyGroupedItems = displayedRows.some((r) => r.codes && r.codes.length > 1);

  return (
    <div className="space-y-4">
      {/* 1. Control Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Search Input */}
        <div className="flex-1 min-w-[240px] max-w-sm relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar por código, fragrância ou descrição..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Grouping Mode Segmented Toggle (The requested De-Para / Description Consolidation!) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
          <span className="text-[11px] font-semibold text-slate-500 px-2 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-blue-600" /> Agrupamento:
          </span>
          <button
            onClick={() => onFilterChange({ ...filter, groupingMode: 'by-code' })}
            className={`px-2.5 py-1 font-medium rounded-md transition-all ${
              filter.groupingMode === 'by-code'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Cada código é exibido individualmente em sua própria linha"
          >
            Por Código (Individual)
          </button>
          <button
            onClick={() => onFilterChange({ ...filter, groupingMode: 'by-description' })}
            className={`px-2.5 py-1 font-medium rounded-md transition-all flex items-center gap-1 ${
              filter.groupingMode === 'by-description'
                ? 'bg-emerald-700 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Consolida produtos que têm a mesma descrição comercial (unifica V2, V3, etc. e soma os saldos)"
          >
            <Sparkles className="w-3 h-3" />
            <span>Consolidar por Descrição</span>
          </button>
          <button
            onClick={() => onFilterChange({ ...filter, groupingMode: 'by-depara' })}
            className={`px-2.5 py-1 font-medium rounded-md transition-all ${
              filter.groupingMode === 'by-depara'
                ? 'bg-purple-700 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Unifica códigos conforme a tabela de De-Para cadastrada"
          >
            Tabela De-Para
          </button>
        </div>

        {/* Unit Type Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
          <span className="text-[11px] font-medium text-slate-500 px-2 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Unidades:
          </span>
          {(['ALL', 'ER', 'VD', 'Loja', 'HBD'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setActiveUnitTypeFilter(type)}
              className={`px-2 py-1 font-medium rounded-md transition-colors ${
                activeUnitTypeFilter === type
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {type === 'ALL' ? 'Todas' : type}
            </button>
          ))}
        </div>

        {/* Export Button & Zero-stock toggle */}
        <div className="flex items-center gap-4 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700">
            <input
              type="checkbox"
              checked={filter.onlyNonZeroTotal}
              onChange={(e) =>
                onFilterChange({ ...filter, onlyNonZeroTotal: e.target.checked })
              }
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
            />
            <span>Apenas Saldo &gt; 0</span>
          </label>

          <button
            onClick={onExportExcel}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar XLSX</span>
          </button>
        </div>
      </div>

      {/* Sub-bar explaining consolidation mode when active */}
      {filter.groupingMode !== 'by-code' && (
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 text-emerald-900">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>
              <strong>Modo Consolidado Ativo: </strong>
              {filter.groupingMode === 'by-description'
                ? 'Produtos com a mesma descrição base (ex: V3, V4, N/FORM) estão unificados em uma única linha com a soma dos estoques.'
                : 'Produtos vinculados na tabela De-Para estão unificados sob o código e descrição canônicos.'}
            </span>
          </div>

          {hasAnyGroupedItems && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleExpandAll}
                className="text-emerald-800 hover:underline font-semibold text-[11px]"
              >
                Expandir todos os códigos
              </button>
              <span className="text-emerald-300">|</span>
              <button
                onClick={handleCollapseAll}
                className="text-emerald-800 hover:underline font-semibold text-[11px]"
              >
                Recolher todos
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. Main Pivoted Stock Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[640px] relative">
          <table className="w-full text-left text-xs border-collapse">
            {/* Table Header */}
            <thead className="bg-slate-100/90 backdrop-blur-xs sticky top-0 z-20 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-semibold text-slate-700 whitespace-nowrap sticky left-0 bg-slate-100 z-30 min-w-[110px] border-r border-slate-200">
                  Código
                </th>
                <th className="py-2.5 px-3 font-semibold text-slate-700 whitespace-nowrap sticky left-[110px] bg-slate-100 z-30 min-w-[280px] border-r border-slate-200">
                  Descrição do Produto
                </th>
                <th className="py-2.5 px-2.5 font-semibold text-slate-700 whitespace-nowrap min-w-[100px]">
                  Marca
                </th>
                <th className="py-2.5 px-2.5 font-semibold text-slate-700 whitespace-nowrap min-w-[70px]">
                  Volume
                </th>

                {/* Unit Columns */}
                {displayedUnitColumns.map((u) => (
                  <th
                    key={u.key}
                    title={u.unitName ? `${u.label} - ${u.unitName}` : u.label}
                    className="py-2 px-2.5 font-semibold text-right whitespace-nowrap min-w-[95px] border-l border-slate-200 cursor-help"
                  >
                    <div className="flex flex-col items-end">
                      <span className="font-mono text-slate-900">{u.label}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-medium border mt-0.5 ${getUnitTypeBadgeColor(
                          u.type
                        )}`}
                      >
                        {u.type}
                      </span>
                    </div>
                  </th>
                ))}

                {/* Total Saldo Column */}
                <th className="py-2.5 px-3 font-bold text-slate-900 text-right whitespace-nowrap min-w-[105px] border-l-2 border-slate-300 bg-slate-200/50">
                  Saldo Total
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {displayedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5 + displayedUnitColumns.length}
                    className="py-12 text-center text-slate-400"
                  >
                    Nenhum produto atendeu aos critérios ou busca atual.
                  </td>
                </tr>
              ) : (
                displayedRows.map((row) => {
                  const hasMultipleCodes = row.codes && row.codes.length > 1;
                  const isExpanded = expandedRows.has(row.productCode);

                  return (
                    <div key={row.productCode} style={{ display: 'contents' }}>
                      {/* Main Consolidated Row */}
                      <tr
                        className={`transition-colors group ${
                          hasMultipleCodes
                            ? 'bg-emerald-50/20 hover:bg-emerald-50/50'
                            : 'hover:bg-blue-50/40'
                        }`}
                      >
                        {/* Código Principal + Expand Button & Badge */}
                        <td className="py-2 px-3 font-mono font-medium text-slate-900 whitespace-nowrap sticky left-0 bg-white group-hover:bg-blue-50/40 z-10 border-r border-slate-200">
                          <div className="flex items-center gap-1.5">
                            {hasMultipleCodes ? (
                              <button
                                type="button"
                                onClick={() => toggleExpand(row.productCode)}
                                className="p-0.5 rounded-md hover:bg-slate-200 text-slate-500 transition-colors"
                                title="Ver detalhamento por cada código"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-3.5 h-3.5 text-emerald-700" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5 text-emerald-700" />
                                )}
                              </button>
                            ) : (
                              <span className="w-4"></span>
                            )}
                            <span className="font-semibold text-slate-900">{row.productCode}</span>
                            {hasMultipleCodes && (
                              <span
                                className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold border border-emerald-300"
                                title={`Códigos unificados: ${row.codes.join(', ')}`}
                              >
                                {row.codes.length} cód
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Descrição */}
                        <td className="py-2 px-3 font-medium text-slate-800 whitespace-nowrap sticky left-[110px] bg-white group-hover:bg-blue-50/40 z-10 border-r border-slate-200">
                          <div
                            className="truncate max-w-[340px]"
                            title={
                              hasMultipleCodes
                                ? `${row.description} (Códigos: ${row.codes.join(', ')})`
                                : row.description
                            }
                          >
                            {row.description}
                          </div>
                        </td>

                        {/* Marca */}
                        <td className="py-2 px-2.5 whitespace-nowrap text-slate-500 text-[11px]">
                          {row.brand}
                        </td>

                        {/* Volume */}
                        <td className="py-2 px-2.5 whitespace-nowrap font-mono text-slate-500 text-[11px]">
                          {row.volume}
                        </td>

                        {/* Unit cells */}
                        {displayedUnitColumns.map((u) => {
                          const qty = row.units[u.key] || 0;
                          return (
                            <td
                              key={u.key}
                              className="py-2 px-2.5 text-right font-mono tabular-nums whitespace-nowrap border-l border-slate-100"
                            >
                              {qty > 0 ? (
                                <span className="font-semibold text-slate-900">
                                  {qty.toLocaleString('pt-BR')}
                                </span>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                          );
                        })}

                        {/* Row Total */}
                        <td className="py-2 px-3 text-right font-mono tabular-nums font-bold text-blue-900 whitespace-nowrap border-l-2 border-slate-300 bg-slate-50/50 group-hover:bg-blue-100/30">
                          {row.total.toLocaleString('pt-BR')}
                        </td>
                      </tr>

                      {/* Nested Sub-rows for each individual code when expanded */}
                      {hasMultipleCodes &&
                        isExpanded &&
                        row.subItems &&
                        row.subItems.map((sub) => (
                          <tr
                            key={`${row.productCode}-${sub.code}`}
                            className="bg-slate-50/80 hover:bg-slate-100/80 transition-colors text-[11px] border-b border-dashed border-slate-200"
                          >
                            {/* Sub Code */}
                            <td className="py-1.5 px-3 font-mono font-medium text-slate-600 whitespace-nowrap sticky left-0 bg-slate-50/90 z-10 border-r border-slate-200 pl-7">
                              <span className="text-slate-400 mr-1">↳</span>
                              <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold text-slate-800">
                                {sub.code}
                              </span>
                            </td>

                            {/* Sub Description */}
                            <td className="py-1.5 px-3 font-normal text-slate-600 whitespace-nowrap sticky left-[110px] bg-slate-50/90 z-10 border-r border-slate-200">
                              <div className="truncate max-w-[320px] text-slate-600 italic">
                                {sub.description}
                              </div>
                            </td>

                            <td className="py-1.5 px-2.5 text-slate-400">-</td>
                            <td className="py-1.5 px-2.5 text-slate-400">-</td>

                            {/* Sub Unit Quantities */}
                            {displayedUnitColumns.map((u) => {
                              const qty = sub.units[u.key] || 0;
                              return (
                                <td
                                  key={u.key}
                                  className="py-1.5 px-2.5 text-right font-mono tabular-nums whitespace-nowrap border-l border-slate-200 text-slate-600"
                                >
                                  {qty > 0 ? qty.toLocaleString('pt-BR') : '-'}
                                </td>
                              );
                            })}

                            {/* Sub Total */}
                            <td className="py-1.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-700 whitespace-nowrap border-l-2 border-slate-300 bg-slate-100/60">
                              {sub.total.toLocaleString('pt-BR')}
                            </td>
                          </tr>
                        ))}
                    </div>
                  );
                })
              )}
            </tbody>

            {/* Footer Row (Totals per Unit) */}
            <tfoot className="bg-slate-200/80 backdrop-blur-xs font-bold text-slate-900 sticky bottom-0 z-20 border-t-2 border-slate-300">
              <tr>
                <td className="py-2.5 px-3 sticky left-0 bg-slate-200 z-30 border-r border-slate-300">
                  TOTAL GERAL
                </td>
                <td className="py-2.5 px-3 sticky left-[110px] bg-slate-200 z-30 border-r border-slate-300 text-slate-600 font-normal">
                  {displayedRows.length} linhas ({filter.groupingMode !== 'by-code' ? 'consolidadas' : 'itens'})
                </td>
                <td className="py-2.5 px-2.5">-</td>
                <td className="py-2.5 px-2.5">-</td>

                {/* Footer Sum for each Unit Column */}
                {displayedUnitColumns.map((u) => (
                  <td
                    key={u.key}
                    className="py-2.5 px-2.5 text-right font-mono tabular-nums border-l border-slate-300"
                  >
                    {(columnSums.sums[u.key] || 0).toLocaleString('pt-BR')}
                  </td>
                ))}

                {/* Grand Total */}
                <td className="py-2.5 px-3 text-right font-mono tabular-nums font-extrabold text-blue-950 border-l-2 border-slate-400 bg-slate-300/60">
                  {columnSums.grand.toLocaleString('pt-BR')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
