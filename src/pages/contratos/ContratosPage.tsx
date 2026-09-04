import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ContratosTable from "../../components/contratos/ContratosTable";
import CrearContratoModal from "../../components/contratos/CrearContratoModal";
import CambiarPropietarioModal from "../../components/parcelas/CambiarPropietarioModal";
import EditarContratoModal from "../../components/parcelas/EditarContratoModal";
import type { Parcela } from "../../types/parcela";

export default function ContratosPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [parcelaToEditOwner, setParcelaToEditOwner] = useState<Parcela | null>(null);
    const [parcelaToEditContrato, setParcelaToEditContrato] = useState<Parcela | null>(null);

    return (
        <DashboardLayout>
            <div className="max-w-[1400px] mx-auto w-full flex flex-col gap-6 sm:gap-lg">
                {/* Page Header & Actions */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <span className="material-symbols-outlined text-[24px]">description</span>
                            </div>
                            <div>
                                <h2 className="font-display text-2xl sm:text-display text-on-background font-bold">
                                    Contratos y Pagos
                                </h2>
                                <p className="font-body-md text-xs sm:text-body-md text-on-surface-variant mt-0.5">
                                    Gestión de contratos de venta, clientes titulares, cuotas pactadas y abonos.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                        {/* Search Bar */}
                        <div className="relative w-full sm:w-64">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                                search
                            </span>
                            <input
                                type="text"
                                placeholder="Buscar cliente, lote, rol..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary w-full shadow-sm transition-shadow font-body-md text-sm outline-none"
                            />
                        </div>

                        {/* Botón Nuevo Contrato */}
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-primary text-on-primary rounded-lg font-semibold text-xs sm:text-sm hover:bg-primary/90 shadow-sm transition-colors cursor-pointer whitespace-nowrap"
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Nuevo Contrato
                        </button>
                    </div>
                </div>

                {/* Data Table */}
                <ContratosTable
                    searchQuery={searchQuery}
                    refreshTrigger={refreshTrigger}
                    onEditOwner={(p) => setParcelaToEditOwner(p)}
                    onEditContrato={(p) => setParcelaToEditContrato(p)}
                />
            </div>

            {/* Crear Contrato Modal */}
            <CrearContratoModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
            />

            {/* Cambiar Titular / Propietario Modal */}
            {parcelaToEditOwner && (
                <CambiarPropietarioModal
                    isOpen={Boolean(parcelaToEditOwner)}
                    parcela={parcelaToEditOwner}
                    onClose={() => setParcelaToEditOwner(null)}
                    onSuccess={() => {
                        setParcelaToEditOwner(null);
                        setRefreshTrigger((prev) => prev + 1);
                    }}
                />
            )}

            {/* Editar Condiciones de Contrato Modal */}
            {parcelaToEditContrato && (
                <EditarContratoModal
                    isOpen={Boolean(parcelaToEditContrato)}
                    parcela={parcelaToEditContrato}
                    onClose={() => setParcelaToEditContrato(null)}
                    onSuccess={() => {
                        setParcelaToEditContrato(null);
                        setRefreshTrigger((prev) => prev + 1);
                    }}
                />
            )}
        </DashboardLayout>
    );
}
