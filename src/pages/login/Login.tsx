import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
    const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, authError, clearAuthError } = useAuth();
    const navigate = useNavigate();
    
    const [mode, setMode] = useState<"login" | "signup">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const activeError = authError || errorMsg;

    useEffect(() => {
        if (!loading && user) {
            navigate("/dashboard", { replace: true });
        }
    }, [user, loading, navigate]);

    const handleEmailAuth = async (e: FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setErrorMsg("Por favor, ingresa tu correo y contraseña.");
            return;
        }

        try {
            setSubmitting(true);
            setErrorMsg(null);
            setSuccessMsg(null);

            if (mode === "login") {
                await signInWithEmail(email, password);
            } else {
                await signUpWithEmail(email, password);
                setSuccessMsg("Cuenta creada exitosamente. Si se requiere confirmación, revisa tu correo.");
            }
        } catch (error: any) {
            console.error("Error de autenticación:", error);
            setErrorMsg(error.message || "Ocurrió un error al procesar tu solicitud.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setErrorMsg(null);
            setSuccessMsg(null);
            await signInWithGoogle();
        } catch (error: any) {
            console.error("Error al iniciar sesión con Google:", error);
            setErrorMsg("No se pudo iniciar sesión con Google. Por favor, intenta de nuevo.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-surface-bright text-on-surface antialiased">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                    <p className="font-label-md text-on-surface-variant/80 animate-pulse text-sm">
                        Verificando sesión...
                    </p>
                </div>
            </div>
        );
    }

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
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 sm:mb-6 shrink-0">
                        <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            real_estate_agent
                        </span>
                    </div>

                    <h1 className="font-headline-lg text-xl sm:text-headline-lg font-bold text-center text-on-surface mb-xs">
                        Inmobiliaria Toltén
                    </h1>

                    <p className="font-body-md text-xs sm:text-body-md text-on-surface-variant/80 text-center mb-6">
                        Inicia sesión para acceder al panel de parcelas.
                    </p>

                    {/* Selector Iniciar Sesión / Registro */}
                    <div className="w-full grid grid-cols-2 p-1 bg-surface-container-low rounded-lg mb-6 text-xs font-medium border border-outline-variant/40">
                        <button
                            type="button"
                            onClick={() => {
                                setMode("login");
                                setErrorMsg(null);
                                setSuccessMsg(null);
                            }}
                            className={`py-2 rounded-md transition-all ${
                                mode === "login"
                                    ? "bg-surface-container-lowest text-on-surface shadow-xs font-bold"
                                    : "text-on-surface-variant hover:text-on-surface"
                            }`}
                        >
                            Iniciar Sesión
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setMode("signup");
                                setErrorMsg(null);
                                setSuccessMsg(null);
                            }}
                            className={`py-2 rounded-md transition-all ${
                                mode === "signup"
                                    ? "bg-surface-container-lowest text-on-surface shadow-xs font-bold"
                                    : "text-on-surface-variant hover:text-on-surface"
                            }`}
                        >
                            Registrarse
                        </button>
                    </div>

                    {/* Mensaje de Error */}
                    {activeError && (
                        <div className="w-full mb-4 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-xs font-medium flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">error</span>
                                <span>{activeError}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setErrorMsg(null);
                                    clearAuthError();
                                }}
                                className="text-error hover:opacity-70 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                        </div>
                    )}

                    {/* Mensaje de Éxito */}
                    {successMsg && (
                        <div className="w-full mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-medium flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                            <span>{successMsg}</span>
                        </div>
                    )}

                    {/* Formulario de Email y Contraseña */}
                    <form onSubmit={handleEmailAuth} className="w-full flex flex-col gap-4">
                        <div>
                            <label className="block text-xs font-medium text-on-surface-variant mb-1.5">
                                Correo Electrónico
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@correo.com"
                                className="w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-surface-bright text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-on-surface-variant mb-1.5">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-surface-bright text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full mt-2 flex items-center justify-center rounded-lg bg-primary text-on-primary py-2.5 px-4 text-sm font-medium shadow-sm hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
                        >
                            {submitting ? (
                                <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin"></div>
                            ) : mode === "login" ? (
                                "Iniciar Sesión"
                            ) : (
                                "Crear Cuenta"
                            )}
                        </button>
                    </form>

                    {/* Separador */}
                    <div className="w-full my-5 flex items-center gap-3">
                        <div className="h-px flex-1 bg-outline-variant/60"></div>
                        <span className="text-[11px] text-on-surface-variant/60 uppercase tracking-wider font-semibold">
                            o continúa con
                        </span>
                        <div className="h-px flex-1 bg-outline-variant/60"></div>
                    </div>

                    {/* Botón de Google */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-4 py-2.5 font-label-md text-sm text-on-surface shadow-sm transition-all duration-200 hover:bg-surface-container-low hover:border-outline cursor-pointer"
                    >
                        {/* Icono oficial de Google */}
                        <svg className="w-5 h-5 mr-3 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                        </svg>
                        <span>Google</span>
                    </button>
                </section>
            </div>
        </main>
    );
}