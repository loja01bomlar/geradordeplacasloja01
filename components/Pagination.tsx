import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    const handlePrev = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    return (
        <div className="flex items-center justify-center gap-4 mt-2 bg-white/50 backdrop-blur-sm p-3 rounded-xl border border-[#00b5ac] shadow-sm">
            <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-[#00b5ac] text-white rounded-lg font-bold hover:bg-[#009e96] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
            >
                Anterior
            </button>
            <span className="font-bold text-black">
                Página {currentPage} de {totalPages}
            </span>
            <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-[#00b5ac] text-white rounded-lg font-bold hover:bg-[#009e96] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
            >
                Próxima
            </button>
        </div>
    );
};

export default Pagination;