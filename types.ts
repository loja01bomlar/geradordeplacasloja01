export interface ElementStyle {
    fontSize?: string;
    top?: string;
    left?: string;
    width?: string;
    color?: string;
    textAlign?: 'left' | 'center' | 'right';
    letterSpacing?: string;
}

export interface ProductStyles {
    title?: ElementStyle;
    subtitle?: ElementStyle;
    priceInt?: ElementStyle;
    priceDec?: ElementStyle;
    validFrom?: ElementStyle;
    validUntil?: ElementStyle;
}

export interface Product {
    id: string;
    title: string;
    subtitle: string;
    price: string;
    priceInt: string;
    priceDec: string;
    validFrom: string;
    validUntil: string;
    isPlaceholder?: boolean;
    customStyles?: ProductStyles;
    originalText?: string; // Para preservar a entrada original do usuário
}