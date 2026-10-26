import { useState } from 'react';
import { Check, Edit3, HelpCircle, Layers, Table } from 'lucide-react';
import { ColumnMapping, NormalizedStockRow, RawStockRow } from '../types/inventory';

interface RawDataViewProps {
  rawRows: RawStockRow[];
  headers: string[];
  mapping: ColumnMapping;
  onUpdateMapping: (newMapping: ColumnMapping) => void;
  normalizedRows: NormalizedStockRow[];
}

export function RawDataView({
  rawRows,
  headers,
  mapping,
  onUpdateMapping,
  normalizedRows,
}: RawDataViewProps) {
  const [isEditingMapping, setIsEditingMapping] = useState(false);
  const [localMapping, setLocalMapping] = useState<ColumnMapping>(mapping);

  const handleSaveMapping = () => {
    onUpdateMapping(localMapping);
    setIsEditingMapping(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Mapeamento de Colunas Detectado */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Table className="w-4 h-4 text-blue-600" />
              Mapeamento de Colunas da Retaguarda
            </h3>
            <p className="text-xs text-slate-500">
              O sistema detectou automaticamente as seguintes colunas no arquivo importado
            </p>
          </div>

          <button
            onClick={() => {
              if (isEditingMapping) {
                handleSaveMapping();
              } else {
                setLocalMapping(mapping);
                setIsEditingMapping(true);
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isEditingMapping
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {isEditingMapping ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Salvar Mapeamento</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                <span>Ajustar Colunas Manualmente</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          {/* Código */}
          <div className="p-3 rounded-lg border bg-slate-50/50">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">
              Coluna de Código do Produto
            </span>
            {isEditingMapping ? (
              <select
                value={localMapping.codeCol}
                onChange={(e) =>
                  setLocalMapping({ ...localMapping, codeCol: e.target.value })
                }
                className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white"
              >
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            ) : (
              <div className="font-mono font-semibold text-slate-900 truncate">
                {mapping.codeCol || '(Não detectado)'}
              </div>
            )}
          </div>

          {/* Descrição */}
          <div className="p-3 rounded-lg border bg-slate-50/50">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">
              Coluna de Descrição
            </span>
            {isEditingMapping ? (
              <select
                value={localMapping.descCol}
                onChange={(e) =>
                  setLocalMapping({ ...localMapping, descCol: e.target.value })
                }
                className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white"
              >
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            ) : (
              <div className="font-mono font-semibold text-slate-900 truncate">
                {mapping.descCol || '(Não detectado)'}
              </div>
            )}
          </div>

          {/* Saldo / Estoque */}
          <div className="p-3 rounded-lg border bg-slate-50/50">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">
              Coluna de Saldo / Estoque
            </span>
            {isEditingMapping ? (
              <select
                value={localMapping.stockCol}
                onChange={(e) =>
                  setLocalMapping({ ...localMapping, stockCol: e.target.value })
                }
                className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white"
              >
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            ) : (
              <div className="font-mono font-semibold text-slate-900 truncate">
                {mapping.stockCol || '(Não detectado)'}
              </div>
            )}
          </div>

          {/* Unidade / ER / VD */}
          <div className="p-3 rounded-lg border bg-slate-50/50">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">
              Coluna de Unidade (ER/VD/Loja)
            </span>
            {isEditingMapping ? (
              <select
                value={localMapping.unitCol}
                onChange={(e) =>
                  setLocalMapping({ ...localMapping, unitCol: e.target.value })
                }
                className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white"
              >
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            ) : (
              <div className="font-mono font-semibold text-slate-900 truncate">
                {mapping.unitCol || '(Não detectado)'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Visualizador das Linhas Normalizadas */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-600" />
            <h4 className="text-sm font-bold text-slate-900">
              Amostra de Linhas Normalizadas ({normalizedRows.length} registros)
            </h4>
          </div>
          <span className="text-xs text-slate-500">
            Exibindo os primeiros 50 registros processados
          </span>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 font-semibold text-slate-700">
              <tr>
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Código Produto</th>
                <th className="py-2.5 px-3">Descrição Normalizada</th>
                <th className="py-2.5 px-3">Tipo Unidade</th>
                <th className="py-2.5 px-3">Rótulo Unidade</th>
                <th className="py-2.5 px-3 text-right">Saldo Processado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {normalizedRows.slice(0, 50).map((row, idx) => (
                <tr key={row.id} className="hover:bg-slate-50/60">
                  <td className="py-2 px-3 text-slate-400 font-sans text-[11px]">{idx + 1}</td>
                  <td className="py-2 px-3 font-semibold text-slate-900">{row.productCode}</td>
                  <td className="py-2 px-3 font-sans truncate max-w-[320px]">{row.description}</td>
                  <td className="py-2 px-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border">
                      {row.unitType}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-800">{row.unitLabel}</td>
                  <td className="py-2 px-3 text-right font-semibold text-slate-900 tabular-nums">
                    {row.quantity.toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
