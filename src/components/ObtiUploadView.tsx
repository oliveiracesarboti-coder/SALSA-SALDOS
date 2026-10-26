import { useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  FolderOpen,
  Layers,
  RefreshCw,
  SlidersHorizontal,
  Trash2,
  Upload,
} from 'lucide-react';
import { ColumnMapping, FilterState, RawStockRow, RegexPreset, UnitColumnInfo } from '../types/inventory';
import { parseStockFile } from '../utils/parser';
import { REGEX_PRESETS } from '../utils/rules';

interface ObtiUploadViewProps {
  fileName: string;
  rawRowsCount: number;
  availableUnits: UnitColumnInfo[];
  filter: FilterState;
  onFilterChange: (newFilter: FilterState) => void;
  onApplyPreset: (preset: RegexPreset) => void;
  onConfirmImport: (rawRows: RawStockRow[], headers: string[], mapping: ColumnMapping, fileName: string) => void;
  onLoadRealData: () => void;
  onLoadSample: () => void;
  onAnalyzeAndGoToMatrix: () => void;
  onClearFiles: () => void;
}

export function ObtiUploadView({
  fileName,
  rawRowsCount,
  availableUnits,
  filter,
  onFilterChange,
  onApplyPreset,
  onConfirmImport,
  onLoadRealData,
  onLoadSample,
  onAnalyzeAndGoToMatrix,
  onClearFiles,
}: ObtiUploadViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reference date state
  const todayStr = new Date().toISOString().split('T')[0];
  const [refDate, setRefDate] = useState(todayStr);

  const handleProcessFile = async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      const result = await parseStockFile(file);
      if (result.rawRows.length === 0) {
        setError('O arquivo carregado está vazio ou não possui registros válidos.');
        setLoading(false);
        return;
      }
      onConfirmImport(result.rawRows, result.headers, result.mapping, result.fileName);
      setLoading(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha ao processar arquivo.');
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleProcessFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleProcessFile(file);
  };

  const handleSelectAllUnits = () => {
    onFilterChange({ ...filter, selectedUnits: [] }); // empty means all
  };

  const handleDeselectAllUnits = () => {
    onFilterChange({ ...filter, selectedUnits: ['__NONE__'] });
  };

  const handleToggleUnit = (unitKey: string) => {
    let current = filter.selectedUnits;
    if (current.length === 0) {
      // currently all are selected, so selecting all except this one
      current = availableUnits.map((u) => u.key);
    }
    if (current.includes('__NONE__')) {
      current = [];
    }

    if (current.includes(unitKey)) {
      const next = current.filter((k) => k !== unitKey);
      onFilterChange({ ...filter, selectedUnits: next.length === 0 ? ['__NONE__'] : next });
    } else {
      const next = [...current, unitKey];
      if (next.length === availableUnits.length) {
        onFilterChange({ ...filter, selectedUnits: [] }); // all selected
      } else {
        onFilterChange({ ...filter, selectedUnits: next });
      }
    }
  };

  const isUnitSelected = (unitKey: string) => {
    if (filter.selectedUnits.includes('__NONE__')) return false;
    if (filter.selectedUnits.length === 0) return true;
    return filter.selectedUnits.includes(unitKey);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ========================================================= */}
      {/* 1. OBTI HERO BANNER (Identical to image_266f115b.png)     */}
      {/* ========================================================= */}
      <div className="rounded-2xl bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#042f2e] text-white p-7 sm:p-9 shadow-lg relative overflow-hidden border border-emerald-900/50">
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Pitch */}
          <div className="lg:col-span-7 space-y-3.5">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-emerald-300">
              <span>ESTOQUE</span>
              <span>·</span>
              <span>RETAGUARDA</span>
              <span>·</span>
              <span>ER / VD / LOJAS</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Do arquivo ao relatório, <br className="hidden sm:inline" />
              sem planilha no meio.
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl leading-relaxed">
              Carregue o arquivo de saldo da Retaguarda (GB) ou VD+. O sistema normaliza colunas,
              aplica regras de filtragem por texto e gera a matriz pivoteada por unidade com exportação Excel pronta.
            </p>
          </div>

          {/* Right 3-Step Process Card Stack */}
          <div className="lg:col-span-5 space-y-2.5">
            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-xl p-3 border border-white/10 flex items-center gap-3.5 transition-all">
              <span className="font-mono font-bold text-xs text-emerald-300 bg-emerald-950/60 px-2 py-1 rounded-md border border-emerald-800">
                01
              </span>
              <div>
                <h4 className="text-xs font-bold text-white">Junte os arquivos</h4>
                <p className="text-[11px] text-emerald-200/80">
                  Retaguarda GB (SALDO-CODIGOS), VD+, Unidades
                </p>
              </div>
            </div>

            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-xl p-3 border border-white/10 flex items-center gap-3.5 transition-all">
              <span className="font-mono font-bold text-xs text-emerald-300 bg-emerald-950/60 px-2 py-1 rounded-md border border-emerald-800">
                02
              </span>
              <div>
                <h4 className="text-xs font-bold text-white">Defina o escopo & regras</h4>
                <p className="text-[11px] text-emerald-200/80">
                  Loção 400ml, Body Splash, Estojos ou sem refil
                </p>
              </div>
            </div>

            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-xl p-3 border border-white/10 flex items-center gap-3.5 transition-all">
              <span className="font-mono font-bold text-xs text-emerald-300 bg-emerald-950/60 px-2 py-1 rounded-md border border-emerald-800">
                03
              </span>
              <div>
                <h4 className="text-xs font-bold text-white">Gere a Matriz Excel</h4>
                <p className="text-[11px] text-emerald-200/80">
                  Pivot por ER/VD/Loja com download em 1 clique
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MAIN TWO-COLUMN DASHBOARD (1. Arquivos / 2. Escopo)   */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ------------------------------------------------------- */}
        {/* CARD 1: ARQUIVOS (Col 5)                                */}
        {/* ------------------------------------------------------- */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <h3 className="font-bold text-sm text-slate-900">Arquivos</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {rawRowsCount > 0 ? `${rawRowsCount.toLocaleString('pt-BR')} linhas` : 'nenhum'}
              </span>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/60 hover:bg-slate-50'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv,.xlsx,.xls"
                className="hidden"
              />

              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2.5 shadow-xs">
                <Upload className="w-5 h-5" />
              </div>

              <p className="font-semibold text-slate-800 text-xs mb-3">
                {loading ? 'Lendo e normalizando arquivo...' : 'Arraste os arquivos ou escolha abaixo'}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-4 py-2 bg-[#0d5c58] hover:bg-[#094744] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  Selecionar arquivos
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLoadRealData();
                  }}
                  title="Carregar o arquivo real da Retaguarda enviado (saldo-estoque-24-10-2026.csv)"
                  className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                >
                  Base Real (24 Lojas)
                </button>
              </div>

              <p className="text-[11px] text-slate-400 mt-3 font-normal">
                Retaguarda (CSV/XLSX) · VD+ · Unidades
              </p>
            </div>

            {/* Loaded File Info Card */}
            {rawRowsCount > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="font-semibold text-slate-900 block truncate" title={fileName}>
                      {fileName}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {rawRowsCount.toLocaleString('pt-BR')} registros carregados
                    </span>
                  </div>
                </div>

                <button
                  onClick={onClearFiles}
                  title="Remover arquivo carregado"
                  className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Action Bottom Bar */}
          <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              onClick={onAnalyzeAndGoToMatrix}
              disabled={rawRowsCount === 0}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs ${
                rawRowsCount > 0
                  ? 'bg-[#0d5c58] hover:bg-[#094744] text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Analisar arquivos e ver Matriz</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {rawRowsCount > 0 && (
              <button
                onClick={onClearFiles}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-1"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------- */}
        {/* CARD 2: ESCOPO & REGRAS (Col 7)                         */}
        {/* ------------------------------------------------------- */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-md bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h3 className="font-bold text-sm text-slate-900">Escopo & Regras de Filtro</h3>
            </div>
            <span className="text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              {REGEX_PRESETS.find((p) => p.id === filter.presetId)?.name || 'Personalizado'}
            </span>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Data de Referência */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block text-[11px] uppercase tracking-wider">
                Data de Referência
              </label>
              <input
                type="date"
                value={refDate}
                onChange={(e) => setRefDate(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            {/* Atalho de Regra / Preset */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block text-[11px] uppercase tracking-wider">
                Atalho de Regra / Preset
              </label>
              <select
                value={filter.presetId}
                onChange={(e) => {
                  const preset = REGEX_PRESETS.find((p) => p.id === e.target.value);
                  if (preset) onApplyPreset(preset);
                }}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:border-emerald-600 focus:outline-hidden"
              >
                {REGEX_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro de Volume */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block text-[11px] uppercase tracking-wider">
                Filtro de Volume (Regex)
              </label>
              <input
                type="text"
                value={filter.volumeRegex}
                onChange={(e) =>
                  onFilterChange({ ...filter, presetId: 'custom', volumeRegex: e.target.value })
                }
                placeholder="Ex: 400\s*ML ou 200\s*ML"
                className="w-full font-mono text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            {/* Exclusões Estritas */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block text-[11px] uppercase tracking-wider">
                Exclusões Estritas (Regex)
              </label>
              <input
                type="text"
                value={filter.exclusionRegex}
                onChange={(e) =>
                  onFilterChange({ ...filter, presetId: 'custom', exclusionRegex: e.target.value })
                }
                placeholder="Ex: (REF|REFIL|KIT|DEM)"
                className="w-full font-mono text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            {/* Modo de Consolidação de Códigos (De-Para) */}
            <div className="space-y-1 sm:col-span-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <label className="font-semibold text-slate-800 block text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-700" />
                Modo de Consolidação de Códigos (De-Para)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => onFilterChange({ ...filter, groupingMode: 'by-code' })}
                  className={`p-2 rounded-lg text-left border text-xs transition-all ${
                    filter.groupingMode === 'by-code'
                      ? 'bg-white border-slate-800 ring-1 ring-slate-800 font-bold text-slate-900 shadow-2xs'
                      : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                  }`}
                >
                  <div className="font-semibold">Por Código Individual</div>
                  <div className="text-[10px] text-slate-500">Cada SKU em linha separada</div>
                </button>
                <button
                  type="button"
                  onClick={() => onFilterChange({ ...filter, groupingMode: 'by-description' })}
                  className={`p-2 rounded-lg text-left border text-xs transition-all ${
                    filter.groupingMode === 'by-description'
                      ? 'bg-emerald-50 border-emerald-600 ring-1 ring-emerald-600 font-bold text-emerald-900 shadow-2xs'
                      : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                  }`}
                >
                  <div className="font-semibold text-emerald-800">Consolidar por Descrição</div>
                  <div className="text-[10px] text-emerald-700">Unifica V2, V3, V4 e N/FORM</div>
                </button>
                <button
                  type="button"
                  onClick={() => onFilterChange({ ...filter, groupingMode: 'by-depara' })}
                  className={`p-2 rounded-lg text-left border text-xs transition-all ${
                    filter.groupingMode === 'by-depara'
                      ? 'bg-purple-50 border-purple-600 ring-1 ring-purple-600 font-bold text-purple-900 shadow-2xs'
                      : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                  }`}
                >
                  <div className="font-semibold text-purple-800">Tabela De-Para</div>
                  <div className="text-[10px] text-purple-700">Vínculos manuais cadastrados</div>
                </button>
              </div>
            </div>
          </div>

          {/* Green Information Callout (matching OBTI) */}
          <div className="p-3 rounded-lg bg-emerald-50/80 border border-emerald-200/70 text-emerald-900 text-xs">
            <span className="font-semibold">Regra Ativa: </span>
            {filter.inclusionRegex
              ? `Inclusão obrigatória de /${filter.inclusionRegex}/`
              : 'Catálogo geral sem restrição de categoria'}
            {filter.exclusionRegex ? ` com exclusão de /${filter.exclusionRegex}/.` : '.'}
          </div>

          {/* Target Units Section (matching REGIONAIS in OBTI) */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Unidades / Lojas / ERs ({availableUnits.length})
              </span>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleSelectAllUnits}
                  className="text-emerald-700 hover:text-emerald-900 font-semibold"
                >
                  todas
                </button>
                <span className="text-slate-300">/</span>
                <button
                  type="button"
                  onClick={handleDeselectAllUnits}
                  className="text-slate-500 hover:text-slate-800 font-medium"
                >
                  nenhuma
                </button>
              </div>
            </div>

            <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-2.5 bg-slate-50/50 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {availableUnits.map((u) => {
                const selected = isUnitSelected(u.key);
                return (
                  <label
                    key={u.key}
                    className={`flex items-center gap-2 p-1.5 rounded-lg border cursor-pointer select-none transition-colors ${
                      selected
                        ? 'bg-white border-emerald-300 text-slate-900 font-medium shadow-2xs'
                        : 'bg-transparent border-transparent text-slate-500 hover:bg-white/60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => handleToggleUnit(u.key)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                    />
                    <span className="font-mono text-[11px] truncate" title={u.unitName || u.label}>
                      {u.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Additional Options */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filter.onlyNonZeroTotal}
                onChange={(e) =>
                  onFilterChange({ ...filter, onlyNonZeroTotal: e.target.checked })
                }
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
              />
              <span className="font-medium">Ocultar produtos com saldo zero na matriz</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
