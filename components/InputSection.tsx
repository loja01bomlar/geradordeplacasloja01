
import React, { useState, useCallback, useRef } from 'react';
import { expandAbbreviations, removeNumericalCodes, processGroupedProducts } from '../services/parser';

// Declare global variables from CDNs
declare var pdfjsLib: any;
declare var mammoth: any;
declare var XLSX: any;

function readAsText(file: File, encoding: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file, encoding);
    });
}

function hasCorruptedChars(text: string): boolean {
    const corruptedPatterns = [
        /Ã£/,      // ã mal codificado
        /Ã©/,      // é mal codificado
        /Ã§/,      // ç mal codificado
        /Ã¡/,      // á mal codificado
        /Ã³/,      // ó mal codificado
        /ã\[a-z\]ã/, // padrão de double encoding
        /\uFFFD/,       // replacement character
    ];
    return corruptedPatterns.some(p => p.test(text));
}

async function readFileWithCorrectEncoding(file: File): Promise<string> {
    let text = await readAsText(file, 'UTF-8');
    
    if (hasCorruptedChars(text)) {
        text = await readAsText(file, 'ISO-8859-1');
    }
    
    if (hasCorruptedChars(text)) {
        text = await readAsText(file, 'windows-1252');
    }
    
    return text;
}

interface InputSectionProps {
    onProcess: (text: string) => void;
    isLoading: boolean;
    inputText: string;
    onInputTextChange: (text: string) => void;
}

