
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

type TopbarProps = {
    onMenuClick?: () => void;
};

export default function Topbar({ onMenuClick }: TopbarProps) {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await signOut();
            navigate("/");
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

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

                <h2 className="font-headline-md text-base sm:text-headline-md font-semibold text-on-surface truncate">
                    Panel de Gestión de Parcelas
                </h2>
            </div>

            <div className="flex items-center gap-sm sm:gap-md shrink-0">
                <button className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors relative cursor-pointer">
                    <span className="material-symbols-outlined text-[22px]">notifications</span>
                    <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
                </button>

                <div className="h-6 sm:h-8 w-px bg-outline-variant mx-1 sm:mx-2"></div>

                {/* Contenedor relativo para posicionar el dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-xs sm:gap-sm hover:bg-surface-container-low transition-colors p-1 pr-2 sm:pr-3 rounded-full cursor-pointer"
                    >
                        <img
                            alt={user?.user_metadata?.full_name || "Avatar del Administrador"}
                            className="w-8 h-8 rounded-full object-cover shadow-sm bg-surface-dim"
                            src={user?.user_metadata?.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuDEPFYWV-6_4FzgzFAPWAdkefGTSnW4N0KfRuK2YA4BEZpxsrrKstt2XV2tpcszhqGlri9nih469rBfSxDMQ9XFKqnYjy38ktTt-mFqbmkz3Rd8pIoPTDadin81b8s641e_ZNFZQ-ADJQq55nUop7_8Lm4qOdgGROlJvd1vMaNHRQ-MhYCUhnTD2hbMR1HiyR4HgcAT-ebURGXBbA13w9bs2JWYbH6LHARKghd7S84aHGQjmit5nYKY5Q"}
                        />
                        <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                            {isDropdownOpen ? "expand_less" : "expand_more"}
                        </span>
                    </button>

                    {/* Menú desplegable */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest border border-outline-variant rounded-md shadow-lg py-2 z-30">
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-3 cursor-pointer text-sm font-medium"
                            >
                                <span className="material-symbols-outlined text-[20px]">logout</span>
                                Cerrar sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}