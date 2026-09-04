import { useState, useEffect } from "react";
import useSWR from "swr";
import type { Parcela } from "../../types/parcela";
import { getParcelas } from "../../services/api";
import ContratoRow, { ContratoCard } from "./ContratoRow";
import { sortParcelasByLote } from "../../utils/loteSort";

type ContratosTableProps = {
    searchQuery: string;
    refreshTrigger: number;
    onEditOwner: (parcela: Parcela) => void;
    onEditContrato: (parcela: Parcela) => void;
};

function ContratoRowSkeleton() {
    return (
        <tr className="animate-pulse text-center">
            <td className="py-4 px-4 border-r border-outline-variant">
                <div className="h-5 bg-outline-variant/30 rounded w-16 mx-auto"></div>
            </td>
            <td className="py-4 px-4 border-r border-outline-variant">
                <div className="flex items-center justify-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-outline-variant/30 shrink-0"></div>
                    <div className="h-5 bg-outline-variant/30 rounded w-28"></div>
                </div>
            </td>
            <td className="py-4 px-4 border-r border-outline-variant">
                <div className="h-5 bg-outline-variant/30 rounded w-20 mx-auto"></div>
            </td>
            <td className="py-4 px-4 border-r border-outline-variant">
                <div className="h-5 bg-outline-variant/30 rounded w-16 mx-auto"></div>
            </td>
            <td className="py-4 px-4 border-r border-outline-variant">
                <div className="h-5 bg-outline-variant/30 rounded w-20 mx-auto"></div>
            </td>
            <td className="py-4 px-4 border-r border-outline-variant">
                <div className="h-5 bg-outline-variant/30 rounded w-20 mx-auto"></div>
            </td>
            <td className="py-4 px-4 border-r border-outline-variant">
                <div className="h-6 bg-outline-variant/30 rounded-full w-16 mx-auto"></div>
            </td>
            <td className="py-4 px-4">
                <div className="h-5 bg-outline-variant/30 rounded w-6 mx-auto"></div>
            </td>
        </tr>
    );
}

function ContratoCardSkeleton() {
    return (
        <div className="p-4 bg-surface-container-lowest flex flex-col gap-3 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="h-5 bg-outline-variant/30 rounded w-16"></div>
                <div className="h-6 bg-outline-variant/30 rounded w-20"></div>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-outline-variant/30 shrink-0"></div>
                <div className="h-5 bg-outline-variant/30 rounded w-28"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2.5 rounded-lg border border-outline-variant/20 bg-surface-container-low/40">
                <div className="h-8 bg-outline-variant/20 rounded"></div>
                <div className="h-8 bg-outline-variant/20 rounded"></div>
                <div className="h-8 bg-outline-variant/20 rounded"></div>
            </div>
        </div>
    );
}

export default function ContratosTable({
    searchQuery,
    refreshTrigger,
    onEditOwner,
    onEditContrato,
}: ContratosTableProps) {
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

    const allParcelas = data?.items || [];
    // Filtrar solo las parcelas que tienen contrato activo (tienen propietario asignado)
    const contratosParcelas = allParcelas.filter(
        (p) => p.owner && p.owner !== "Sin Asignar" && p.status !== "inactive"
    );

    const sortedContratos = sortParcelasByLote(contratosParcelas);

    // Filtrado por lote, cliente o escritura
    const filteredContratos = sortedContratos.filter((parcela) => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;
        return (
            (parcela.id && parcela.id.toLowerCase().includes(query)) ||
            (parcela.owner && parcela.owner.toLowerCase().includes(query)) ||
            (parcela.escritura && parcela.escritura.toLowerCase().includes(query))
        );
    });

    const totalCount = filteredContratos.length;
    const totalPages = Math.ceil(totalCount / limit) || 1;
    const paginatedContratos = filteredContratos.slice((page - 1) * limit, page * limit);
    const skeletons = Array(limit).fill(null);

    return (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col">
            {/* Table Subheader */}
            <div className="flex justify-between items-center p-4 sm:p-lg border-b border-outline-variant bg-surface-container-low">
                <div>
                    <h3 className="font-headline-md text-base sm:text-headline-md text-on-surface font-semibold">
                        Contratos de Venta Activos
                    </h3>
                    <p className="font-body-md text-xs sm:text-body-md text-on-surface-variant mt-1">
                        Control de clientes titulares, cuotas pactadas, abonos acumulados y saldos pendientes.
                    </p>
                </div>
                <div className="text-sm font-medium text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-full border border-outline-variant">
                    {totalCount} Contratos
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="bg-surface-container-low border-b border-outline-variant">
                        <tr className="text-center">
                            <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-center border-r border-outline-variant">Lote</th>
                            <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-center border-r border-outline-variant">Propietario / Titular</th>
                            <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-center border-r border-outline-variant">Escritura (ROL)</th>
                            <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-center border-r border-outline-variant">Cuotas</th>
                            <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-center border-r border-outline-variant">Abono</th>
                            <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-center border-r border-outline-variant">Estado</th>
                            <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="font-data-tabular text-data-tabular text-on-background divide-y divide-outline-variant">
                        {isLoading ? (
                            skeletons.map((_, i) => <ContratoRowSkeleton key={i} />)
                        ) : error ? (
                            <tr>
                                <td colSpan={7} className="py-8 px-6 text-center text-error font-medium">
                                    {error.message || "Error al cargar contratos"}
                                </td>
                            </tr>
                        ) : paginatedContratos.length > 0 ? (
                            paginatedContratos.map((parcela) => (
                                <ContratoRow
                                    key={parcela.id}
                                    parcela={parcela}
                                    onEditOwner={() => onEditOwner(parcela)}
                                    onEditContrato={() => onEditContrato(parcela)}
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="py-8 px-6 text-center text-on-surface-variant/70">
                                    No se encontraron contratos que coincidan con la búsqueda.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-outline-variant">
                {isLoading ? (
                    skeletons.map((_, i) => <ContratoCardSkeleton key={i} />)
                ) : error ? (
                    <div className="py-8 px-4 text-center text-error font-medium text-sm">
                        {error.message || "Error"}
                    </div>
                ) : paginatedContratos.length > 0 ? (
                    paginatedContratos.map((parcela) => (
                        <ContratoCard
                            key={parcela.id}
                            parcela={parcela}
                            onEditOwner={() => onEditOwner(parcela)}
                            onEditContrato={() => onEditContrato(parcela)}
                        />
                    ))
                ) : (
                    <div className="py-8 px-4 text-center text-on-surface-variant/70 text-sm">
                        No se encontraron contratos que coincidan con la búsqueda.
                    </div>
                )}
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-outline-variant bg-surface-container-low">
                <div className="text-xs sm:text-sm text-on-surface-variant">
                    Mostrando <span className="font-medium text-on-surface">{paginatedContratos.length > 0 ? (page - 1) * limit + 1 : 0}</span> a{" "}
                    <span className="font-medium text-on-surface">{Math.min(page * limit, totalCount)}</span> de{" "}
                    <span className="font-medium text-on-surface">{totalCount}</span> resultados
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        disabled={page === 1}
                        className="px-3 py-1.5 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        Anterior
                    </button>
                    <div className="px-3 text-xs sm:text-sm font-medium text-on-surface">
                        {page} / {totalPages}
                    </div>
                    <button
                        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                        disabled={page >= totalPages}
                        className="px-3 py-1.5 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        Siguiente
                    </button>
                </div>
            </div>
        </div>
    );
}
