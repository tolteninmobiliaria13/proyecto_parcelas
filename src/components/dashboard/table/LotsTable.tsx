import { useState } from "react";
import useSWR from "swr";
import type { Lot } from "../../../types/lots";
import { getDashboardLots } from "../../../services/api";
import LotRow, { LotCard } from "./LotRow";
import { sortParcelasByLote } from "../../../utils/loteSort";

// ─── Helpers ────────────────────────────────────────────────────────────────

function isThisMonth(dateStr?: string): boolean {
    if (!dateStr) return false;
    // dateStr viene como "DD/MM/YYYY"
    const parts = dateStr.split("/");
    if (parts.length !== 3) return false;
    const today = new Date();
    return (
        Number(parts[1]) === today.getMonth() + 1 &&
        Number(parts[2]) === today.getFullYear()
    );
}

// ─── Skeletons ───────────────────────────────────────────────────────────────

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

// ─── Tabs config ─────────────────────────────────────────────────────────────

type TabKey = "morosos" | "pendientes";

const TABS: { key: TabKey; label: string; icon: string; emptyText: string }[] = [
    {
        key: "morosos",
        label: "Morosos",
        icon: "warning",
        emptyText: "No hay lotes con cuotas atrasadas.",
    },
    {
        key: "pendientes",
        label: "Pendientes este mes",
        icon: "schedule",
        emptyText: "No hay cuotas por vencer en el mes actual.",
    },
];

// ─── Table panel ─────────────────────────────────────────────────────────────

interface TablePanelProps {
    rows: Lot[];
    loading: boolean;
    error: any;
    emptyText: string;
    activeTab: TabKey;
}

