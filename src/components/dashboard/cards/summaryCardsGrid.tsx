import { dashboardStats } from "../../../data/dashboard";
import SummaryCard from "./SummaryCard";

export default function SummaryCardsGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg mb-xl">
            {dashboardStats.map((stat, index) => (
                <SummaryCard 
                    key={index}
                    stat={stat} 
                />
            ))}
        </div>
    );
}
