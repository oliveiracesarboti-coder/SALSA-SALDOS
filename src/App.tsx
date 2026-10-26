/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState } from 'react';
import { DeParaView } from './components/DeParaView';
import { Header } from './components/Header';
import { KpiBar } from './components/KpiBar';
import { MatrixView } from './components/MatrixView';
import { ObtiUploadView } from './components/ObtiUploadView';
import { RawDataView } from './components/RawDataView';
import { RegexWorkbench } from './components/RegexWorkbench';
import { UploadModal } from './components/UploadModal';
import { DEFAULT_PRODUCT_DE_PARA } from './data/abbreviations';
import { SAMPLE_HEADERS, SAMPLE_RAW_STOCK_DATA } from './data/sampleInventory';
import { ColumnMapping, FilterState, ProductDePara, RawStockRow, RegexPreset } from './types/inventory';
import { exportMatrixToExcel } from './utils/exporter';
import { detectColumnMapping, loadRealStockFile, normalizeStockData } from './utils/parser';
import { buildStockMatrix } from './utils/pivot';
import { REGEX_PRESETS } from './utils/rules';

export default function App() {
  // Default to 'upload' tab to show the OBTI screen from image_266f115b.png
  const [activeTab, setActiveTab] = useState<'upload' | 'matrix' | 'rules' | 'raw' | 'depara'>('upload');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Raw file state
  const [rawRows, setRawRows] = useState<RawStockRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({ codeCol: '', descCol: '', stockCol: '', unitCol: '' });
  const [fileName, setFileName] = useState('');

  // Product De-Para List State
  const [productDeParaList, setProductDeParaList] = useState<ProductDePara[]>(DEFAULT_PRODUCT_DE_PARA);

  // Filter & Regex State - default to "Todos os Produtos"
  const initialPreset = REGEX_PRESETS[0]; // 'todos-sem-filtro'
  const [filter, setFilter] = useState<FilterState>({
    presetId: initialPreset.id,
    inclusionRegex: initialPreset.inclusionPattern,
    exclusionRegex: initialPreset.exclusionPattern,
    volumeRegex: initialPreset.volumePattern,
    brandRegex: initialPreset.brandPattern,
    customSearchText: '',
    onlyNonZeroTotal: false,
    selectedUnits: [],
    groupingMode: 'by-code',
  });

  // Normalized rows
  const normalizedRows = useMemo(() => {
    return normalizeStockData(rawRows, mapping);
  }, [rawRows, mapping]);

  // Pivoted matrix data with De-Para support
  const pivotData = useMemo(() => {
    return buildStockMatrix(normalizedRows, filter, productDeParaList);
  }, [normalizedRows, filter, productDeParaList]);

  // Active preset name for display
  const currentPresetName = useMemo(() => {
    const matched = REGEX_PRESETS.find((p) => p.id === filter.presetId);
    return matched ? matched.name : 'Personalizado (Especialista)';
  }, [filter.presetId]);

  // Load real dataset from uploaded Retaguarda file (24 stores)
  const handleLoadRealData = async () => {
    try {
      const result = await loadRealStockFile();
      setRawRows(result.rawRows);
      setHeaders(result.headers);
      setMapping(result.mapping);
      setFileName(result.fileName);
      const allPreset = REGEX_PRESETS[0];
      setFilter((prev) => ({
        ...prev,
        presetId: allPreset.id,
        inclusionRegex: allPreset.inclusionPattern,
        exclusionRegex: allPreset.exclusionPattern,
        volumeRegex: allPreset.volumePattern,
        brandRegex: allPreset.brandPattern,
      }));
    } catch (err) {
      console.error('Falha ao carregar base real:', err);
    }
  };

  // Pre-load the real Retaguarda dataset on initial mount
  useEffect(() => {
    handleLoadRealData();
  }, []);

  // Load simulated sample data
  const handleLoadSample = () => {
    setRawRows(SAMPLE_RAW_STOCK_DATA);
    setHeaders(SAMPLE_HEADERS);
    setMapping(detectColumnMapping(SAMPLE_HEADERS));
    setFileName('SALDO-CODIGOS-TODOSVDS.csv (Amostra Loções)');
  };

  // Clear loaded files
  const handleClearFiles = () => {
    setRawRows([]);
    setHeaders([]);
    setMapping({ codeCol: '', descCol: '', stockCol: '', unitCol: '' });
    setFileName('');
  };

  // Import confirmed from upload modal or dropzone
  const handleConfirmImport = (
    newRawRows: RawStockRow[],
    newHeaders: string[],
    newMapping: ColumnMapping,
    newFileName: string
  ) => {
    setRawRows(newRawRows);
    setHeaders(newHeaders);
    setMapping(newMapping);
    setFileName(newFileName);
  };

  // Apply a preset rule
  const handleApplyPreset = (preset: RegexPreset) => {
    setFilter({
      ...filter,
      presetId: preset.id,
      inclusionRegex: preset.inclusionPattern,
      exclusionRegex: preset.exclusionPattern,
      volumeRegex: preset.volumePattern,
      brandRegex: preset.brandPattern,
    });
  };

  // Export Excel
  const handleExportExcel = () => {
    exportMatrixToExcel(pivotData, filter, currentPresetName);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 1. Top Navigation Bar (matching OBTI) */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onExportExcel={handleExportExcel}
        hasData={rawRows.length > 0}
        filteredCount={pivotData.filteredCount}
      />

      {/* 2. KPI / Metrics Strip (shown when data is present) */}
      {rawRows.length > 0 && (
        <KpiBar
          pivotData={pivotData}
          fileName={fileName}
          presetName={currentPresetName}
        />
      )}

      {/* 3. Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* TAB 1: OBTI UPLOAD & SCOPE VIEW (The exact requested screen) */}
        {activeTab === 'upload' && (
          <ObtiUploadView
            fileName={fileName}
            rawRowsCount={rawRows.length}
            availableUnits={pivotData.unitColumns}
            filter={filter}
            onFilterChange={setFilter}
            onApplyPreset={handleApplyPreset}
            onConfirmImport={handleConfirmImport}
            onLoadRealData={handleLoadRealData}
            onLoadSample={handleLoadSample}
            onAnalyzeAndGoToMatrix={() => setActiveTab('matrix')}
            onClearFiles={handleClearFiles}
          />
        )}

        {/* TAB 2: PIVOTED MATRIX VIEW */}
        {activeTab === 'matrix' && (
          <div className="space-y-6">
            {/* Quick Preset Selector Bar at top of matrix for immediate switching */}
            <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-semibold text-slate-700 mr-1">Regras Rápidas:</span>
                {REGEX_PRESETS.map((p) => {
                  const active = filter.presetId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleApplyPreset(p)}
                      className={`px-2.5 py-1 rounded-md transition-colors font-medium whitespace-nowrap ${
                        active
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('upload')}
                  className="text-emerald-700 hover:text-emerald-800 font-semibold text-xs"
                >
                  &larr; Voltar para Entrada de Arquivos
                </button>
                <span className="text-slate-300">|</span>
                <button
                  onClick={() => setActiveTab('rules')}
                  className="text-blue-600 hover:text-blue-700 font-semibold text-xs"
                >
                  Editor de Regex &rarr;
                </button>
              </div>
            </div>

            {/* Matrix View */}
            <MatrixView
              pivotData={pivotData}
              filter={filter}
              onFilterChange={setFilter}
              onExportExcel={handleExportExcel}
            />
          </div>
        )}

        {/* TAB 3: REGEX WORKBENCH */}
        {activeTab === 'rules' && (
          <RegexWorkbench
            filter={filter}
            onFilterChange={setFilter}
            onApplyPreset={handleApplyPreset}
          />
        )}

        {/* TAB 4: RAW DATA INSPECTOR */}
        {activeTab === 'raw' && (
          <RawDataView
            rawRows={rawRows}
            headers={headers}
            mapping={mapping}
            onUpdateMapping={setMapping}
            normalizedRows={normalizedRows}
          />
        )}

        {/* TAB 5: DE-PARA DICTIONARY & PRODUCT CODE EQUIVALENCES */}
        {activeTab === 'depara' && (
          <DeParaView
            productDeParaList={productDeParaList}
            onUpdateProductDeParaList={setProductDeParaList}
            onGoToMatrixWithDePara={() => {
              setFilter((prev) => ({ ...prev, groupingMode: 'by-depara' }));
              setActiveTab('matrix');
            }}
          />
        )}
      </main>

      {/* 4. Upload Modal (when opened from anywhere) */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onConfirmImport={handleConfirmImport}
        onLoadRealData={handleLoadRealData}
        onLoadSample={handleLoadSample}
      />
    </div>
  );
}
