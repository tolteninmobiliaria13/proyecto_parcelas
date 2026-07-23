import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute() {
    const { user, role, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-surface-bright text-on-surface antialiased">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                    <p className="font-label-md text-on-surface-variant/80 animate-pulse text-sm">
                        Verificando permisos...
                    </p>
                </div>
            </div>
        );
    }

    if (!user || role !== "admin") {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
