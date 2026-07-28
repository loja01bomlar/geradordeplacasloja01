import { parseProductList } from './services/parser';
const text = `
FRAL BABYSEC ULTRA HIPER - G60, M68, P72, XG56, XXG48, XXXG42 R$ 67,99
FRAL GERIAT PLENITUD PROT - PLUS UNISSEX 16UN G/XG, P/M R$ 63,99
SAB FARNESE - 180G aveia, floral, frutas vermelhas, puro hidratante R$ 4,98
SAB FARNESE - 85G erva doce, frutas vermelhas, proteína do leite R$ 2,29
KIT SAB LIQ INTIMO DERMAFEME - 2UN 200ML floral, fresh, tutti frutti R$ 18,98
DENTIF COLGATE LUMINOUS WHITE - 70G COLOR CORRECT R$ 7,98
`;
const items = parseProductList(text);
console.log(items.length);
console.log(JSON.stringify(items, null, 2));