const InputSection: React.FC<InputSectionProps> = ({ onProcess, isLoading, inputText, onInputTextChange }) => {
    const [isReadingFile, setIsReadingFile] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsReadingFile(true);
        let fileContent = '';

        try {
            const extension = file.name.split('.').pop()?.toLowerCase();
            switch (extension) {
                case 'txt':
                case 'csv':
                    const rawText = await readFileWithCorrectEncoding(file);
                    
                    if (/^barras,preco_ger,preco_cv,Nome/i.test(rawText) || /^\d{7,14},\d+[.,]\d{2},,/.test(rawText)) {
                        let cleanText = rawText.replace(/^barras,preco_ger,preco_cv,Nome\s*/i, '');
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
                            fileContent = processGroupedProducts(parsedData, 'Nome', 'preco_ger');
                        } else {
                            fileContent = expandAbbreviations(removeNumericalCodes(rawText));
                        }
                    } else {
                        fileContent = expandAbbreviations(removeNumericalCodes(rawText));
                    }
                    break;
                case 'pdf':
                    const pdfData = await file.arrayBuffer();
                    const pdf = await pdfjsLib.getDocument(pdfData).promise;
                    let pdfText = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        pdfText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
                    }
                    fileContent = expandAbbreviations(removeNumericalCodes(pdfText));
                    break;
                case 'docx':
                    const docxData = await file.arrayBuffer();
                    const docxResult = await mammoth.extractRawText({ arrayBuffer: docxData });
                    fileContent = expandAbbreviations(removeNumericalCodes(docxResult.value));
                    break;
                case 'xlsx':
                case 'xls':
                    try {
                        const ExcelJS = (await import('exceljs')).default;
                        const excelData = await file.arrayBuffer();
                        const workbook = new ExcelJS.Workbook();
                        await workbook.xlsx.load(excelData);
                        const worksheet = workbook.worksheets[0];
                        
                        if (worksheet && worksheet.rowCount > 0) {
                            const extractedItems: string[] = [];
                            let descIndex = -1;
                            let priceIndex = -1;
                            let validIndex = -1;

                            worksheet.eachRow((row, rowNumber) => {
                                // Skip red rows
                                let isRed = false;
                                row.eachCell({ includeEmpty: false }, (cell) => {
                                    if (cell.fill && cell.fill.type === 'pattern' && cell.fill.pattern === 'solid') {
                                        const fgColor = cell.fill.fgColor?.argb || cell.fill.fgColor?.theme;
                                        // Typical red hex starts with FF usually like FFFF0000 or similar
                                        if (typeof fgColor === 'string' && (fgColor.toUpperCase().includes('FF0000') || fgColor.toUpperCase().includes('C00000') || fgColor === 'FFFFC7CE')) {
                                            isRed = true;
                                        }
                                    }
                                });
                                
                                if (isRed) return;

                                 const rowValues = row.values as any[];
                                // rowValues is 1-indexed in exceljs!
                                const getCellValue = (val: any): string => {
                                    if (val === null || val === undefined) return '';
                                    if (typeof val === 'number') {
                                        return Number.isInteger(val) ? val.toString() : val.toFixed(2).replace('.', ',');
                                    }
                                    if (typeof val === 'object') {
                                        if ('result' in val) return String(val.result);
                                        if ('richText' in val) return val.richText.map((rt: any) => rt.text).join('');
                                        if (val instanceof Date) return val.toLocaleDateString('pt-BR');
                                    }
                                    return String(val);
                                };

                                const rowLower = Array.from(rowValues).map(v => getCellValue(v).toLowerCase().trim());

                                if (descIndex === -1 || priceIndex === -1) {
                                    const possibleDesc = rowLower.findIndex(c => c && (c === 'descrição' || c === 'descricao' || c === 'produto' || c === 'nome' || c.includes('descrição') || c.includes('descricao')));

                                    if (possibleDesc !== -1) {
                                        descIndex = possibleDesc;
                                        let pIdx = rowLower.findIndex(c => c && c.includes('venda') && c.includes('encarte'));
                                        if (pIdx === -1) pIdx = rowLower.findIndex(c => c && (c.includes('preço') || c.includes('preco')) && c.includes('encarte'));
                                        if (pIdx === -1) pIdx = rowLower.findIndex(c => c && (c.includes('preço') || c.includes('preco')) && c.includes('final'));
                                        if (pIdx === -1) pIdx = rowLower.findIndex(c => c && ['valor', 'preço', 'preco', 'pv'].includes(c));

                                        if (pIdx !== -1) {
                                            priceIndex = pIdx;
                                            validIndex = -1; // Desativado - validade é preenchida manualmente pelo usuário
                                            return;
                                        } else {
                                            descIndex = -1;
                                        }
                                    }
                                }

                                if (descIndex !== -1 && priceIndex !== -1 && rowValues.length > Math.max(descIndex, priceIndex)) {
                                    const desc = getCellValue(rowValues[descIndex]).trim();
                                    let price = getCellValue(rowValues[priceIndex]).trim();
                                    let valid = validIndex !== -1 && rowValues.length > validIndex ? getCellValue(rowValues[validIndex]).trim() : '';

                                    if (desc && desc !== '' && price && price !== '' && !desc.toLowerCase().startsWith('encarte')) {
                                        price = price.replace(/R\$\s*/gi, '').trim();
                                        let line = `${desc} R$ ${price}`;
                                        if (valid && valid !== '') {
                                            valid = valid.toLowerCase().replace('até', 'ate').trim();
                                            line += ` // VALIDADE: ${valid}`;
                                        }
                                        extractedItems.push(line);
                                    }
                                }
                            });

                            if (extractedItems.length > 0) {
                                fileContent = extractedItems.join('\n');
                            } else {
                                // Fallback reading text if no specific columns found
                                fileContent = "";
                                worksheet.eachRow((row) => {
                                     let isRed = false;
                                     row.eachCell({ includeEmpty: false }, (cell) => {
                                         if (cell.fill && cell.fill.type === 'pattern' && cell.fill.pattern === 'solid') {
                                             const fgColor = cell.fill.fgColor?.argb;
                                             if (typeof fgColor === 'string' && (fgColor.toUpperCase().includes('FF0000') || fgColor.toUpperCase().includes('C00000') || fgColor === 'FFFFC7CE')) {
                                                 isRed = true;
                                             }
                                         }
                                     });
                                     if (!isRed) {
                                         const rw = row.values as any[];
                                         const rwStr = Array.from(rw).filter(Boolean).map(v => {
                                             if (v === null || v === undefined) return '';
                                             if (typeof v === 'number') {
                                                 return Number.isInteger(v) ? v.toString() : v.toFixed(2).replace('.', ',');
                                             }
                                             if (typeof v === 'object') {
                                                 if ('result' in v) return String(v.result);
                                                 if ('richText' in v) return v.richText.map((rt: any) => rt.text).join('');
                                                 if (v instanceof Date) return v.toLocaleDateString('pt-BR');
                                             }
                                             return String(v);
                                         });
                                         fileContent += rwStr.filter(Boolean).join(',') + '\n';
                                     }
                                });
                                fileContent = expandAbbreviations(removeNumericalCodes(fileContent));
                            }
                        } else {
                             fileContent = "";
                        }
                    } catch (err) {
                        console.error('Error with ExcelJS, falling back', err);
                        // fallback to xlsx
                    }
                    break;
                default:
                    alert('Formato de arquivo não suportado.');
            }
            onInputTextChange(fileContent);
        } catch (error) {
            console.error('Error reading file:', error);
            alert('Falha ao ler o arquivo.');
        } finally {
            setIsReadingFile(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }, [onInputTextChange]);
    
    const isProcessing = isLoading || isReadingFile;

    return (
        <div className="bg-white p-6 rounded-[16px] shadow-[0_2px_8px_rgba(0,181,172,0.2)] flex flex-col min-h-[400px] border-2 border-[#00b5ac]">
            <h2 className="text-xl font-bold mb-4 text-black flex items-center gap-2">
                <span>🏥</span> 3. Insira sua Lista de Produtos
            </h2>
            <div className="flex-1 flex flex-col min-h-[200px] relative">
                <textarea
                    value={inputText}
                    onChange={(e) => onInputTextChange(e.target.value)}
                    placeholder="Cole sua lista aqui ou faça o upload de um arquivo Excel.&#10;Exemplo Excel (Colunas):&#10;[Produto] [Subtítulo] [Adicional] [Valor Por]&#10;&#10;Exemplo Texto:&#10;DIPIRONA 500MG - 20 COMPRIMIDOS // ADICIONAL R$ 12,50"
                    className="w-full flex-1 p-4 bg-white border-2 border-[#00b5ac] rounded-[12px] resize-none focus:outline-none focus:ring-2 focus:ring-[#00b5ac] transition-all no-scrollbar text-black shadow-inner placeholder-gray-500"
                    disabled={isProcessing}
                />
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
                 <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".txt,.csv,.pdf,.docx,.xls,.xlsx"
                    className="hidden"
                    id="file-upload"
                    disabled={isProcessing}
                />
                <label
                    htmlFor="file-upload"
                    className={`flex-1 text-center px-4 py-3 rounded-lg font-bold transition-all cursor-pointer shadow-sm text-sm border-0 ${isProcessing ? 'bg-gray-300 text-white cursor-not-allowed' : 'bg-[#00b5ac] text-white hover:bg-[#009e96]'}`}
                >
                    {isReadingFile ? 'Lendo...' : '📁 Upload de Arquivo'}
                </label>
                
                <button
                    onClick={() => onInputTextChange('')}
                    disabled={!inputText || isProcessing}
                    className="px-4 py-3 bg-[#f36e21] text-white rounded-lg font-bold hover:bg-[#d95d18] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm shadow-sm"
                >
                    🗑️ Limpar
                </button>

                <button
                    onClick={() => onProcess(inputText)}
                    disabled={!inputText || isProcessing}
                    className="flex-1 px-4 py-3 bg-[#00b5ac] text-white rounded-lg font-bold hover:bg-[#009e96] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md text-sm transform active:scale-95"
                >
                    {isLoading ? 'Processando...' : '✅ Processar Lista'}
                </button>
            </div>
        </div>
    );
};

export default InputSection;
