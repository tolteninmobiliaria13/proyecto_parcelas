import { useState, useEffect } from "react";
import useSWR from "swr";
import type { Parcela } from "../../types/parcela";
import { getParcelas } from "../../services/api";
import ParcelaRow, { ParcelaCard } from "./ParcelaRow";
import { sortParcelasByLote } from "../../utils/loteSort";

type ParcelasTableProps = {
    searchQuery: string;
    refreshTrigger: number;
    onAssignOwner: (parcela: Parcela) => void;
    onEditParcela: (parcela: Parcela) => void;
    onDeleteParcela: (parcela: Parcela) => void;
};

function ParcelaRowSkeleton() {
    return (
        <tr className="animate-pulse text-center">
            <td className="py-4 px-6 border-r border-outline-variant">
                <div className="h-5 bg-outline-variant/30 rounded w-16 mx-auto"></div>
            </td>
            <td className="py-4 px-6 border-r border-outline-variant">
                <div className="h-5 bg-outline-variant/30 rounded w-28 mx-auto"></div>
            </td>
            <td className="py-4 px-6 border-r border-outline-variant">
                <div className="h-5 bg-outline-variant/30 rounded w-24 mx-auto"></div>
            </td>
            <td className="py-4 px-6 border-r border-outline-variant">
                <div className="h-6 bg-outline-variant/30 rounded-full w-20 mx-auto"></div>
            </td>
            <td className="py-4 px-6">
                <div className="h-5 bg-outline-variant/30 rounded w-8 mx-auto"></div>
            </td>
        </tr>
    );
}

function ParcelaCardSkeleton() {
    return (
        <div className="p-4 bg-surface-container-lowest flex flex-col gap-3 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="h-5 bg-outline-variant/30 rounded w-16"></div>
                <div className="h-6 bg-outline-variant/30 rounded w-20"></div>
            </div>
            <div className="h-10 bg-outline-variant/20 rounded"></div>
        </div>
    );
}

export default function ParcelasTable({
    searchQuery,
    refreshTrigger,
    onAssignOwner,
    onEditParcela,
    onDeleteParcela,
}: ParcelasTableProps) {
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data, error, isLoading, mutate } = useSWR(
        ['parcelas'],
        () => getParcelas(1, 1000),
        { keepPreviousData: true }
    );

    useEffect(() => {
        if (refreshTrigger > 0) {
            mutate();
        }
    }, [refreshTrigger, mutate]);

    useEffect(() => {
        setPage(1);
    }, [searchQuery]);

    const parcelas = data?.items || [];
    const sortedParcelas = sortParcelasByLote(parcelas);

    // Client-side filtering by id (lote) or subdivision across all parcels
    const filteredParcelas = sortedParcelas.filter((parcela) => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;
        return (
            (parcela.id && parcela.id.toLowerCase().includes(query)) ||
            (parcela.subdivision && parcela.subdivision.toLowerCase().includes(query)) ||
            (parcela.owner && parcela.owner.toLowerCase().includes(query))
        );
    });

    const totalCount = filteredParcelas.length;
    const totalPages = Math.ceil(totalCount / limit) || 1;
    const paginatedParcelas = filteredParcelas.slice((page - 1) * limit, page * limit);
    const displayCount = totalCount;
    const skeletons = Array(limit).fill(null);

    return (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col">
            {/* Table Subheader */}
            <div className="flex justify-between items-center p-4 sm:p-lg border-b border-outline-variant bg-surface-container-low">
                <div>
                    <h3 className="font-headline-md text-base sm:text-headline-md text-on-surface font-semibold">Registro de Parcelas</h3>
                    <p className="font-body-md text-xs sm:text-body-md text-on-surface-variant mt-1">
                        Inventario general de lotes, proyectos asociados, precios y disponibilidad.
                    </p>
                </div>
                <div className="text-sm font-medium text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-full border border-outline-variant">
                    {displayCount} Registros
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                    {/* Table Header */}
                    <thead className="bg-surface-container-low border-b border-outline-variant">
                        <tr className="text-center font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                            <th className="py-3 px-6 text-center border-r border-outline-variant">Lote</th>
                            <th className="py-3 px-6 text-center border-r border-outline-variant">Loteo / Subdivisión</th>
                            <th className="py-3 px-6 text-center border-r border-outline-variant">Precio Venta</th>
                            <th className="py-3 px-6 text-center border-r border-outline-variant">Estado</th>
                            <th className="py-3 px-6 text-center">Acciones</th>
                        </tr>
                    </thead>
                    {/* Table Body */}
                    <tbody className="font-data-tabular text-data-tabular text-on-background divide-y divide-outline-variant">
                        {isLoading ? (
                            skeletons.map((_, i) => <ParcelaRowSkeleton key={i} />)
                        ) : error ? (
                            <tr>
                                <td colSpan={5} className="py-8 px-6 text-center text-error font-medium">
                                    {error.message || "Error al cargar parcelas"}
                                </td>
                            </tr>
                        ) : paginatedParcelas.length > 0 ? (
                            paginatedParcelas.map((parcela) => (
                                <ParcelaRow
                                    key={parcela.id}
                                    parcela={parcela}
                                    onAssign={() => onAssignOwner(parcela)}
                                    onEditParcela={() => onEditParcela(parcela)}
                                    onDeleteParcela={() => onDeleteParcela(parcela)}
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="py-8 px-6 text-center text-on-surface-variant/70">
                                    No se encontraron parcelas que coincidan con la búsqueda.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-outline-variant">
                {isLoading ? (
                    skeletons.map((_, i) => <ParcelaCardSkeleton key={i} />)
                ) : error ? (
                    <div className="py-8 px-4 text-center text-error font-medium text-sm">
                        {error.message || "Error"}
                    </div>
                ) : paginatedParcelas.length > 0 ? (
                    paginatedParcelas.map((parcela) => (
                        <ParcelaCard
                            key={parcela.id}
                            parcela={parcela}
                            onAssign={() => onAssignOwner(parcela)}
                            onEditParcela={() => onEditParcela(parcela)}
                            onDeleteParcela={() => onDeleteParcela(parcela)}
                        />
                    ))
                ) : (
                    <div className="py-8 px-4 text-center text-on-surface-variant/70 text-sm">
                        No se encontraron parcelas que coincidan con la búsqueda.
                    </div>
                )}
            </div>

            {/* Pagination Footer */}
            <div className="bg-surface-container-low border-t border-outline-variant p-4 sm:px-6 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="font-body-md text-on-surface-variant text-xs sm:text-sm text-center sm:text-left">
                    {isLoading ? (
                        "Cargando parcelas..."
                    ) : totalCount === 0 ? (
                        "0 parcelas encontradas"
                    ) : (
                        <>
                            Mostrando <span className="font-medium text-on-surface">{(page - 1) * limit + 1}</span> a <span className="font-medium text-on-surface">{Math.min(page * limit, totalCount)}</span> de <span className="font-medium text-on-surface">{totalCount}</span> parcelas
                        </>
                    )}
                </span>
                {totalCount > 0 && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="p-1 rounded text-on-surface-variant hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                        </button>
                        <div className="flex items-center gap-1">
                            <span className="px-3 py-1 rounded-md bg-primary-container text-on-primary-container text-xs sm:text-sm font-medium font-data-tabular">
                                Página {page} de {totalPages}
                            </span>
                        </div>
                        <button
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page >= totalPages}
                            className="p-1 rounded text-on-surface-variant hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
