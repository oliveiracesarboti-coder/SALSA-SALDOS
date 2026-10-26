import { Download, Layers } from 'lucide-react';

interface HeaderProps {
  activeTab: 'upload' | 'matrix' | 'rules' | 'raw' | 'depara';
  onTabChange: (tab: 'upload' | 'matrix' | 'rules' | 'raw' | 'depara') => void;
  onExportExcel: () => void;
  hasData: boolean;
  filteredCount: number;
}

export function Header({
  activeTab,
  onTabChange,
  onExportExcel,
  hasData,
  filteredCount,
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Zone 1: OBTI Brand Wordmark matching image_266f115b.png */}
          <div
            onClick={() => onTabChange('upload')}
            className="flex items-center gap-3 shrink-0 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-[#0d5c58] text-white flex items-center justify-center font-bold text-base tracking-wider shadow-xs">
              OB
            </div>
            <div>
              <span className="text-base font-extrabold text-slate-900 tracking-tight block leading-none">
                OBTI
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                RELATÓRIOS DO ESTOQUE
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links Pill Container matching image_266f115b.png */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200">
            <button
              onClick={() => onTabChange('upload')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all whitespace-nowrap ${
                activeTab === 'upload'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Entrada & Arquivos
            </button>
            <button
              onClick={() => onTabChange('matrix')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all whitespace-nowrap ${
                activeTab === 'matrix'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Matriz de Saldo
            </button>
            <button
              onClick={() => onTabChange('rules')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all whitespace-nowrap ${
                activeTab === 'rules'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Editor de Regras
            </button>
            <button
              onClick={() => onTabChange('depara')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all whitespace-nowrap ${
                activeTab === 'depara'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Diagnóstico & De-Para
            </button>
          </nav>

          {/* Zone 3: Local Status & Primary Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* '● local' status pill from OBTI screenshot */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>local</span>
            </div>

            <button
              onClick={onExportExcel}
              disabled={!hasData || filteredCount === 0}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs ${
                hasData && filteredCount > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Excel (.xlsx)</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
