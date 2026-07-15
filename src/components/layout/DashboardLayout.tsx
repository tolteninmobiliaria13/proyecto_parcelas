import type { ReactNode } from "react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

type DashboardLayoutProps = {
    children: ReactNode;
};

export default function DashboardLayout({
    children,
}: DashboardLayoutProps) {
    return (
        <div className="flex min-h-screen bg-surface-bright text-on-surface antialiased">
            <Sidebar />

            <div className="ml-[260px] flex flex-1 flex-col">
                <Topbar />

                <main className="flex-1 mt-16 p-xl">
                    {children}
                </main>
            </div>
        </div>
    );
}