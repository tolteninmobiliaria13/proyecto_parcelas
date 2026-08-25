import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ConfirmModal from "../../components/ui/ConfirmModal";
import {
    getParcelasPapelera,
    restoreParcela,
    deleteParcelaDefinitivo,
    type ParcelaPapelera,
} from "../../services/api";

export default function PapeleraPage() {
    const [items, setItems] = useState<ParcelaPapelera[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [actionId, setActionId] = useState<string | null>(null);
    const [itemToDeleteForever, setItemToDeleteForever] = useState<ParcelaPapelera | null>(null);
    const [itemToRestore, setItemToRestore] = useState<ParcelaPapelera | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadPapelera = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getParcelasPapelera();
            setItems(data);
        } catch (err: any) {
            console.error("Error al cargar papelera:", err);
            setError("No se pudieron cargar los elementos de la papelera.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPapelera();
    }, []);

    const confirmRestore = async () => {
        if (!itemToRestore) return;
        const item = itemToRestore;
        setItemToRestore(null);
        setActionId(item.id);

        try {
            await restoreParcela(item.id);
            await loadPapelera();
        } catch (err: any) {
            console.error("Error al restaurar parcela:", err);
            setError("Ocurrió un error al restaurar la parcela.");
        } finally {
            setActionId(null);
        }
    };

    const confirmDeleteForever = async () => {
        if (!itemToDeleteForever) return;
        const item = itemToDeleteForever;
        setItemToDeleteForever(null);
        setActionId(item.id);

        try {
            await deleteParcelaDefinitivo(item.id);
            await loadPapelera();
        } catch (err: any) {
            console.error("Error al borrar definitivamente:", err);
            setError("Ocurrió un error al eliminar definitivamente la parcela.");
        } finally {
            setActionId(null);
        }
    };

    const filteredItems = items.filter((item) => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;
        return (
            (item.numero_lote && item.numero_lote.toLowerCase().includes(query)) ||
            (item.owner && item.owner.toLowerCase().includes(query)) ||
            (item.subdivision && item.subdivision.toLowerCase().includes(query))
        );
    });

    return (
        <DashboardLayout>
            <div className="max-w-[1400px] mx-auto w-full flex flex-col gap-6 sm:gap-lg">
                {/* Page Header & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-error/10 text-error flex items-center justify-center">
                                <span className="material-symbols-outlined text-[24px]">delete_sweep</span>
                            </div>
                            <div>
                                <h2 className="font-display text-2xl sm:text-display text-on-background font-bold">
                                    Papelera de Parcelas
                                </h2>
                                <p className="font-body-md text-xs sm:text-body-md text-on-surface-variant mt-0.5">
                                    Parcelas eliminadas temporalmente. Puedes restaurarlas o borrarlas definitivamente.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Search & Refresh */}
                    <div className="flex items-center gap-3">
                        <div className="relative w-full sm:w-64">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                                search
                            </span>
                            <input
                                type="text"
                                placeholder="Buscar en papelera..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary w-full shadow-sm transition-shadow font-body-md text-sm outline-none"
                            />
                        </div>
                        <button
                            onClick={loadPapelera}
                            disabled={loading}
                            className="p-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer disabled:opacity-50"
                            title="Recargar papelera"
                        >
                            <span className={`material-symbols-outlined text-[20px] ${loading ? "animate-spin" : ""}`}>
                                refresh
                            </span>
                        </button>
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm font-medium flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px] shrink-0">error</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* Table Container */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col">
                    {/* Subheader */}
                    <div className="flex justify-between items-center p-4 sm:p-lg border-b border-outline-variant bg-surface-container-low">
                        <div>
                            <h3 className="font-headline-md text-base sm:text-headline-md text-on-surface font-semibold">
                                Registros en Papelera
                            </h3>
                            <p className="font-body-md text-xs text-on-surface-variant mt-0.5">
                                Los registros eliminados permanecen aquí hasta su borrado definitivo.
                            </p>
                        </div>
                        <div className="text-sm font-medium text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-full border border-outline-variant">
                            {filteredItems.length} {filteredItems.length === 1 ? "Registro" : "Registros"}
                        </div>
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead className="bg-surface-container-low border-b border-outline-variant">
                                <tr className="text-center font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                                    <th className="py-3 px-6 text-center border-r border-outline-variant">Lote</th>
                                    <th className="py-3 px-6 text-center border-r border-outline-variant">Subdivisión</th>
                                    <th className="py-3 px-6 text-center border-r border-outline-variant">Último Propietario</th>
                                    <th className="py-3 px-6 text-center border-r border-outline-variant">Precio Base</th>
                                    <th className="py-3 px-6 text-center border-r border-outline-variant">Fecha Eliminación</th>
                                    <th className="py-3 px-6 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant font-data-tabular text-data-tabular text-on-surface">
                                {loading ? (
                                    Array(4).fill(null).map((_, i) => (
                                        <tr key={i} className="animate-pulse text-center">
                                            <td className="py-4 px-6 border-r border-outline-variant"><div className="h-5 bg-outline-variant/30 rounded w-16 mx-auto"></div></td>
                                            <td className="py-4 px-6 border-r border-outline-variant"><div className="h-5 bg-outline-variant/30 rounded w-24 mx-auto"></div></td>
                                            <td className="py-4 px-6 border-r border-outline-variant"><div className="h-5 bg-outline-variant/30 rounded w-32 mx-auto"></div></td>
                                            <td className="py-4 px-6 border-r border-outline-variant"><div className="h-5 bg-outline-variant/30 rounded w-20 mx-auto"></div></td>
                                            <td className="py-4 px-6 border-r border-outline-variant"><div className="h-5 bg-outline-variant/30 rounded w-28 mx-auto"></div></td>
                                            <td className="py-4 px-6"><div className="h-5 bg-outline-variant/30 rounded w-32 mx-auto"></div></td>
                                        </tr>
                                    ))
                                ) : filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 px-6 text-center text-on-surface-variant">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <span className="material-symbols-outlined text-[42px] text-outline opacity-40">
                                                    delete_outline
                                                </span>
                                                <p className="font-medium text-sm text-on-surface">La papelera está vacía</p>
                                                <p className="text-xs text-on-surface-variant">
                                                    {searchQuery ? "No hay elementos que coincidan con la búsqueda." : "No hay parcelas eliminadas actualmente."}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-surface-container/40 transition-colors text-center">
                                            <td className="py-4 px-6 font-bold text-primary border-r border-outline-variant">
                                                {item.numero_lote}
                                            </td>
                                            <td className="py-4 px-6 text-on-surface-variant border-r border-outline-variant">
                                                {item.subdivision || "-"}
                                            </td>
                                            <td className="py-4 px-6 text-on-surface font-medium border-r border-outline-variant">
                                                {item.owner}
                                            </td>
                                            <td className="py-4 px-6 font-semibold text-on-surface border-r border-outline-variant">
                                                $ {item.precio_base ? item.precio_base.toLocaleString("es-CL") : "0"}
                                            </td>
                                            <td className="py-4 px-6 text-on-surface-variant text-xs font-mono border-r border-outline-variant">
                                                {item.fecha_eliminacion || "-"}
                                            </td>
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => setItemToRestore(item)}
                                                        disabled={actionId === item.id}
                                                        className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                                        title="Restaurar parcela al listado activo"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">
                                                            restore_from_trash
                                                        </span>
                                                        Restaurar
                                                    </button>
                                                    <button
                                                        onClick={() => setItemToDeleteForever(item)}
                                                        disabled={actionId === item.id}
                                                        className="px-3 py-1.5 rounded-lg bg-error/10 text-error hover:bg-error/20 transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                                        title="Eliminar permanentemente de la base de datos"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">
                                                            delete_forever
                                                        </span>
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards View */}
                    <div className="md:hidden divide-y divide-outline-variant">
                        {loading ? (
                            Array(3).fill(null).map((_, i) => (
                                <div key={i} className="p-4 bg-surface-container-lowest flex flex-col gap-3 animate-pulse">
                                    <div className="flex items-center justify-between">
                                        <div className="h-5 bg-outline-variant/30 rounded w-16"></div>
                                        <div className="h-5 bg-outline-variant/30 rounded w-24"></div>
                                    </div>
                                    <div className="h-4 bg-outline-variant/30 rounded w-32"></div>
                                    <div className="h-8 bg-outline-variant/20 rounded"></div>
                                </div>
                            ))
                        ) : filteredItems.length === 0 ? (
                            <div className="py-10 px-4 text-center text-on-surface-variant flex flex-col items-center gap-2">
                                <span className="material-symbols-outlined text-[36px] text-outline opacity-40">
                                    delete_outline
                                </span>
                                <p className="font-medium text-sm text-on-surface">La papelera está vacía</p>
                            </div>
                        ) : (
                            filteredItems.map((item) => (
                                <div key={item.id} className="p-4 bg-surface-container-lowest flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-primary text-base">{item.numero_lote}</span>
                                        <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                                            {item.subdivision || "Sin loteo"}
                                        </span>
                                    </div>

                                    <div className="text-xs text-on-surface flex flex-col gap-1">
                                        <div><span className="text-on-surface-variant">Titular:</span> <span className="font-semibold">{item.owner}</span></div>
                                        <div><span className="text-on-surface-variant">Precio Base:</span> <span className="font-semibold">$ {item.precio_base ? item.precio_base.toLocaleString("es-CL") : "0"}</span></div>
                                        <div><span className="text-on-surface-variant">Fecha Eliminación:</span> <span className="font-mono text-[11px]">{item.fecha_eliminacion || "-"}</span></div>
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/30">
                                        <button
                                            onClick={() => setItemToRestore(item)}
                                            disabled={actionId === item.id}
                                            className="flex-1 py-1.5 px-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">restore_from_trash</span>
                                            Restaurar
                                        </button>
                                        <button
                                            onClick={() => setItemToDeleteForever(item)}
                                            disabled={actionId === item.id}
                                            className="flex-1 py-1.5 px-3 rounded-lg bg-error/10 text-error hover:bg-error/20 transition-colors text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">delete_forever</span>
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Confirmación para Restaurar */}
            {itemToRestore && (
                <ConfirmModal
                    isOpen={Boolean(itemToRestore)}
                    title="Restaurar Parcela"
                    message={`¿Deseas restaurar la parcela "${itemToRestore.numero_lote}" al listado de parcelas activas?`}
                    confirmText="Restaurar Parcela"
                    cancelText="Cancelar"
                    isDanger={false}
                    onCancel={() => setItemToRestore(null)}
                    onConfirm={confirmRestore}
                />
            )}

            {/* Confirmación para Eliminar Definitivamente */}
            {itemToDeleteForever && (
                <ConfirmModal
                    isOpen={Boolean(itemToDeleteForever)}
                    title="Eliminar Definitivamente"
                    message={`¿Estás seguro de eliminar PERMANENTEMENTE la parcela "${itemToDeleteForever.numero_lote}"? Esta acción eliminará el contrato y todos sus datos asociados sin posibilidad de recuperación.`}
                    confirmText="Eliminar Permanentemente"
                    cancelText="Cancelar"
                    isDanger={true}
                    onCancel={() => setItemToDeleteForever(null)}
                    onConfirm={confirmDeleteForever}
                />
            )}
        </DashboardLayout>
    );
}
