import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "../services/supabase";
import type { User, Session } from "@supabase/supabase-js";
import { checkUserPermission } from "../services/api";
import type { UserRole } from "../types/auth";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    role: UserRole | null;
    isAuthorized: boolean;
    authError: string | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [role, setRole] = useState<UserRole | null>(null);
    const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const handleUserSession = async (currentSession: Session | null) => {
        setSession(currentSession);
        const currentUser = currentSession?.user ?? null;

        if (currentUser && currentUser.email) {
            try {
                const check = await checkUserPermission(currentUser.email);
                if (check.is_authorized) {
                    setUser(currentUser);
                    setRole((check.rol as UserRole) || "user");
                    setIsAuthorized(true);
                    setAuthError(null);
                } else {
                    // Si el correo no está autorizado, cerramos sesión inmediatamente
                    await supabase.auth.signOut();
                    setUser(null);
                    setRole(null);
                    setIsAuthorized(false);
                    setAuthError(check.message || "Tu correo electrónico no está autorizado para acceder al sistema.");
                }
            } catch (err) {
                console.error("Error al validar autorización:", err);
                await supabase.auth.signOut();
                setUser(null);
                setRole(null);
                setIsAuthorized(false);
                setAuthError("No se pudo verificar el permiso de acceso con el servidor.");
            }
        } else {
            setUser(null);
            setRole(null);
            setIsAuthorized(false);
        }
        setLoading(false);
    };

    useEffect(() => {
        // Obtener la sesión inicial
        supabase.auth.getSession().then(({ data: { session } }) => {
            handleUserSession(session);
        }).catch((err) => {
            console.error("Error al obtener la sesión inicial:", err);
            setLoading(false);
        });

        // Suscribirse a cambios en el estado de autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            handleUserSession(session);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signInWithGoogle = async () => {
        setAuthError(null);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: window.location.origin + "/dashboard",
            },
        });
        if (error) throw error;
    };

    const signInWithEmail = async (email: string, password: string) => {
        setAuthError(null);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
    };

    const signUpWithEmail = async (email: string, password: string) => {
        setAuthError(null);
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });
        if (error) throw error;
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setRole(null);
        setIsAuthorized(false);
        setAuthError(null);
        if (error) throw error;
    };

    const clearAuthError = () => setAuthError(null);

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                role,
                isAuthorized,
                authError,
                loading,
                signInWithGoogle,
                signInWithEmail,
                signUpWithEmail,
                signOut,
                clearAuthError
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth debe usarse dentro de un AuthProvider");
    }
    return context;
}
