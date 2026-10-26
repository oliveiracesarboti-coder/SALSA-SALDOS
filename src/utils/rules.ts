import { FilterState, RegexPreset } from '../types/inventory';

export const REGEX_PRESETS: RegexPreset[] = [
  {
    id: 'todos-sem-filtro',
    name: 'Todos os Produtos',
    shortDesc: 'Exibe todo o catálogo do arquivo sem exclusões',
    inclusionPattern: '',
    exclusionPattern: '',
    volumePattern: '',
    brandPattern: '',
    categoryName: 'Todos',
  },
  {
    id: 'estojos-kits',
    name: 'Estojos & Kits (Geral)',
    shortDesc: 'Todos os Estojos, Kits de presente e Packs Promocionais (ESTJ, KIT, PMPCK)',
    inclusionPattern: '(ESTJ|KIT|PMPCK|COMB)',
    exclusionPattern: '',
    volumePattern: '',
    brandPattern: '',
    categoryName: 'Estojos & Kits',
  },
  {
    id: 'estojos-cbem',
    name: 'Estojos Cuide-se Bem',
    shortDesc: 'Estojos e Kits da linha Cuide-se Bem (Nuvem, Deleite, Pessegura, etc.)',
    inclusionPattern: '(ESTJ|KIT|PMPCK)',
    exclusionPattern: '',
    volumePattern: '',
    brandPattern: '(CBEM|CUIDE)',
    categoryName: 'Estojos Cuide-se Bem',
  },
  {
    id: 'estojos-nspa',
    name: 'Estojos Nativa SPA',
    shortDesc: 'Estojos e Kits Nativa SPA (Ameixa, Ameixa Negra, Quinoa, Merlot, etc.)',
    inclusionPattern: '(ESTJ|KIT|PMPCK)',
    exclusionPattern: '',
    volumePattern: '',
    brandPattern: '(NSPA|SPA)',
    categoryName: 'Estojos Nativa SPA',
  },
  {
    id: 'estojos-perfumaria',
    name: 'Estojos Perfumaria',
    shortDesc: 'Estojos Malbec, Lily, Zaad, Floratta, Egeo, Liz, Elysée, etc.',
    inclusionPattern: '(ESTJ|KIT)',
    exclusionPattern: '',
    volumePattern: '',
    brandPattern: '(MALBEC|LILY|ZAAD|FLORATTA|EGEO|ELYS|COFFEE|ARBO|UOMINI|HER CODE|GLAMOUR|LIZ|CELEBRE|CLASH)',
    categoryName: 'Estojos Perfumaria',
  },
  {
    id: 'locao-400ml-sem-refil',
    name: 'Loção 400ml (Sem Refil)',
    shortDesc: 'Loções corporais 400ml CBEM e NSPA sem refil, kit ou miniaturas',
    inclusionPattern: '(LOC|HID|HD|AVELUD|NUTR)',
    exclusionPattern: '(REF|REFIL|RPCK|DEM|ESTJ|KIT|MAOS|FAC|PES|ESF)',
    volumePattern: '400\\s*ML',
    brandPattern: '(CBEM|CUIDE|NSPA|SPA)',
    categoryName: 'Loção Corporal 400ml',
  },
  {
    id: 'body-splash-200ml',
    name: 'Body Splash 200ml',
    shortDesc: 'Todos os Body Splash 200ml (sem amostras/kits)',
    inclusionPattern: '(SPL|SPLASH|BS)',
    exclusionPattern: '(DEM|ESTJ|KIT|MINI)',
    volumePattern: '200\\s*ML',
    brandPattern: '',
    categoryName: 'Body Splash 200ml',
  },
  {
    id: 'apenas-refil-400ml',
    name: 'Apenas Refis 400ml',
    shortDesc: 'Somente refis de loções 400ml para reposição',
    inclusionPattern: '(REF|REFIL|RPCK)',
    exclusionPattern: '(DEM|ESTJ|KIT)',
    volumePattern: '400\\s*ML',
    brandPattern: '',
    categoryName: 'Refil 400ml',
  },
];

export function normalizeText(text: string): string {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
}

