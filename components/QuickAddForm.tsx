import React, { useState } from 'react';

interface QuickAddFormProps {
    onAdd: (title: string, sub1: string, sub2: string, price: string) => void;
}

const QuickAddForm: React.FC<QuickAddFormProps> = ({ onAdd }) => {
    const [title, setTitle] = useState('');
    const [sub1, setSub1] = useState('');
    const [sub2, setSub2] = useState('');
    const [price, setPrice] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) return;
        onAdd(title, sub1, sub2, price || '0,00');
        // Clear form
        setTitle('');
        setSub1('');
        setSub2('');
        setPrice('');
    };

    return (
        <div className="bg-white rounded-[16px] p-6 border-2 border-[#00b5ac] shadow-[0_2px_8px_rgba(0,181,172,0.2)]">
            <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                <span>➕</span> 4. Adicionar Produto Individual
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                    type="text"
                    placeholder="Nome do Produto"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-[#00b5ac] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b5ac] placeholder-gray-500 text-black"
                />
                
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Subtítulo 01"
                        value={sub1}
                        onChange={(e) => setSub1(e.target.value)}
                        className="flex-1 px-4 py-2.5 text-sm bg-white border border-[#00b5ac] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b5ac] placeholder-gray-500 text-black"
                    />
                    <input
                        type="text"
                        placeholder="Subtítulo 02"
                        value={sub2}
                        onChange={(e) => setSub2(e.target.value)}
                        className="flex-1 px-4 py-2.5 text-sm bg-white border border-[#00b5ac] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b5ac] placeholder-gray-500 text-black"
                    />
                </div>

                <div className="flex gap-3 items-center">
                    <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black text-sm font-bold">R$</span>
                        <input
                            type="text"
                            placeholder="0,00"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#00b5ac] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b5ac] placeholder-gray-500 text-black"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-[#f36e21] hover:bg-[#d95d18] text-white text-sm font-bold px-6 py-2.5 rounded-lg transition-colors shadow-sm"
                    >
                        + Adicionar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default QuickAddForm;