import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ParcelasTable from "../../components/parcelas/ParcelasTable";
import NuevaParcelaModal from "../../components/parcelas/NuevaParcelaModal";
import EditarParcelaModal from "../../components/parcelas/EditarParcelaModal";
import AsignarPropietarioModal from "../../components/parcelas/AsignarPropietarioModal";
import SubdivisionesModal from "../../components/parcelas/SubdivisionesModal";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { deleteParcela } from "../../services/api";
import type { Parcela } from "../../types/parcela";

export default function ParcelasPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubdivisionModalOpen, setIsSubdivisionModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [parcelaToAssign, setParcelaToAssign] = useState<Parcela | null>(null);
    const [parcelaToEdit, setParcelaToEdit] = useState<Parcela | null>(null);
    const [parcelaToMoveToPapelera, setParcelaToMoveToPapelera] = useState<Parcela | null>(null);

    const confirmMoveToPapelera = async () => {
        if (!parcelaToMoveToPapelera) return;
        const target = parcelaToMoveToPapelera;
        setParcelaToMoveToPapelera(null);

        try {
            await deleteParcela(target.id);
            setRefreshTrigger((prev) => prev + 1);
        } catch (err: any) {
            console.error("Error al mover parcela a la papelera:", err);
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
                            Administración y registro general del inventario de loteos.
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
                                placeholder="Buscar parcela o loteo..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary w-full shadow-sm transition-shadow font-body-md text-sm outline-none"
                            />
                        </div>
                        {/* Action buttons row */}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            {/* Nuevo Loteo Action */}
                            <button
                                onClick={() => setIsSubdivisionModalOpen(true)}
                                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-low shadow-sm transition-colors font-medium text-xs sm:text-sm cursor-pointer whitespace-nowrap"
                            >
                                <span className="material-symbols-outlined text-[18px] text-primary">format_list_bulleted</span>
                                Gestionar Loteos
                            </button>
                            {/* Primary Action (New Parcel) */}
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-primary text-on-primary rounded-lg font-semibold text-xs sm:text-sm hover:bg-primary/90 shadow-sm transition-colors cursor-pointer whitespace-nowrap"
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
                    onAssignOwner={(p) => setParcelaToAssign(p)}
                    onEditParcela={(p) => setParcelaToEdit(p)}
                    onDeleteParcela={(p) => setParcelaToMoveToPapelera(p)}
                />
            </div>

            {/* Creation Modal */}
            <NuevaParcelaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
            />

            {/* Gestión de Loteos / Subdivisiones Modal */}
            <SubdivisionesModal
                isOpen={isSubdivisionModalOpen}
                onClose={() => setIsSubdivisionModalOpen(false)}
                onChanged={() => setRefreshTrigger((prev) => prev + 1)}
            />

            {/* Edit Parcela Modal */}
            <EditarParcelaModal
                isOpen={parcelaToEdit !== null}
                parcela={parcelaToEdit}
                onClose={() => setParcelaToEdit(null)}
                onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
            />

            {/* Asignar Propietario Inicial Modal */}
            {parcelaToAssign && (
                <AsignarPropietarioModal
                    isOpen={Boolean(parcelaToAssign)}
                    parcela={parcelaToAssign}
                    onClose={() => setParcelaToAssign(null)}
                    onSuccess={() => {
                        setParcelaToAssign(null);
                        setRefreshTrigger((prev) => prev + 1);
                    }}
                />
            )}

            {/* Confirmación para Mover a Papelera */}
            <ConfirmModal
                isOpen={parcelaToMoveToPapelera !== null}
                title="Mover a la Papelera"
                message={`¿Deseas mover la parcela "${parcelaToMoveToPapelera?.id}" a la Papelera? Podrás restaurarla o eliminarla definitivamente más tarde desde la Papelera.`}
                confirmText="Mover a Papelera"
                cancelText="Cancelar"
                isDanger={true}
                onCancel={() => setParcelaToMoveToPapelera(null)}
                onConfirm={confirmMoveToPapelera}
            />
        </DashboardLayout>
    );
}

