
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getNotificationsSummary } from "../../services/api";
import type { NotificationsSummary } from "../../types/auth";

type TopbarProps = {
    onMenuClick?: () => void;
};

export default function Topbar({ onMenuClick }: TopbarProps) {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationsSummary | null>(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            const data = await getNotificationsSummary();
            setNotifications(data);

            // Si hay notificaciones activas y no han sido ignoradas en esta sesión, abrir el panel automáticamente
            const isDismissed = sessionStorage.getItem("notifications_dismissed") === "true";
            if (data && data.total_count > 0 && !isDismissed) {
                setIsNotificationsOpen(true);
            }
        };

        fetchNotifications();
        // Polling cada 30 segundos
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleIgnoreNotifications = () => {
        sessionStorage.setItem("notifications_dismissed", "true");
        setIsNotificationsOpen(false);
    };

    const handleLogout = async () => {
        try {
            await signOut();
            navigate("/");
        } catch {
            // Manejado silenciosamente
        }
    };

    // Iniciales para el avatar cuando no hay foto de Google
    const getInitials = () => {
        const name = user?.user_metadata?.full_name || user?.email || "U";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const hasAvatar = Boolean(user?.user_metadata?.avatar_url);

    return (
        <header className="fixed top-0 right-0 left-0 lg:left-[260px] h-16 bg-surface-container-lowest text-primary border-b border-outline-variant flex justify-between items-center px-4 sm:px-lg z-20 transition-all">
            <div className="flex items-center gap-2 sm:gap-xl min-w-0">
                {/* Botón menú para móvil */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 rounded-lg text-on-surface hover:bg-surface-container-low transition-colors shrink-0 cursor-pointer"
                    aria-label="Abrir menú"
                >
                    <span className="material-symbols-outlined text-[24px]">menu</span>
                </button>

                <Link
                    to="/dashboard"
                    className="font-headline-md text-base sm:text-headline-md font-semibold text-on-surface hover:text-primary transition-colors truncate cursor-pointer"
                    title="Ir a la página de Resumen"
                >
                    Panel de Gestión de Parcelas
                </Link>
            </div>

            <div className="flex items-center gap-sm sm:gap-md shrink-0">
                {/* Notificaciones */}
                <div className="relative">
                    <button
                        onClick={() => {
                            setIsNotificationsOpen(!isNotificationsOpen);
                            setIsDropdownOpen(false);
                        }}
                        className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors relative cursor-pointer"
                        title="Notificaciones"
                    >
                        <span className="material-symbols-outlined text-[22px]">notifications</span>
                        {notifications && notifications.total_count > 0 && (
                            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-error text-on-error text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                                {notifications.total_count}
                            </span>
                        )}
                    </button>

                    {/* Backdrop invisible para cerrar al hacer clic afuera */}
                    {isNotificationsOpen && (
                        <div
                            className="fixed inset-0 z-20"
                            onClick={() => setIsNotificationsOpen(false)}
                        />
                    )}

                    {/* Popover de Notificaciones */}
                    {isNotificationsOpen && (
                        <div className="fixed left-3 right-3 top-16 max-w-md mx-auto sm:absolute sm:top-auto sm:right-0 sm:left-auto sm:mt-2 sm:w-96 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl py-2 z-30 divide-y divide-outline-variant/40 animate-fade-in">
                            <div className="px-4 py-2.5 flex items-center justify-between">
                                <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[16px] text-primary">notifications_active</span>
                                    Notificaciones del Sistema
                                </h3>
                                <button
                                    onClick={handleIgnoreNotifications}
                                    className="text-[11px] font-medium px-2 py-1 rounded bg-surface-container-low hover:bg-surface-container text-on-surface-variant transition-colors flex items-center gap-1 cursor-pointer"
                                    title="Ignorar notificaciones por esta sesión"
                                >
                                    <span className="material-symbols-outlined text-[14px]">visibility_off</span>
                                    Ignorar
                                </button>
                            </div>

                            <div className="max-h-80 overflow-y-auto divide-y divide-outline-variant/20">
                                {!notifications || notifications.items.length === 0 ? (
                                    <div className="p-6 text-center text-xs text-on-surface-variant flex flex-col items-center gap-1">
                                        <span className="material-symbols-outlined text-[28px] text-emerald-500">check_circle</span>
                                        <span>No hay alertas ni notificaciones pendientes.</span>
                                    </div>
                                ) : (
                                    notifications.items.map((item) => {
                                        const isOverdue = item.tipo === "cuota_vencida";
                                        const isDueToday = item.tipo === "cuota_hoy";
                                        const isUserPending = item.tipo === "usuario_pendiente";

                                        let iconName = "event_upcoming";
                                        let iconStyles = "bg-error/10 text-error";
                                        let badgeBg = "bg-error/15 text-error";
                                        let badgeLabel = "Vencimiento";

                                        if (isUserPending) {
                                            iconName = "person_add";
                                            iconStyles = "bg-sky-500/10 text-sky-600 border border-sky-500/20";
                                            badgeBg = "bg-sky-500/15 text-sky-600";
                                            badgeLabel = "Solicitud";
                                        } else if (isOverdue) {
                                            iconName = "warning";
                                            iconStyles = "bg-error/10 text-error border border-error/20";
                                            badgeBg = "bg-error/15 text-error font-bold";
                                            badgeLabel = "Vencida";
                                        } else if (isDueToday) {
                                            iconName = "schedule";
                                            iconStyles = "bg-amber-500/10 text-amber-600 border border-amber-500/20";
                                            badgeBg = "bg-amber-500/15 text-amber-600 font-bold";
                                            badgeLabel = "Vence Hoy";
                                        }

                                        return (
                                            <Link
                                                key={item.id}
                                                to={item.link || "#"}
                                                onClick={() => setIsNotificationsOpen(false)}
                                                className="p-3 hover:bg-surface-container-low flex items-start gap-3 transition-colors block text-left"
                                            >
                                                <div className={`p-2 rounded-full shrink-0 ${iconStyles}`}>
                                                    <span className="material-symbols-outlined text-[18px]">
                                                        {iconName}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="text-xs font-bold text-on-surface truncate">{item.titulo}</p>
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] shrink-0 ${badgeBg}`}>
                                                            {badgeLabel}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-on-surface-variant line-clamp-2 mt-0.5">{item.descripcion}</p>
                                                    <span className="text-[10px] text-on-surface-variant/60 mt-1 block font-mono">{item.fecha}</span>
                                                </div>
                                            </Link>
                                        );
                                    })
                                )}
                            </div>

                            {notifications && notifications.items.length > 0 && (
                                <div className="px-4 py-2 flex justify-between items-center bg-surface-container-low/40">
                                    <span className="text-[10px] text-on-surface-variant font-medium">
                                        {notifications.total_count} alerta(s) {notifications.overdue_count ? `(${notifications.overdue_count} vencida/s)` : ''}
                                    </span>
                                    <button
                                        onClick={handleIgnoreNotifications}
                                        className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                                    >
                                        Entendido / Ignorar
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="h-6 sm:h-8 w-px bg-outline-variant mx-1 sm:mx-2"></div>

                {/* Dropdown de Perfil / Logout */}
                <div className="relative">
                    <button
                        onClick={() => {
                            setIsDropdownOpen(!isDropdownOpen);
                            setIsNotificationsOpen(false);
                        }}
                        className="flex items-center gap-xs sm:gap-sm hover:bg-surface-container-low transition-colors p-1 pr-2 sm:pr-3 rounded-full cursor-pointer"
                    >
                        {hasAvatar ? (
                            <img
                                alt={user?.user_metadata?.full_name || "Avatar"}
                                className="w-8 h-8 rounded-full object-cover shadow-xs bg-surface-dim"
                                src={user?.user_metadata?.avatar_url}
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center justify-center shadow-xs">
                                {getInitials()}
                            </div>
                        )}
                        <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                            {isDropdownOpen ? "expand_less" : "expand_more"}
                        </span>
                    </button>

                    {/* Menú desplegable */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-52 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg py-2 z-30">
                            <div className="px-4 py-2 border-b border-outline-variant/40 mb-1">
                                <p className="text-xs font-bold text-on-surface truncate">
                                    {user?.user_metadata?.full_name || user?.email}
                                </p>
                                <p className="text-[10px] text-on-surface-variant truncate">{user?.email}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-3 cursor-pointer text-xs font-medium"
                            >
                                <span className="material-symbols-outlined text-[18px]">logout</span>
                                Cerrar sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}