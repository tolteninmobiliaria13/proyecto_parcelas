import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ParcelasTable from "../../components/parcelas/ParcelasTable";
import NuevaParcelaModal from "../../components/parcelas/NuevaParcelaModal";
import EditarParcelaModal from "../../components/parcelas/EditarParcelaModal";
import AsignarPropietarioModal from "../../components/parcelas/AsignarPropietarioModal";
import { deleteParcela } from "../../services/api";
import type { Parcela } from "../../types/parcela";

export default function ParcelasPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selectedParcela, setSelectedParcela] = useState<Parcela | null>(null);
    const [parcelaToEdit, setParcelaToEdit] = useState<Parcela | null>(null);

    const handleDeleteParcela = async (p: Parcela) => {
        const confirm = window.confirm(`¿Estás seguro de que deseas eliminar la parcela "${p.id}"? Esta acción borrará la parcela permanentemente.`);
        if (!confirm) return;

        try {
            await deleteParcela(p.id);
            setRefreshTrigger((prev) => prev + 1);
        } catch (err: any) {
            console.error("Error al eliminar parcela:", err);
            alert(err.response?.data?.message || "No se puede eliminar la parcela. Podría tener contratos o pagos asociados vigentes.");
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-[1400px] mx-auto w-full flex flex-col gap-6 sm:gap-lg">
                {/* Page Header & Actions */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h2 className="font-display text-2xl sm:text-display text-on-background font-bold">Listado de Parcelas</h2>
                        <p className="font-body-md text-xs sm:text-body-md text-on-surface-variant mt-1">
                            Administración y registro general de loteos.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                        {/* Search Bar */}
                        <div className="relative w-full sm:w-64">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                                search
                            </span>
                            <input
                                type="text"
                                placeholder="Buscar parcela o propietario..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary w-full shadow-sm transition-shadow font-body-md text-sm outline-none"
                            />
                        </div>
                        {/* Action buttons row */}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            {/* Filter Dropdown (Visual only) */}
                            <button className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low shadow-sm transition-colors font-data-tabular text-sm cursor-pointer">
                                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                                Filtros
                            </button>
                            {/* Primary Action (New Parcel) */}
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-primary-container text-on-primary-container rounded-lg font-data-tabular text-sm hover:bg-primary-container/90 shadow-sm transition-colors cursor-pointer whitespace-nowrap"
                            >
                                <span className="material-symbols-outlined text-[18px]">add</span>
                                Nueva Parcela
                            </button>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <ParcelasTable
                    searchQuery={searchQuery}
                    refreshTrigger={refreshTrigger}
                    onAssignOwner={(p) => setSelectedParcela(p)}
                    onEditParcela={(p) => setParcelaToEdit(p)}
                    onEditContrato={(p) => setSelectedParcela(p)}
                    onDeleteParcela={handleDeleteParcela}
                />
            </div>

            {/* Creation Modal */}
            <NuevaParcelaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
            />

            {/* Edit Parcela Modal */}
            <EditarParcelaModal
                isOpen={parcelaToEdit !== null}
                parcela={parcelaToEdit}
                onClose={() => setParcelaToEdit(null)}
                onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
            />

            {/* Assignment Modal */}
            <AsignarPropietarioModal
                isOpen={selectedParcela !== null}
                parcela={selectedParcela}
                onClose={() => setSelectedParcela(null)}
                onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
            />
        </DashboardLayout>
    );
}
