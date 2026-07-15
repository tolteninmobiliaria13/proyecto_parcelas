import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ParcelasTable from "../../components/parcelas/ParcelasTable";

export default function ParcelasPage() {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                {/* Page Header & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-xl gap-4">
                    <h2 className="font-display text-display text-on-background">Listado de Parcelas</h2>
                    <div className="flex items-center gap-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                                search
                            </span>
                            <input
                                type="text"
                                placeholder="Buscar parcela o propietario..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary w-64 shadow-sm transition-shadow font-body-md outline-none"
                            />
                        </div>
                        {/* Filter Dropdown (Visual only) */}
                        <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low shadow-sm transition-colors font-data-tabular cursor-pointer">
                            <span className="material-symbols-outlined text-[18px]">filter_list</span>
                            Filtros
                        </button>
                        {/* Primary Action (New Parcel) */}
                        <button className="flex items-center gap-2 px-4 py-2 bg-primary-container text-on-primary-container rounded-lg font-data-tabular hover:bg-primary-container/90 shadow-sm transition-colors cursor-pointer">
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Nueva Parcela
                        </button>
                    </div>
                </div>

                {/* Data Table */}
                <ParcelasTable searchQuery={searchQuery} />
            </div>
        </DashboardLayout>
    );
}
