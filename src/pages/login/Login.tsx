import { useNavigate } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();

    /* al conectar supabase reemplazar por el login de google */
    const handleLogin = () => {
        navigate("/dashboard");
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-surface-bright text-on-surface antialiased p-4 sm:p-md overflow-hidden">
            {/* Contenedor principal con fondo decorativo de resplandor */}
            <div className="relative w-full max-w-md">
                {/* Glow decorativo de fondo */}
                <div className="absolute -left-12 -top-12 sm:-left-16 sm:-top-16 w-36 sm:w-48 h-36 sm:h-48 bg-primary-fixed/30 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute -right-12 -bottom-12 sm:-right-16 sm:-bottom-16 w-36 sm:w-48 h-36 sm:h-48 bg-secondary-fixed/30 rounded-full blur-2xl pointer-events-none"></div>

                {/* Tarjeta de Login */}
                <section className="relative bg-surface-container-lowest border border-outline-variant rounded-xl p-6 sm:p-xl shadow-lg flex flex-col items-center z-10">
                    {/* Icono de la marca */}
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6 sm:mb-lg shrink-0">
                        <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            real_estate_agent
                        </span>
                    </div>

                    <h1 className="font-headline-lg text-xl sm:text-headline-lg font-bold text-center text-on-surface mb-xs">
                        Inmobiliaria Toltén
                    </h1>

                    <p className="font-body-md text-xs sm:text-body-md text-on-surface-variant/80 text-center mb-6 sm:mb-xl">
                        Inicia sesión para acceder al panel de parcelas.
                    </p>

                    {/* Botón de Google */}
                    <button
                        onClick={handleLogin}
                        className="w-full flex items-center justify-center rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-4 py-3 sm:py-sm font-label-md text-sm text-on-surface shadow-sm transition-all duration-200 hover:bg-surface-container-low hover:border-outline cursor-pointer"
                    >
                        {/* Icono oficial de Google */}
                        <svg className="w-5 h-5 mr-3 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                        </svg>
                        <span>Continuar con Google</span>
                    </button>

                </section>
            </div>
        </main>
    );
}