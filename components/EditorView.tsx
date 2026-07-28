import React, { forwardRef, useRef, useState, useEffect } from 'react';
import { Product } from '../types';
import PriceTagCard from './PriceTagCard';

interface EditorViewProps {
    products: Product[];
    backgroundImage: string | null;
    onUpdateProduct: (product: Product) => void;
    onDeleteProduct: (productId: string) => void;
    onRepeatProduct: (product: Product) => void;
    onDuplicateProduct: (product: Product) => void;
    onCopyStyles: (product: Product) => void;
    isGeneratingPdf: boolean;
}

const EditorView = forwardRef<HTMLDivElement, EditorViewProps>(({ products, backgroundImage, onUpdateProduct, onDeleteProduct, onRepeatProduct, onDuplicateProduct, onCopyStyles, isGeneratingPdf }, ref) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    const totalItems = 14;
    const placeholders = Array.from({ length: totalItems - products.length }).map((_, i) => ({
        id: `placeholder-${i}`,
        title: '',
        subtitle: '',
        price: '',
        priceInt: '',
        priceDec: '',
        isPlaceholder: true,
        validFrom: '',
        validUntil: ''
    }));

    const allItems = [...products, ...placeholders];
    
    // Sincroniza o ref externo com o interno
    React.useImperativeHandle(ref, () => internalRef.current as HTMLDivElement);

    const scaleRef = useRef(scale);
    useEffect(() => {
        scaleRef.current = scale;
    }, [scale]);

    useEffect(() => {
        if (isGeneratingPdf) {
            return;
        }

        let rafId: number | null = null;

        const updateScale = () => {
            if (containerRef.current) {
                const parentElement = containerRef.current.parentElement;
                if (parentElement) {
                    const parentWidth = parentElement.clientWidth;
                    if (parentWidth > 0) {
                        // O tamanho base perfeito para o preview de 100% zoom é exatamente 664px
                        const newScale = Math.round((parentWidth / 664) * 1000) / 1000;
                        if (Math.abs(newScale - scaleRef.current) > 0.005) {
                            setScale(newScale);
                        }
                    }
                }
            }
        };

        updateScale();

        const targetEl = containerRef.current?.parentElement;
        const observer = new ResizeObserver(() => {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                updateScale();
            });
        });

        if (targetEl) {
            observer.observe(targetEl);
        }

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
            observer.disconnect();
        };
    }, [isGeneratingPdf]);

    const currentScale = isGeneratingPdf ? 1 : scale;

    // Dimensões exatas de posicionamento para A4
    const printableAreaStyle: React.CSSProperties = {
        position: 'absolute',
        top: '3.097%',
        bottom: '3.097%',
        left: '4.238%',
        right: '4.238%',
    };

    return (
        <div 
            ref={containerRef}
            className="w-full relative overflow-hidden"
            style={{
                // Reserva o espaço correto na tela de acordo com o aspecto A4 e escala atual
                height: isGeneratingPdf ? '939px' : `${currentScale * 939}px`,
                width: isGeneratingPdf ? '664px' : '100%',
                transition: isGeneratingPdf ? 'none' : 'height 0.15s ease-out',
            }}
        >
            <div
                ref={internalRef}
                id="a4-sheet"
                className="bg-white absolute top-0 left-0 origin-top-left shadow-xl"
                style={{
                    width: '664px',
                    height: '939px',
                    transform: isGeneratingPdf ? 'none' : `scale(${currentScale})`,
                    backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
                    backgroundSize: '100% 100%',
                    backgroundRepeat: 'no-repeat',
                    imageRendering: 'auto', 
                    fontSize: '11px', // Tamanho fixo e seguro para manter a proporção correta na pré-visualização
                }}
            >
                <div 
                    id="printable-area"
                    className="absolute"
                    style={printableAreaStyle}
                >
                    <div className="relative w-full h-full">
                        {allItems.map((product, index) => {
                            const row = Math.floor(index / 2);
                            const col = index % 2;
                            const rowHeight = 100 / 7;
                            
                            // --- AJUSTE DE POSICIONAMENTO DA GRADE (LIMITES DOS CARDS) ---
                            let pixelOffset = 0;
                            
                            // Pedido: A partir do Card 03 (index 2), tudo desce mais 0.5px (total 1.5px)
                            if (index >= 2) pixelOffset += 1.5;
                            
                            // Correções finas acumuladas para compensar o arraste da impressora ao longo da folha
                            if (index >= 5) pixelOffset += 1;
                            if (index >= 8) pixelOffset += 3;
                            if (index >= 12) pixelOffset += 1;

                            const topPosition = pixelOffset !== 0 
                                ? `calc(${row * rowHeight}% + ${pixelOffset}px)` 
                                : `${row * rowHeight}%`;

                            const wrapperStyle: React.CSSProperties = {
                                position: 'absolute',
                                top: topPosition, 
                                left: `${col * 50}%`, // 2 colunas
                                width: '50%',
                                height: `${rowHeight}%`,
                            };

                            return (
                                <div key={product.id} style={wrapperStyle}>
                                    <PriceTagCard
                                        product={product}
                                        index={index}
                                        onUpdate={onUpdateProduct}
                                        onDelete={onDeleteProduct}
                                        onRepeat={(productId) => {
                                            const productToRepeat = products.find(p => p.id === productId);
                                            if (productToRepeat) onRepeatProduct(productToRepeat);
                                        }}
                                        onDuplicate={(productId) => {
                                            const productToDuplicate = products.find(p => p.id === productId);
                                            if (productToDuplicate) onDuplicateProduct(productToDuplicate);
                                        }}
                                        onCopyStyles={(productId) => {
                                            const productToCopy = products.find(p => p.id === productId);
                                            if (productToCopy) onCopyStyles(productToCopy);
                                        }}
                                        isGeneratingPdf={isGeneratingPdf}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
});

EditorView.displayName = 'EditorView';

export default EditorView;
