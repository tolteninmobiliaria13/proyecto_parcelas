import { useState, useEffect } from "react";
import { updateParcela, getSubdivisiones } from "../../services/api";
import type { Parcela } from "../../types/parcela";
import type { Subdivision } from "../../services/api";

type EditarParcelaModalProps = {
    isOpen: boolean;
    parcela: Parcela | null;
    onClose: () => void;
    onSuccess: () => void;
};

export default function EditarParcelaModal({
    isOpen,
    parcela,
    onClose,
    onSuccess,
}: EditarParcelaModalProps) {
    const [formData, setFormData] = useState({
        numero_lote: "",
        numero_rol: "",
        subdivision: "",
        precio_base: "",
        estado: "disponible",
    });

    const [subdivisionesList, setSubdivisionesList] = useState<Subdivision[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            getSubdivisiones()
                .then((data) => {
                    setSubdivisionesList(data);
                })
                .catch((err) => {
                    console.error("Error al obtener subdivisiones:", err);
                });
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && parcela) {
            setFormData({
                numero_lote: parcela.id || "",
                numero_rol: parcela.escritura || "",
                subdivision: parcela.subdivision || "",
                precio_base: String(parcela.precioVenta),
                estado: parcela.estado || "disponible",
            });
            setError(null);
        }
    }, [isOpen, parcela]);

    if (!isOpen || !parcela) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!formData.numero_lote.trim()) {
            setError("El número de lote es obligatorio.");
            setLoading(false);
            return;
        }
        if (!formData.subdivision.trim()) {
            setError("La subdivisión/proyecto es obligatoria.");
            setLoading(false);
            return;
        }
        if (!formData.precio_base || Number(formData.precio_base) <= 0) {
            setError("El precio de venta debe ser mayor a 0.");
            setLoading(false);
            return;
        }

        try {
            await updateParcela(parcela.id, {
                numero_lote: formData.numero_lote.trim(),
                numero_rol: formData.numero_rol.trim() || null,
                subdivision: formData.subdivision.trim(),
                precio_base: Number(formData.precio_base),
                estado: formData.estado,
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Error al actualizar parcela:", err);
            setError(err.response?.data?.message || "Ocurrió un error al guardar los cambios de la parcela.");
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
                            Editar Parcela
                        </h3>
                        <p className="text-[12px] text-on-surface-variant">
                            Modifica los atributos físicos de la parcela: <span className="font-semibold text-primary">{parcela.id}</span>
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
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-on-surface-variant">Número de Lote *</label>
                            <input
                                type="text"
                                name="numero_lote"
                                value={formData.numero_lote}
                                onChange={handleChange}
                                disabled={loading}
                                className="px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary w-full text-sm outline-none shadow-xs"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-on-surface-variant">Número de ROL</label>
                            <input
                                type="text"
                                name="numero_rol"
                                value={formData.numero_rol}
                                onChange={handleChange}
                                disabled={loading}
                                className="px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary w-full text-sm outline-none shadow-xs"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-on-surface-variant">Subdivisión / Proyecto *</label>
                        {subdivisionesList.length > 0 ? (
                            <select
                                name="subdivision"
                                value={formData.subdivision}
                                onChange={handleChange}
                                disabled={loading}
                                className="px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary w-full text-sm outline-none shadow-xs cursor-pointer"
                                required
                            >
                                {subdivisionesList.map((sub) => (
                                    <option key={sub.id} value={sub.nombre}>
                                        {sub.numero ? `Loteo N° ${sub.numero} - ${sub.nombre}` : sub.nombre}
                                    </option>
                                ))}
                                {formData.subdivision && !subdivisionesList.some(s => s.nombre === formData.subdivision) && (
                                    <option value={formData.subdivision}>{formData.subdivision}</option>
                                )}
                            </select>
                        ) : (
                            <input
                                type="text"
                                name="subdivision"
                                value={formData.subdivision}
                                onChange={handleChange}
                                disabled={loading}
                                className="px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary w-full text-sm outline-none shadow-xs"
                                required
                            />
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-on-surface-variant">Precio Base (CLP) *</label>
                        <input
                            type="number"
                            name="precio_base"
                            value={formData.precio_base}
                            onChange={handleChange}
                            disabled={loading}
                            className="px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary w-full text-sm outline-none shadow-xs"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-on-surface-variant">Estado de Venta</label>
                        <select
                            name="estado"
                            value={formData.estado}
                            onChange={handleChange}
                            disabled={loading}
                            className="px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary w-full text-sm outline-none shadow-xs"
                        >
                            <option value="disponible">Disponible</option>
                            <option value="reservada">Reservada</option>
                            <option value="vendida">Vendida</option>
                        </select>
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
                                    <span>Guardar Cambios</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
