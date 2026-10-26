import { useState } from 'react';
import { AlertCircle, CheckCircle, Code2, Copy, Play, Sparkles, Tag, XCircle } from 'lucide-react';
import { FilterState, RegexPreset } from '../types/inventory';
import { REGEX_PRESETS, testProductEligibility } from '../utils/rules';

interface RegexWorkbenchProps {
  filter: FilterState;
  onFilterChange: (newFilter: FilterState) => void;
  onApplyPreset: (preset: RegexPreset) => void;
}

const TEST_SAMPLES = [
  'CBEM LOC HID CPO DELEITE 400ML',
  'CBEM REFIL LOC HID CPO NUVEM 400ML',
  'NSPA LOC HID DES AVELUD AMEIXA 400ML',
  'NSPA DES COL BODY SPLASH AMEIXA 200ML',
  'KIT CBEM DELEITE (LOC 400ML + SAB)',
  'CBEM CRM HID MAOS DELEITE 50G',
  'DEM BOTI MALBEC EDT 100ML TESTER',
];

export function RegexWorkbench({
  filter,
  onFilterChange,
  onApplyPreset,
}: RegexWorkbenchProps) {
  const [testInput, setTestInput] = useState('CBEM LOC HID CPO DELEITE 400ML');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Evaluate current test input with active filter rules
  const testResult = testProductEligibility(testInput, filter);

  // Regex validation check
  function validateRegex(pattern: string): { valid: boolean; error?: string } {
    if (!pattern.trim()) return { valid: true };
    try {
      new RegExp(pattern);
      return { valid: true };
    } catch (err: unknown) {
      return { valid: false, error: err instanceof Error ? err.message : 'Regex inválido' };
    }
  }

  const incValidation = validateRegex(filter.inclusionRegex);
  const excValidation = validateRegex(filter.exclusionRegex);
  const volValidation = validateRegex(filter.volumeRegex);
  const brandValidation = validateRegex(filter.brandRegex);

  const handleInsertToken = (target: 'inclusion' | 'exclusion', token: string) => {
    if (target === 'exclusion') {
      const current = filter.exclusionRegex.trim();
      let updated = '';
      if (!current) {
        updated = `(${token})`;
      } else if (current.startsWith('(') && current.endsWith(')')) {
        const inner = current.slice(1, -1);
        updated = `(${inner}|${token})`;
      } else {
        updated = `(${current}|${token})`;
      }
      onFilterChange({ ...filter, presetId: 'custom', exclusionRegex: updated });
    } else {
      const current = filter.inclusionRegex.trim();
      let updated = '';
      if (!current) {
        updated = `(${token})`;
      } else if (current.startsWith('(') && current.endsWith(')')) {
        const inner = current.slice(1, -1);
        updated = `(${inner}|${token})`;
      } else {
        updated = `(${current}|${token})`;
      }
      onFilterChange({ ...filter, presetId: 'custom', inclusionRegex: updated });
    }

    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 1500);
  };

  return (
    <div className="space-y-6">
      {/* 1. Presets Rápidos */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Presets de Filtragem Prontos
            </h3>
            <p className="text-xs text-slate-500">
              Escolha uma regra pré-configurada ou ajuste os parâmetros avançados abaixo
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {filter.presetId === 'custom' ? 'Modo Especialista (Custom)' : `Preset: ${filter.presetId}`}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {REGEX_PRESETS.map((p) => {
            const isSelected = filter.presetId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onApplyPreset(p)}
                className={`p-2.5 rounded-lg text-left transition-all border text-xs ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-600 font-semibold text-blue-900 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="font-semibold truncate">{p.name}</div>
                <div className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {p.shortDesc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Editor Avançado de Expressões Regulares */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">
              Editor de Expressões Regulares (Regex)
            </h3>
          </div>
          <button
            onClick={() => {
              onFilterChange({
                ...filter,
                presetId: 'custom',
                inclusionRegex: '',
                exclusionRegex: '',
                volumeRegex: '',
                brandRegex: '',
              });
            }}
            className="text-xs text-slate-500 hover:text-slate-800 underline"
          >
            Limpar todos os filtros
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Inclusão Obrigatória */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Inclusão Obrigatória (Categoria / Termo)
              </label>
              {!incValidation.valid && (
                <span className="text-[11px] text-rose-600 font-medium">Sintaxe inválida</span>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                value={filter.inclusionRegex}
                onChange={(e) =>
                  onFilterChange({ ...filter, presetId: 'custom', inclusionRegex: e.target.value })
                }
                placeholder="Ex: (LOC|HID|HD|AVELUD|NUTR)"
                className={`w-full font-mono text-xs px-3 py-2 rounded-lg border bg-slate-50 focus:bg-white focus:outline-hidden ${
                  incValidation.valid
                    ? 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    : 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                }`}
              />
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 mt-1">
              <span>Inserir rápido:</span>
              {['LOC', 'HID', 'AVELUD', 'SPLASH', 'CRM'].map((token) => (
                <button
                  key={token}
                  type="button"
                  onClick={() => handleInsertToken('inclusion', token)}
                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-mono"
                >
                  +{token}
                </button>
              ))}
            </div>
          </div>

          {/* Exclusão Estrita */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Exclusão Estrita (Rejeição Imediata)
              </label>
              {!excValidation.valid && (
                <span className="text-[11px] text-rose-600 font-medium">Sintaxe inválida</span>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                value={filter.exclusionRegex}
                onChange={(e) =>
                  onFilterChange({ ...filter, presetId: 'custom', exclusionRegex: e.target.value })
                }
                placeholder="Ex: (REF|REFIL|RPCK|DEM|ESTJ|KIT|MAOS|FAC|PES|ESF)"
                className={`w-full font-mono text-xs px-3 py-2 rounded-lg border bg-slate-50 focus:bg-white focus:outline-hidden ${
                  excValidation.valid
                    ? 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    : 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                }`}
              />
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 mt-1">
              <span>Inserir rápido:</span>
              {['REF', 'REFIL', 'KIT', 'DEM', 'ESTJ', 'MAOS'].map((token) => (
                <button
                  key={token}
                  type="button"
                  onClick={() => handleInsertToken('exclusion', token)}
                  className="px-1.5 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-[10px] font-mono"
                >
                  +{token}
                </button>
              ))}
            </div>
          </div>

          {/* Volume */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-800">
              Volume Obrigatório (Regex)
            </label>
            <input
              type="text"
              value={filter.volumeRegex}
              onChange={(e) =>
                onFilterChange({ ...filter, presetId: 'custom', volumeRegex: e.target.value })
              }
              placeholder="Ex: 400\\s*ML ou 200\\s*ML"
              className="w-full font-mono text-xs px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            />
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span>Opções:</span>
              {['400\\s*ML', '200\\s*ML', '100\\s*ML', '50\\s*G'].map((vol) => (
                <button
                  key={vol}
                  type="button"
                  onClick={() => onFilterChange({ ...filter, presetId: 'custom', volumeRegex: vol })}
                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-mono"
                >
                  {vol.replace('\\s*', ' ')}
                </button>
              ))}
              <button
                type="button"
                onClick={() => onFilterChange({ ...filter, presetId: 'custom', volumeRegex: '' })}
                className="text-[10px] text-slate-400 hover:text-slate-600 underline"
              >
                Qualquer volume
              </button>
            </div>
          </div>

          {/* Marca */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-800">
              Marca Alvo (Regex)
            </label>
            <input
              type="text"
              value={filter.brandRegex}
              onChange={(e) =>
                onFilterChange({ ...filter, presetId: 'custom', brandRegex: e.target.value })
              }
              placeholder="Ex: (CBEM|CUIDE|NSPA|SPA)"
              className="w-full font-mono text-xs px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            />
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span>Opções:</span>
              <button
                type="button"
                onClick={() =>
                  onFilterChange({ ...filter, presetId: 'custom', brandRegex: '(CBEM|CUIDE)' })
                }
                className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-mono"
              >
                Cuide-se Bem
              </button>
              <button
                type="button"
                onClick={() =>
                  onFilterChange({ ...filter, presetId: 'custom', brandRegex: '(NSPA|SPA)' })
                }
                className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-mono"
              >
                Nativa SPA
              </button>
              <button
                type="button"
                onClick={() => onFilterChange({ ...filter, presetId: 'custom', brandRegex: '' })}
                className="text-[10px] text-slate-400 hover:text-slate-600 underline"
              >
                Todas as marcas
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bancada de Teste em Tempo Real (Live Matcher) */}
      <div className="bg-slate-900 text-slate-100 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              Bancada de Teste Regex em Tempo Real
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Digite qualquer descrição para validar o comportamento dos filtros
          </span>
        </div>

        {/* Input box */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Digite uma descrição de produto da Retaguarda..."
              className="flex-1 font-mono text-xs px-3.5 py-2.5 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-blue-400 focus:outline-hidden"
            />
          </div>

          {/* Quick preset test pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
            <span>Exemplos para testar:</span>
            {TEST_SAMPLES.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => setTestInput(sample)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  testInput === sample
                    ? 'bg-blue-600 text-white font-medium'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {sample.slice(0, 32)}...
              </button>
            ))}
          </div>

          {/* Result card */}
          <div className="mt-4 p-4 rounded-lg bg-slate-800/80 border border-slate-700 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">Resultado:</span>
                {testResult.eligible ? (
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    ELEGÍVEL (Incluído na Matriz)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" />
                    REJEITADO (Excluído)
                  </span>
                )}
              </div>

              {testResult.rejectionReason && (
                <div className="text-rose-400 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Motivo: {testResult.rejectionReason}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 text-slate-300">
              <div>
                <span className="text-slate-500 block text-[11px]">Marca Detectada</span>
                <span className="font-semibold text-white">{testResult.brand || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Categoria</span>
                <span className="font-semibold text-white">{testResult.category || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Volume</span>
                <span className="font-semibold text-white font-mono">{testResult.volume || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Regras Acionadas</span>
                <span className="text-slate-300 font-mono text-[11px]">
                  {testResult.matchedRules.length > 0
                    ? testResult.matchedRules.join(', ')
                    : 'Nenhuma'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
