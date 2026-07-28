import { parseProductList } from './services/parser';

const str = `Dipirona Monoidratada R$ 10,99 // VALIDADE: ate 30/06`;
console.log(JSON.stringify(parseProductList(str), null, 2));



















