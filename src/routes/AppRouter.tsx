import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/login/Login";
import DashboardPage from "../pages/dashboard/Dashboardpage";
import ParcelasPage from "../pages/parcelas/ParcelasPage";
import ClientesPage from "../pages/clientes/ClientesPage";
import PagosPage from "../pages/pagos/PagosPage";
import ContratosPage from "../pages/contratos/ContratosPage";
import PapeleraPage from "../pages/papelera/PapeleraPage";
import Usuarios from "../pages/usuarios/Usuarios";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route element={<ProtectedRoute />}>
                    <Route
                        path="/dashboard"
                        element={<DashboardPage />}
                    />

                    <Route
                        path="/parcelas"
                        element={<ParcelasPage />}
                    />

                    <Route
                        path="/contratos"
                        element={<ContratosPage />}
                    />

                    <Route
                        path="/clientes"
                        element={<ClientesPage />}
                    />

                    <Route
                        path="/pagos"
                        element={<PagosPage />}
                    />

                    <Route
                        path="/vencimientos"
                        element={<Navigate to="/pagos" replace />}
                    />

                    <Route
                        path="/papelera"
                        element={<PapeleraPage />}
                    />

                    <Route element={<AdminRoute />}>
                        <Route
                            path="/dashboard/usuarios"
                            element={<Usuarios />}
                        />
                    </Route>
                </Route>

            </Routes>
        </BrowserRouter>
    );
}