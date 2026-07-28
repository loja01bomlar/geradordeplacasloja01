import React from 'react';

interface ControlsProps {
    onGeneratePdf: () => void;
    isGenerating: boolean;
    hasProducts: boolean;
}

const Controls: React.FC<ControlsProps> = ({ onGeneratePdf, isGenerating, hasProducts }) => {
    return (
        <div className="bg-white p-6 rounded-[16px] shadow-[0_2px_8px_rgba(0,181,172,0.2)] border-2 border-[#00b5ac]">
            <button
                onClick={onGeneratePdf}
                disabled={isGenerating || !hasProducts}
                className="w-full py-4 bg-[#f36e21] text-white rounded-xl font-bold hover:shadow-lg hover:bg-[#d95d18] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-lg tracking-wide flex justify-center items-center gap-2 transform active:scale-[0.98]"
            >
                {isGenerating ? (
                    <>
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Gerando PDF...
                    </>
                ) : (
                    <>🎯 GERAR PDF</>
                )}
            </button>
        </div>
    );
};

export default Controls;