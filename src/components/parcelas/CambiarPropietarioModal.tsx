import { useState, useEffect } from "react";
import { getClientes, cambiarPropietario, getContratoDetalle } from "../../services/api";
import type { Cliente, CambiarPropietarioPayload } from "../../services/api";
import type { Parcela } from "../../types/parcela";

type CambiarPropietarioModalProps = {
    isOpen: boolean;
    parcela: Parcela | null;
    onClose: () => void;
    onSuccess: () => void;
};

export default function CambiarPropietarioModal({
    isOpen,
    parcela,
    onClose,
    onSuccess,
}: CambiarPropietarioModalProps) {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [clienteMode, setClienteMode] = useState<"existing" | "new">("existing");

    // Form states
    const [selectedClienteId, setSelectedClienteId] = useState("");
    const [clienteNombre, setClienteNombre] = useState("");
    const [clienteEmail, setClienteEmail] = useState("");
    const [clienteTelefono, setClienteTelefono] = useState("");
    const [currentOwnerName, setCurrentOwnerName] = useState("");

    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && parcela) {
            setLoadingData(true);
            setError(null);
            Promise.all([getClientes(), getContratoDetalle(parcela.id)])
                .then(([clientsList, detail]) => {
                    setClientes(clientsList);
                    setCurrentOwnerName(detail.cliente_nombre || parcela.owner || "Sin Asignar");
                    setSelectedClienteId(detail.cliente_id);
                    setClienteMode("existing");
                })
                .catch((err) => {
                    console.error("Error al cargar datos del propietario:", err);
                    setError("No se pudo cargar la información del propietario actual.");
                })
                .finally(() => {
                    setLoadingData(false);
                });

            setClienteNombre("");
            setClienteEmail("");
            setClienteTelefono("");
        }
    }, [isOpen, parcela?.id]);

    if (!isOpen || !parcela) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingSubmit(true);
        setError(null);

        if (clienteMode === "new" && !clienteNombre.trim()) {
            setError("El nombre del nuevo cliente es obligatorio.");
            setLoadingSubmit(false);
            return;
        }

        if (clienteMode === "existing" && !selectedClienteId) {
            setError("Debes seleccionar un cliente existente.");
            setLoadingSubmit(false);
            return;
        }

        const payload: CambiarPropietarioPayload = {};
        if (clienteMode === "existing") {
            payload.cliente_id = selectedClienteId;
        } else {
            payload.cliente_nombre = clienteNombre.trim();
            payload.cliente_email = clienteEmail.trim() || null;
            payload.cliente_telefono = clienteTelefono.trim() || null;
        }

        try {
            await cambiarPropietario(parcela.id, payload);
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Error al cambiar propietario:", err);
            let errMsg = "Ocurrió un error al actualizar el propietario. Por favor, intenta de nuevo.";
            if (err.response?.data?.message) {
                errMsg = err.response.data.message;
            } else if (err.response?.data?.detail) {
                const details = err.response.data.detail;
                if (typeof details === "string") {
                    errMsg = details;
                } else if (Array.isArray(details)) {
                    errMsg = details.map((d: any) => `${d.loc.join('.')}: ${d.msg}`).join(', ');
                }
            }
            setError(errMsg);
        } finally {
            setLoadingSubmit(false);
        }
    };

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-md animate-fade-in"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl max-w-md w-full overflow-hidden p-5 sm:p-6 flex flex-col gap-4 animate-scale-up"
            >
                {/* Header */}
                <div className="flex items-start justify-between border-b border-outline-variant/60 pb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[22px]">person</span>
                        </div>
                        <div>
                            <h3 className="font-headline-md text-base text-on-surface font-bold">
                                Cambiar Propietario
                            </h3>
                            <p className="text-[12px] text-on-surface-variant">
                                Lote: <span className="font-semibold text-primary">{parcela.id}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-outline hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
                        aria-label="Cerrar modal"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {/* Propietario Actual Banner */}
                <div className="p-3 bg-surface-container-low/70 border border-outline-variant/50 rounded-lg flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant font-medium">Titular Actual:</span>
                    <span className="font-bold text-on-surface">{currentOwnerName}</span>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-xs font-medium flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Modo de Cliente Selector */}
                    {clientes.length > 0 && (
                        <div className="flex bg-surface-container-low p-1 rounded-lg border border-outline-variant/40">
                            <button
                                type="button"
                                onClick={() => setClienteMode("existing")}
                                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                    clienteMode === "existing"
                                        ? "bg-surface-container-lowest text-primary shadow-xs"
                                        : "text-on-surface-variant hover:text-on-surface"
                                }`}
                            >
                                Seleccionar Existente
                            </button>
                            <button
                                type="button"
                                onClick={() => setClienteMode("new")}
                                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                    clienteMode === "new"
                                        ? "bg-surface-container-lowest text-primary shadow-xs"
                                        : "text-on-surface-variant hover:text-on-surface"
                                }`}
                            >
                                Registrar Nuevo
                            </button>
                        </div>
                    )}

                    {loadingData ? (
                        <div className="py-6 text-center text-xs text-on-surface-variant">
                            Cargando información de clientes...
                        </div>
                    ) : clienteMode === "existing" ? (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-on-surface">
                                Seleccionar Nuevo Titular
                            </label>
                            <select
                                value={selectedClienteId}
                                onChange={(e) => setSelectedClienteId(e.target.value)}
                                className="w-full px-3 py-2 text-xs border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none cursor-pointer"
                            >
                                {clientes.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.nombre_completo} {c.email ? `(${c.email})` : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 p-3.5 bg-surface-container-low/50 rounded-lg border border-outline-variant/30">
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-semibold text-on-surface">
                                    Nombre Completo *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: Roberto Gómez"
                                    value={clienteNombre}
                                    onChange={(e) => setClienteNombre(e.target.value)}
                                    className="w-full px-3 py-1.5 text-xs border border-outline-variant rounded-md bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-medium text-on-surface-variant">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    placeholder="correo@ejemplo.com"
                                    value={clienteEmail}
                                    onChange={(e) => setClienteEmail(e.target.value)}
                                    className="w-full px-3 py-1.5 text-xs border border-outline-variant rounded-md bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-medium text-on-surface-variant">
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    placeholder="+56 9 1234 5678"
                                    value={clienteTelefono}
                                    onChange={(e) => setClienteTelefono(e.target.value)}
                                    className="w-full px-3 py-1.5 text-xs border border-outline-variant rounded-md bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/60">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loadingSubmit}
                            className="px-4 py-2 border border-outline-variant rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loadingSubmit || loadingData}
                            className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                        >
                            {loadingSubmit ? (
                                <>
                                    <div className="w-3.5 h-3.5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                                    <span>Guardando...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[16px]">save</span>
                                    <span>Guardar Propietario</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
