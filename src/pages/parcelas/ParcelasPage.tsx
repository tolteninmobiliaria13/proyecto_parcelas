import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ParcelasTable from "../../components/parcelas/ParcelasTable";

export default function ParcelasPage() {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                {/* Page Header & Actions */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 sm:mb-xl gap-4">
                    <div>
                        <h2 className="font-display text-2xl sm:text-display text-on-background">Listado de Parcelas</h2>
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
                            <button className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-primary-container text-on-primary-container rounded-lg font-data-tabular text-sm hover:bg-primary-container/90 shadow-sm transition-colors cursor-pointer whitespace-nowrap">
                                <span className="material-symbols-outlined text-[18px]">add</span>
                                Nueva Parcela
                            </button>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <ParcelasTable searchQuery={searchQuery} />
            </div>
        </DashboardLayout>
    );
}
