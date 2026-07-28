import { parseProductList } from './services/parser.ts';

const text = `
Santo Habito Digest Hortelã 150ml R$ 28,99
Santo Habito Vitamina B12 60 Cápsulas R$ 24,99
Santo Habito Condro Premium 60 Cápsulas R$ 89,99
Creme Dental Colgate Original Mint 90G R$ 12,99
Creme Dental Colgate Luminous White Glow 70G R$ 19,99
Esmalte Risque Cremoso Terracota Provoca 8ml R$ 5,99
Esmalte Risque Cremoso Ante Solução Mal Iluminada 8ml R$ 5,99
`;

console.log(JSON.stringify(parseProductList(text), null, 2));
