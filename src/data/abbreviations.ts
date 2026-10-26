import { DeParaEntry } from '../types/inventory';

export const DEFAULT_DE_PARA: DeParaEntry[] = [
  // Categorias & Formatos
  { sigla: 'LOC', significado: 'Loção', tipo: 'categoria' },
  { sigla: 'HID', significado: 'Hidratante', tipo: 'categoria' },
  { sigla: 'HD', significado: 'Hidratante', tipo: 'categoria' },
  { sigla: 'CPO', significado: 'Corporal', tipo: 'categoria' },
  { sigla: 'AVELUD', significado: 'Aveludada / Aveludado', tipo: 'categoria' },
  { sigla: 'NUTR', significado: 'Nutritiva / Nutrição', tipo: 'categoria' },
  { sigla: 'SPL', significado: 'Body Splash', tipo: 'categoria' },
  { sigla: 'BS', significado: 'Body Splash', tipo: 'categoria' },
  { sigla: 'SPLASH', significado: 'Body Splash', tipo: 'categoria' },
  { sigla: 'CRM', significado: 'Creme', tipo: 'categoria' },
  { sigla: 'COL', significado: 'Desodorante Colônia', tipo: 'categoria' },
  { sigla: 'EDT', significado: 'Eau de Toilette', tipo: 'categoria' },
  { sigla: 'EDP', significado: 'Eau de Parfum', tipo: 'categoria' },
  { sigla: 'SAB', significado: 'Sabonete', tipo: 'categoria' },
  { sigla: 'DES', significado: 'Desodorante', tipo: 'categoria' },
  { sigla: 'ANTIP', significado: 'Antitranspirante', tipo: 'categoria' },

  // Termos de Exclusão / Restrição
  { sigla: 'REF', significado: 'Refil (Excluir quando busca frasco normal)', tipo: 'outro' },
  { sigla: 'REFIL', significado: 'Refil (Excluir)', tipo: 'outro' },
  { sigla: 'RPCK', significado: 'Refill Pack (Excluir)', tipo: 'outro' },
  { sigla: 'DEM', significado: 'Demonstrador / Tester (Excluir)', tipo: 'outro' },
  { sigla: 'ESTJ', significado: 'Estojo (Excluir)', tipo: 'outro' },
  { sigla: 'KIT', significado: 'Kit Promocional (Excluir)', tipo: 'outro' },
  { sigla: 'MAOS', significado: 'Creme para Mãos (Excluir se busca corporal)', tipo: 'outro' },
  { sigla: 'FAC', significado: 'Facial (Excluir se busca corporal)', tipo: 'outro' },
  { sigla: 'PES', significado: 'Pés (Excluir se busca corporal)', tipo: 'outro' },
  { sigla: 'ESF', significado: 'Esfoliante (Excluir se busca loção regular)', tipo: 'outro' },

  // Marcas
  { sigla: 'CBEM', significado: 'Cuide-se Bem', tipo: 'marca' },
  { sigla: 'CUIDE', significado: 'Cuide-se Bem', tipo: 'marca' },
  { sigla: 'NSPA', significado: 'Nativa SPA', tipo: 'marca' },
  { sigla: 'SPA', significado: 'Nativa SPA', tipo: 'marca' },
  { sigla: 'BOT', significado: 'O Boticário', tipo: 'marca' },
  { sigla: 'MALB', significado: 'Malbec', tipo: 'marca' },
  { sigla: 'LILY', significado: 'Lily', tipo: 'marca' },
  { sigla: 'EGEO', significado: 'Egeo', tipo: 'marca' },
  { sigla: 'ELYS', significado: 'Elysée', tipo: 'marca' },
  { sigla: 'FLOR', significado: 'Floratta', tipo: 'marca' },

  // Unidades Operacionais
  { sigla: 'ER', significado: 'Espaço do Revendedor (Base VD)', tipo: 'unidade' },
  { sigla: 'VD', significado: 'Venda Direta / Canal Revenda', tipo: 'unidade' },
  { sigla: 'LOJA', significado: 'Loja Física / Franquia', tipo: 'unidade' },
  { sigla: 'HBD', significado: 'Hub Boticário Distribuição / Logística', tipo: 'unidade' },
];

export const DEFAULT_PRODUCT_DE_PARA = [
  {
    id: 'dp-1',
    fromCode: '48281',
    toCode: '88082',
    targetDescription: 'NSPA LOC DES HID CPO AMEIXA NEGRA 400ml',
    notes: 'Unifica Versão V3 com Versão V4 atual',
  },
  {
    id: 'dp-2',
    fromCode: '74101',
    toCode: '85124',
    targetDescription: 'CBEM LOC DES HID CPO DELEITE 400ml',
    notes: 'Código legado para código atual',
  },
  {
    id: 'dp-3',
    fromCode: '74103',
    toCode: '88688',
    targetDescription: 'CBEM LOC DES HID CPO NUVEM 400ml',
    notes: 'Unifica fórmula anterior com Nova Fórmula (N/FORM)',
  },
  {
    id: 'dp-4',
    fromCode: '50881',
    toCode: '90219',
    targetDescription: 'CBEM DES COL BDY SPLSH DELEITE 200ml',
    notes: 'Body Splash Deleite versões V3 e V4',
  },
  {
    id: 'dp-5',
    fromCode: '48280',
    toCode: '90981',
    targetDescription: 'NSPA DES COL BDY SPLSH AMEIXA NEGRA 200ml',
    notes: 'Unifica códigos de Body Splash Ameixa Negra',
  },
];

