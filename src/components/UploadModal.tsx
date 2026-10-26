import { useRef, useState } from 'react';
import { AlertCircle, FileSpreadsheet, RefreshCw, Upload, X } from 'lucide-react';
import { ColumnMapping, RawStockRow } from '../types/inventory';
import { parseStockFile } from '../utils/parser';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmImport: (rawRows: RawStockRow[], headers: string[], mapping: ColumnMapping, fileName: string) => void;
  onLoadRealData: () => void;
  onLoadSample: () => void;
}

export function UploadModal({
  isOpen,
  onClose,
  onConfirmImport,
  onLoadRealData,
  onLoadSample,
}: UploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleProcessFile = async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      const result = await parseStockFile(file);
      if (result.rawRows.length === 0) {
        setError('O arquivo carregado está vazio ou não pôde ser interpretado.');
        setLoading(false);
        return;
      }
      onConfirmImport(result.rawRows, result.headers, result.mapping, result.fileName);
      setLoading(false);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha ao processar o arquivo.');
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Importar Arquivo de Estoque
              </h3>
              <p className="text-xs text-slate-500">
                Retaguarda GB (SALDO-CODIGOS...), VD+ ou Curva ABC
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
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
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50'
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
            <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="font-semibold text-slate-800 text-sm">
              {loading ? 'Lendo e normalizando arquivo...' : 'Clique para selecionar ou arraste o arquivo'}
            </p>
            <p className="text-slate-500 mt-1">
              Formatos aceitos: <strong>.CSV</strong> (separador ';' ou ',') ou <strong>.XLSX</strong>
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              Trata automaticamente acentuação Latin1/UTF-8 e vírgula decimal
            </p>
          </div>

          {/* Or Divider */}
          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] text-slate-400 font-medium absolute">
              OU BASES PRÉ-CARREGADAS
            </span>
          </div>

          {/* Load Real Data Button */}
          <button
            type="button"
            onClick={() => {
              onLoadRealData();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl border border-blue-200 hover:border-blue-300 bg-blue-50/70 hover:bg-blue-50 text-blue-900 font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <RefreshCw className="w-4 h-4 text-blue-600" />
            <span>Carregar Arquivo Real Retaguarda (24 Lojas · 1.557 Registros)</span>
          </button>

          {/* Sample quick button */}
          <button
            type="button"
            onClick={() => {
              onLoadSample();
              onClose();
            }}
            className="w-full py-2 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-600 font-medium flex items-center justify-center gap-2 transition-colors text-[11px]"
          >
            <span>Carregar Dados de Demonstração (Loções 400ml / VD & ER)</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
