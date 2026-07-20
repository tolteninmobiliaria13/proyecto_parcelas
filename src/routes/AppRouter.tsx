import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/login/Login";
import DashboardPage from "../pages/dashboard/Dashboardpage";
import ParcelasPage from "../pages/parcelas/ParcelasPage";
import VencimientosPage from "../pages/vencimientos/VencimientosPage";


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
                    path="/vencimientos"
                    element={<VencimientosPage />}
                />

            </Routes>
        </BrowserRouter>
    );
}