
import React, { useState, useEffect } from 'react';
import { Product, ProductStyles, ElementStyle } from '../types';

interface StyleEditorModalProps {
    product: Product;
    onClose: () => void;
    onSave: (styles: ProductStyles, updatedProductFields?: Partial<Product>) => void;
    getElementId: (elementKey: string) => string;
}

const ELEMENT_OPTIONS = [
    { label: 'Título do Produto', key: 'title' },
    { label: 'Subtítulo', key: 'subtitle' },
    { label: 'Preço (Inteiro)', key: 'priceInt' },
    { label: 'Preço (Centavos)', key: 'priceDec' },
    { label: 'Validade (De)', key: 'validFrom' },
    { label: 'Validade (Até)', key: 'validUntil' },
] as const;

type ElementKey = typeof ELEMENT_OPTIONS[number]['key'];

const StyleEditorModal: React.FC<StyleEditorModalProps> = ({ product, onClose, onSave, getElementId }) => {
    const [selectedElement, setSelectedElement] = useState<ElementKey>('title');
    const [currentStyles, setCurrentStyles] = useState<ProductStyles>(product.customStyles || {});
    const [productDraft, setProductDraft] = useState<Product>({ ...product });
    
    const [computedValues, setComputedValues] = useState({
        fontSize: '',
        top: '',
        left: '',
    });

    useEffect(() => {
        const id = getElementId(selectedElement);
        const element = document.getElementById(id);
        if (element) {
            const computed = window.getComputedStyle(element);
            setComputedValues({
                fontSize: computed.fontSize,
                top: computed.top,
                left: computed.left,
            });
        }
    }, [selectedElement, getElementId, product]);

    const handleStyleChange = (property: keyof ElementStyle, value: string) => {
        let finalValue = value;
        if (value && !isNaN(Number(value))) {
            finalValue = `${value}px`;
        }
        setCurrentStyles(prev => ({
            ...prev,
            [selectedElement]: {
                ...prev[selectedElement],
                [property]: finalValue
            }
        }));
    };

    const handleContentChange = (value: string) => {
        setProductDraft(prev => ({
            ...prev,
            [selectedElement]: value
        }));
    };

    const handleSave = () => {
        onSave(currentStyles, {
            title: productDraft.title,
            subtitle: productDraft.subtitle,
            priceInt: productDraft.priceInt,
            priceDec: productDraft.priceDec,
            validFrom: productDraft.validFrom,
            validUntil: productDraft.validUntil
        });
        onClose();
    };

    const handleClearStyle = () => {
         setCurrentStyles(prev => {
            const newStyles = { ...prev };
            delete newStyles[selectedElement];
            return newStyles;
         });
    };

    const activeStyle = currentStyles[selectedElement] || {};

    const formatComputed = (val: string) => {
        if (!val) return '---';
        if (val.includes('px')) {
            const num = parseFloat(val);
            return `${Math.round(num)}px`;
        }
        return val;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">Editar Produto e Estilo</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Escolha o que editar</label>
                    <select
                        value={selectedElement}
                        onChange={(e) => setSelectedElement(e.target.value as ElementKey)}
                        className="w-full bg-gray-900 border border-gray-700 text-white rounded p-2 focus:ring-2 focus:ring-blue-500"
                    >
                        {ELEMENT_OPTIONS.map(opt => (
                            <option key={opt.key} value={opt.key}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-6 p-3 bg-gray-900/50 rounded-lg border border-blue-500/30">
                    <label className="block text-xs font-bold text-blue-400 mb-2 uppercase tracking-wide">
                        Conteúdo do Texto
                    </label>
                    <textarea
                        value={(productDraft as any)[selectedElement] || ''}
                        onChange={(e) => handleContentChange(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-white rounded p-2 text-sm focus:ring-1 focus:ring-blue-500"
                        rows={selectedElement === 'subtitle' ? 2 : 1}
                        placeholder="Digite o novo texto aqui..."
                    />
                    <p className="text-[10px] text-gray-500 mt-1">Altera apenas este card.</p>
                </div>

                <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-700 pb-1">Ajustes Finos (Layout)</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <div className="flex justify-between items-end mb-1">
                                <label className="block text-xs text-gray-400">Tamanho da Fonte</label>
                                <span className="text-[10px] text-blue-300">Atual: {formatComputed(computedValues.fontSize)}</span>
                            </div>
                            <input
                                type="text"
                                placeholder="ex: 20"
                                value={activeStyle.fontSize?.replace('px', '') || ''}
                                onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 text-white rounded p-2 text-sm"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <label className="block text-xs text-gray-400">Topo (Y)</label>
                                <span className="text-[10px] text-blue-300">Atual: {formatComputed(computedValues.top)}</span>
                            </div>
                            <input
                                type="text"
                                placeholder="ex: 50"
                                value={activeStyle.top?.replace('px', '') || ''}
                                onChange={(e) => handleStyleChange('top', e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 text-white rounded p-2 text-sm"
                            />
                        </div>
                        <div>
                             <div className="flex justify-between items-end mb-1">
                                <label className="block text-xs text-gray-400">Esquerda (X)</label>
                                <span className="text-[10px] text-blue-300">Atual: {formatComputed(computedValues.left)}</span>
                            </div>
                            <input
                                type="text"
                                placeholder="ex: 20"
                                value={activeStyle.left?.replace('px', '') || ''}
                                onChange={(e) => handleStyleChange('left', e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 text-white rounded p-2 text-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <button
                        onClick={handleClearStyle}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                    >
                        Resetar Estilo
                    </button>
                    <div className="flex-1"></div>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-bold shadow-lg transition-all"
                    >
                        Salvar Alterações
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StyleEditorModal;
