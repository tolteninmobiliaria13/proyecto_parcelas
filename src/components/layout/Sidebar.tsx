import { useNavigate } from "react-router-dom";
import { menuItems } from "../../data/menu";
import NavItem from "../ui/NavItem";

export default function Sidebar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Aquí puedes agregar la lógica para limpiar tokens o estado global si es necesario
        navigate("/");
    };

    return (
        <nav className="fixed left-0 top-0 h-full w-[260px] bg-primary text-on-primary border-r border-outline-variant shadow-sm flex flex-col p-lg gap-xl z-20">
            <div className="flex items-center gap-sm">
                <div>
                    <h1 className="font-headline-md text-headline-md font-bold text-on-primary truncate">Inmobiliaria Toltén</h1>
                </div>
            </div>

            <ul className="flex flex-col gap-sm mt-md font-body-md text-body-md">
                {menuItems.map((item) => (
                    <li key={item.path}>
                        <NavItem
                            title={item.title}
                            path={item.path}
                            icon={item.icon}
                        />
                    </li>
                ))}
            </ul>

            {/* Contenedor del botón de Cerrar Sesión empujado hacia abajo con mt-auto */}
            <div className="mt-auto border-t border-outline-variant/30 pt-4">
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full gap-4 px-4 py-3 rounded-md hover:bg-white/10 transition-colors font-body-md text-on-primary"
                >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    <span>Cerrar sesión</span>
                </button>
            </div>
        </nav>
    );
}