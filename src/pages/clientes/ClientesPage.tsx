import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import NuevoClienteModal from "../../components/clientes/NuevoClienteModal";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { getClientes, deleteCliente } from "../../services/api";
import type { Cliente } from "../../services/api";

export default function ClientesPage() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteErrorMsg, setDeleteErrorMsg] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
    const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        setLoading(true);
        setError(null);
        getClientes()
            .then((data) => {
                setClientes(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error al obtener listado de clientes:", err);
                setError("No se pudieron cargar los clientes.");
                setLoading(false);
            });
    }, [refreshTrigger]);

    // Client filtering
    const filteredClientes = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        return clientes.filter((c) => {
            if (!query) return true;
            return (
                c.nombre_completo.toLowerCase().includes(query) ||
                (c.email && c.email.toLowerCase().includes(query)) ||
                (c.telefono && c.telefono.toLowerCase().includes(query))
            );
        });
    }, [clientes, searchQuery]);

    const confirmDeleteCliente = async () => {
        if (!clienteToDelete) return;
        const target = clienteToDelete;
        setClienteToDelete(null);
        setDeleteErrorMsg(null);

        try {
            await deleteCliente(target.id);
            setRefreshTrigger((prev) => prev + 1);
        } catch (err: any) {
            console.error("Error al eliminar cliente:", err);
            setDeleteErrorMsg(
                err.response?.data?.message ||
                `No se pudo eliminar a "${target.nombre_completo}". Podría tener parcelas o contratos vigentes asociados.`
            );
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-[1400px] mx-auto w-full flex flex-col gap-6 sm:gap-lg animate-fade-in">
                {/* Page Header & Actions */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h2 className="font-display text-2xl sm:text-display text-on-background font-bold">Listado de Clientes</h2>
                        <p className="font-body-md text-xs sm:text-body-md text-on-surface-variant mt-1">
                            Administración y registro general de propietarios del loteo.
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
                                placeholder="Buscar cliente por nombre..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary w-full shadow-sm transition-shadow font-body-md text-sm outline-none"
                            />
                        </div>
                        {/* Primary Action (New Client) */}
                        <button
                            onClick={() => {
                                setSelectedCliente(null);
                                setIsModalOpen(true);
                            }}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-data-tabular text-sm hover:bg-primary/90 shadow-sm transition-colors cursor-pointer whitespace-nowrap"
                        >
                            <span className="material-symbols-outlined text-[18px]">person_add</span>
                            Nuevo Cliente
                        </button>
                    </div>
                </div>

                {/* Error Banner en caso de fallo al eliminar */}
                {deleteErrorMsg && (
                    <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-xs sm:text-sm font-medium flex items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px] shrink-0">error</span>
                            <span>{deleteErrorMsg}</span>
                        </div>
                        <button
                            onClick={() => setDeleteErrorMsg(null)}
                            className="text-error hover:opacity-70 cursor-pointer p-1 rounded-md"
                        >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                    </div>
                )}

                {/* Table container */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="flex justify-between items-center p-4 border-b border-outline-variant bg-surface-container-low">
                        <h3 className="font-headline-md text-base text-on-surface font-semibold">Registro de Propietarios</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead className="bg-surface-container-low font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">
                                <tr className="text-center">
                                    <th className="py-3 px-6 font-semibold uppercase tracking-wider text-left border-r border-outline-variant sticky left-0 z-20 bg-surface-container-low min-w-[220px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]">Nombre Completo</th>
                                    <th className="py-3 px-6 font-semibold uppercase tracking-wider text-center border-r border-outline-variant">Email</th>
                                    <th className="py-3 px-6 font-semibold uppercase tracking-wider text-center border-r border-outline-variant">Teléfono</th>
                                    <th className="py-3 px-6 font-semibold uppercase tracking-wider text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="font-body-md text-sm text-on-surface divide-y divide-outline-variant">
                                {loading ? (
                                    Array(4).fill(null).map((_, i) => (
                                        <tr key={i} className="animate-pulse text-center">
                                            <td className="py-4 px-6 border-r border-outline-variant text-left sticky left-0 z-10 bg-surface-container-lowest shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]"><div className="h-5 bg-outline-variant/30 rounded w-44"></div></td>
                                            <td className="py-4 px-6 border-r border-outline-variant"><div className="h-5 bg-outline-variant/30 rounded w-36 mx-auto"></div></td>
                                            <td className="py-4 px-6 border-r border-outline-variant"><div className="h-5 bg-outline-variant/30 rounded w-28 mx-auto"></div></td>
                                            <td className="py-4 px-6"><div className="h-5 bg-outline-variant/30 rounded w-16 mx-auto"></div></td>
                                        </tr>
                                    ))
                                ) : error ? (
                                    <tr>
                                        <td colSpan={4} className="py-8 px-6 text-center text-error font-medium">{error}</td>
                                    </tr>
                                ) : filteredClientes.length > 0 ? (
                                    filteredClientes.map((c) => (
                                        <tr key={c.id} className="hover:bg-surface-container/40 transition-colors text-center group">
                                            <td className="py-4 px-6 border-r border-outline-variant text-left font-semibold text-primary sticky left-0 z-10 bg-surface-container-lowest group-hover:bg-surface-container/60 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">{c.nombre_completo}</td>
                                            <td className="py-4 px-6 border-r border-outline-variant text-on-surface-variant">{c.email || "No registrado"}</td>
                                            <td className="py-4 px-6 border-r border-outline-variant text-on-surface-variant font-mono">{c.telefono || "No registrado"}</td>
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedCliente(c);
                                                            setIsModalOpen(true);
                                                        }}
                                                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-primary/30 text-primary text-xs hover:bg-primary/10 transition-colors cursor-pointer font-medium"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">edit</span>
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => setClienteToDelete(c)}
                                                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-error/30 text-error text-xs hover:bg-error/10 transition-colors cursor-pointer font-medium"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">delete</span>
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="py-8 px-6 text-center text-on-surface-variant/70">No se encontraron clientes registrados.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Nuevo/Editar Cliente Modal */}
            <NuevoClienteModal
                isOpen={isModalOpen}
                cliente={selectedCliente}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedCliente(null);
                }}
                onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
            />

            {/* Confirmación para Eliminar Cliente */}
            <ConfirmModal
                isOpen={clienteToDelete !== null}
                title="Eliminar Cliente"
                message={`¿Estás seguro de que deseas eliminar al cliente "${clienteToDelete?.nombre_completo}"? Esta acción no se podrá deshacer.`}
                confirmText="Eliminar Cliente"
                cancelText="Cancelar"
                isDanger={true}
                onCancel={() => setClienteToDelete(null)}
                onConfirm={confirmDeleteCliente}
            />
        </DashboardLayout>
    );
}
