import { useEffect, useState } from "react";
import {
    getUsuariosPermitidos,
    createUsuarioPermitido,
    updateUsuarioPermitido,
    deleteUsuarioPermitido
} from "../../services/api";
import { ADMIN_EMAILS_PREDETERMINADOS } from "../../types/auth";
import type { UsuarioPermitido, UserRole } from "../../types/auth";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ConfirmModal from "../../components/ui/ConfirmModal";

export default function Usuarios() {
    const { role } = useAuth();
    const [usuarios, setUsuarios] = useState<UsuarioPermitido[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Modal para agregar usuario
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [newNombre, setNewNombre] = useState("");
    const [newRol, setNewRol] = useState<UserRole>("user");
    const [saving, setSaving] = useState(false);

    // Modal para confirmación de eliminación
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; email: string } | null>(null);

    const fetchUsuarios = async () => {
        try {
            setLoading(true);
            const data = await getUsuariosPermitidos();
            setUsuarios(data);
        } catch {
            setErrorMsg("No se pudieron cargar los usuarios permitidos.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail.trim()) return;

        try {
            setSaving(true);
            setErrorMsg(null);
            setSuccessMsg(null);
            await createUsuarioPermitido({
                email: newEmail.trim().toLowerCase(),
                nombre: newNombre.trim() || undefined,
                rol: newRol,
                activo: true
            });
            setSuccessMsg(`Usuario ${newEmail} autorizado correctamente.`);
            setIsModalOpen(false);
            setNewEmail("");
            setNewNombre("");
            setNewRol("user");
            fetchUsuarios();
        } catch {
            setErrorMsg("No se pudo guardar el usuario autorizado.");
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActivo = async (user: UsuarioPermitido) => {
        if (ADMIN_EMAILS_PREDETERMINADOS.includes(user.email.toLowerCase())) {
            setErrorMsg("Los administradores principales predeterminados no pueden ser desactivados.");
            return;
        }

        try {
            setErrorMsg(null);
            const updated = await updateUsuarioPermitido(user.id, { activo: !user.activo });
            setUsuarios(prev => prev.map(u => u.id === user.id ? updated : u));
            setSuccessMsg(`Estado actualizado para ${user.email}`);
        } catch {
            setErrorMsg("No se pudo cambiar el estado del usuario.");
        }
    };

    const handleToggleRol = async (user: UsuarioPermitido) => {
        if (ADMIN_EMAILS_PREDETERMINADOS.includes(user.email.toLowerCase())) {
            setErrorMsg("Los administradores principales predeterminados no pueden ser cambiados de rol.");
            return;
        }

        try {
            setErrorMsg(null);
            const nextRol: UserRole = user.rol === "admin" ? "user" : "admin";
            const updated = await updateUsuarioPermitido(user.id, { rol: nextRol });
            setUsuarios(prev => prev.map(u => u.id === user.id ? updated : u));
            setSuccessMsg(`Rol cambiado a ${nextRol === 'admin' ? 'Administrador' : 'Usuario'} para ${user.email}`);
        } catch {
            setErrorMsg("No se pudo actualizar el rol del usuario.");
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        const { id, email } = deleteTarget;

        try {
            setErrorMsg(null);
            await deleteUsuarioPermitido(id);
            setUsuarios(prev => prev.filter(u => u.id !== id));
            setSuccessMsg(`Acceso eliminado para ${email}`);
        } catch {
            setErrorMsg("No se pudo eliminar el usuario.");
        } finally {
            setDeleteTarget(null);
        }
    };

    const filteredUsuarios = usuarios.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.nombre && u.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (role !== "admin") {
        return (
            <DashboardLayout>
                <div className="p-6 text-center text-error">
                    <span className="material-symbols-outlined text-[48px] mb-2">lock</span>
                    <h2 className="text-lg font-bold">Acceso Restringido</h2>
                    <p className="text-sm text-on-surface-variant">Solo los administradores pueden gestionar usuarios autorizados.</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header de la sección */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-on-surface flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[28px]">admin_panel_settings</span>
                            Usuarios Permitidos
                        </h1>
                        <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
                            Administra qué correos electrónicos tienen acceso a la plataforma y aprueba solicitudes pendientes.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-on-primary font-medium text-xs sm:text-sm shadow-xs hover:bg-primary/90 transition-all cursor-pointer shrink-0"
                    >
                        <span className="material-symbols-outlined text-[18px]">person_add</span>
                        <span>Autorizar Usuario</span>
                    </button>
                </div>

                {/* Alertas de la pantalla */}
                {errorMsg && (
                    <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-xs font-medium flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">error</span>
                            <span>{errorMsg}</span>
                        </div>
                        <button onClick={() => setErrorMsg(null)} className="cursor-pointer hover:opacity-70">
                            <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                    </div>
                )}

                {successMsg && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-medium flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                            <span>{successMsg}</span>
                        </div>
                        <button onClick={() => setSuccessMsg(null)} className="cursor-pointer hover:opacity-70">
                            <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                    </div>
                )}

                {/* Búsqueda y Tabla */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 sm:p-6 shadow-xs space-y-4">
                    <div className="relative max-w-sm">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[20px]">
                            search
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar por correo o nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-outline-variant bg-surface-bright text-on-surface text-xs sm:text-sm focus:outline-none focus:border-primary"
                        />
                    </div>

                    {loading ? (
                        <div className="py-12 flex justify-center items-center">
                            <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[650px]">
                                <thead>
                                    <tr className="border-b border-outline-variant text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider bg-surface-container-low/50">
                                        <th className="py-3 px-4">Correo Electrónico</th>
                                        <th className="py-3 px-4">Nombre / Etiqueta</th>
                                        <th className="py-3 px-4 text-center">Rol</th>
                                        <th className="py-3 px-4 text-center">Estado</th>
                                        <th className="py-3 px-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant/40 text-xs sm:text-sm">
                                    {filteredUsuarios.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-on-surface-variant text-xs">
                                                No se encontraron usuarios registrados.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsuarios.map((u) => {
                                            const isProtected = ADMIN_EMAILS_PREDETERMINADOS.includes(u.email.toLowerCase());
                                            return (
                                                <tr key={u.id} className={`hover:bg-surface-container-low/30 transition-colors ${!u.activo ? 'bg-amber-500/5' : ''}`}>
                                                    <td className="py-3 px-4 font-medium text-on-surface">
                                                        <div className="flex items-center gap-2">
                                                            <span>{u.email}</span>
                                                            {isProtected && (
                                                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-600 font-bold border border-purple-500/20" title="Super Administrador Inmutable">
                                                                    Protegido
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-on-surface-variant">
                                                        {u.nombre || "—"}
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        {isProtected ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 border border-purple-500/20">
                                                                <span className="material-symbols-outlined text-[14px]">shield</span>
                                                                <span>Admin Principal</span>
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleToggleRol(u)}
                                                                title="Clic para cambiar rol"
                                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                                                                    u.rol === "admin"
                                                                        ? "bg-purple-500/10 text-purple-600 border border-purple-500/20 hover:bg-purple-500/20"
                                                                        : "bg-blue-500/10 text-blue-600 border border-blue-500/20 hover:bg-blue-500/20"
                                                                }`}
                                                            >
                                                                <span className="material-symbols-outlined text-[14px]">
                                                                    {u.rol === "admin" ? "verified_user" : "person"}
                                                                </span>
                                                                <span>{u.rol === "admin" ? "Administrador" : "Usuario"}</span>
                                                            </button>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        {isProtected ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                                                <span>Autorizado</span>
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleToggleActivo(u)}
                                                                title={u.activo ? "Clic para desactivar" : "Clic para autorizar usuario"}
                                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                                                                    u.activo
                                                                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20"
                                                                        : "bg-amber-500/15 text-amber-700 border border-amber-500/30 hover:bg-amber-500/25 animate-pulse"
                                                                }`}
                                                            >
                                                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                                                <span>{u.activo ? "Autorizado" : "Pendiente (Autorizar)"}</span>
                                                            </button>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        {!isProtected && (
                                                            <button
                                                                onClick={() => setDeleteTarget({ id: u.id, email: u.email })}
                                                                className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors cursor-pointer"
                                                                title="Eliminar acceso"
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Modal para Agregar Usuario */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
                        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
                            <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
                                <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">person_add</span>
                                    Autorizar Nuevo Usuario
                                </h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-on-surface-variant hover:text-on-surface cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[20px]">close</span>
                                </button>
                            </div>

                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-on-surface-variant mb-1">
                                        Correo Electrónico *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="usuario@ejemplo.com"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-bright text-on-surface text-sm focus:outline-none focus:border-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-on-surface-variant mb-1">
                                        Nombre o Descripción (Opcional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Juan Pérez - Vendedor"
                                        value={newNombre}
                                        onChange={(e) => setNewNombre(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-bright text-on-surface text-sm focus:outline-none focus:border-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-on-surface-variant mb-1">
                                        Rol asignado
                                    </label>
                                    <select
                                        value={newRol}
                                        onChange={(e) => setNewRol(e.target.value as UserRole)}
                                        className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-bright text-on-surface text-sm focus:outline-none focus:border-primary cursor-pointer"
                                    >
                                        <option value="user">Usuario (Estándar)</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/60">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 rounded-lg border border-outline-variant text-xs font-medium text-on-surface hover:bg-surface-container-low cursor-pointer"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-medium shadow-xs hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
                                    >
                                        {saving ? "Guardando..." : "Autorizar Correo"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal de confirmación para eliminar */}
                <ConfirmModal
                    isOpen={deleteTarget !== null}
                    title="Eliminar permiso de acceso"
                    message={`¿Estás seguro de eliminar el acceso para ${deleteTarget?.email}? El usuario no podrá ingresar hasta ser re-autorizado.`}
                    confirmText="Eliminar acceso"
                    cancelText="Cancelar"
                    isDanger={true}
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            </div>
        </DashboardLayout>
    );
}
