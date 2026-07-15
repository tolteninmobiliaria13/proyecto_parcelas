import SearchBar from "../dashboard/search/SearchBar";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Topbar() {
    const navigate = useNavigate();
    /* al conectar supabase remplazar por el login de google*/
    const handleLogin = () => {
        navigate("/");
    }

    const [isDropdownOpen, setIsDropdownOpen] = useState(false)


    return (
        <header className="fixed top-0 right-0 w-[calc(100%-260px)] h-16 bg-surface-container-lowest text-primary border-b border-outline-variant flex justify-between items-center px-lg z-10">
            <div className="flex items-center gap-xl">
                <h2 className="font-headline-md text-headline-md font-semibold text-on-surface">Panel de Gestión de Parcelas</h2>
                <SearchBar />
            </div>

            <div className="flex items-center gap-md">
                <button className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors relative">
                    <span className="material-symbols-outlined">notifications</span>
                    <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
                </button>

                <div className="h-8 w-px bg-outline-variant mx-2"></div>

                {/* Contenedor relativo para posicionar el dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-sm hover:bg-surface-container-low transition-colors p-1 pr-3 rounded-full"
                    >
                        <img
                            alt="Avatar del Administrador"
                            className="w-8 h-8 rounded-full object-cover shadow-sm bg-surface-dim"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEPFYWV-6_4FzgzFAPWAdkefGTSnW4N0KfRuK2YA4BEZpxsrrKstt2XV2tpcszhqGlri9nih469rBfSxDMQ9XFKqnYjy38ktTt-mFqbmkz3Rd8pIoPTDadin81b8s641e_ZNFZQ-ADJQq55nUop7_8Lm4qOdgGROlJvd1vMaNHRQ-MhYCUhnTD2hbMR1HiyR4HgcAT-ebURGXBbA13w9bs2JWYbH6LHARKghd7S84aHGQjmit5nYKY5Q"
                        />
                        {/* Cambiamos el icono dependiendo del estado */}
                        <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                            {isDropdownOpen ? "expand_less" : "expand_more"}
                        </span>
                    </button>

                    {/* Menú desplegable */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest border border-outline-variant rounded-md shadow-lg py-2 z-20">
                            <button
                                onClick={handleLogin}
                                className="w-full text-left px-4 py-2 text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-3"
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