export function detectBrand(desc: string): string {
  const norm = normalizeText(desc);
  if (/(CBEM|CUIDE[-\s]?SE\s*BEM)/i.test(norm)) return 'Cuide-se Bem';
  if (/(NSPA|NATIVA\s*SPA)/i.test(norm)) return 'Nativa SPA';
  if (/MALBEC/i.test(norm)) return 'Malbec';
  if (/LILY/i.test(norm)) return 'Lily';
  if (/ZAAD/i.test(norm)) return 'Zaad';
  if (/EGEO/i.test(norm)) return 'Egeo';
  if (/ELYSEE|ELYS/i.test(norm)) return 'Elysée';
  if (/FLORATTA|FLOR/i.test(norm)) return 'Floratta';
  if (/GLAMOUR/i.test(norm)) return 'Glamour';
  if (/LIZ/i.test(norm)) return 'Liz';
  if (/ARBO/i.test(norm)) return 'Arbo';
  if (/CELEBRE/i.test(norm)) return 'Celebre';
  if (/COFFEE/i.test(norm)) return 'Coffee';
  if (/CLASH/i.test(norm)) return 'Clash';
  if (/HER CODE/i.test(norm)) return 'Her Code';
  if (/UOMINI/i.test(norm)) return 'Uomini';
  if (/BOTIK/i.test(norm)) return 'Botik';
  if (/DR BOTICA/i.test(norm)) return 'Dr. Botica';
  if (/BOTI BABY/i.test(norm)) return 'Boti Baby';
  if (/BOTICOLL|PORTINARI/i.test(norm)) return 'Boticollection';
  if (/SIAGE/i.test(norm)) return 'Eudora Siàge';
  if (/INSTANCE/i.test(norm)) return 'Eudora Instance';
  if (/NIINA/i.test(norm)) return 'Niina Secrets';
  if (/EUD|EUDORA/i.test(norm)) return 'Eudora';
  if (/OUI|O\.U\.I/i.test(norm)) return 'O.U.i';
  if (/QDB|QUEM DISSE/i.test(norm)) return 'Quem Disse, Berenice?';
  if (/MA CHERIE/i.test(norm)) return 'Ma Chérie';
  if (/CASA 214/i.test(norm)) return 'Casa 214';
  if (/BOTI|BOTICARIO/i.test(norm)) return 'O Boticário';
  return 'Geral';
}

export function detectVolume(desc: string): string {
  const norm = normalizeText(desc);
  const mlMatch = norm.match(/(\d+)\s*(ML|G|KG)/);
  if (mlMatch) {
    return `${mlMatch[1]} ${mlMatch[2].toLowerCase()}`;
  }
  return '-';
}

export function detectCategory(desc: string): string {
  const norm = normalizeText(desc);
  if (/ESTJ/i.test(norm)) return 'Estojo de Presente';
  if (/KIT/i.test(norm)) return 'Kit';
  if (/PMPCK/i.test(norm)) return 'Pack Promocional';
  if (/COMB/i.test(norm)) return 'Combo';
  if (/(REF|REFIL|RPCK)/i.test(norm)) return 'Refil';
  if (/(SPL|SPLASH|BS)/i.test(norm)) return 'Body Splash';
  if (/(LOC|HID|HD|AVELUD|NUTR)/i.test(norm)) return 'Loção Hidratante';
  if (/SAB/i.test(norm)) return 'Sabonete';
  if (/(COL|EDT|EDP)/i.test(norm)) return 'Perfumaria';
  if (/MAOS/i.test(norm)) return 'Creme de Mãos';
  return 'Outros';
}

export interface EligibilityResult {
  eligible: boolean;
  brand: string;
  category: string;
  volume: string;
  rejectionReason?: string;
  matchedRules: string[];
}

