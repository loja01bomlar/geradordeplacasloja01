import React, { useState, useCallback, useRef } from 'react';
import { Product } from './types';
import InputSection from './components/InputSection';
import QuickAddForm from './components/QuickAddForm';
import BackgroundUploader from './components/BackgroundUploader';
import ValidityControls from './components/ValidityControls';
import EditorView from './components/EditorView';
import Controls from './components/Controls';
import Pagination from './components/Pagination';
import { parseProductList, formatTitleCase } from './services/parser';

const ITEMS_PER_PAGE = 14;

// Declare global variables from CDNs
declare var jspdf: any;
declare var html2canvas: any;

const App: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
    const [validFrom, setValidFrom] = useState<string>('');
    const [validUntil, setValidUntil] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
    const [inputText, setInputText] = useState<string>('');
    const [renderTrigger, setRenderTrigger] = useState<number>(0);
    const editorViewRef = useRef<HTMLDivElement>(null);

    const handleValidFromChange = (date: string) => {
        setValidFrom(date);
        setProducts(prev => prev.map(p => ({ ...p, validFrom: date })));
    };

    const handleValidUntilChange = (date: string) => {
        setValidUntil(date);
        setProducts(prev => prev.map(p => ({ ...p, validUntil: date })));
    };

    const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE) || 1;

    const handleProcessList = useCallback((text: string) => {
        setIsLoading(true);
        try {
            const parsedProducts = parseProductList(text);
            const productsWithValidity = parsedProducts.map(p => ({ 
                ...p, 
                validFrom: validFrom || p.validFrom, 
                validUntil: validUntil || p.validUntil 
            }));
            setProducts(productsWithValidity);
            setCurrentPage(1);
        } catch (error) {
            console.error("Error parsing product list:", error);
            alert("Ocorreu um erro ao processar a lista. Verifique o formato do texto.");
        } finally {
            setIsLoading(false);
        }
    }, [validFrom, validUntil]);

    const handleUpdateProduct = useCallback((updatedProduct: Product) => {
        setProducts(prevProducts =>
            prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p)
        );
    }, []);

    const handleDeleteProduct = useCallback((productId: string) => {
        setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
    }, []);

    const handleRepeatProduct = (productToRepeat: Product) => {
        // Create 14 copies of the product, preserving edits and styles
        const newProducts = Array(14).fill(null).map((_, index) => ({
            ...productToRepeat,
            id: `${productToRepeat.id}_repeat_${Date.now()}_${index}`,
            customStyles: productToRepeat.customStyles 
                ? JSON.parse(JSON.stringify(productToRepeat.customStyles)) 
                : {}
        }));

        setProducts(newProducts);
        setCurrentPage(1);

        // Update the text box to reflect 14 copies of the original text, if available
        if (productToRepeat.originalText) {
            const newText = Array(14).fill(productToRepeat.originalText).join('\n');
            setInputText(newText);
        }

        alert("Lista de produtos atualizada para 14 cópias do item selecionado!");
    };

    const handleDuplicateProduct = (productToDuplicate: Product) => {
        const newProduct: Product = {
            ...productToDuplicate,
            id: `${productToDuplicate.id}_copy_${Date.now()}`,
            customStyles: productToDuplicate.customStyles 
                ? JSON.parse(JSON.stringify(productToDuplicate.customStyles)) 
                : {}
        };

        setProducts(prev => {
            const newProducts = [...prev, newProduct];
            const newTotal = Math.ceil(newProducts.length / ITEMS_PER_PAGE);
            if (newTotal > currentPage) {
                setTimeout(() => setCurrentPage(newTotal), 50);
            }
            return newProducts;
        });
    };

    const handleCopyStyles = (productToCopy: Product) => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const stylesToCopy = productToCopy.customStyles;

        setProducts(prevProducts => {
            const newProducts = [...prevProducts];
            for (let i = startIndex; i < endIndex && i < newProducts.length; i++) {
                newProducts[i] = {
                    ...newProducts[i],
                    customStyles: stylesToCopy
                        ? JSON.parse(JSON.stringify(stylesToCopy))
                        : {},
                };
            }
            return newProducts;
        });
        setRenderTrigger(prev => prev + 1);
        alert("Estilo copiado para os cards da página atual!");
    };

    const handleAddSpecificProduct = useCallback((title: string, sub1: string, sub2: string, priceStr: string) => {
        let priceInt = '00';
        let priceDec = '00';
        
        // Simple price parser for manual input
        const cleanPrice = priceStr.replace('R$', '').trim().replace('.', ',');
        const parts = cleanPrice.split(',');
        if (parts.length > 0) priceInt = parts[0];
        if (parts.length > 1) priceDec = parts[1].padEnd(2, '0').slice(0, 2);
        
        // Logic to combine subtitles with a line break and formatting
        const formattedSub1 = formatTitleCase(sub1);
        const formattedSub2 = formatTitleCase(sub2);
        
        let finalSubtitle = formattedSub1;
        if (formattedSub2) {
            finalSubtitle = formattedSub1 ? `${formattedSub1}\n${formattedSub2}` : formattedSub2;
        }

        const newProduct: Product = {
            id: `manual_${Date.now()}`,
            title: title.toUpperCase(),
            subtitle: finalSubtitle, // The card component handles formatting
            price: `R$${priceInt},${priceDec}`,
            priceInt,
            priceDec,
            validFrom: validFrom,
            validUntil: validUntil,
            customStyles: {}
        };

        setProducts(prev => {
            const newProducts = [...prev, newProduct];
            // Automatically switch to the new page if needed
            const newTotal = Math.ceil(newProducts.length / ITEMS_PER_PAGE);
            if (newTotal > currentPage) {
                // Defer page switch slightly to ensure render
                setTimeout(() => setCurrentPage(newTotal), 50);
            }
            return newProducts;
        });
    }, [validFrom, validUntil, currentPage]);

    const handleBgChange = async (file: File) => {
        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                const rawUrl = e.target?.result as string;
                const img = new Image();
                img.onload = () => {
                    const MAX_DIM = 1600;
                    let width = img.width;
                    let height = img.height;
                    if (width > MAX_DIM || height > MAX_DIM) {
                        if (width > height) {
                            height = Math.round((height * MAX_DIM) / width);
                            width = MAX_DIM;
                        } else {
                            width = Math.round((width * MAX_DIM) / height);
                            height = MAX_DIM;
                        }
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, width, height);
                        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
                        canvas.width = 0;
                        canvas.height = 0;
                        setBackgroundImage(compressedDataUrl);
                    } else {
                        setBackgroundImage(rawUrl);
                    }
                };
                img.onerror = () => setBackgroundImage(rawUrl);
                img.src = rawUrl;
            };
            reader.readAsDataURL(file);
        } catch (e) {
            console.error('Error processing background image', e);
        }
    };

    const handleRemoveBg = () => {
        setBackgroundImage(null);
    };

    const handleClearProducts = () => {
        setProducts([]);
        setInputText(''); // Limpa também a caixa de texto
        setCurrentPage(1);
    };

    const generatePdf = async () => {
        if (!editorViewRef.current) return;
        setIsGeneratingPdf(true);

        try {
            const { jsPDF } = jspdf;
            // A4 size in mm: 210 x 297
            const pdf = new jsPDF('p', 'mm', 'a4');
            const originalPage = currentPage;
            const pageElement = editorViewRef.current;

            for (let i = 1; i <= totalPages; i++) {
                setCurrentPage(i);
                // Wait for render update
                await new Promise(resolve => setTimeout(resolve, 350));
                
                if (i > 1) {
                    pdf.addPage();
                }

                let originalBgStyle = '';
                let hadBgClass = false;

                if (backgroundImage) {
                    originalBgStyle = pageElement.style.backgroundImage;
                    hadBgClass = pageElement.classList.contains('bg-white');
                    
                    // Remove temporariamente o fundo para captura do texto
                    pageElement.style.backgroundImage = 'none';
                    if (hadBgClass) {
                        pageElement.classList.remove('bg-white');
                    }
                }

                await document.fonts.ready;
                // Captura o texto com escala otimizada para nitidez e velocidade
                const textCanvas = await html2canvas(pageElement, {
                    scale: 2.5, 
                    backgroundColor: null,
                    useCORS: true,
                    logging: false,
                    onclone: (clonedDoc) => {
                        const link1 = clonedDoc.createElement('link');
                        link1.rel = 'preconnect';
                        link1.href = 'https://fonts.googleapis.com';
                        clonedDoc.head.appendChild(link1);

                        const link2 = clonedDoc.createElement('link');
                        link2.rel = 'preconnect';
                        link2.href = 'https://fonts.gstatic.com';
                        link2.crossOrigin = 'anonymous';
                        clonedDoc.head.appendChild(link2);

                        const link3 = clonedDoc.createElement('link');
                        link3.rel = 'stylesheet';
                        link3.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;900&family=Oswald:wght@700&display=swap';
                        link3.crossOrigin = 'anonymous';
                        clonedDoc.head.appendChild(link3);
                    }
                });
                const textImgData = textCanvas.toDataURL('image/png');

                // Libera memória de tela do canvas
                textCanvas.width = 0;
                textCanvas.height = 0;

                // Restaura o visual da página
                if (backgroundImage) {
                    if (hadBgClass) {
                        pageElement.classList.add('bg-white');
                    }
                    pageElement.style.backgroundImage = originalBgStyle;

                    // --- Injeção do Background de Alta Qualidade ---
                    let format = 'PNG';
                    let compression = 'FAST'; 

                    if (backgroundImage.startsWith('data:image/jpeg') || backgroundImage.startsWith('data:image/jpg')) {
                        format = 'JPEG';
                        compression = 'NONE';
                    } else if (backgroundImage.startsWith('data:image/webp')) {
                        format = 'WEBP';
                        compression = 'FAST'; 
                    }

                    try {
                        // Adiciona o Fundo (Camada 0)
                        pdf.addImage(backgroundImage, format, 0, 0, 210, 297, undefined, compression);
                    } catch (e) {
                        console.error("Fallback background PDF generation", e);
                        pdf.addImage(backgroundImage, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
                    }
                }

                // Adiciona o Texto (Camada 1 - Sobreposição)
                pdf.addImage(textImgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
            }

            pdf.save('placas_de_preco_alta_resolucao.pdf');
            setCurrentPage(originalPage);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Ocorreu um erro ao gerar o PDF. Tente novamente.");
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const productsForCurrentPage = products.slice(startIndex, endIndex);

    return (
        <div className="min-h-screen flex flex-col xl:flex-row p-4 sm:p-6 lg:p-8 gap-8 bg-[#f8f9fa] text-black">
            {isGeneratingPdf && (
                <div className="fixed inset-0 bg-[#00b5ac]/90 flex flex-col items-center justify-center z-50 backdrop-blur-sm text-white">
                    <div className="w-16 h-16 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
                    <p className="mt-4 text-xl font-bold">Gerando PDF Alta Definição... ({currentPage}/{totalPages})</p>
                    <p className="text-white/80">Isso pode levar alguns segundos para garantir a nitidez.</p>
                </div>
            )}
            
            {/* Left Sidebar - Inputs & Controls */}
            <div className="w-full xl:w-[450px] shrink-0 flex flex-col gap-6">
                <header className="mb-2">
                    <h1 className="text-3xl font-extrabold text-[#00b5ac] tracking-tight">Gerador de Placas</h1>
                    <p className="text-black mt-1 font-medium">Farmácia Bom Lar</p>
                </header>
                
                {/* 1. Background Upload */}
                <BackgroundUploader 
                    onBgChange={handleBgChange} 
                    backgroundImage={backgroundImage}
                    onRemoveBg={handleRemoveBg}
                />

                {/* 2. Validity */}
                <ValidityControls 
                    validFrom={validFrom}
                    onValidFromChange={handleValidFromChange}
                    validUntil={validUntil}
                    onValidUntilChange={handleValidUntilChange}
                />

                {/* 3. Input List */}
                <InputSection 
                    onProcess={handleProcessList} 
                    isLoading={isLoading || isGeneratingPdf} 
                    inputText={inputText}
                    onInputTextChange={setInputText}
                />
                
                {/* 4. Quick Add */}
                <QuickAddForm onAdd={handleAddSpecificProduct} />

                {/* Generate Button */}
                <Controls
                    onGeneratePdf={generatePdf}
                    isGenerating={isGeneratingPdf}
                    hasProducts={products.length > 0}
                />
            </div>

            {/* Main Area - Preview */}
            <main className="flex-1 flex flex-col items-center justify-start gap-6 pt-4">
                 
                 {/* Botão de Limpar Preenchimento */}
                 <div className="w-full flex justify-end max-w-2xl">
                    <button 
                        onClick={handleClearProducts}
                        disabled={products.length === 0}
                        className="text-[#f36e21] hover:text-white border border-[#f36e21] hover:bg-[#f36e21] px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#f36e21]"
                    >
                        🗑️ Limpar Preenchimento
                    </button>
                 </div>

                 <div className="w-full flex justify-center">
                    <div id="editor-view-container" className="w-full max-w-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] border-4 border-white rounded-sm">
                        <EditorView
                            key={renderTrigger} // Força a re-renderização
                            ref={editorViewRef}
                            products={productsForCurrentPage}
                            backgroundImage={backgroundImage}
                            onUpdateProduct={handleUpdateProduct}
                            onDeleteProduct={handleDeleteProduct}
                            onRepeatProduct={handleRepeatProduct}
                            onDuplicateProduct={handleDuplicateProduct}
                            onCopyStyles={handleCopyStyles}
                            isGeneratingPdf={isGeneratingPdf}
                        />
                    </div>
                </div>
                {products.length > ITEMS_PER_PAGE && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                )}
            </main>
        </div>
    );
};

export default App;