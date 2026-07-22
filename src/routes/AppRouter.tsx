import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/login/Login";
import DashboardPage from "../pages/dashboard/Dashboardpage";
import ParcelasPage from "../pages/parcelas/ParcelasPage";
import ClientesPage from "../pages/clientes/ClientesPage";
import VencimientosPage from "../pages/vencimientos/VencimientosPage";
import ProtectedRoute from "./ProtectedRoute";


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
                        path="/clientes"
                        element={<ClientesPage />}
                    />

                    <Route
                        path="/vencimientos"
                        element={<VencimientosPage />}
                    />
                </Route>


            </Routes>
        </BrowserRouter>
    );
}