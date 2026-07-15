import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/login/Login";
import DashboardPage from "../pages/dashboard/Dashboardpage";
import ParcelasPage from "../pages/parcelas/ParcelasPage";
import PagosPage from "../pages/pagos/PagosPage";
import VencimientosPage from "../pages/vencimientos/VencimientosPage";
import ConfiguracionPage from "../pages/configuracion/ConfiguracionPage";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/dashboard"
                    element={<DashboardPage />}
                />

                <Route
                    path="/parcelas"
                    element={<ParcelasPage />}
                />

                <Route
                    path="/pagos"
                    element={<PagosPage />}
                />

                <Route
                    path="/vencimientos"
                    element={<VencimientosPage />}
                />

                <Route
                    path="/configuracion"
                    element={<ConfiguracionPage />}
                />

            </Routes>
        </BrowserRouter>
    );
}