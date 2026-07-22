import { useState, useEffect } from "react";
import { createCliente, updateCliente } from "../../services/api";
import type { Cliente } from "../../services/api";

type NuevoClienteModalProps = {
    isOpen: boolean;
    cliente: Cliente | null;
    onClose: () => void;
    onSuccess: () => void;
};

export default function NuevoClienteModal({
    isOpen,
    cliente,
    onClose,
    onSuccess,
}: NuevoClienteModalProps) {
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [telefono, setTelefono] = useState("");
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (cliente) {
                setNombre(cliente.nombre_completo || "");
                setEmail(cliente.email || "");
                setTelefono(cliente.telefono || "");
            } else {
                setNombre("");
                setEmail("");
                setTelefono("");
            }
            setError(null);
        }
    }, [isOpen, cliente]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!nombre.trim()) {
            setError("El nombre completo es obligatorio.");
            setLoading(false);
            return;
        }

        const payload = {
            nombre_completo: nombre.trim(),
            email: email.trim() || null,
            telefono: telefono.trim() || null,
        };

        try {
            if (cliente) {
                await updateCliente(cliente.id, payload);
            } else {
                await createCliente(payload);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Error al guardar cliente:", err);
            setError(err.response?.data?.message || "Ocurrió un error al guardar los datos del cliente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-md animate-fade-in"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl max-w-md w-full overflow-hidden p-6 flex flex-col gap-md animate-scale-up"
            >
                {/* Header */}
                <div className="flex items-start justify-between border-b border-outline-variant/60 pb-3">
                    <div>
                        <h3 className="font-headline-md text-base sm:text-headline-md text-on-surface font-bold">
                            {cliente ? "Editar Cliente" : "Nuevo Cliente"}
                        </h3>
                        <p className="text-[12px] text-on-surface-variant">
                            {cliente ? "Actualiza los datos del cliente." : "Ingresa los datos del nuevo cliente."}
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

                {/* Error Banner */}
                {error && (
                    <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-xs font-medium flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">error</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-on-surface-variant">
                            Nombre Completo *
                        </label>
                        <input
                            type="text"
                            placeholder="Ej: Juan Pérez"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            disabled={loading}
                            className="px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary w-full text-sm outline-none shadow-xs"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-on-surface-variant">
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            placeholder="juan.perez@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            className="px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary w-full text-sm outline-none shadow-xs"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-on-surface-variant">
                            Teléfono
                        </label>
                        <input
                            type="text"
                            placeholder="+56 9 1234 5678"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                            disabled={loading}
                            className="px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary w-full text-sm outline-none shadow-xs"
                        />
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant/60 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 border border-outline-variant rounded-lg text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:bg-primary/90 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                                    <span>Guardando...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[18px]">save</span>
                                    <span>Guardar</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
