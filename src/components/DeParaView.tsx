import { useState } from 'react';
import { ArrowRight, BookOpen, Layers, Link2, Plus, RotateCcw, Search, Trash2 } from 'lucide-react';
import { DEFAULT_DE_PARA, DEFAULT_PRODUCT_DE_PARA } from '../data/abbreviations';
import { DeParaEntry, ProductDePara } from '../types/inventory';

interface DeParaViewProps {
  productDeParaList: ProductDePara[];
  onUpdateProductDeParaList: (list: ProductDePara[]) => void;
  onGoToMatrixWithDePara?: () => void;
}

export function DeParaView({
  productDeParaList,
  onUpdateProductDeParaList,
  onGoToMatrixWithDePara,
}: DeParaViewProps) {
  const [subTab, setSubTab] = useState<'products' | 'abbreviations'>('products');

  // Product De-Para Form State
  const [searchCode, setSearchCode] = useState('');
  const [newFromCode, setNewFromCode] = useState('');
  const [newToCode, setNewToCode] = useState('');
  const [newTargetDesc, setNewTargetDesc] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Siglas State
  const [entries, setEntries] = useState<DeParaEntry[]>(DEFAULT_DE_PARA);
  const [searchSigla, setSearchSigla] = useState('');
  const [newSigla, setNewSigla] = useState('');
  const [newSignificado, setNewSignificado] = useState('');
  const [newTipo, setNewTipo] = useState<'categoria' | 'marca' | 'unidade' | 'outro'>('categoria');

  // Filtered Product De-Para
  const filteredProducts = productDeParaList.filter(
    (p) =>
      p.fromCode.toLowerCase().includes(searchCode.toLowerCase()) ||
      p.toCode.toLowerCase().includes(searchCode.toLowerCase()) ||
      p.targetDescription.toLowerCase().includes(searchCode.toLowerCase()) ||
      (p.notes && p.notes.toLowerCase().includes(searchCode.toLowerCase()))
  );

  // Filtered Siglas
  const filteredSiglas = entries.filter(
    (e) =>
      e.sigla.toLowerCase().includes(searchSigla.toLowerCase()) ||
      e.significado.toLowerCase().includes(searchSigla.toLowerCase())
  );

  const handleAddProductDePara = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFromCode.trim() || !newToCode.trim()) return;

    const newEntry: ProductDePara = {
      id: `dp-${Date.now()}`,
      fromCode: newFromCode.trim(),
      toCode: newToCode.trim(),
      targetDescription: newTargetDesc.trim() || `Produto ${newToCode.trim()}`,
      notes: newNotes.trim() || 'Equivalência cadastrada manualmente',
    };

    onUpdateProductDeParaList([newEntry, ...productDeParaList]);
    setNewFromCode('');
    setNewToCode('');
    setNewTargetDesc('');
    setNewNotes('');
  };

  const handleDeleteProductDePara = (idToDelete: string) => {
    onUpdateProductDeParaList(productDeParaList.filter((p) => p.id !== idToDelete));
  };

  const handleRestoreDefaultProductDePara = () => {
    onUpdateProductDeParaList(DEFAULT_PRODUCT_DE_PARA);
  };

  const handleAddSigla = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSigla.trim() || !newSignificado.trim()) return;

    setEntries([
      {
        sigla: newSigla.trim().toUpperCase(),
        significado: newSignificado.trim(),
        tipo: newTipo,
      },
      ...entries,
    ]);

    setNewSigla('');
    setNewSignificado('');
  };

  const handleDeleteSigla = (indexToDelete: number) => {
    setEntries(entries.filter((_, idx) => idx !== indexToDelete));
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setSubTab('products')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
            subTab === 'products'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
          }`}
        >
          <Link2 className="w-3.5 h-3.5" />
          <span>De-Para de Códigos de Produto ({productDeParaList.length})</span>
        </button>

        <button
          onClick={() => setSubTab('abbreviations')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
            subTab === 'abbreviations'
              ? 'bg-[#0d5c58] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Dicionário de Siglas (LOC, HID, CPO...)</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* SUB-TAB 1: DE-PARA DE CÓDIGOS DE PRODUTOS                 */}
      {/* ========================================================= */}
      {subTab === 'products' && (
        <div className="space-y-6">
          {/* Info & Add Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-purple-700" />
                  De-Para de Códigos: Unificação de Produtos com a Mesma Descrição
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Vincule códigos legados ou diferentes versões (V2, V3, V4, N/FORM) para que a Matriz de Saldo
                  some seus estoques em uma única linha consolidada.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRestoreDefaultProductDePara}
                  className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition-colors"
                  title="Restaurar lista de equivalências conhecidas (Ameixa Negra, Deleite, Nuvem)"
                >
                  <RotateCcw className="w-3 h-3 text-slate-500" />
                  <span>Restaurar Padrões</span>
                </button>

                {onGoToMatrixWithDePara && (
                  <button
                    type="button"
                    onClick={onGoToMatrixWithDePara}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <span>Ver Matriz Unificada</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Form to add code mapping */}
            <form onSubmit={handleAddProductDePara} className="mt-4 pt-4 border-t border-slate-100 text-xs space-y-3">
              <span className="font-semibold text-slate-800 block text-[11px] uppercase tracking-wider">
                Adicionar Novo Vínculo De-Para:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] font-medium text-slate-500 block mb-0.5">
                    Código de Origem (Legado / V3)
                  </label>
                  <input
                    type="text"
                    value={newFromCode}
                    onChange={(e) => setNewFromCode(e.target.value)}
                    placeholder="Ex: 48281"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-xs focus:border-purple-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-medium text-slate-500 block mb-0.5">
                    Código de Destino (Principal / V4)
                  </label>
                  <input
                    type="text"
                    value={newToCode}
                    onChange={(e) => setNewToCode(e.target.value)}
                    placeholder="Ex: 88082"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-xs focus:border-purple-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-medium text-slate-500 block mb-0.5">
                    Descrição Padronizada / Frasco
                  </label>
                  <input
                    type="text"
                    value={newTargetDesc}
                    onChange={(e) => setNewTargetDesc(e.target.value)}
                    placeholder="Ex: NSPA LOC CPO AMEIXA NEGRA 400ml"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:border-purple-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-medium text-slate-500 block mb-0.5">
                    Observação
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      placeholder="Ex: Unifica V3 e V4"
                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:border-purple-600 focus:outline-hidden"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg shrink-0 transition-colors"
                    >
                      Vincular
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Product De-Para Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="relative w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  placeholder="Buscar por código ou descrição..."
                  className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden"
                />
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {filteredProducts.length} de {productDeParaList.length} vínculos
              </span>
            </div>

            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 font-semibold text-slate-700">
                  <tr>
                    <th className="py-2.5 px-4 w-36">Código Origem</th>
                    <th className="py-2.5 px-4 w-12 text-center"></th>
                    <th className="py-2.5 px-4 w-36">Código Destino</th>
                    <th className="py-2.5 px-4">Descrição Unificada</th>
                    <th className="py-2.5 px-4">Observação</th>
                    <th className="py-2.5 px-4 w-16 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Nenhum vínculo De-Para encontrado.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-700">
                          <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {p.fromCode}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-center text-slate-400">
                          <ArrowRight className="w-3.5 h-3.5 mx-auto text-purple-600" />
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-purple-900">
                          <span className="bg-purple-50 px-2 py-0.5 rounded border border-purple-200 text-purple-800">
                            {p.toCode}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-slate-900">
                          {p.targetDescription}
                        </td>
                        <td className="py-2.5 px-4 text-slate-500 italic text-[11px]">
                          {p.notes || '-'}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            onClick={() => handleDeleteProductDePara(p.id)}
                            title="Excluir vínculo"
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 2: DICIONÁRIO DE SIGLAS                           */}
      {/* ========================================================= */}
      {subTab === 'abbreviations' && (
        <div className="space-y-6">
          {/* Introduction Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#0d5c58]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Dicionário De-Para de Siglas e Abreviações
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {entries.length} termos cadastrados
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-3xl">
              Tabela de referência das siglas comumente encontradas nos cadastros da Retaguarda GB,
              VD+ e notas fiscais. As siglas auxiliam na criação de regras regex e entendimento das descrições resumidas.
            </p>

            {/* Form to add custom abbreviation */}
            <form onSubmit={handleAddSigla} className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2 text-xs">
              <input
                type="text"
                value={newSigla}
                onChange={(e) => setNewSigla(e.target.value)}
                placeholder="Sigla (ex: CPO)"
                className="w-32 px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-xs focus:border-emerald-600 focus:outline-hidden"
              />
              <input
                type="text"
                value={newSignificado}
                onChange={(e) => setNewSignificado(e.target.value)}
                placeholder="Significado (ex: Corporal)"
                className="flex-1 min-w-[200px] px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:border-emerald-600 focus:outline-hidden"
              />
              <select
                value={newTipo}
                onChange={(e) => setNewTipo(e.target.value as DeParaEntry['tipo'])}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:border-emerald-600 focus:outline-hidden"
              >
                <option value="categoria">Categoria / Formato</option>
                <option value="marca">Marca</option>
                <option value="unidade">Unidade / Canal</option>
                <option value="outro">Exclusão / Outro</option>
              </select>
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-[#0d5c58] hover:bg-[#094744] text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Sigla</span>
              </button>
            </form>
          </div>

          {/* Table list */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="relative w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchSigla}
                  onChange={(e) => setSearchSigla(e.target.value)}
                  placeholder="Buscar sigla ou significado..."
                  className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden"
                />
              </div>
              <span className="text-xs text-slate-400">
                {filteredSiglas.length} de {entries.length} exibidos
              </span>
            </div>

            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 font-semibold text-slate-700">
                  <tr>
                    <th className="py-2.5 px-4 w-32">Sigla / Código</th>
                    <th className="py-2.5 px-4">Significado Padrão</th>
                    <th className="py-2.5 px-4 w-40">Tipo</th>
                    <th className="py-2.5 px-4 w-16 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredSiglas.map((item, idx) => (
                    <tr key={`${item.sigla}-${idx}`} className="hover:bg-slate-50/60">
                      <td className="py-2 px-4 font-mono font-bold text-slate-900">{item.sigla}</td>
                      <td className="py-2 px-4 font-medium text-slate-800">{item.significado}</td>
                      <td className="py-2 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 capitalize">
                          {item.tipo}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-right">
                        <button
                          onClick={() => handleDeleteSigla(idx)}
                          title="Excluir sigla"
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
