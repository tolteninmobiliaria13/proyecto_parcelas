import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "../services/supabase";
import type { User, Session } from "@supabase/supabase-js";
import { checkUserPermission } from "../services/api";
import type { UserRole } from "../types/auth";
import axios from "axios";

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
    const lastCheckedEmailRef = useRef<string | null>(null);

    const safeSignOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (e) {
            console.warn("Aviso al cerrar sesión en Supabase:", e);
        }
    };

    const handleUserSession = async (currentSession: Session | null) => {
        setSession(currentSession);
        const currentUser = currentSession?.user ?? null;

        if (currentUser && currentUser.email) {
            if (lastCheckedEmailRef.current === currentUser.email && isAuthorized) {
                setLoading(false);
                return;
            }

            try {
                lastCheckedEmailRef.current = currentUser.email;
                const check = await checkUserPermission(currentUser.email);
                
                if (lastCheckedEmailRef.current !== currentUser.email) {
                    return;
                }

                if (check.is_authorized) {
                    setUser(currentUser);
                    setRole((check.rol as UserRole) || "user");
                    setIsAuthorized(true);
                    setAuthError(null);
                } else {
                    await safeSignOut();
                    setUser(null);
                    setRole(null);
                    setIsAuthorized(false);
                    setAuthError(check.message || "Tu correo electrónico no está autorizado para acceder al sistema.");
                }
            } catch (err) {
                if (axios.isCancel(err)) {
                    return;
                }
                console.error("Error al validar autorización:", err);
                await safeSignOut();
                setUser(null);
                setRole(null);
                setIsAuthorized(false);
                setAuthError("No se pudo verificar el permiso de acceso con el servidor.");
            }
        } else {
            lastCheckedEmailRef.current = null;
            setUser(null);
            setRole(null);
            setIsAuthorized(false);
        }
        setLoading(false);
    };

    useEffect(() => {
        let isSubscribed = true;

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (isSubscribed) {
                handleUserSession(session);
            }
        });

        return () => {
            isSubscribed = false;
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
        await safeSignOut();
        setUser(null);
        setSession(null);
        setRole(null);
        setIsAuthorized(false);
        setAuthError(null);
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
