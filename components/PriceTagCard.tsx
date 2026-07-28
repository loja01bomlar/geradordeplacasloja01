import React, { useState } from 'react';
import { Product, ProductStyles } from '../types';
import StyleEditorModal from './StyleEditorModal';

// --- AJUSTES VISUAIS EXCLUSIVOS PARA TELA (PREVIEW) ---
// Estes ajustes compensam variações de renderização exclusivas dos navegadores.
const SCREEN_FIXES: Record<string, { x: number, y: number }> = {
    title: { x: 0, y: 1.75 },
    subtitle: { x: 0, y: 0.75 },
    priceInt: { x: 0, y: -10 },
    priceDec: { x: 0, y: -4.5 },
    validFrom: { x: 0, y: -0.5 },
    validUntil: { x: 0, y: -0.5 }
};

interface PriceTagCardProps {
    product: Product;
    index: number;
    onUpdate: (product: Product) => void;
    onDelete: (productId: string) => void;
    onRepeat: (productId: string) => void;
    onDuplicate: (productId: string) => void;
    onCopyStyles: (productId: string) => void;
    isGeneratingPdf: boolean;
}

const PriceTagCard: React.FC<PriceTagCardProps> = ({ product, index, onUpdate, onDelete, onRepeat, onDuplicate, onCopyStyles, isGeneratingPdf }) => {
    const [isEditingStyles, setIsEditingStyles] = useState(false);

    if (product.isPlaceholder) {
        return <div className="w-full h-full"></div>;
    }

    const handleStyleSave = (newStyles: ProductStyles, updatedFields?: Partial<Product>) => {
        onUpdate({ 
            ...product, 
            customStyles: newStyles,
            ...updatedFields 
        });
    };

    const TITLE_THRESHOLD = 26;

    const getAutoTitleFontSize = () => {
        const length = product.title.length;
        const baseSizeEm = 1.8;
        const baseOffsetPx = 6;
        if (length <= TITLE_THRESHOLD) return `calc(${baseSizeEm}em - ${baseOffsetPx}px)`;
        const ratio = TITLE_THRESHOLD / length;
        const safeRatio = Math.max(ratio, 0.65); 
        return `calc(${baseSizeEm * safeRatio}em - ${baseOffsetPx * safeRatio}px)`;
    };

    const getAutoSubtitleFontSize = () => {
        const length = product.subtitle ? product.subtitle.length : 0;
        const baseThreshold = 45; 
        const baseSizeEm = 0.8;
        const baseOffsetPx = 0.5;
        if (length <= baseThreshold) return `calc(${baseSizeEm}em - ${baseOffsetPx}px)`;
        const ratio = baseThreshold / length;
        const safeRatio = Math.max(ratio, 0.65); 
        return `calc(${baseSizeEm * safeRatio}em - ${baseOffsetPx * safeRatio}px)`;
    };
    
    // --- LÓGICA DE MICRO-AJUSTES DE PRECISÃO CIRÚRGICA POR CARD (INDEX) ---
    const getMicroOffset = (elementKey: string): { x: number, y: number } => {
        let x = 0;
        let y = 0;

        // 1. Eixo Y (Vertical) - Bloco de Título e Subtítulo (Restaurado para manter alinhamento correto)
        if (elementKey === 'title' || elementKey === 'subtitle') {
            if (index === 4) y += 1.0;              // Card 05: descer 1px
            if ([6, 7].includes(index)) y += 1.0;   // Cards 07 e 08: descer 1px
            if ([10, 11].includes(index)) y += 1.5; // Cards 11 e 12: descer 1.5px
            if ([8, 9].includes(index)) y -= 0.5;    // Cards 09 e 10: subir 0.5px
        }

        // 2. Eixo Y (Vertical) - Validades (Ajustes específicos solicitados)
        if (elementKey === 'validFrom' || elementKey === 'validUntil') {
            // Ajuste Horizontal (X)
            if ([3, 5, 7, 9, 11, 13].includes(index)) {
                x = 1; // 1px para a direita
            }

            // Ajuste Vertical (Y)
            // Cards 01, 02, 13, 14 (índices 0, 1, 12, 13) -> 0px (Está ótimo)
            if ([0, 1, 12, 13].includes(index)) {
                y = 0;
            } 
            // Cards 09, 10 (índices 8, 9) -> subir 1px
            else if ([8, 9].includes(index)) {
                y = -1;
            }
            // Cards 11, 12 (índices 10, 11) -> baixar 2.0px (1.5px anterior + 0.5px solicitado)
            else if ([10, 11].includes(index)) {
                y = 2.0;
            }
            // Demais cards (03, 04, 05, 06, 07, 08) -> baixar 1px
            else {
                y = 1;
            }
        }

        return { x, y };
    };

    const isRightColumn = index % 2 !== 0;
    const isLongTitle = product.title.length > TITLE_THRESHOLD;
    const subtitleTitleSizeShift = isLongTitle ? 0 : 0.5;

    const micro = {
        title: getMicroOffset('title'),
        subtitle: getMicroOffset('subtitle'),
        validFrom: getMicroOffset('validFrom'),
        validUntil: getMicroOffset('validUntil')
    };

    const defaultStyles: Record<string, React.CSSProperties> = {
        title: {
            position: 'absolute',
            left: `calc(100% * 23 / 651 - 2px + ${micro.title.x}px)`,
            top: isLongTitle 
                ? `calc(100% * 57.5 / 271 + 4.5px + ${micro.title.y}px)` 
                : `calc(100% * 57.5 / 271 + 3.5px + ${micro.title.y}px)`,
            width: '90%',
            maxWidth: '90%',
            fontSize: getAutoTitleFontSize(),
            fontWeight: 'bold',
            fontFamily: "'MUSEO SANS', 'Montserrat', sans-serif",
            letterSpacing: '-0.05em',
            whiteSpace: 'nowrap',
            lineHeight: 0.9,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        subtitle: {
            position: 'absolute',
            left: `calc(100% * 23 / 651 - 0.75px + ${micro.subtitle.x}px)`,
            top: `calc(100% * 87 / 271 + ${4.45 + subtitleTitleSizeShift + micro.subtitle.y}px)`, 
            width: '54%', 
            fontSize: getAutoSubtitleFontSize(), 
            color: 'black',
            fontFamily: "'MUSEO SANS', 'Montserrat', sans-serif",
            fontWeight: 'normal',
            lineHeight: 'calc(0.85em + 0.5px)',
            paddingLeft: '0.25px',
            textIndent: '-0.25px', 
            whiteSpace: 'pre-wrap', 
            wordBreak: 'break-word',
            textTransform: 'uppercase',
        },
        priceInt: {
            position: 'absolute',
            left: `calc(100% * 110 / 651 + 73px)`, 
            width: `calc(100% * 270 / 651)`,
            textAlign: 'right',
            top: `calc(100% * 85 / 271 + 29px)`,
            fontSize: 'calc(6.2em - 14px)', 
            fontWeight: '700', 
            lineHeight: 0.85,
            letterSpacing: '-0.05em', 
            fontFamily: "'Oswald', sans-serif", 
        },
        priceDec: {
            position: 'absolute',
            left: `calc(100% * 385 / 651 + 77px)`,
            top: `calc(100% * 68 / 271 + 25px)`,
            fontSize: 'calc(3.2em - 11px)', 
            fontWeight: '700',
            letterSpacing: '-0.05em', 
            fontFamily: "'Oswald', sans-serif",
        },
        validFrom: {
            position: 'absolute',
            left: isRightColumn 
                ? `calc((100% * 200 / 651) - 8px + ${micro.validFrom.x}px)` 
                : `calc((100% * 200 / 651) - 9px + ${micro.validFrom.x}px)`, 
            top: `calc(100% * 223 / 271 + 1.5px + ${micro.validFrom.y}px)`, 
            fontSize: 'calc(0.6em - 1px)', 
            color: '#000', width: '35px', textAlign: 'center',
            fontWeight: 'bold',
            fontFamily: "'MUSEO SANS', 'Montserrat', sans-serif",
            whiteSpace: 'nowrap',
        },
        validUntil: {
            position: 'absolute',
            left: isRightColumn 
                ? `calc((100% * 260 / 651) - 12.5px + ${micro.validUntil.x}px)` 
                : `calc((100% * 260 / 651) - 13.5px + ${micro.validUntil.x}px)`, 
            top: `calc(100% * 223 / 271 + 1.5px + ${micro.validUntil.y}px)`, 
            fontSize: 'calc(0.6em - 1px)', 
            color: '#000', width: '55px', textAlign: 'center',
            fontWeight: 'bold',
            fontFamily: "'MUSEO SANS', 'Montserrat', sans-serif",
            whiteSpace: 'nowrap',
        }
    };

    const getFinalStyle = (elementKey: keyof ProductStyles): React.CSSProperties => {
        const defaults = defaultStyles[elementKey] || {};
        const custom = product.customStyles?.[elementKey];
        let finalStyle = {
            ...defaults,
            ...(custom?.fontSize && { fontSize: custom.fontSize }),
            ...(custom?.top && { top: custom.top }),
            ...(custom?.left && { left: custom.left }),
            ...(custom?.width && { width: custom.width }),
            ...(custom?.color && { color: custom.color }),
            ...(custom?.letterSpacing && { letterSpacing: custom.letterSpacing }),
        };

        const fix = SCREEN_FIXES[elementKey as keyof typeof SCREEN_FIXES];
        if (fix && (fix.x !== 0 || fix.y !== 0)) {
            finalStyle.transform = `translate(${fix.x}px, ${fix.y}px)`;
        }
        return finalStyle;
    };

    const getElementId = (element: string) => `el-${product.id}-${element}`;

    return (
        <div className="relative w-full h-full group text-black">
             {isEditingStyles && (
                <StyleEditorModal
                    product={product}
                    onClose={() => setIsEditingStyles(false)}
                    onSave={handleStyleSave}
                    getElementId={getElementId}
                />
            )}

            <div className={`absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 z-20 p-2 ${isGeneratingPdf ? 'hidden' : ''}`}>
                <div className="flex gap-2">
                    <button onClick={() => setIsEditingStyles(true)} className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600 font-bold shadow-sm">Editar Conteúdo / Estilo</button>
                    <button onClick={() => onDelete(product.id)} className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 font-bold shadow-sm">Excluir</button>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => onDuplicate(product.id)} className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 font-bold shadow-sm">Duplicar Placa</button>
                    <button onClick={() => onRepeat(product.id)} className="bg-purple-500 text-white px-2 py-1 rounded text-xs hover:bg-purple-600 font-bold shadow-sm">Replicar Produto</button>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => onCopyStyles(product.id)} className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 font-bold shadow-sm">Copiar Estilo p/ Todos</button>
                </div>
            </div>

            <div id={getElementId('title')} style={getFinalStyle('title')} className="z-10">{product.title}</div>
            <div id={getElementId('subtitle')} style={getFinalStyle('subtitle')} className="z-10">{product.subtitle}</div>
            <div id={getElementId('priceInt')} style={getFinalStyle('priceInt')} className="z-10">{product.priceInt}</div>
            <div id={getElementId('priceDec')} style={getFinalStyle('priceDec')} className="z-10">{product.priceDec}</div>
            <div id={getElementId('validFrom')} style={getFinalStyle('validFrom')} className="z-10">{product.validFrom}</div>
            <div id={getElementId('validUntil')} style={getFinalStyle('validUntil')} className="z-10">{product.validUntil}</div>
        </div>
    );
};

export default PriceTagCard;
