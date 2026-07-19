import { parcelas } from "../../data/parcelas";
import ParcelaRow from "./ParcelaRow";

type ParcelasTableProps = {
    searchQuery: string;
};

export default function ParcelasTable({ searchQuery }: ParcelasTableProps) {
    // Client-side filtering by id or owner
    const filteredParcelas = parcelas.filter((parcela) => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;
        return (
            parcela.id.toLowerCase().includes(query) ||
            parcela.owner.toLowerCase().includes(query)
        );
    });

    const totalCount = searchQuery ? filteredParcelas.length : 150;

    return (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    {/* Table Header */}
                    <thead className="bg-surface-container-low border-b border-outline-variant">
                        <tr>
                            <th className="py-3 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">ID Parcela</th>
                            <th className="py-3 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Propietario</th>
                            <th className="py-3 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Superficie (m²)</th>
                            <th className="py-3 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Escritura</th>
                            <th className="py-3 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Estado</th>
                            <th className="py-3 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Acciones</th>
                        </tr>
                    </thead>
                    {/* Table Body */}
                    <tbody className="font-data-tabular text-data-tabular text-on-background divide-y divide-outline-variant">
                        {filteredParcelas.length > 0 ? (
                            filteredParcelas.map((parcela) => (
                                <ParcelaRow key={parcela.id} parcela={parcela} />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="py-8 px-6 text-center text-on-surface-variant/70">
                                    No se encontraron parcelas que coincidan con la búsqueda.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            <div className="bg-surface-container-lowest border-t border-outline-variant px-6 py-4 flex items-center justify-between">
                <span className="font-body-md text-on-surface-variant text-sm">
                    Mostrando <span className="font-medium text-on-surface">1</span> a <span className="font-medium text-on-surface">{Math.min(filteredParcelas.length, 5)}</span> de <span className="font-medium text-on-surface">{totalCount}</span> parcelas
                </span>
                <div className="flex items-center gap-2">
                    <button className="p-1 rounded text-on-surface-variant hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors" disabled>
                        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                    </button>
                    <div className="flex items-center">
                        <button className="w-8 h-8 flex items-center justify-center rounded-md bg-primary-container text-on-primary-container font-data-tabular text-sm font-medium">1</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-md text-on-surface hover:bg-surface-container font-data-tabular text-sm transition-colors">2</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-md text-on-surface hover:bg-surface-container font-data-tabular text-sm transition-colors">3</button>
                        <span className="w-8 h-8 flex items-center justify-center text-on-surface-variant text-sm">...</span>
                        <button className="w-8 h-8 flex items-center justify-center rounded-md text-on-surface hover:bg-surface-container font-data-tabular text-sm transition-colors">30</button>
                    </div>
                    <button className="p-1 rounded text-on-surface-variant hover:bg-surface-container transition-colors">
                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
