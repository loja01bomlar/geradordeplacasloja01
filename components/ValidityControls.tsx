import React from 'react';

interface ValidityControlsProps {
    validFrom: string;
    onValidFromChange: (text: string) => void;
    validUntil: string;
    onValidUntilChange: (text: string) => void;
}

const ValidityControls: React.FC<ValidityControlsProps> = ({ validFrom, onValidFromChange, validUntil, onValidUntilChange }) => {
    return (
        <div className="bg-white p-6 rounded-[16px] shadow-[0_2px_8px_rgba(0,181,172,0.2)] border-2 border-[#00b5ac]">
            <h2 className="text-xl font-bold text-black flex items-center gap-2 mb-4">
                <span>📅</span> 2. Validade
            </h2>
            <div className="flex gap-4">
                <div className="flex-1">
                    <label className="block text-xs font-bold text-black mb-1.5 uppercase tracking-wide">Válida de</label>
                    <input
                        type="text"
                        value={validFrom}
                        onChange={(e) => onValidFromChange(e.target.value)}
                        className="w-full p-2.5 bg-white border border-[#00b5ac] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b5ac] transition-colors text-sm text-black placeholder-gray-500"
                        placeholder="DD/MM"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-xs font-bold text-black mb-1.5 uppercase tracking-wide">Até</label>
                    <input
                        type="text"
                        value={validUntil}
                        onChange={(e) => onValidUntilChange(e.target.value)}
                        className="w-full p-2.5 bg-white border border-[#00b5ac] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b5ac] transition-colors text-sm text-black placeholder-gray-500"
                        placeholder="DD/MM/AA"
                    />
                </div>
            </div>
        </div>
    );
};

export default ValidityControls;