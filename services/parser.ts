
import { Product } from '../types';

// --- DICIONÁRIO DE ABREVIATURAS BOM LAR ---
// Atualizado com base no PDF fornecido e feedbacks
const ABBREVIATIONS_DB: Record<string, string> = {
    "UNDS": "UNIDADES",
    "UND": "UNIDADES",
    "UN": "UNIDADE",
    "AD": "Adulto",
    "PED": "Pediátrico",
    "INF": "Infantil",
    "AMP": "Ampola",
    "AMP LIOF": "Ampola Liofilizado",
    "INJ": "Injetável",
    "IV": "Intravenoso",
    "IM": "Intramuscular",
    "SUBC": "Subcutânea",
    "DIL": "Diluente",
    "CPR": "Comprimido",
    "CPR REV": "Comprimido Revestido",
    "CPR EFER": "Comprimido Efervescente",
    "CPR SUBL": "Comprimido Sublingual",
    "CPR MAST": "Comprimido Mastigável",
    "CAPS": "Cápsula",
    "CAPS GEL": "Cápsula Gelatinosa",
    "DRA": "Drágea",
    "DG": "Drágea",
    "PAST": "Pastilhas",
    "CRE": "Creme",
    "CRE VAG": "Creme Vaginal",
    "APLIC": "Aplicador",
    "COL": "Colírio",
    "ENV": "Envelope",
    "FLAC": "Flaconetes",
    "FR": "Frasco",
    "GTS": "Gotas",
    "INAL": "Inalador",
    "INALA": "Inalante",
    "OFT": "Oftálmica",
    "OTOL": "Otológicas",
    "LIQ": "Líquido",
    "LC": "Loção",
    "POM": "Pomada",
    "XPE": "Xarope",
    "EXPEC": "Expectorante",
    "ELX": "Elixir",
    "AER": "Aerossol",
    "SAB": "Sabonete",
    "SAB LIQ": "Sabonete Líquido",
    "SUSP": "Suspensão",
    "SOL": "Solução",
    "DERMAT": "Dermatológico",
    "LIBER PROL": "Liberação Prolongada",
    "ANTIS": "Antisséptico",
    "ENXAG": "Enxaguante",
    "ENX": "Enxaguante",
    "SOLV": "Solvente",
    "GRAN": "Granulado",
    "FRAL": "Fralda",
    "DES": "Desodorante",
    "SH": "Shampoo",
    "COND": "Condicionador",
    "TINT": "Tintura",
    "DESC": "Descolorante",
    "ALIS": "Alisante",
    "CRE DENT": "Creme Dental",
    "DENT": "Creme Dental",
    "DENTIF": "Creme Dental",
    "ESC": "Escova",
    "ESM": "Esmalte",
    "LC CAP": "Loção Capilar",
    "LC HID": "Loção Hidratante",
    "LC CRE": "Loção Cremosa",
    "UMID": "Umidificador",
    "ABS": "Absorvente",
    "ABS INT": "Absorvente Interno",
    "ABS GER": "Absorvente Geriátrico",
    "ABS SEIOS": "Absorvente Seios",
    "AGUA OXI": "Água Oxigenada",
    "AGUA OXI CRE": "Água Oxigenada Cremosa",
    "AGUA MICELAR": "Água Micelar",
    "APAR BAR": "Aparelho de Barbear",
    "ALICATE CUT": "Alicate de Cutícula",
    "PROT SOL": "Protetor Solar",
    "PROT LAB": "Protetor Labial",
    "PROT SEIOS": "Protetor de Seios",
    "PROT TERM": "Protetor Térmico",
    "CORP": "Corporal",
    "UMED": "Umedecido",
    "REPEL": "Repelente",
    "FAC": "Facial",
    "INT": "Interno",
    "REVIT": "Revitart",
    "MASC": "Máscara",
    "TRAT": "Tratamento",
    "Hialuron": "Hialurônico",
    "GERIAT": "Geriátrica",
    "HID": "Hidratante",
    "VIT": "Vitamina",
    "DEPIL": "Depilatória",
    "PROT": "Protetor",
    "DISC": "Discreto",
    "APAR": "Aparelho"
};

// Lista de unidades que indicam que um número precedente é volume/quantidade e não um código
// Incluímos as formas por extenso para garantir que números como "400" seguidos de "Drágea" sejam mantidos
const VOLUME_UNITS = [
    'ML', 'L', 'G', 'KG', 'MG', 'MCG', 'M', 'CM', 'MM', 'UN', 'UNS', 'UND', 'UNDS', 'CX', 
    'CPS', 'CAPS', 'CPR', 'DRA', 'DG', 'GR', 'UI', 'POTS', 'FR', 'SACHE', 'SACHES',
    'AMP', 'FLAC', 'ENV', 'PAST', 'COMPRIMIDO', 'COMPRIMIDOS', 'CAPSULA', 'CAPSULAS',
    'UNIDADE', 'UNIDADES', 'DRAGEA', 'DRAGEAS', 'DRÁGEA', 'DRÁGEAS', 'GEL'
];

/**
 * Remove sequências de 3 ou mais números isolados (códigos internos/barras).
 * "Inteligência": Se o número for seguido por uma unidade de volume (ex: 140 UN), ele é mantido.
 */
export const removeNumericalCodes = (text: string): string => {
    if (!text) return text;
    
    const words = text.split(/(\s+)/);
    const resultWords: string[] = [];
    
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        
        if (/^\s+$/.test(word)) {
            resultWords.push(word);
            continue;
        }

        // Verifica se a palavra é puramente numérica e tem 3+ dígitos
        if (/^\d{3,}$/.test(word)) {
            let nextWordRaw = '';
            // Busca a próxima palavra que não seja apenas espaço
            for (let j = i + 1; j < words.length; j++) {
                if (!/^\s+$/.test(words[j])) {
                    nextWordRaw = words[j];
                    break;
                }
            }
            
            // Normaliza a unidade para comparação (remove acentos e caracteres não-alfabéticos)
            const nextWordClean = nextWordRaw ? nextWordRaw.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z]/g, '') : '';
            
            // Verifica se a próxima palavra está na lista de unidades permitidas
            const isVolume = nextWordClean && VOLUME_UNITS.some(u => 
                u.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase() === nextWordClean
            );
            
            if (isVolume) {
                resultWords.push(word);
            } else {
                // Remove o código numérico e o espaço anterior se existir
                if (resultWords.length > 0 && /^\s+$/.test(resultWords[resultWords.length - 1])) {
                    resultWords.pop();
                }
                continue;
            }
        } else {
            resultWords.push(word);
        }
    }
    
    return resultWords.join('').replace(/\s+/g, ' ').trim();
};

/**
 * Remove qualquer número que pareça preço (12,34) e símbolos de moeda (R$) que tenham sobrado na descrição
 */
export const removeResidualPrices = (text: string): string => {
    if (!text) return text;
    // Remove R$ isolados, no fim de palavras ou seguidos de preços
    return text
        .replace(/\b[Rr]\$\s*/g, '') 
        .replace(/\s+[Rr]\$$/g, '') // R$ no final da string
        .replace(/\b\d+[,.]\d{2}\b/g, '') // Preços residuais
        .replace(/\s+/g, ' ')
        .trim();
};

export const expandAbbreviations = (text: string): string => {
    if (!text) return text;
    let expandedText = text;

    expandedText = expandedText.replace(/\bPOM\s*POM\b/gi, '___POMPOM___');

    // Especial para UN colado em números: 3un -> 3 UNIDADE
    expandedText = expandedText.replace(/(\d+)(un|und|unidades|unidade)\b/gi, '$1 UNIDADE');

    const sortedKeys = Object.keys(ABBREVIATIONS_DB).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
        const value = ABBREVIATIONS_DB[key];
        // Usa lookarounds para bordas de palavras que respeitam acentuação do português
        const regex = new RegExp(`(^|\\s|[.,;()\\-])(${key})(?=\\s|[.,;()\\-]|$)`, 'gi');
        expandedText = expandedText.replace(regex, `$1${value}`);
    }
    
    expandedText = expandedText.replace(/___POMPOM___/gi, 'POM POM');
    
    return expandedText;
};

