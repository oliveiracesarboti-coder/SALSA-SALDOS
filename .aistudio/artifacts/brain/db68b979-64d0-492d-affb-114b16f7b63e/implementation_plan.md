# App de Saldo Rápido — OBTI do Estoque

Sistema ágil e completo para ingestão, normalização, filtragem por expressões regulares e consolidação matricial de saldos de estoque da Retaguarda (GB) e VD+, gerando planilhas Excel prontas com totalizadores por unidade e produto.

## Decisões Confirmadas & Parâmetros

> [!IMPORTANT]
> As seguintes escolhas de arquitetura e experiência foram validadas e incorporadas ao plano:
> - **Processamento no Navegador**: Leitura ultra-rápida de CSV/XLSX, pivotamento e exportação de arquivo Excel (.xlsx) 100% no cliente, garantindo privacidade e sem gargalos de rede.
> - **Editor Avançado de Regras & Regex**: Painel com expressões regulares configuráveis, presets imediatos (CBEM, NSPA, Loção 400ml, Body Splash 200ml, exclusão estrita de refil/kit/amostras), testador em tempo real e busca livre.
> - **Massa de Dados Simulada Pronta**: Dados realistas integrados da Retaguarda GB (SALDO-CODIGOS) com múltiplas unidades (ER, VD, Lojas, HBD) para permitir teste instantâneo em 1 clique sem requerer upload imediato.

---

## 1. Visão Geral & Proposta de Valor

- **O que faz**: Automatiza o fluxo operacional de conferência de estoque entre unidades (Lojas, Espaços do Revendedor - ER, Venda Direta - VD e Hubs de Distribuição - HBD). Cruza os códigos e descrições brutas, filtra por categoria/volume com exclusão estrita de itens indesejados (refis, kits, brindes) e monta a matriz pivoteada com totais horizontais e verticais.
- **Público-Alvo**: Gestores de estoque, planejadores de demanda, franqueados e analistas de operações de varejo e venda direta.
- **Benefício**: Reduz um trabalho manual de 30 a 60 minutos no Excel para menos de 5 segundos, eliminando erros de digitação e fórmulas quebradas.

---

## 2. Experiência do Usuário & Design Visual

### Fluxo Operacional (4 Etapas Guiadas)
1. **Entrada de Dados**:
   - Botão para carregar arquivo da Retaguarda (`.csv` ou `.xlsx`), com suporte automático a separadores `;` e `,` e encodings UTF-8 / Latin1.
   - Botão para carregar base auxiliar (VD+ ou De-Para próprio de unidades e siglas).
   - Botão "Carregar Amostra da Retaguarda" para experimentação instantânea.
2. **Normalização & Sanitização**:
   - Tratamento automático de formatos numéricos brasileiros (`1.250,50` -> `1250.50`), remoção de linhas em branco e cabeçalhos residuais.
   - Extração por regex inteligente do código e tipo de unidade (ex: `"Loja: 14417"`, `"ER: 6848"`, `"VD: 102"`, `"HBD: 01"`).
3. **Editor Avançado de Regex & Filtros**:
   - Presets prontos com 1 clique:
     - *Loção Hidratante 400ml* (CBEM / NSPA sem refil).
     - *Body Splash 200ml* (sem amostras/kits).
     - *Cremes Corporais & Aveludados*.
   - Editor de Regex Customizável:
     - Expressão de Inclusão (ex: `(?i)(CBEM|NSPA|CUIDE).*?(LOC|HID|HD|AVELUD).*?(400\s*ML)`).
     - Expressão de Exclusão Estrita (ex: `(?i)(REF|REFIL|RPCK|DEM|ESTJ|KIT|MAOS|FAC|PES|ESF)`).
   - Testador em tempo real: digite ou insira uma descrição para ver o resultado do matching imediatamente.
4. **Matriz Dinâmica & Exportação Excel**:
   - Tabela matricial pivoteada com linhas (Código + Descrição) e colunas ordenadas por unidade (`ER`, `VD`, `Loja`, `HBD`).
   - Coluna de **Saldo Total por Produto** e linha de rodapé com **Total por Unidade**.
   - Barra de busca rápida na tabela para filtrar itens instantaneamente.
   - Botão de exportação **Baixar Excel (.xlsx)** com formatação profissional (cabeçalho destacado, alinhamento numérico, larguras de coluna automáticas e totais em negrito).

