import { useState, useEffect } from "react";
import { getSubdivisiones, createSubdivision, updateSubdivision, deleteSubdivision } from "../../services/api";
import type { Subdivision } from "../../services/api";

type SubdivisionesModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onChanged: () => void;
};

export default function SubdivisionesModal({
    isOpen,
    onClose,
    onChanged,
}: SubdivisionesModalProps) {
    const [subdivisiones, setSubdivisiones] = useState<Subdivision[]>([]);
    const [loadingList, setLoadingList] = useState(false);

    // Create state
    const [nuevoNombre, setNuevoNombre] = useState("");
    const [loadingCreate, setLoadingCreate] = useState(false);

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editNombre, setEditNombre] = useState("");
    const [loadingEdit, setLoadingEdit] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const fetchList = () => {
        setLoadingList(true);
        getSubdivisiones()
            .then((data) => setSubdivisiones(data))
            .catch((err) => {
                console.error("Error al cargar subdivisiones:", err);
                setError("No se pudieron cargar los loteos.");
            })
            .finally(() => setLoadingList(false));
    };

    useEffect(() => {
        if (isOpen) {
            fetchList();
            setError(null);
            setSuccessMsg(null);
            setNuevoNombre("");
            setEditingId(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Calcular el siguiente número que le corresponderá al nuevo loteo
    const maxNum = subdivisiones.reduce((max, item) => Math.max(max, item.numero || 0), 0);
    const siguienteNumero = maxNum + 1;

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevoNombre.trim()) {
            setError("Ingresa un nombre para el nuevo loteo.");
            return;
        }

        setLoadingCreate(true);
        setError(null);
        setSuccessMsg(null);

        try {
            await createSubdivision({ nombre: nuevoNombre.trim() });
            setNuevoNombre("");
            setSuccessMsg("¡Loteo creado con éxito!");
            fetchList();
            onChanged();
        } catch (err: any) {
            console.error("Error al crear subdivisión:", err);
            setError(err.response?.data?.detail || err.response?.data?.message || "Ocurrió un error al crear el loteo.");
        } finally {
            setLoadingCreate(false);
        }
    };

    const handleStartEdit = (sub: Subdivision) => {
        setEditingId(sub.id);
        setEditNombre(sub.nombre);
        setError(null);
        setSuccessMsg(null);
    };

    const handleSaveEdit = async (id: string) => {
        if (!editNombre.trim()) {
            setError("El nombre del loteo no puede estar vacío.");
            return;
        }

        setLoadingEdit(true);
        setError(null);
        setSuccessMsg(null);

        try {
            await updateSubdivision(id, { nombre: editNombre.trim() });
            setEditingId(null);
            setSuccessMsg("Loteo actualizado correctamente.");
            fetchList();
            onChanged();
        } catch (err: any) {
            console.error("Error al actualizar subdivisión:", err);
            setError(err.response?.data?.detail || err.response?.data?.message || "Ocurrió un error al guardar los cambios.");
        } finally {
            setLoadingEdit(false);
        }
    };

    const handleDelete = async (sub: Subdivision) => {
        if (!window.confirm(`¿Estás seguro de eliminar la subdivisión "${sub.nombre}"?`)) return;

        setError(null);
        setSuccessMsg(null);

        try {
            await deleteSubdivision(sub.id);
            setSuccessMsg(`Subdivisión "${sub.nombre}" eliminada.`);
            fetchList();
            onChanged();
        } catch (err: any) {
            console.error("Error al eliminar subdivisión:", err);
            setError(err.response?.data?.detail || err.response?.data?.message || "No se pudo eliminar el loteo.");
        }
    };

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-md animate-fade-in"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl max-w-lg w-full overflow-hidden p-6 flex flex-col gap-md animate-scale-up max-h-[90vh]"
            >
                {/* Header */}
                <div className="flex items-start justify-between border-b border-outline-variant/60 pb-3">
                    <div>
                        <h3 className="font-headline-md text-base sm:text-headline-md text-on-surface font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[22px]">format_list_bulleted</span>
                            Gestión de Loteos y Subdivisiones
                        </h3>
                        <p className="text-[12px] text-on-surface-variant mt-0.5">
                            Crea, modifica y gestiona la numeración correlativa de los proyectos.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-outline hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
                        aria-label="Cerrar modal"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {/* Banners Feedback */}
                {error && (
                    <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-xs font-medium flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">error</span>
                        <span>{error}</span>
                    </div>
                )}
                {successMsg && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-medium flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        <span>{successMsg}</span>
                    </div>
                )}

                {/* Formulario de Registro Rápido */}
                <form onSubmit={handleCreate} className="p-3.5 bg-surface-container-low border border-outline-variant/60 rounded-xl flex flex-col gap-2">
                    <span className="text-xs font-bold text-primary uppercase tracking-wide flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">add_circle</span>
                        Crear Nuevo Loteo (N° {siguienteNumero})
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="px-3 py-2 bg-primary-container/40 text-primary border border-primary/20 rounded-lg text-xs font-bold font-mono whitespace-nowrap">
                            Loteo N° {siguienteNumero}
                        </div>
                        <input
                            type="text"
                            placeholder="Nombre del Loteo (Ej: San Ignacio, Fases 1)..."
                            value={nuevoNombre}
                            onChange={(e) => setNuevoNombre(e.target.value)}
                            disabled={loadingCreate}
                            className="flex-1 px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm outline-none shadow-xs"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loadingCreate}
                            className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold hover:bg-primary/90 flex items-center gap-1 cursor-pointer disabled:opacity-50 shadow-xs"
                        >
                            {loadingCreate ? (
                                <div className="w-3.5 h-3.5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[16px]">save</span>
                                    <span>Agregar</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Listado de Loteos Existentes */}
                <div className="flex flex-col gap-2 overflow-y-auto max-h-[320px] pr-1">
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wide border-b border-outline-variant/40 pb-1">
                        Loteos Registrados ({subdivisiones.length})
                    </span>

                    {loadingList ? (
                        <div className="flex flex-col gap-2 py-4">
                            {Array(3).fill(null).map((_, i) => (
                                <div key={i} className="h-10 bg-outline-variant/20 animate-pulse rounded-lg"></div>
                            ))}
                        </div>
                    ) : subdivisiones.length === 0 ? (
                        <div className="p-6 text-center text-xs text-on-surface-variant font-medium bg-surface-container-low/30 rounded-lg border border-dashed border-outline-variant/60">
                            No hay loteos registrados todavía. ¡Crea el primero arriba!
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {subdivisiones.map((sub) => (
                                <div
                                    key={sub.id}
                                    className="p-3 bg-surface-container-lowest border border-outline-variant/60 rounded-lg flex items-center justify-between gap-3 shadow-2xs hover:border-outline transition-colors"
                                >
                                    {editingId === sub.id ? (
                                        /* Modo Edición en línea */
                                        <div className="flex items-center gap-2 w-full animate-fade-in">
                                            <span className="px-2 py-1 bg-surface-container text-on-surface text-xs font-mono font-bold rounded">
                                                N° {sub.numero}
                                            </span>
                                            <input
                                                type="text"
                                                value={editNombre}
                                                onChange={(e) => setEditNombre(e.target.value)}
                                                disabled={loadingEdit}
                                                className="flex-1 px-2 py-1 text-xs border border-primary rounded bg-surface-container-lowest text-on-surface outline-none font-medium"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => handleSaveEdit(sub.id)}
                                                disabled={loadingEdit}
                                                className="px-2.5 py-1 bg-emerald-600 text-white rounded text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer flex items-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">check</span>
                                                Guardar
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                disabled={loadingEdit}
                                                className="px-2 py-1 border border-outline-variant rounded text-xs text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    ) : (
                                        /* Modo Lectura */
                                        <>
                                            <div className="flex items-center gap-2">
                                                <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-mono font-bold rounded-md border border-primary/20">
                                                    N° {sub.numero}
                                                </span>
                                                <span className="text-xs sm:text-sm font-semibold text-on-surface">
                                                    {sub.nombre}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleStartEdit(sub)}
                                                    className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-md transition-colors cursor-pointer"
                                                    title="Editar nombre del loteo"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(sub)}
                                                    className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-md transition-colors cursor-pointer"
                                                    title="Eliminar loteo"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end pt-3 border-t border-outline-variant/60">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-outline-variant rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