export function testProductEligibility(desc: string, filter: FilterState): EligibilityResult {
  const rawDesc = desc || '';
  const norm = normalizeText(rawDesc);
  const brand = detectBrand(rawDesc);
  const category = detectCategory(rawDesc);
  const volume = detectVolume(rawDesc);
  const matchedRules: string[] = [];

  // 1. Check custom text search if present
  if (filter.customSearchText && filter.customSearchText.trim()) {
    const terms = filter.customSearchText.trim().split(/\s+/);
    for (const term of terms) {
      const cleanTerm = normalizeText(term);
      if (!norm.includes(cleanTerm)) {
        return {
          eligible: false,
          brand,
          category,
          volume,
          rejectionReason: `Termo de busca '${term}' não encontrado`,
          matchedRules,
        };
      }
    }
    matchedRules.push('Busca livre correspondida');
  }

  // 2. Brand pattern regex
  if (filter.brandRegex && filter.brandRegex.trim()) {
    try {
      const brandRx = new RegExp(filter.brandRegex.trim(), 'i');
      if (!brandRx.test(norm)) {
        return {
          eligible: false,
          brand,
          category,
          volume,
          rejectionReason: `Marca não atende ao padrão /${filter.brandRegex}/`,
          matchedRules,
        };
      }
      matchedRules.push('Marca validada');
    } catch {
      // Invalid regex, treat as literal search
      if (!norm.includes(normalizeText(filter.brandRegex))) {
        return {
          eligible: false,
          brand,
          category,
          volume,
          rejectionReason: `Marca não contém '${filter.brandRegex}'`,
          matchedRules,
        };
      }
    }
  }

  // 3. Inclusion pattern (must match category or term)
  if (filter.inclusionRegex && filter.inclusionRegex.trim()) {
    try {
      const incRx = new RegExp(filter.inclusionRegex.trim(), 'i');
      if (!incRx.test(norm)) {
        return {
          eligible: false,
          brand,
          category,
          volume,
          rejectionReason: `Descrição não contém os termos obrigatórios /${filter.inclusionRegex}/`,
          matchedRules,
        };
      }
      matchedRules.push('Termos obrigatórios presentes');
    } catch {
      if (!norm.includes(normalizeText(filter.inclusionRegex))) {
        return {
          eligible: false,
          brand,
          category,
          volume,
          rejectionReason: `Descrição não contém '${filter.inclusionRegex}'`,
          matchedRules,
        };
      }
    }
  }

  // 4. Volume pattern
  if (filter.volumeRegex && filter.volumeRegex.trim()) {
    try {
      const volRx = new RegExp(filter.volumeRegex.trim(), 'i');
      if (!volRx.test(norm)) {
        return {
          eligible: false,
          brand,
          category,
          volume,
          rejectionReason: `Volume não atende ao padrão /${filter.volumeRegex}/`,
          matchedRules,
        };
      }
      matchedRules.push('Volume validado');
    } catch {
      if (!norm.includes(normalizeText(filter.volumeRegex))) {
        return {
          eligible: false,
          brand,
          category,
          volume,
          rejectionReason: `Volume não contém '${filter.volumeRegex}'`,
          matchedRules,
        };
      }
    }
  }

  // 5. Strict Exclusion pattern (rejection if matches)
  if (filter.exclusionRegex && filter.exclusionRegex.trim()) {
    try {
      const excRx = new RegExp(filter.exclusionRegex.trim(), 'i');
      if (excRx.test(norm)) {
        const match = norm.match(excRx);
        return {
          eligible: false,
          brand,
          category,
          volume,
          rejectionReason: `Excluído por termo proibido (${match ? match[0] : 'regra'})`,
          matchedRules,
        };
      }
      matchedRules.push('Nenhum termo de exclusão detectado');
    } catch {
      // Ignored if invalid regex
    }
  }

  return {
    eligible: true,
    brand,
    category,
    volume,
    matchedRules,
  };
}

/**
 * Strips version indicators (V2, V3, V7), formula flags (N/FORM),
 * and seasonal batch codes (REG/22, NAT/25, PAIS/26) to identify equivalent products
 * with the same commercial description.
 */
export function getCanonicalDescriptionKey(desc: string): string {
  let norm = normalizeText(desc);
  // Remove version tags: V2, V3, V4, V7 etc.
  norm = norm.replace(/\bV\d+\b/gi, '');
  // Remove formula tags: N/FORM, NOVA FORMULA
  norm = norm.replace(/\bN\/FORM\b/gi, '');
  norm = norm.replace(/\bNOVA\s+FORMULA\b/gi, '');
  // Remove campaign markers: REG/21, REG/22, NAT/24, PAIS/25, MAES/26, AMOR/26
  norm = norm.replace(/\b(?:REG|NAT|PAIS|MAES|AMOR)\/\d+\b/gi, '');
  // Clean multiple spaces and trim
  return norm.replace(/\s+/g, ' ').trim();
}