### Linguagem Visual & Tipografia
- **Tema**: Interface limpa e funcional estilo Enterprise Data Workspace, com tons neutros ardósia (`#0F172A`, `#F8FAFC`, bordas sutis `#E2E8F0`), acentos de foco em azul marinho/índigo (`#2563EB`) e indicadores semânticos sutis de dados.
- **Tipografia**: `Plus Jakarta Sans` para estrutura, títulos e controles; `JetBrains Mono` / `tabular-nums` rigorosamente aplicado para todos os números de estoque, códigos de produto e expressões regulares.
- **Zero-Pill Discipline**: Metadados organizados em texto limpo com separadores tipográficos (`·`), sem cápsulas artificiais.

---

## 3. Decisões de Produto & Arquitetura

```
┌────────────────────────────────────────────────────────────────────────┐
│                        App de Saldo Rápido                             │
├─────────────────────────┬──────────────────────────┬───────────────────┤
│    1. Ingestão / Dados   │    2. Motor de Regras    │   3. Visualização │
│                         │                          │      & Export     │
│ ┌─────────────────────┐ │ ┌──────────────────────┐ │ ┌───────────────┐ │
│ │ Leitor CSV / XLSX   │ │ │ Normalizador Decimal │ │ │ Matriz Pivot  │ │
│ │ (Encoding & Sep)    │ │ │ Extrator de Unidade  │ │ │ (Código x Und)│ │
│ ├─────────────────────┤ │ ├──────────────────────┤ │ ├───────────────┤ │
│ │ Amostra Retaguarda  │ │ │ Compilador Regex     │ │ │ Gerador XLSX  │ │
│ │ Integrada (1-click) │ │ │ (Inclusão / Exclusão)│ │ │ (Formatação)  │ │
│ └─────────────────────┘ │ └──────────────────────┘ │ └───────────────┘ │
└─────────────────────────┴──────────────────────────┴───────────────────┘
```

- **Processamento 100% In-Browser com `xlsx` (SheetJS)**:
  - Permite manipulação fluida de arquivos com milhares de linhas sem latência de rede.
  - Exportação direta de arquivo `.xlsx` com múltiplas planilhas (Matriz Consolidada, Dados Brutos Filtrados, Resumo por Unidade).
- **Mapeador Inteligente de Colunas**:
  - Reconhecimento automático de variações de cabeçalhos da Retaguarda (`CODIGO`, `COD_PROD`, `DESCRICAO`, `SALDO`, `ESTOQUE`, `UNIDADE`, `FILIAL`, etc.).

---

## 4. Etapas de Execução

1. **Instalação da biblioteca `xlsx`**: Para leitura e escrita binária de planilhas Excel nativas no cliente.
2. **Motor de Parsing & Normalização (`src/utils/parser.ts`)**:
   - Tratamento de CSV (; e ,) com conversão de codificação.
   - Regex de identificação de unidades (`ER`, `VD`, `Loja`, `HBD`).
   - Normalização de valores numéricos de estoque com fallback para zero.
3. **Motor de Regras Regex & Presets (`src/utils/rules.ts`)**:
   - Definição parametrizada de regras para marcas (CBEM, NSPA), volumes (400ml, 200ml, etc.) e termos proibidos (refis, kits, amostras).
   - Função de avaliação de elegibilidade e extração de atributos.
4. **Conjunto de Dados de Teste (`src/data/sampleInventory.ts`)**:
   - Massa de dados realista simulando arquivo `SALDO-CODIGOS-TODOSVDS.csv` com produtos conhecidos do Grupo Boticário e múltiplas filiais.
5. **Componente de Matriz Pivoteada & Exportador XLSX (`src/utils/exporter.ts`)**:
   - Pivot table agregando por `sum`, ordenação de colunas por tipo/código e cálculo de totais horizontais e verticais.
   - Geração de planilha estilizada no Excel com download automático nomeado como `Saldo_Rapido_YYYY-MM-DD.xlsx`.
6. **Interface Principal & Abas de Navegação (`src/App.tsx`)**:
   - Navegação limpa: Painel da Matriz, Editor de Regras Regex, Inspetor de Arquivo Bruto e De-Para de Siglas.
   - Barra superior com estatísticas resumidas (total de SKUs filtrados, volume total de peças em estoque, número de unidades mapeadas).
7. **Verificação & Testes de Compilação**: Executar `compile_applet` e validar todos os fluxos.
