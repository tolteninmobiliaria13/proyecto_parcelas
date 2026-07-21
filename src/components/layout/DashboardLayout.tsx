import { useState } from "react";
import type { ReactNode } from "react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

type DashboardLayoutProps = {
    children: ReactNode;
};

export default function DashboardLayout({
    children,
}: DashboardLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-surface-bright text-on-surface antialiased">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex flex-1 flex-col lg:ml-[260px] min-w-0">
                <Topbar onMenuClick={() => setIsSidebarOpen(true)} />

                <main className="flex-1 mt-16 p-4 sm:p-6 lg:p-xl min-w-0 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}