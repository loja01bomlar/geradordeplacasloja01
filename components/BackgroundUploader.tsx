import React, { useRef } from 'react';

interface BackgroundUploaderProps {
    onBgChange: (file: File) => void;
    backgroundImage: string | null;
    onRemoveBg: () => void;
}

const BackgroundUploader: React.FC<BackgroundUploaderProps> = ({ onBgChange, backgroundImage, onRemoveBg }) => {
    const bgInputRef = useRef<HTMLInputElement>(null);

    const handleBgFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onBgChange(file);
        }
    };

    const handleRemove = () => {
        if (bgInputRef.current) {
            bgInputRef.current.value = '';
        }
        onRemoveBg();
    };

    return (
        <div className="bg-white p-6 rounded-[16px] shadow-[0_2px_8px_rgba(0,181,172,0.2)] border-2 border-[#00b5ac]">
            <h2 className="text-xl font-bold text-black flex items-center gap-2 mb-4">
                <span>📷</span> 1. Upload da Imagem de Fundo (A4)
            </h2>
            
            {backgroundImage ? (
                <div className="relative w-full h-48 rounded-xl border-2 border-[#00b5ac] overflow-hidden group">
                    <img 
                        src={backgroundImage} 
                        alt="Fundo selecionado" 
                        className="w-full h-full object-cover opacity-90"
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-white font-bold mb-2">Imagem Selecionada</span>
                         <button 
                            onClick={handleRemove}
                            className="bg-[#f36e21] hover:bg-[#d95d18] text-white px-4 py-2 rounded-lg font-bold shadow-md transition-transform transform hover:scale-105 flex items-center gap-2"
                         >
                            ❌ Remover Fundo
                         </button>
                    </div>
                    {/* Botão X fixo no canto para mobile/acesso rápido */}
                    <button 
                        onClick={handleRemove}
                        className="absolute top-2 right-2 bg-white text-[#f36e21] w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md hover:bg-gray-100 z-10"
                        title="Remover Fundo"
                    >
                        ✕
                    </button>
                </div>
            ) : (
                <div>
                    <input
                        type="file"
                        ref={bgInputRef}
                        onChange={handleBgFileChange}
                        accept="image/*"
                        className="hidden"
                        id="bg-upload"
                    />
                    <label
                        htmlFor="bg-upload"
                        className="w-full flex flex-col items-center justify-center px-4 py-6 rounded-xl border-2 border-dashed border-[#00b5ac] hover:bg-[#00b5ac]/5 transition-all cursor-pointer group"
                    >
                        <span className="text-[#00b5ac] font-bold text-sm group-hover:scale-105 transition-transform">Clique para selecionar imagem</span>
                        <span className="text-xs text-gray-500 mt-1">Formato A4 Recomendado</span>
                    </label>
                </div>
            )}
        </div>
    );
};

export default BackgroundUploader;