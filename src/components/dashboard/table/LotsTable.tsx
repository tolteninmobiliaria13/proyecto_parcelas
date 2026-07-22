import { useState, useEffect } from "react";
import type { Lot } from "../../../types/lots";
import { getDashboardLots } from "../../../services/api";
import LotRow, { LotCard } from "./LotRow";

function LotRowSkeleton() {
    return (
        <tr className="animate-pulse text-center">
            <td className="py-4 px-6 border-r border-outline-variant">
                <div className="h-5 bg-outline-variant/30 rounded w-16 mx-auto"></div>
            </td>
            <td className="py-4 px-6 border-r border-outline-variant">
                <div className="flex items-center justify-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-outline-variant/30 shrink-0"></div>
                    <div className="h-5 bg-outline-variant/30 rounded w-28"></div>
                </div>
            </td>
            <td className="py-4 px-6 border-r border-outline-variant">
                <div className="h-5 bg-outline-variant/30 rounded w-20 mx-auto"></div>
            </td>
            <td className="py-4 px-6 border-r border-outline-variant">
                <div className="h-5 bg-outline-variant/30 rounded w-24 mx-auto"></div>
            </td>
            <td className="py-4 px-6 border-r border-outline-variant">
                <div className="h-6 bg-outline-variant/30 rounded-full w-16 mx-auto"></div>
            </td>
            <td className="py-4 px-6">
                <div className="h-5 bg-outline-variant/30 rounded w-6 mx-auto"></div>
            </td>
        </tr>
    );
}

function LotCardSkeleton() {
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
            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg border border-outline-variant/20 bg-surface-container-low/40">
                <div className="h-8 bg-outline-variant/20 rounded"></div>
                <div className="h-8 bg-outline-variant/20 rounded"></div>
            </div>
        </div>
    );
}

export default function LotsTable() {
    const [lots, setLots] = useState<Lot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getDashboardLots()
            .then((data) => {
                setLots(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error al obtener contratos morosos:", err);
                setError("No se pudieron obtener los registros.");
                setLoading(false);
            });
    }, []);

    const skeletons = Array(3).fill(null);

    return (
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
            {/* Table Header */}
            <div className="flex justify-between items-center p-4 sm:p-lg border-b border-outline-variant bg-surface-container-low">
                <div>
                    <h3 className="font-headline-md text-base sm:text-headline-md text-on-surface font-semibold">Morosos</h3>
                    <p className="font-body-md text-xs sm:text-body-md text-on-surface-variant mt-1">
                        Pagos pendientes.
                    </p>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead className="bg-surface-container-low font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">
                        <tr className="text-center">
                            <th className="py-3 px-6 font-semibold uppercase tracking-wider text-center border-r border-outline-variant">Lote</th>
                            <th className="py-3 px-6 font-semibold uppercase tracking-wider text-center border-r border-outline-variant">Comprador</th>
                            <th className="py-3 px-6 font-semibold uppercase tracking-wider text-center border-r border-outline-variant">Saldo</th>
                            <th className="py-3 px-6 font-semibold uppercase tracking-wider text-center border-r border-outline-variant">Próximo Vencimiento</th>
                            <th className="py-3 px-6 font-semibold uppercase tracking-wider text-center border-r border-outline-variant">Estado</th>
                            <th className="py-3 px-6 font-semibold uppercase tracking-wider text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="font-data-tabular text-data-tabular text-on-surface divide-y divide-outline-variant">
                        {loading ? (
                            skeletons.map((_, i) => <LotRowSkeleton key={i} />)
                        ) : error ? (
                            <tr>
                                <td colSpan={6} className="py-8 px-6 text-center text-error font-medium">
                                    {error}
                                </td>
                            </tr>
                        ) : lots.length > 0 ? (
                            lots.map((lot) => (
                                <LotRow key={lot.id} lot={lot} />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="py-8 px-6 text-center text-on-surface-variant/70">
                                    No hay lotes con deudas pendientes.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-outline-variant">
                {loading ? (
                    skeletons.map((_, i) => <LotCardSkeleton key={i} />)
                ) : error ? (
                    <div className="p-6 text-center text-error text-sm font-medium">{error}</div>
                ) : lots.length > 0 ? (
                    lots.map((lot) => (
                        <LotCard key={lot.id} lot={lot} />
                    ))
                ) : (
                    <div className="p-6 text-center text-on-surface-variant/70 text-sm">
                        No hay lotes con deudas pendientes.
                    </div>
                )}
            </div>

            {/* Table Footer / Pagination Minimalist */}
            <div className="p-4 sm:px-6 sm:py-4 border-t border-outline-variant bg-surface-container-low flex flex-col sm:flex-row justify-between items-center gap-3 text-xs sm:text-sm font-body-md text-on-surface-variant">
                <span>
                    {loading 
                        ? "Cargando registros..." 
                        : `Mostrando ${lots.length} de ${lots.length} registros`
                    }
                </span>
                <div className="flex gap-2 w-full sm:w-auto justify-end">
                    <button className="px-3 py-1.5 rounded-md border border-outline-variant hover:bg-surface-container transition-colors disabled:opacity-50 cursor-not-allowed" disabled>
                        Anterior
                    </button>
                    <button className="px-3 py-1.5 rounded-md border border-outline-variant hover:bg-surface-container transition-colors disabled:opacity-50 cursor-not-allowed" disabled>
                        Siguiente
                    </button>
                </div>
            </div>
        </section>
    );
}