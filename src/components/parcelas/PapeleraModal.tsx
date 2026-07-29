import { useState, useEffect } from "react";
import { getParcelasPapelera, restoreParcela, deleteParcelaDefinitivo, type ParcelaPapelera } from "../../services/api";
import ConfirmModal from "../ui/ConfirmModal";

interface PapeleraModalProps {
    isOpen: boolean;
    onClose: () => void;
    onChanged: () => void;
}

export default function PapeleraModal({ isOpen, onClose, onChanged }: PapeleraModalProps) {
    const [items, setItems] = useState<ParcelaPapelera[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionId, setActionId] = useState<string | null>(null);
    const [itemToDeleteForever, setItemToDeleteForever] = useState<ParcelaPapelera | null>(null);
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
        if (isOpen) {
            loadPapelera();
        }
    }, [isOpen]);

    const handleRestore = async (item: ParcelaPapelera) => {
        setActionId(item.id);
        try {
            await restoreParcela(item.id);
            await loadPapelera();
            onChanged();
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
            onChanged();
        } catch (err: any) {
            console.error("Error al borrar definitivamente:", err);
            setError("Ocurrió un error al eliminar definitivamente la parcela.");
        } finally {
            setActionId(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-error-container/20 text-error flex items-center justify-center">
                            <span className="material-symbols-outlined text-[24px]">delete_sweep</span>
                        </div>
                        <div>
                            <h3 className="font-display text-lg font-bold text-on-surface">
                                Papelera de Parcelas
                            </h3>
                            <p className="text-xs text-on-surface-variant">
                                Parcelas eliminadas temporalmente. Puedes restaurarlas o eliminarlas definitivamente.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {error && (
                        <div className="p-3 mb-4 rounded-lg bg-error-container/20 border border-error/30 text-error text-sm">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="py-12 flex flex-col items-center justify-center text-on-surface-variant">
                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                            <span className="text-sm">Cargando papelera...</span>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center text-on-surface-variant">
                            <span className="material-symbols-outlined text-[48px] text-outline opacity-40 mb-2">
                                delete_outline
                            </span>
                            <p className="font-medium text-sm text-on-surface">La papelera está vacía</p>
                            <p className="text-xs text-on-surface-variant mt-1">
                                Las parcelas eliminadas temporalmente aparecerán aquí.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-outline-variant/30">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-surface-container-low text-on-surface-variant font-medium text-xs border-b border-outline-variant/30">
                                    <tr>
                                        <th className="px-4 py-3">Lote</th>
                                        <th className="px-4 py-3">Subdivisión</th>
                                        <th className="px-4 py-3">Propietario</th>
                                        <th className="px-4 py-3">Precio Base</th>
                                        <th className="px-4 py-3">Fecha Eliminación</th>
                                        <th className="px-4 py-3 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant/20">
                                    {items.map((item) => (
                                        <tr key={item.id} className="hover:bg-surface-container-low/40 transition-colors">
                                            <td className="px-4 py-3 font-medium text-on-surface">
                                                {item.numero_lote}
                                            </td>
                                            <td className="px-4 py-3 text-on-surface-variant">
                                                {item.subdivision}
                                            </td>
                                            <td className="px-4 py-3 text-on-surface-variant">
                                                {item.owner}
                                            </td>
                                            <td className="px-4 py-3 text-on-surface">
                                                $ {item.precio_base ? item.precio_base.toLocaleString("es-CL") : "0"}
                                            </td>
                                            <td className="px-4 py-3 text-on-surface-variant text-xs">
                                                {item.fecha_eliminacion || "-"}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* Restaurar Button */}
                                                    <button
                                                        onClick={() => handleRestore(item)}
                                                        disabled={actionId === item.id}
                                                        className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                                        title="Restaurar parcela a la lista activa"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">
                                                            restore_from_trash
                                                        </span>
                                                        Restaurar
                                                    </button>
                                                    {/* Eliminar Definitivamente Button */}
                                                    <button
                                                        onClick={() => setItemToDeleteForever(item)}
                                                        disabled={actionId === item.id}
                                                        className="px-3 py-1.5 rounded-lg bg-error/10 text-error hover:bg-error/20 transition-colors text-xs font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-outline-variant/20 bg-surface-container-low/30 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors text-sm font-medium cursor-pointer"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
