import { Box, Building2, CheckCircle2, FileText, Layers } from 'lucide-react';
import { PivotResult } from '../utils/pivot';

interface KpiBarProps {
  pivotData: PivotResult;
  fileName: string;
  presetName: string;
}

export function KpiBar({ pivotData, fileName, presetName }: KpiBarProps) {
  // Count by unit type
  const erCount = pivotData.unitColumns.filter((u) => u.type === 'ER').length;
  const vdCount = pivotData.unitColumns.filter((u) => u.type === 'VD').length;
  const lojaCount = pivotData.unitColumns.filter((u) => u.type === 'Loja').length;
  const hbdCount = pivotData.unitColumns.filter((u) => u.type === 'HBD').length;

  return (
    <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Left: File and Preset badge/info */}
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 font-medium text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span className="truncate max-w-[220px]" title={fileName}>
              {fileName || 'Nenhum arquivo carregado'}
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Regra ativa:</span>
            <span className="font-semibold text-slate-800">{presetName}</span>
          </div>
        </div>

        {/* Right: Metrics Strip with tabular-nums */}
        <div className="flex flex-wrap items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <div>
              <span className="text-slate-500 block">SKUs na Matriz</span>
              <span className="font-semibold text-slate-900 font-mono tabular-nums text-sm">
                {pivotData.filteredCount}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Box className="w-4 h-4 text-emerald-600" />
            <div>
              <span className="text-slate-500 block">Total Peças em Estoque</span>
              <span className="font-semibold text-slate-900 font-mono tabular-nums text-sm">
                {pivotData.grandTotal.toLocaleString('pt-BR')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-600" />
            <div>
              <span className="text-slate-500 block">Unidades ({pivotData.unitColumns.length})</span>
              <span className="font-medium text-slate-700 text-xs">
                {erCount > 0 && `${erCount} ER `}
                {vdCount > 0 && `${vdCount} VD `}
                {lojaCount > 0 && `${lojaCount} Loja `}
                {hbdCount > 0 && `${hbdCount} HBD`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
            <CheckCircle2 className="w-4 h-4 text-slate-400" />
            <div>
              <span className="text-slate-500 block">Linhas Analisadas</span>
              <span className="font-medium text-slate-700 font-mono tabular-nums">
                {pivotData.totalInputRows} ({pivotData.excludedCount} excluídas)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
