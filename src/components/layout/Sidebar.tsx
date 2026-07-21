import { useNavigate } from "react-router-dom";
import { menuItems } from "../../data/menu";
import NavItem from "../ui/NavItem";
import { useAuth } from "../../context/AuthContext";

type SidebarProps = {
    isOpen?: boolean;
    onClose?: () => void;
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const navigate = useNavigate();
    const { signOut } = useAuth();

    const handleLogout = async () => {
        if (onClose) onClose();
        try {
            await signOut();
            navigate("/");
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    return (
        <>
            {/* Backdrop overlay para pantallas móviles */}
            {isOpen && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 bg-black/50 backdrop-blur-xs z-30 lg:hidden transition-opacity"
                />
            )}

            <nav
                className={`fixed left-0 top-0 h-full w-[260px] bg-primary text-on-primary border-r border-outline-variant shadow-lg flex flex-col p-lg gap-xl z-40 transition-transform duration-300 ease-in-out ${
                    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                }`}
            >
                <div className="flex items-center justify-between gap-sm">
                    <h1 className="font-headline-md text-headline-md font-bold text-on-primary truncate">
                        Inmobiliaria Toltén
                    </h1>
                    {/* Botón para cerrar en pantallas pequeñas */}
                    <button
                        onClick={onClose}
                        className="lg:hidden p-1 rounded-lg hover:bg-white/10 text-on-primary transition-colors cursor-pointer"
                        aria-label="Cerrar menú"
                    >
                        <span className="material-symbols-outlined text-[24px]">close</span>
                    </button>
                </div>

                <ul className="flex flex-col gap-sm mt-md font-body-md text-body-md">
                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <NavItem
                                title={item.title}
                                path={item.path}
                                icon={item.icon}
                                onClick={onClose}
                            />
                        </li>
                    ))}
                </ul>

                {/* Contenedor del botón de Cerrar Sesión empujado hacia abajo con mt-auto */}
                <div className="mt-auto border-t border-outline-variant/30 pt-4">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full gap-4 px-4 py-3 rounded-md hover:bg-white/10 transition-colors font-body-md text-on-primary cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                        <span>Cerrar sesión</span>
                    </button>
                </div>
            </nav>
        </>
    );
}