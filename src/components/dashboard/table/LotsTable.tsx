import { useState, useEffect } from "react";
import type { Lot } from "../../../types/lots";
import { getDashboardLots } from "../../../services/api";
import LotRow, { LotCard } from "./LotRow";

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
    error: string | null;
    emptyText: string;
}

function TablePanel({ rows, loading, error, emptyText }: TablePanelProps) {
    const skeletons = Array(3).fill(null);
    return (
        <>
            {/* Desktop */}
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
                                <td colSpan={6} className="py-8 px-6 text-center text-error font-medium">{error}</td>
                            </tr>
                        ) : rows.length > 0 ? (
                            rows.map((lot) => <LotRow key={lot.id} lot={lot} />)
                        ) : (
                            <tr>
                                <td colSpan={6} className="py-8 px-6 text-center text-on-surface-variant/70">{emptyText}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y divide-outline-variant">
                {loading ? (
                    skeletons.map((_, i) => <LotCardSkeleton key={i} />)
                ) : error ? (
                    <div className="p-6 text-center text-error text-sm font-medium">{error}</div>
                ) : rows.length > 0 ? (
                    rows.map((lot) => <LotCard key={lot.id} lot={lot} />)
                ) : (
                    <div className="p-6 text-center text-on-surface-variant/70 text-sm">{emptyText}</div>
                )}
            </div>
        </>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LotsTable() {
    const [lots, setLots] = useState<Lot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabKey>("morosos");

    useEffect(() => {
        getDashboardLots()
            .then((data) => {
                setLots(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error al obtener contratos:", err);
                setError("No se pudieron obtener los registros.");
                setLoading(false);
            });
    }, []);

    // Clasificación: excluir completamente pagados (sin balance y sin nextDueDate)
    const morosos = lots.filter((l) => l.status === "overdue");
    const pendientes = lots.filter(
        (l) => l.status === "current" && isThisMonth(l.nextDueDate)
    );

    const counts: Record<TabKey, number> = { morosos: morosos.length, pendientes: pendientes.length };
    const activeRows = activeTab === "morosos" ? morosos : pendientes;
    const activeTab_ = TABS.find((t) => t.key === activeTab)!;

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
                        const count = loading ? null : counts[tab.key];
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
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
                rows={activeRows}
                loading={loading}
                error={error}
                emptyText={activeTab_.emptyText}
            />

            {/* Footer */}
            <div className="p-4 sm:px-6 sm:py-4 border-t border-outline-variant bg-surface-container-low flex justify-between items-center gap-3 text-xs sm:text-sm font-body-md text-on-surface-variant">
                <span>
                    {loading
                        ? "Cargando registros..."
                        : `Mostrando ${activeRows.length} registros`}
                </span>
                {/* Indicadores de carrusel */}
                <div className="flex items-center gap-1.5">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            aria-label={`Ver ${tab.label}`}
                            className={`rounded-full transition-all duration-200 cursor-pointer ${
                                activeTab === tab.key
                                    ? "w-5 h-2 bg-primary"
                                    : "w-2 h-2 bg-outline-variant hover:bg-outline"
                            }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}