export const formatTitleCase = (text: string) => {
    if (!text) return '';
    let cleanText = text.replace(/([,.;:])(?=\S)/g, '$1 ');
    const lowercaseExceptions = [
        'de', 'da', 'do', 'das', 'dos', 'e', 'a', 'o', 'as', 'os',
        'em', 'na', 'no', 'nas', 'nos', 'por', 'com', 'pela', 'pelo',
        'para', 'pra', 'pro', 'um', 'uns', 'uma', 'umas'
    ];
    let formatted = cleanText.toLowerCase().split(/\s+/).map(word => {
        const cleanWord = word.replace(/[^a-zA-Z0-9\u00C0-\u00FF]+$/, ''); 
        if (lowercaseExceptions.includes(cleanWord)) return word;
        
        // Se for número com unidade (ex: 3g, 10ml), não uppercase tudo
        if (/^\d+(?:[.,]\d+)?(ml|l|g|kg|mg|mcg)$/i.test(cleanWord)) {
            return word.toLowerCase();
        }
        
        // Se for número puro, não uppercase
        if (/^\d+$/.test(cleanWord)) {
            return word;
        }

        if (/^(?:G\/XG|XG\/XXG|P\/M|M\/G|XXG|XG|EG|PP|P|M|G|X|P\/G|GG)\d*$/i.test(cleanWord)) {
            return word.toUpperCase();
        }

        if (cleanWord.length <= 3) return word.toUpperCase();

        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');

    // Correções semânticas pós-formatação
    formatted = formatted
        // FPS sempre maiúsculo e com espaço
        .replace(/(?:^|[\s\-])(?:fps|Fps|fPs|fpS)\s*(\d+)(?![a-zA-ZÀ-ÿ])/g, (match, p1) => match.replace(/fps/i, 'FPS').replace(/\s*\d+/, ` ${p1}`))
        // Porcentagens coladas
        .replace(/(\d+)\s+%/g, '$1%')
        // Graus colados
        .replace(/(\d+)\s+°/g, '$1°')
        // Mais colado apenas se não for seguido de palavra (ex: D3 + K2)
        .replace(/(\d+)\s*\+(?!\s*[a-zA-ZÀ-ÿ])/g, '$1+')
        // pH minúsculo p, maiúsculo H
        .replace(/(?:^|[\s\-])(?:ph|Ph|pH|PH)\s*(\d+(?:[.,]\d+)?)(?![a-zA-ZÀ-ÿ])/g, (match, p1) => match.replace(/ph/i, 'pH').replace(/\s*\d+(?:[.,]\d+)?/, ` ${p1}`))
        // Vitamina com letra/número
        .replace(/(?:^|[\s\-])(?:vitamina|Vitamina)\s+([a-zA-Z0-9]+)(?![a-zA-ZÀ-ÿ])/gi, (match, p1) => match.replace(/vitamina/i, 'Vitamina').replace(/\s+[a-zA-Z0-9]+/, ` ${p1.toUpperCase()}`))
        // Unidades por extenso
        .replace(/(\d+)\s*(un|und|unds|unidade)\b/gi, '$1 Unidades');

    return formatted;
};

export function formatUnidade(text: string): string {
    if (!text) return text;
    return text.replace(
        /(\d+)\s*(Un|Und|Unds)\b/gi,
        (match, numero) => {
            const qty = parseInt(numero, 10);
            return qty === 1 ? `${qty} UNIDADE` : `${qty} UNIDADES`;
        }
    );
}

export function fixKnownWords(text: string): string {
    const corrections: Record<string, string> = {
        'Colírioônia': 'Colônia',
        'Colírionia': 'Colônia',
        'Colirioonia': 'Colônia',
        'COLÍRIOÔNIA': 'COLÔNIA',
        'COLÍRIONIA': 'COLÔNIA',
    };
    
    let fixed = text;
    for (const [wrong, right] of Object.entries(corrections)) {
        fixed = fixed.split(wrong).join(right); // replaceAll fallback
    }
    
    return fixed;
}

function cleanForDisplay(text: string): string {
    if (!text) return '';
    return text
        .replace(/\s*\/\/\s*/g, ' ')  // Remove //
        .replace(/\s+/g, ' ')          // Remove espaços duplos
        .trim();
}

const MAX_TITULO_LENGTH = 38; // Ajustado para o limite visual do card (aprox 90% da largura)

const SPEC_REGEX_STRING = `(?:^|[\\s\\-,|])(\\d+(?:[.,]\\d+)?\\s*(?:ml|l|g|kg|mg|mcg|m|cm|mm|un|uns|und|unds|unidades|unidade|cx|comprimidos|comprimido|cápsulas|capsulas|caps|cps|ampolas|ampola|dg|dra|drageas|dragea|drágea|drágeas|ui|gr|fr|flac|saches|sache|tiras)|(?:fps|Fps|fPs|fpS)\\s*\\d+(?:\\s*\\+)?|\\d+\\s*%(?:\\s*\\+)?|\\d+\\s*°|\\d+\\s*\\+|(?:ph|Ph|pH|PH)\\s*\\d+(?:[.,]\\d+)?)(?![a-zA-ZÀ-ÿ])`;

export function smartSplitTitle(nome: string): {
    titulo: string;
    subtitulo1: string;
    subtitulo2: string;
} {
    let titulo = nome;
    let subtitulo1 = '';
    let subtitulo2 = '';
    
    // REGRA 1: Se tiver " - ", separa aí
    const hyphenRegex = /\s+-\s*|\s*-\s+/;
    if (hyphenRegex.test(nome)) {
        const parts = nome.split(hyphenRegex);
        titulo = parts[0].trim();
        subtitulo2 = parts.slice(1).join(' - ').trim();
    }
    
    // REGRA 2: Extrair especificações (ml, g, Unds, etc)
    const hasPipe = titulo.includes('|');
    if (!hasPipe) {
        const specRegex = new RegExp(SPEC_REGEX_STRING, 'gi');
        
        const specs: string[] = [];
        let match;
        specRegex.lastIndex = 0;
        while ((match = specRegex.exec(titulo)) !== null) {
            specs.push(match[1] || match[0].replace(/^[-,|\s]+/, '').trim());
        }
        
        if (specs.length > 0) {
            subtitulo1 = specs.join(' | ');
            for (const s of specs) {
                const regex = new RegExp(`(?:^|[\\s\\-,|])(${escapeRegex(s)})(?![a-zA-ZÀ-ÿ])`, 'i');
                titulo = titulo.replace(regex, '').trim();
            }
        }
    }
    
    // REGRA 3: Se AINDA for longo demais, quebrar inteligente
    if (titulo.length > MAX_TITULO_LENGTH) {
        // Pontos de quebra prioritários (em ordem)
        const breakPoints = [
            / C\//,                    // "C/ Abas" → subtítulo
            / Com /i,                   // "Com Abas" → subtítulo  
            / Para /i,                  // "Para Mãos" → subtítulo
            / Toda /i,                  // "Toda Protegida" → subtítulo
            / (Dia|Noite) /i,           // "Dia Seca" → subtítulo
            / (Fem|Men|Masc|Masculino|Feminino) /i,
            / \d+\s*(Un|Unds|Unidades)/i,
            / Recém/i,                  // "Recém Nascido" → subtítulo
        ];
        
        for (const pattern of breakPoints) {
            const match = titulo.match(pattern);
            if (match && match.index) {
                const breakIndex = match.index;
                const newTitulo = titulo.substring(0, breakIndex).trim();
                const newSub = titulo.substring(breakIndex).trim();
                
                if (newTitulo.length <= MAX_TITULO_LENGTH) {
                    titulo = newTitulo;
                    subtitulo2 = subtitulo2 ? `${newSub} ${subtitulo2}` : newSub;
                    break;
                }
            }
        }
        
        // Se ainda longo, quebra na última palavra que cabe
        if (titulo.length > MAX_TITULO_LENGTH) {
            const words = titulo.split(/\s+/);
            let newTitulo = '';
            let overflow = '';
            
            for (const word of words) {
                if (newTitulo === '' || (newTitulo + ' ' + word).trim().length <= MAX_TITULO_LENGTH) {
                    newTitulo = (newTitulo + ' ' + word).trim();
                } else {
                    overflow = (overflow + ' ' + word).trim();
                }
            }
            
            titulo = newTitulo;
            subtitulo2 = overflow + (subtitulo2 ? ' ' + subtitulo2 : '');
        }
    }
    
    // Limpar
    titulo = titulo.replace(/[-,]\s*$/, '').trim();
    titulo = titulo.replace(/(?:^|\s)(?:com|de|para|sem|\+)\s*$/i, '').trim();
    subtitulo2 = subtitulo2.replace(/^[-,]\s*/, '').trim();
    
    return { titulo, subtitulo1, subtitulo2 };
}

// ═══════════════════════════════════════════════════════
// DICIONÁRIO DE CATEGORIAS (O QUE É?)
// ═══════════════════════════════════════════════════════

const CATEGORIAS = [
  // Higiene e Beleza
  'Esmalte', 'Shampoo', 'Condicionador', 'Creme de Pentear',
  'Creme de Tratamento', 'Sabonete', 'Desodorante Aerossol', 'Desodorante Roll-on', 'Desodorante Spray', 'Desodorante Creme', 'Desodorante', 'Protetor Solar',
  'Manteiga de Cacau', 'Creme Hidratante para Mãos', 'Creme Hidratante para Pés', 'Creme para Mãos', 'Creme para Pés', 'Creme Hidratante',
  'Hidratante', 'Loção Hidratante', 'Loção Corporal', 'Gel de Limpeza',
  'Creme Dental', 'Escova Dental', 'Escova de Dentes', 'Fio Dental',
  'Enxaguante Bucal', 'Aparelho de Barbear', 'Aparelho de Depilar',
  'Creme de Barbear', 'Espuma de Barbear', 'Gel Creme Hidratante',
  'Óleo \\+ Sérum Bifásico', 'Óleo Sérum', 'Sérum',
  
  // Bebê e Infantil
  'Fralda', 'Toalhas Umedecidas Recém Nascido', 'Toalhas Umedecidas', 'Toalha Umedecida Recém Nascido', 'Toalha Umedecida', 'Lenços Umedecidos',
  'Creme para Assaduras', 'Pomada para Assaduras', 'Colônia',
  
  // Medicamentos e Suplementos
  'Creatina', 'Suplemento Alimentar', 'Suplemento', 'Vitamina', 'Protetor',
  'Curativo', 'Repelente', 'Pomada',
  
  // Absorventes
  'Absorvente', 'Protetor Diário', 'Roupa Íntima',
  
  // Cabelo
  'Gelatina', 'Máscara Capilar', 'Tintura',
  
  // Outros
  'Balas', 'Castanha', 'Lip Care', 'Kit',
];

// ═══════════════════════════════════════════════════════
// DICIONÁRIO DE MARCAS
// ═══════════════════════════════════════════════════════

const MARCAS = [
  // Esmaltes
  'Risque', 'Colorama', 'Impala', 'Dailus', 'Vult',
  
  // Higiene
  'Colgate', 'Oral B', 'Oral-B', 'Elmex', 'Listerine', 'Sorriso', 'Close Up',
  'Dove', 'Nivea', 'Rexona', 'Bozzano', 'Gillette', 'Secret', 'Old Spice', 'Axe', 'Ban', 'Suave', 'Francis', 'Senador', 'Giovanna Baby', 'Adidas',
  'Seda', 'Pantene', 'Kolene', 'Monange', 'Tresemme', 'Clear', 'Elseve', 'Garnier',
  
  // Farmácia
  'Revitart', 'Bom Lar', 'Crescendo', 'Huggies', 'Intimus', 'Pampers', 'Pom Pom', 'Cremer', 'MamyPoko',
  'Plenitud', 'Poise', 'Mili', 'Tena', 'Bigfral',
  
  // Suplementos
  'Creathinex Ada', 'Ada', 'Santo Habito', 'Santo Hábito', 'Lavitan', 'Centrum', 'Cimed', 'Revigore',
  
  // Medicamentos
  'Dorflex', 'Novalgina', 'Naldecon', 'Strepsils', 'Ciflogex', 'Neosaldina', 'Tylenol', 'Advil', 'Benegrip',
  'Aceviton', 'Loratamed', 'Cimegripe', 'Enterogermina', 'Epocler', 'Eno', 'Estomazil',
  
  // Infantil
  'Patotinha', 'Gum', 'Johnson', 'Granado',
  
  // Outros
  'Darrow', 'Actine', 'Herbíssimo', 'Herbissimo',
  'Marco Boni', 'Exposis', 'Off', 'Repelex',
  'Go Jelly', 'Freegells', 'Iracema', 'Halls', 'Trident',
];

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function isDiaperName(text: string): boolean {
  const clean = text.toLowerCase();
  return clean.includes('fralda') || 
         clean.includes('pampers') || 
         clean.includes('huggies') || 
         clean.includes('babysec') || 
         clean.includes('mamypoko') || 
         clean.includes('bigfral') || 
         clean.includes('plenitud') || 
         clean.includes('tena') ||
         clean.includes('geriatrica') ||
         clean.includes('geriátrica');
}

export function parseProductName(nome: string): {
  titulo: string;
  subtitulo1: string;
  subtitulo2: string;
} {
  let remaining = nome.trim();
  let especificacao = '';
  let variante = '';
  let matchedRawSizeOrColated = '';
  
  // PASSO 1: Extrair ESPECIFICAÇÃO TÉCNICA (ml, g, etc)
  let tamanhoVariante = '';
  const hasPipe = remaining.includes('|');
  const hyphenRegex = /\s+-\s*|\s*-\s+/;
  const hasHyphen = hyphenRegex.test(remaining);

  if (hasPipe) {
      if (hasHyphen) {
          const parts = remaining.split(hyphenRegex);
          const subParts = parts.slice(1).join(' - ').split('|');
          variante = subParts[0].trim();
          especificacao = subParts.slice(1).join('|').trim();
      } else {
          const parts = remaining.split('|');
          variante = parts.slice(1).join('|').trim();
      }
  } else {
      const specRegex = new RegExp(SPEC_REGEX_STRING, 'gi');
      
      const specs: string[] = [];
      let match;
      specRegex.lastIndex = 0;
      
      while ((match = specRegex.exec(remaining)) !== null) {
          specs.push(match[1] || match[0].replace(/^[-,|\s]+/, '').trim());
      }
      
      if (specs.length > 0) {
          especificacao = specs.join(' | ');
      }

      // PASSO 3: Extrair Variante de Tamanho (Fraldas, etc)
      const isDiaper = isDiaperName(nome);
      const colatedMatch = isDiaper ? remaining.match(/\b(XXXG|XXG|XG|GG|EG|PP|P|M|G)(\d+)\b/i) : null;
      
      if (colatedMatch) {
          const tamanho = colatedMatch[1].toUpperCase();
          const quantidade = colatedMatch[2];
          tamanhoVariante = `${quantidade} UNIDADES ${tamanho}`;
          matchedRawSizeOrColated = colatedMatch[0];
      } else {
          const variantMatch = remaining.match(/(?:^|[\s\-])(?:(\d+)\s*(?:Un|Unidades?|Unds?|Tiras?|Und)?\s+)?(G\/XG|XG\/XXG|P\/M|M\/G|XXG|XG|EG|G|M|P|PP)(?:(?:\s*-\s*|\s+)(\d+)\s*(?:Un|Unidades?|Unds?|Tiras?|Und)?)?(?!\w)/i);
          if (variantMatch) {
              const tamanho = variantMatch[2].toUpperCase();
              const quantidade = variantMatch[1] || variantMatch[3];
              const cleanMatch = variantMatch[0];
              const hasUnidades = cleanMatch.toLowerCase().includes('un') || isDiaper;
              if (isDiaper || hasUnidades) {
                  tamanhoVariante = quantidade ? `${quantidade} UNIDADES ${tamanho}` : tamanho;
              } else {
                  tamanhoVariante = tamanho;
              }
              matchedRawSizeOrColated = variantMatch[0];
          }
      }

      // PASSO 4: Separar VARIANTE
      if (hasHyphen) {
        const parts = remaining.split(hyphenRegex);
        variante = parts.slice(1).join(' - ').trim();
      } else {
        const variantKeywords = /(?:^|\s)(Sabor|Cor|Fragrância|Aroma|Tipo|Tamanho)\s+(.*)$/i;
        const matchKeyword = remaining.match(variantKeywords);
        if (matchKeyword && matchKeyword.index !== undefined) {
            variante = matchKeyword[0].trim();
        }
      }
  }
  
  let tituloOriginal = nome.trim();
  
  const removeFromTitle = (text: string, part: string) => {
      if (!part) return text;
      if (part.includes('|')) {
          let current = text;
          part.split('|').forEach(p => {
              current = removeFromTitle(current, p.trim());
          });
          return current;
      }
      const regex = new RegExp(`(?:^|[\\s\\-,|])(${escapeRegex(part)})(?![a-zA-ZÀ-ÿ0-9])`, 'i');
      return text.replace(regex, '').replace(/\s{2,}/g, ' ').replace(/^[-,|\s]+/, '').replace(/[-,|\s]+$/, '').trim();
  };

  if (especificacao && variante) {
      variante = removeFromTitle(variante, especificacao);
  }

  if (especificacao) tituloOriginal = removeFromTitle(tituloOriginal, especificacao);
  if (variante) tituloOriginal = removeFromTitle(tituloOriginal, variante);
  
  if (matchedRawSizeOrColated) {
      tituloOriginal = removeFromTitle(tituloOriginal, matchedRawSizeOrColated);
  }

  if (!tituloOriginal) tituloOriginal = nome;

  let titulo = tituloOriginal;
  let subtitulo1 = [tamanhoVariante, especificacao].filter(Boolean).join(' | ');
  let subtitulo2 = variante.replace(/^[-,|\s]+/, '').trim();

  if (!tamanhoVariante && especificacao) {
    subtitulo1 = especificacao;
  } else if (tamanhoVariante && especificacao) {
      // Avoid duplication like "14 UNIDADES P/M | 14 UNIDADES"
      if (tamanhoVariante.includes(especificacao)) {
          subtitulo1 = tamanhoVariante;
      }
  }

  // REGRA CUSTOMIZADA: Santo Hábito e Revigore
  if (nome.toUpperCase().includes('SANTO HABITO') || nome.toUpperCase().includes('SANTO HÁBITO')) {
      titulo = removeFromTitle(tituloOriginal, 'Santo Hábito');
      subtitulo1 = ['Santo Hábito', subtitulo1].filter(Boolean).join(' | ');
  } else if (nome.toUpperCase().includes('REVIGORE')) {
      titulo = removeFromTitle(tituloOriginal, 'Revigore');
      subtitulo1 = ['Revigore', subtitulo1].filter(Boolean).join(' | ');
  }

  // REGRA CUSTOMIZADA: Bridgerton
  if (nome.toUpperCase().includes('BRIDGERTON')) {
      if (!titulo.toUpperCase().includes('BRIDGERTON')) {
          titulo += ' BRIDGERTON';
          subtitulo1 = subtitulo1.replace(/BRIDGERTON\s*/i, '').replace(/^\||\|$/g, '').trim();
          subtitulo2 = subtitulo2.replace(/BRIDGERTON\s*/i, '').replace(/^\||\|$/g, '').trim();
      }
      if (!subtitulo2.toUpperCase().includes('CONSULTE APRESENTAÇÕES') && !subtitulo1.toUpperCase().includes('CONSULTE APRESENTAÇÕES')) {
          subtitulo2 = subtitulo2 ? `${subtitulo2} | Consulte Apresentações` : 'Consulte Apresentações';
      }
  }

  // POST-PROCESSING: Extrair volume/especificação do título (sempre)
  const specRegexPost = new RegExp(SPEC_REGEX_STRING, 'gi');
  let matchSpec;
  const extractedSpecs: string[] = [];
  while ((matchSpec = specRegexPost.exec(titulo)) !== null) {
      extractedSpecs.push(matchSpec[1] || matchSpec[0].replace(/^[-,|\s]+/, '').trim());
  }
  if (extractedSpecs.length > 0) {
      for (const s of extractedSpecs) {
          const regex = new RegExp(`(?:^|[\\s\\-,|])(${escapeRegex(s)})(?![a-zA-ZÀ-ÿ])`, 'i');
          titulo = titulo.replace(regex, '').trim();
      }
      const newSpecs = extractedSpecs.join(' | ');
      subtitulo2 = subtitulo2 ? `${newSpecs} | ${subtitulo2}` : newSpecs;
  }

  // POST-PROCESSING: Remover "CONSULTE APRESENTAÇÕES" ou "CONSULTE" do título
  const consulteRegex = /(?:^|\s)(CONSULTE(?:\s+APRESENTAÇÕES)?)(?:\s|$)/i;
  const matchConsulte = titulo.match(consulteRegex);
  if (matchConsulte) {
      titulo = titulo.replace(consulteRegex, ' ').trim();
  }

  // PASSO 6: Se o título ficou muito longo, aplica a lógica de quebra
  if (titulo.length > MAX_TITULO_LENGTH) {
      const breakPoints = [
          / C\//,                    // "C/ Abas" → subtítulo
          / Com /i,                   // "Com Abas" → subtítulo  
          / Para /i,                  // "Para Mãos" → subtítulo
          / Toda /i,                  // "Toda Protegida" → subtítulo
          / (Dia|Noite) /i,           // "Dia Seca" → subtítulo
          / (Fem|Men|Masc|Masculino|Feminino) /i,
          / \d+\s*(Un|Unds|Unidades)/i,
          / Recém/i,                  // "Recém Nascido" → subtítulo
      ];
      
      let quebrou = false;
      for (const pattern of breakPoints) {
          const match = titulo.match(pattern);
          if (match && match.index) {
              const breakIndex = match.index;
              const newTitulo = titulo.substring(0, breakIndex).trim();
              const newSub = titulo.substring(breakIndex).trim();
              
              if (newTitulo.length <= MAX_TITULO_LENGTH) {
                  titulo = newTitulo;
                  subtitulo1 = subtitulo1 ? `${newSub} | ${subtitulo1}` : newSub;
                  quebrou = true;
                  break;
              }
          }
      }
      
      // Se ainda longo, quebra na última palavra que cabe
      if (!quebrou && titulo.length > MAX_TITULO_LENGTH) {
          const words = titulo.split(/\s+/);
          let newTitulo = '';
          let overflow = '';
          
          for (const word of words) {
              if (newTitulo === '' || (newTitulo + ' ' + word).trim().length <= MAX_TITULO_LENGTH) {
                  newTitulo = (newTitulo + ' ' + word).trim();
              } else {
                  overflow = (overflow + ' ' + word).trim();
              }
          }
          
          titulo = newTitulo;
          subtitulo1 = overflow + (subtitulo1 ? ' | ' + subtitulo1 : '');
      }
  }
  
  // Garantir que Consulte Apresentações fique correto
  const consulteRegexGlobal = /(?:^|\s|\b)(CONSULTE(?:\s+APRESENTAÇÕES)?)(?:\s|\b|$)/gi;
  if (consulteRegexGlobal.test(titulo)) {
      titulo = titulo.replace(consulteRegexGlobal, ' ').trim();
  }
  
  if (consulteRegexGlobal.test(subtitulo1)) {
      subtitulo1 = subtitulo1.replace(consulteRegexGlobal, ' ').replace(/\|\s*\|/g, '|').trim();
      if (!subtitulo2.toUpperCase().includes('CONSULTE')) {
          subtitulo2 = subtitulo2 ? `${subtitulo2} | Consulte Apresentações` : 'Consulte Apresentações';
      }
  }
  
  if (consulteRegexGlobal.test(subtitulo2)) {
      subtitulo2 = subtitulo2.replace(consulteRegexGlobal, ' Consulte Apresentações ').replace(/\s+/g, ' ').replace(/\|\s*\|/g, '|').trim();
  } else if (matchConsulte && !subtitulo2.toUpperCase().includes('CONSULTE')) {
      subtitulo2 = subtitulo2 ? `${subtitulo2} | Consulte Apresentações` : 'Consulte Apresentações';
  }

  // Limpar
  titulo = titulo.replace(/[-,]\s*$/, '').trim();
  titulo = titulo.replace(/(?:^|\s)(?:com|de|para|sem|\+)\s*$/i, '').trim();
  subtitulo1 = subtitulo1.replace(/^[-,|\s]+/, '').replace(/[-,|\s]+$/, '').trim();
  subtitulo2 = subtitulo2.replace(/^[-,|\s]+/, '').replace(/[-,|\s]+$/, '').trim();

  return { titulo, subtitulo1, subtitulo2 };
}

function getFirst2Words(text: string): string {
    return text.split(/\s+/).slice(0, 2).join(' ').toUpperCase();
}

function getGroupingKey(titulo: string, preco: string): string {
    const upperTitulo = titulo.toUpperCase();
    if (upperTitulo.startsWith('FREGELLS')) {
        return `FREGELLS|${preco}`;
    }
    return `${upperTitulo}|${preco}`;
}

function getCommonWordPrefix(strings: string[]): string {
    if (strings.length === 0) return '';
    if (strings.length === 1) return strings[0];
    
    const arrays = strings.map(s => s.split(/\s+/));
    const first = arrays[0];
    let common = [];
    
    for (let i = 0; i < first.length; i++) {
        const word = first[i];
        if (arrays.every(arr => arr[i] && arr[i].toUpperCase() === word.toUpperCase())) {
            common.push(word);
        } else {
            break;
        }
    }
    
    return common.join(' ');
}

export function clusterItemsByCommonPrefix(items: any[]) {
    if (!items || items.length < 2) return;

    // Normaliza preço para comparar ignorando espaços ou ponto/vírgula
    const normPrice = (p: string) => (p || '').toString().replace(/\s+/g, '').replace('.', ',').toUpperCase();

    // Agrupa itens por preço normalizado
    const priceMap = new Map<string, any[]>();
    items.forEach(item => {
        const pKey = normPrice(item.price || item.preco || '');
        if (!priceMap.has(pKey)) priceMap.set(pKey, []);
        priceMap.get(pKey)!.push(item);
    });

    const KEY_CATEGORIES = [
        'DESODORANTE', 'SHAMPOO', 'CONDICIONADOR', 'SABONETE', 'ESMALTE', 'CREME', 
        'LOÇÃO', 'COLÔNIA', 'HIDRATANTE', 'PROTETOR', 'ÁGUA MICELAR', 'MÁSCARA', 
        'SÉRUM', 'TALCO', 'ABSORVENTE', 'FRALDA', 'LENÇO', 'GEL', 'FREGELLS', 
        'HALLS', 'TRIDENT', 'MENTOS', 'FINI', 'DORI', 'TIC TAC', 'DOVE', 'REXONA',
        'NIVEA', 'BOZZANO', 'MONANGE', 'RISQUE', 'COLORAMA', 'IMPALA'
    ];

    priceMap.forEach((priceItems) => {
        if (priceItems.length < 2) return;

        // Mapeia por primeiras 2 palavras do título (ou 1 palavra se for categoria/marca chave)
        const prefixMap = new Map<string, any[]>();

        priceItems.forEach(item => {
            const title = (item.parsed?.titulo || item.nome || item.titulo || '').trim();
            const words = title.split(/\s+/).filter(Boolean);
            if (words.length >= 2) {
                const first2 = words.slice(0, 2).join(' ').toUpperCase();
                if (!prefixMap.has(first2)) prefixMap.set(first2, []);
                prefixMap.get(first2)!.push(item);
            }
            if (words.length >= 1) {
                const word = words[0].toUpperCase();
                if (KEY_CATEGORIES.includes(word)) {
                    // Também adiciona ao mapa da palavra única para pegar variações como DESODORANTE
                    const key1 = `SINGLE_${word}`;
                    if (!prefixMap.has(key1)) prefixMap.set(key1, []);
                    prefixMap.get(key1)!.push(item);
                }
            }
        });

        prefixMap.forEach((cluster) => {
            if (cluster.length >= 2) {
                const titles = cluster.map(item => (item.parsed?.titulo || item.nome || item.titulo || '').trim());
                const commonPrefix = getCommonWordPrefix(titles);

                const commonWords = commonPrefix.trim().split(/\s+/).filter(Boolean);
                const firstWord = commonWords[0] ? commonWords[0].toUpperCase() : '';
                const isKeyCategory = KEY_CATEGORIES.includes(firstWord);

                if (commonWords.length >= 2 || (commonWords.length === 1 && isKeyCategory)) {
                    const cleanBaseTitle = commonPrefix.trim();
                    cluster.forEach(item => {
                        const oldTitle = (item.parsed?.titulo || item.nome || item.titulo || '').trim();
                        if (oldTitle.toUpperCase().startsWith(cleanBaseTitle.toUpperCase())) {
                            const suffix = oldTitle.substring(cleanBaseTitle.length).trim();
                            if (item.parsed) {
                                item.parsed.titulo = cleanBaseTitle;
                                if (suffix) {
                                    const currentSub1 = item.parsed.subtitulo1 ? item.parsed.subtitulo1.trim() : '';
                                    if (currentSub1) {
                                        item.parsed.subtitulo1 = `${suffix} ${currentSub1}`.trim();
                                    } else {
                                        item.parsed.subtitulo1 = suffix;
                                    }
                                }
                            } else {
                                item.nome = cleanBaseTitle;
                            }
                        }
                    });
                }
            }
        });
    });
}

export const processGroupedProducts = (jsonData: any[], titleCol: string, priceCol: string, validFromCol?: string, validUntilCol?: string) => {
    const rawItems: any[] = [];

    jsonData.forEach((row: any) => {
        const nomeRaw = row[titleCol];
        const precoRaw = row[priceCol];
        if (!nomeRaw || !precoRaw) return;

        let nome = String(nomeRaw).trim();
        const preco = String(precoRaw).trim();
        
        nome = formatUnidade(nome);
        nome = fixKnownWords(nome);
        
        let isDiaper = isDiaperName(nome);
        let diaperSize = '';

        if (isDiaper) {
            const colatedMatch = nome.match(/\b(XXXG|XXG|XG|GG|EG|PP|P|M|G)(\d+)\b/i);
            
            if (colatedMatch) {
                const tamanho = colatedMatch[1].toUpperCase();
                const quantidade = colatedMatch[2];
                diaperSize = `${quantidade} UNIDADES ${tamanho}`;
                nome = nome.replace(colatedMatch[0], '').replace(/\s*-\s*$/, '').trim();
            } else {
                const diaperRegex = /(?:^|[\s\-])(?:(\d+)\s*(?:Un|Unidades?|Unds?|Tiras?|Und)?\s+)?(G\/XG|XG\/XXG|P\/M|M\/G|XXG|XG|EG|G|M|P|PP)(?:(?:\s*-\s*|\s+)(\d+)\s*(?:Un|Unidades?|Unds?|Tiras?|Und)?)?(?!\w)/i;
                const match = nome.match(diaperRegex);
                if (match) {
                    const tamanho = match[2].toUpperCase();
                    const quantidade = match[1] || match[3];
                    const cleanMatch = match[0];
                    const unidadeFinal = cleanMatch.toUpperCase().includes('TIRA') ? 'TIRAS' : 'UNIDADES';
                    diaperSize = quantidade ? `${quantidade} ${unidadeFinal} ${tamanho}` : tamanho;
                    nome = nome.replace(diaperRegex, '').replace(/\s*-\s*$/, '').trim();
                }
            }
        }
        
        const parsed = parseProductName(nome);
        rawItems.push({
            originalName: nomeRaw,
            nome: nome,
            isDiaper,
            diaperSize,
            preco,
            price: preco.startsWith('R$') ? preco : `R$ ${preco}`,
            parsed,
            vFrom: validFromCol ? row[validFromCol] : '',
            vUntil: validUntilCol ? row[validUntilCol] : ''
        });
    });

    // Cluster items sharing price and common prefix
    clusterItemsByCommonPrefix(rawItems);

    const groups = new Map<string, any[]>();
    rawItems.forEach(item => {
        const key = getGroupingKey(item.parsed.titulo, item.preco);
        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key)!.push(item);
    });

    let generatedLines: string[] = [];

    groups.forEach((items, key) => {
        const first = items[0];
        
        // Se for grupo, o título final é o prefixo comum de todos os títulos
        let finalTitle = items.length > 1 
            ? getCommonWordPrefix(items.map(item => item.parsed.titulo)) 
            : first.parsed.titulo;
            
        // Fallback caso o prefixo comum fique vazio (improvável, mas seguro)
        if (!finalTitle) finalTitle = first.parsed.titulo;

        if (items.length > 1) {
            const sub1s = items.map(p => p.parsed.subtitulo1).filter(Boolean);
            if (sub1s.length === items.length) {
                const commonSub1Prefix = getCommonWordPrefix(sub1s);
                if (commonSub1Prefix) {
                    finalTitle += ' ' + commonSub1Prefix;
                }
            }
        }

        let finalSub1 = first.parsed.subtitulo1;
        let finalSub2 = first.parsed.subtitulo2;

        if (items.length > 1) {
            // GRUPO: múltiplas variações
            
            // Encontra especificação comum (se todas têm a mesma)
            const specs = items.map(p => p.parsed.subtitulo2);
            const commonSpec = specs.every(s => s === specs[0]) ? specs[0] : '';
            
            const commonSub1 = items.every(item => item.parsed.subtitulo1 === first.parsed.subtitulo1) ? first.parsed.subtitulo1 : '';
            
            // Se commonSub1 for idêntico ao prefixo que já adicionamos, não repete
            const sub1s = items.map(p => p.parsed.subtitulo1).filter(Boolean);
            const commonSub1Prefix = sub1s.length === items.length ? getCommonWordPrefix(sub1s) : '';
            
            if (commonSub1 && commonSub1 !== commonSub1Prefix) {
                finalSub1 = commonSub1;
                finalSub2 = commonSpec ? `${commonSpec} | Consulte Apresentações` : 'Consulte Apresentações';
            } else {
                finalSub1 = commonSpec || '';
                finalSub2 = 'Consulte Apresentações';
            }
            
            if (first.isDiaper) {
                const sizes = items.map(item => item.diaperSize).filter(Boolean);
                
                if (sizes.length > 0) {
                    if (commonSub1 && commonSub1 !== commonSub1Prefix) {
                        finalSub1 = commonSub1;
                        finalSub2 = sizes.join(' | ');
                    } else {
                        finalSub1 = sizes.join(' | ');
                        finalSub2 = '';
                    }
                } else {
                    finalSub1 = (commonSub1 && commonSub1 !== commonSub1Prefix) ? commonSub1 : '';
                    finalSub2 = '';
                }
            } else {
                const isVariantGroup = items.every(item => {
                    const fullSub = item.parsed.subtitulo1 + ' ' + item.parsed.subtitulo2;
                    return /(?:^|[\s\-])(G\/XG|XG\/XXG|P\/M|M\/G|XXG|XG|EG|G|M|P|PP)(?![a-zA-ZÀ-ÿ])/i.test(fullSub);
                });

                if (isVariantGroup && items.length > 1) {
                    const variants = items.map(item => {
                        const fullSub = item.parsed.subtitulo1 + ' ' + item.parsed.subtitulo2;
                        const matchTamanho = fullSub.match(/(?:^|[\s\-])(G\/XG|XG\/XXG|P\/M|M\/G|XXG|XG|EG|G|M|P|PP)(?![a-zA-ZÀ-ÿ])/i);
                        const matchQty = fullSub.match(/(?:^|[\s\-])(\d+)\s*(?:UNIDADES?|UN|UNDS?|TIRAS?)?(?![a-zA-ZÀ-ÿ])/i);
                        return {
                            tamanho: matchTamanho ? matchTamanho[1].toUpperCase() : '',
                            quantidade: matchQty ? matchQty[1] : '',
                            unidade: matchQty && matchQty[0].toUpperCase().includes('TIRA') ? 'TIRAS' : 'UNIDADES'
                        };
                    });

                    const subtituloStr = variants.map(v => {
                        const qtyStr = v.quantidade ? `${v.quantidade} ${v.unidade}` : '';
                        return [qtyStr, v.tamanho].filter(Boolean).join(' ');
                    }).join(' | ');
                    
                    finalSub2 = subtituloStr;
                    if (commonSpec && !finalSub2.includes(commonSpec)) {
                        finalSub2 += ` | ${commonSpec}`;
                    }
                }
            }
        } else {
            // ÚNICO: produto individual
            if (first.isDiaper && first.diaperSize) {
                if (first.parsed.subtitulo1) {
                    finalSub1 = first.parsed.subtitulo1;
                    finalSub2 = first.diaperSize;
                } else {
                    finalSub1 = first.diaperSize;
                }
            }
        }

        let line = formatTitleCase(finalTitle);
        let sub1 = finalSub1 ? formatTitleCase(finalSub1) : '';
        let sub2 = finalSub2 ? formatTitleCase(finalSub2) : '';
        
        const combinedSubtitle = formatFinalSubtitle(sub1, sub2);
        
        if (combinedSubtitle) {
            line += ` - ${combinedSubtitle}`;
        }
        
        let formattedPrice = first.preco;
        if (typeof formattedPrice === 'number') {
            formattedPrice = (formattedPrice as number).toFixed(2).replace('.', ',');
        } else if (typeof formattedPrice === 'string') {
            formattedPrice = formattedPrice.replace(/^R\$\s*/, '').trim();
            const numMatch = formattedPrice.match(/^(\d+)[.,](\d+)$/);
            if (numMatch) {
                const decimals = numMatch[2].padEnd(2, '0').slice(0, 2);
                formattedPrice = `${numMatch[1]},${decimals}`;
            } else if (/^\d+$/.test(formattedPrice)) {
                formattedPrice = `${formattedPrice},00`;
            }
        }
        line += ` R$ ${formattedPrice}`;
        
        if (first.vFrom || first.vUntil) {
            line += ` ${first.vFrom} ${first.vUntil}`;
        }
        
        generatedLines.push(line);
    });

    return generatedLines.join('\n\n');
};

// ═══════════════════════════════════════════════════════
// LIMITE DE CARACTERES POR LINHA
// ═══════════════════════════════════════════════════════

const MAX_SUBTITULO_LENGTH = 50; // Ajustar conforme layout da placa

// ═══════════════════════════════════════════════════════
// HÍFEN: APENAS PALAVRAS COMPOSTAS
// ═══════════════════════════════════════════════════════

export function cleanHifen(texto: string): string {
  if (!texto) return texto;
  
  // Primeiro, substitui hífens com espaços ao redor por |
  let result = texto.replace(/\s+-\s+/g, ' | ')
                    .replace(/\s+-/g, ' | ')
                    .replace(/-\s+/g, ' | ');

  // Lista de prefixos comuns em palavras compostas
  const prefixos = [
    'guarda', 'bem', 'anti', 'pós', 'pos', 'pré', 'pre', 'recém', 'recem', 'micro', 'macro', 
    'auto', 'contra', 'extra', 'infra', 'intra', 'neo', 'proto', 'pseudo', 'semi', 'supra', 'ultra',
    'dia', 'pé', 'pe', 'água', 'agua', 'mão', 'mao', 'couve', 'erva', 'beija', 'porta', 'quebra', 
    'saca', 'salva', 'para', 'passa', 'vira', 'bota', 'tira', 'conta', 'bate', 'arranha', 'lambe', 
    'pica', 'pisca', 'roda', 'troca', 'vai', 'vem', 'zigue', 'zague', 'long', 'self', 'roll', 'leave',
    'make', 'oil', 'free', 'cruelty', 'gluten', 'sugar', 'low', 'high', 'top', 'best', 'fast', 'slow',
    'hard', 'soft', 'full', 'half', 'part', 'time', 'kit', 'pack', 'set', 'box', 'bag', 'case', 'mix',
    'combo', 'duo', 'trio', 'mini', 'maxi', 'super', 'hiper', 'mega', 'giga', 'pró', 'pro', 'co'
  ];

  // Substitui hífens sem espaço que NÃO fazem parte de palavras compostas
  // Ex: "Mãos-Ureia" -> "Mãos | Ureia"
  // Divide o texto por hífens
  const parts = result.split('-');
  if (parts.length > 1) {
    let newResult = parts[0];
    for (let i = 1; i < parts.length; i++) {
        const prevWord = parts[i-1].trim().split(' ').pop()?.toLowerCase() || '';
        const isCompound = prefixos.includes(prevWord);
        
        if (isCompound) {
            newResult += '-' + parts[i];
        } else {
            newResult += ' | ' + parts[i];
        }
    }
    result = newResult;
  }
  
  return result;
}

export function formatFinalSubtitle(sub1: string, sub2: string): string {
    // Combine and replace standalone hyphens with |
    let combined = [sub1, sub2].filter(Boolean).join(' | ');
    combined = cleanHifen(combined);
    
    // Clean up extra spaces
    combined = combined.replace(/\s+/g, ' ').trim();

    // If there are two distinct parts originally, we should separate them with |
    if (sub1 && sub2) {
        const cleanSub1 = sub1.replace(/^[|\s]+|[|\s]+$/g, '').replace(/\s+/g, ' ').trim();
        const cleanSub2 = sub2.replace(/^[|\s]+|[|\s]+$/g, '').replace(/\s+/g, ' ').trim();
        if (cleanSub1 && cleanSub2) {
            // Only add | if it's not already there
            if (!combined.includes('|')) {
                 return `${cleanSub1} | ${cleanSub2}`;
            }
        }
    }
    
    return combined;
}

export function splitSubtitulo(texto: string): string {
    if (!texto || texto.length <= MAX_SUBTITULO_LENGTH) return texto;

    // Pontos de quebra prioritários
    const breakPatterns = [
        /\s+\|\s+/, // Quebra no pipe
        /\s+(\d+\s*(ml|g|mg|Cápsulas|Comprimidos|Pastilhas|Unds|Unidades?))/i,
        /\s+(Consulte\s+Apresentações)/i,
        /\s*-\s*/,
    ];
    
    for (const pattern of breakPatterns) {
        const match = texto.match(pattern);
        if (match && match.index) {
            const breakPoint = match.index;
            let parte1 = texto.substring(0, breakPoint).trim();
            let parte2 = texto.substring(breakPoint).replace(/^\s*[|-]\s*/, '').trim();
            
            return `${parte1}\n${parte2}`.trim();
        }
    }
    
    // Fallback: quebra por palavras
    const words = texto.split(' ');
    const midPoint = Math.ceil(words.length / 2);
    
    let linha1 = words.slice(0, midPoint).join(' ');
    let linha2 = words.slice(midPoint).join(' ');
    
    return `${linha1}\n${linha2}`.trim();
}

// ═══════════════════════════════════════════════════════
// LIMPAR E VALIDAR USO DO SEPARADOR |
// ═══════════════════════════════════════════════════════

export function cleanSeparators(text: string): string {
  if (!text) return text;
  let cleaned = text;
  
  // Substitui múltiplos pipes por um só
  cleaned = cleaned.replace(/\|+/g, '|');
  
  // Remove pipes no início e no final (mesmo com espaços)
  cleaned = cleaned.replace(/^[|\s]+/, '');
  cleaned = cleaned.replace(/[|\s]+$/, '');
  
  // Garante que há exatamente um espaço antes e depois de cada pipe
  cleaned = cleaned.replace(/\s*\|\s*/g, ' | ');
  
  return cleaned.trim();
}

// ═══════════════════════════════════════════════════════
// TÍTULO NUNCA TEM |
// ═══════════════════════════════════════════════════════

export function formatTitulo(titulo: string): string {
  if (!titulo) return titulo;
  // Remove qualquer | do título
  return titulo.replace(/\s*\|\s*/g, ' ').trim();
}

// ═══════════════════════════════════════════════════════
// SUBTÍTULO: | APENAS ENTRE DUAS INFORMAÇÕES
// ═══════════════════════════════════════════════════════

export function formatSubtitulo(subtitulo: string): string {
  if (!subtitulo) return subtitulo;
  
  // Substitui vírgulas por pipes para separar atributos
  let cleaned = subtitulo.replace(/,/g, ' | ');
  
  cleaned = cleanSeparators(cleaned);
  
  // Valida: | só existe se tem conteúdo dos dois lados
  if (cleaned.includes('|')) {
    const parts = cleaned.split('|').map(p => p.trim()).filter(Boolean);
    
    if (parts.length < 2) {
      // Não tem 2 partes válidas, remove o |
      cleaned = parts.join(' ');
    } else {
      // Tem 2+ partes, mantém com | entre elas
      cleaned = parts.join(' | ');
    }
  }
  
  return cleaned;
}

// ═══════════════════════════════════════════════════════
// APLICAR EM TODO PRODUTO ANTES DE RENDERIZAR
// ═══════════════════════════════════════════════════════

export function sanitizeProduct(product: { titulo: string; subtitulo1: string; subtitulo2: string; preco?: string }) {
  return {
    ...product,
    titulo: formatTitulo(product.titulo),
    subtitulo1: formatSubtitulo(product.subtitulo1),
    subtitulo2: formatSubtitulo(product.subtitulo2)
  };
}

export const parseProductList = (text: string): Product[] => {
    // Verifica se o texto colado é um CSV no formato específico
    if (/^barras,preco_ger,preco_cv,Nome/i.test(text) || /^\d{7,14},\d+[.,]\d{2},,/.test(text)) {
        let cleanText = text.replace(/^barras,preco_ger,preco_cv,Nome\s*/i, '');
        const lines = cleanText
            .split(/(?=\b\d{7,14},\d+[.,]\d{2},,)/)
            .map(l => l.trim())
            .filter(l => l.length > 0);
        
        const parsedData: any[] = [];
        for (const line of lines) {
            const match = line.match(/^(\d{7,14}),(\d+[.,]\d{2}),([^,]*),(.+)$/);
            if (match) {
                const precoStr = match[2].replace(',', '.');
                parsedData.push({
                    Nome: match[4].trim(),
                    preco_ger: parseFloat(precoStr)
                });
            }
        }
        
        if (parsedData.length > 0) {
            const standardText = parsedData.map(item => `${item.Nome} R$ ${item.preco_ger.toFixed(2).replace('.', ',')}`).join('\n');
            // Chama recursivamente com o texto formatado no padrão normal
            return parseProductList(standardText);
        }
    }

    const pricePattern = /\b\d{1,3}(?:[.,]\d{3})*[.,]\d{2}\b/;

    const isHeaderOrMetadata = (line: string): boolean => {
        const clean = line.trim().toLowerCase();
        if (pricePattern.test(line)) return false;
        
        const headerKeywords = [
            'descrição', 'descricao', 'preço', 'preco', 'encarte', 'validade', 
            'código', 'codigo', 'barras', 'produto', 'oferta', 'imagem', 'foto', 
            'relatório', 'relatorio', 'promoção', 'promocao', 'nr.seq', 'seq', 'compras'
        ];
        
        const words = clean.split(/\s+/);
        const matchesCount = headerKeywords.filter(keyword => clean.includes(keyword)).length;
        
        if (matchesCount >= 2) return true;
        
        if (words.length <= 3 && headerKeywords.some(keyword => clean === keyword || clean === keyword + ':')) {
            return true;
        }
        
        if (clean.includes('descrição preço') || clean.includes('descricao preco') || clean.includes('encarte validade') || clean.includes('preço encarte')) {
            return true;
        }
        
        return false;
    };

    const lines = text.split('\n')
        .filter(line => line.trim() !== '')
        .filter(line => !isHeaderOrMetadata(line));

    let productChunks: string[][] = [];
    let currentChunk: string[] = [];

    for (const line of lines) {
        currentChunk.push(line);
        if (pricePattern.test(line)) {
            productChunks.push(currentChunk);
            currentChunk = [];
        }
    }
    if (currentChunk.length > 0) {
        productChunks.push(currentChunk);
    }

    // 1. Parse all items
    const parsedItems: any[] = [];

    productChunks.forEach((chunk, index) => {
        const originalText = chunk.join('\n');
        let processedLine = chunk.join(' ').trim();
        processedLine = processedLine.replace(/[–—]/g, '-');
        
        if (!processedLine || /^(promo|imagem|oferta|relatório|promoção|validade|nr\.seq|código)/i.test(processedLine)) return;
        
        processedLine = processedLine.replace(/\s*\(.*?\)\s*/g, ' ').trim();

        const pricePattern = /\b\d{1,3}(?:[.,]\d{3})*[.,]\d{2}\b/g;
        const allPrices = processedLine.match(pricePattern);

        if (!allPrices || allPrices.length === 0) return;

        const finalPriceValue = allPrices[allPrices.length - 1];
        const firstPriceIndex = processedLine.indexOf(allPrices[0]);
        
        let descriptionPart = processedLine.substring(0, firstPriceIndex).trim();

        // Limpeza profunda da descrição
        descriptionPart = descriptionPart.replace(/R\$\s*$/i, '').trim();
        descriptionPart = descriptionPart.replace(/(?:POR APENAS:?$|POR:?$|R\$$)/i, '').trim();
        descriptionPart = removeNumericalCodes(descriptionPart);
        descriptionPart = removeResidualPrices(descriptionPart);

        const priceStr = finalPriceValue.replace('.', ',');
        const [priceInt, priceDec] = priceStr.split(',');

        let expandedDesc = expandAbbreviations(descriptionPart);
        expandedDesc = fixKnownWords(expandedDesc);
        const parsed = parseProductName(expandedDesc);

        let pValidFrom = '';
        let pValidUntil = '';
        // Desativado conforme solicitação do usuário - validade é preenchida manualmente

        parsedItems.push({
            id: `${Date.now()}_${index}`,
            parsed,
            price: `R$${priceInt},${priceDec}`,
            priceInt,
            priceDec,
            validFrom: pValidFrom,
            validUntil: pValidUntil,
            originalText
        });
    });

    // 1.5 Detect Conflicts (Mesmo Título, Preços Diferentes)
    const tituloPrecos: Map<string, Set<string>> = new Map();
    parsedItems.forEach(item => {
        const key = item.parsed.titulo.toUpperCase();
        if (!tituloPrecos.has(key)) {
            tituloPrecos.set(key, new Set());
        }
        tituloPrecos.get(key)!.add(item.price);
    });

    const titulosConflitantes = new Set<string>();
    for (const [titulo, precos] of tituloPrecos) {
        if (precos.size > 1) {
            titulosConflitantes.add(titulo);
        }
    }

    // Resolve conflicts by expanding title
    parsedItems.forEach(item => {
        if (/\s+-\s*|\s*-\s+/.test(item.originalText)) {
            // Do not expand if explicitly hyphenated
            return;
        }
        if (titulosConflitantes.has(item.parsed.titulo.toUpperCase())) {
            let { titulo, subtitulo1, subtitulo2 } = item.parsed;
            
            if (subtitulo1) {
                const parts = subtitulo1.split(/\s+/);
                let diferenciador = '';
                let restoSubtitulo1 = subtitulo1;
                
                const linhaPatterns = [
                    /^([A-Z][a-záéíóúãõç]+\s+[A-Z][a-záéíóúãõç]+)/i,
                    /^([A-Z][a-záéíóúãõç]+\s+\d+[A-Z]*)/i,
                    /^(Premium|Original|Luminous|White|Glow|Complex|Digest|Condro|Articular|KIT|PEA)/i,
                ];
                
                for (const pattern of linhaPatterns) {
                    const match = subtitulo1.match(pattern);
                    if (match && !match[1].toLowerCase().startsWith('consulte')) {
                        diferenciador = match[1];
                        restoSubtitulo1 = subtitulo1.replace(match[1], '').trim();
                        break;
                    }
                }
                
                if (!diferenciador && parts.length >= 1) {
                    const firstWord = parts[0].toLowerCase();
                    if (firstWord === 'consulte' || firstWord === '|') {
                        // Não usa "Consulte" ou "|" como diferenciador de título
                        diferenciador = '';
                    } else {
                        diferenciador = parts.slice(0, 2).join(' ');
                        restoSubtitulo1 = parts.slice(2).join(' ');
                    }
                }
                
                const isVolumetria = /^\d+(?:\.\d+)?\s*(?:mg|g|ml|l|mcg|unidades?|unds?|cx|capsulas?|comprimidos?)$/i.test(diferenciador.trim());
                if (diferenciador && !isVolumetria) {
                    item.parsed.titulo = `${titulo} ${diferenciador}`.trim();
                    item.parsed.subtitulo1 = restoSubtitulo1.trim();
                }
            } else if (subtitulo2) {
                // Technical specifications (like 5MG | 30ML) in subtitle2 are kept as-is and never moved to the title.
            }
        }
    });

    // 1.6 Sanitize all products before grouping
    parsedItems.forEach(item => {
        item.parsed = sanitizeProduct(item.parsed);
    });

    // 1.7 Cluster products with same price and common prefix (e.g. deodorants, creams, enamels)
    clusterItemsByCommonPrefix(parsedItems);

    // 2. Group items
    const groups = new Map<string, any[]>();
    
    parsedItems.forEach(item => {
        const key = getGroupingKey(item.parsed.titulo, item.price);
        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key)!.push(item);
    });

    // 3. Create final Product objects
    const products: Product[] = [];
    
    groups.forEach((items, key) => {
        const first = items[0];
        
        const allIdentical = items.every(item => 
            item.parsed.titulo === first.parsed.titulo &&
            item.parsed.subtitulo1 === first.parsed.subtitulo1 && 
            item.parsed.subtitulo2 === first.parsed.subtitulo2
        );
        
        let finalTitle = items.length > 1 && !allIdentical
            ? getCommonWordPrefix(items.map(item => item.parsed.titulo)) 
            : first.parsed.titulo;
            
        if (!finalTitle) finalTitle = first.parsed.titulo;
        
        if (items.length > 1 && !allIdentical) {
            const sub1s = items.map(p => p.parsed.subtitulo1).filter(Boolean);
            if (sub1s.length === items.length) {
                const commonSub1Prefix = getCommonWordPrefix(sub1s);
                if (commonSub1Prefix) {
                    finalTitle += ' ' + commonSub1Prefix;
                }
            }
        }
        
        if (items.length === 1 || allIdentical) {
            // Extract unique identical item to avoid duplicated tags
            const uniqueItem = items[0];
            const sub1 = cleanForDisplay(formatTitleCase(uniqueItem.parsed.subtitulo1));
            const sub2 = cleanForDisplay(formatTitleCase(uniqueItem.parsed.subtitulo2));
            let combinedSubtitle = formatFinalSubtitle(sub1, sub2);
            combinedSubtitle = formatSubtitulo(combinedSubtitle);
            const subtitle = splitSubtitulo(combinedSubtitle);
            
            products.push({
                id: uniqueItem.id,
                title: cleanForDisplay(finalTitle.toUpperCase()),
                subtitle,
                price: uniqueItem.price,
                priceInt: uniqueItem.priceInt,
                priceDec: uniqueItem.priceDec,
                validFrom: uniqueItem.validFrom,
                validUntil: uniqueItem.validUntil,
                customStyles: {},
                originalText: uniqueItem.originalText
            });
        } else {
            // Grupo de produtos (different subtitles)
            
            // Verifica se é um grupo de variantes (Fraldas, etc)
            const isVariantGroup = items.every(item => {
                const fullSub = item.parsed.subtitulo1 + ' ' + item.parsed.subtitulo2;
                return /(?:^|[\s\-])(G\/XG|XG\/XXG|P\/M|M\/G|XXG|XG|EG|G|M|P|PP)(?![a-zA-ZÀ-ÿ])/i.test(fullSub);
            });

            if (isVariantGroup && items.length > 1) {
                const variants = items.map(item => {
                    const fullSub = item.parsed.subtitulo1 + ' ' + item.parsed.subtitulo2;
                    const matchTamanho = fullSub.match(/(?:^|[\s\-])(G\/XG|XG\/XXG|P\/M|M\/G|XXG|XG|EG|G|M|P|PP)(?![a-zA-ZÀ-ÿ])/i);
                    const matchQty = fullSub.match(/(?:^|[\s\-])(\d+)\s*(?:UNIDADES?|UN|UNDS?|TIRAS?)?(?![a-zA-ZÀ-ÿ])/i);
                    return {
                        tamanho: matchTamanho ? matchTamanho[1].toUpperCase() : '',
                        quantidade: matchQty ? matchQty[1] : '',
                        unidade: matchQty && matchQty[0].toUpperCase().includes('TIRA') ? 'TIRAS' : 'UNIDADES'
                    };
                });

                const uniqueSubtitles = Array.from(new Set(variants.map(v => {
                    const qtyStr = v.quantidade ? `${v.quantidade} ${v.unidade}` : '';
                    return [qtyStr, v.tamanho].filter(Boolean).join(' ');
                }).filter(Boolean)));
                const subtituloStr = uniqueSubtitles.join(' | ');

                const formattedSubtituloStr = formatTitleCase(subtituloStr);

                let title = finalTitle;

                products.push({
                    id: first.id,
                    title: cleanForDisplay(title.toUpperCase()),
                    subtitle: splitSubtitulo(formatSubtitulo(formattedSubtituloStr)),
                    price: first.price,
                    priceInt: first.priceInt,
                    priceDec: first.priceDec,
                    validFrom: first.validFrom,
                    validUntil: first.validUntil,
                    customStyles: {},
                    originalText: first.originalText
                });
            } else {
                const commonSub1 = items.every(item => item.parsed.subtitulo1 === first.parsed.subtitulo1) ? first.parsed.subtitulo1 : '';
                
                let sub1 = '';
                const specs = items.map(p => p.parsed.subtitulo2);
                const commonSpec = specs.every(s => s === specs[0]) ? specs[0] : '';
                
                const sub1s = items.map(p => p.parsed.subtitulo1).filter(Boolean);
                const commonSub1Prefix = sub1s.length === items.length ? getCommonWordPrefix(sub1s) : '';

                if (commonSub1 && commonSub1 !== commonSub1Prefix) {
                    sub1 = cleanForDisplay(formatTitleCase(commonSub1));
                    if (commonSpec) {
                        sub1 += ` | ${cleanForDisplay(formatTitleCase(commonSpec))}`;
                    }
                } else {
                    sub1 = cleanForDisplay(formatTitleCase(commonSpec || ''));
                }
                
                const sub2 = sub1.toLowerCase().includes('consulte') ? '' : cleanForDisplay(formatTitleCase('Consulte Apresentações'));
                let combinedSubtitle = formatFinalSubtitle(sub1, sub2);
                combinedSubtitle = formatSubtitulo(combinedSubtitle);
                const subtitle = splitSubtitulo(combinedSubtitle);
                
                products.push({
                    id: first.id,
                    title: cleanForDisplay(finalTitle.toUpperCase()),
                    subtitle,
                    price: first.price,
                    priceInt: first.priceInt,
                    priceDec: first.priceDec,
                    validFrom: first.validFrom,
                    validUntil: first.validUntil,
                    customStyles: {},
                    originalText: first.originalText // Keep first item's original text
                });
            }
        }
    });

    return products;
};