function TablePanel({ rows, loading, error, emptyText, activeTab }: TablePanelProps) {
    const skeletons = Array(3).fill(null);
    const colSpan = activeTab === "morosos" ? 7 : 6;

    return (
        <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="bg-surface-container-low border-b border-outline-variant">
                        <tr className="text-center">
                            <th className="py-3 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider border-r border-outline-variant">Lote</th>
                            <th className="py-3 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider border-r border-outline-variant">Propietario</th>
                            <th className="py-3 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider border-r border-outline-variant">
                                {activeTab === "morosos" ? "Deuda Total" : "Valor Cuota"}
                            </th>
                            {activeTab === "morosos" && (
                                <th className="py-3 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider border-r border-outline-variant">Cuotas Atrasadas</th>
                            )}
                            <th className="py-3 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider border-r border-outline-variant">Vencimiento</th>
                            <th className="py-3 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider border-r border-outline-variant">Estado</th>
                            <th className="py-3 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant font-data-tabular text-data-tabular">
                        {loading ? (
                            skeletons.map((_, i) => <LotRowSkeleton key={i} />)
                        ) : error ? (
                            <tr>
                                <td colSpan={colSpan} className="py-8 px-6 text-center text-error font-medium">
                                    {error.message || "Error al cargar"}
                                </td>
                            </tr>
                        ) : rows.length > 0 ? (
                            rows.map((row) => <LotRow key={row.id} lot={row} activeTab={activeTab} />)
                        ) : (
                            <tr>
                                <td colSpan={colSpan} className="py-8 px-6 text-center text-on-surface-variant/70">
                                    {emptyText}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-outline-variant">
                {loading ? (
                    skeletons.map((_, i) => <LotCardSkeleton key={i} />)
                ) : error ? (
                    <div className="py-8 px-4 text-center text-error font-medium text-sm">
                        {error.message || "Error al cargar"}
                    </div>
                ) : rows.length > 0 ? (
                    rows.map((row) => <LotCard key={row.id} lot={row} activeTab={activeTab} />)
                ) : (
                    <div className="py-8 px-4 text-center text-on-surface-variant/70 text-sm">
                        {emptyText}
                    </div>
                )}
            </div>
        </>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 10;

export default function LotsTable() {
    const [activeTab, setActiveTab] = useState<TabKey>("morosos");
    const [page, setPage] = useState(1);

    const { data, error, isLoading } = useSWR(
        ['dashboard_lots'],
        () => getDashboardLots(1, 1000),
        { keepPreviousData: true }
    );
    const lots = data?.items || [];

    // Clasificación: considerar cuotas vencidas (status === "overdue" o overdueCount > 0)
    const morosos = lots.filter((l) => l.status === "overdue" || (l.overdueCount && l.overdueCount > 0));
    const pendientes = lots.filter(
        (l) => (l.status === "current" || !l.status) && (!l.overdueCount || l.overdueCount === 0) && isThisMonth(l.nextDueDate)
    );

    const counts: Record<TabKey, number> = { morosos: morosos.length, pendientes: pendientes.length };
    const rawActiveRows = activeTab === "morosos" ? morosos : pendientes;
    const activeRows = sortParcelasByLote(rawActiveRows, (l) => l.lot);
    const activeTab_ = TABS.find((t) => t.key === activeTab)!;

    const totalPages = Math.ceil(activeRows.length / ITEMS_PER_PAGE) || 1;
    const paginatedRows = activeRows.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const handleTabChange = (key: TabKey) => {
        setActiveTab(key);
        setPage(1);
    };

    return (
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
            {/* Header con tabs */}
            <div className="border-b border-outline-variant bg-surface-container-low">
                <div className="flex items-center justify-between px-4 sm:px-lg pt-4 sm:pt-lg pb-0">
                    <div>
                        <h3 className="font-headline-md text-base sm:text-headline-md text-on-surface font-semibold">
                            Seguimiento de Cuotas
                        </h3>
                        <p className="font-body-md text-xs sm:text-body-md text-on-surface-variant mt-0.5">
                            Contratos con cuotas atrasadas o por vencer este mes.
                        </p>
                    </div>
                </div>

                {/* Tab bar */}
                <div className="flex gap-0 mt-3 px-4 sm:px-lg overflow-x-auto">
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab.key;
                        const count = isLoading ? null : counts[tab.key];
                        return (
                            <button
                                key={tab.key}
                                onClick={() => handleTabChange(tab.key)}
                                className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap border-b-2 cursor-pointer ${
                                    isActive
                                        ? "border-primary text-primary"
                                        : "border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant"
                                }`}
                            >
                                <span className="material-symbols-outlined text-[17px]">{tab.icon}</span>
                                {tab.label}
                                {count !== null && (
                                    <span
                                        className={`ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold ${
                                            tab.key === "morosos"
                                                ? isActive
                                                    ? "bg-error text-on-error"
                                                    : "bg-error/15 text-error"
                                                : isActive
                                                    ? "bg-primary text-on-primary"
                                                    : "bg-primary/10 text-primary"
                                        }`}
                                    >
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content panel */}
            <TablePanel
                rows={paginatedRows}
                loading={isLoading}
                error={error}
                emptyText={activeTab_.emptyText}
                activeTab={activeTab}
            />

            {/* Footer */}
            <div className="p-4 sm:px-6 sm:py-4 border-t border-outline-variant bg-surface-container-low flex flex-col sm:flex-row justify-between items-center gap-3 text-xs sm:text-sm font-body-md text-on-surface-variant">
                <span>
                    {isLoading
                        ? "Cargando registros..."
                        : activeRows.length === 0
                        ? "0 registros"
                        : `Mostrando ${(page - 1) * ITEMS_PER_PAGE + 1} a ${Math.min(page * ITEMS_PER_PAGE, activeRows.length)} de ${activeRows.length} registros`}
                </span>
                
                {/* Paginación con flechas */}
                {activeRows.length > 0 && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container hover:text-on-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            title="Página anterior"
                        >
                            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                        </button>
                        <span className="px-3 py-1 rounded-md bg-primary-container text-on-primary-container text-xs font-medium font-data-tabular">
                            Página {page} de {totalPages}
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                            className="p-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container hover:text-on-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            title="Página siguiente"
                        >
                            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}