import { dashboardStats } from "../../../data/dashboard";
import SummaryCard from "./SummaryCard";

export default function SummaryCardsGrid() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-lg mb-6 sm:mb-xl">
            {dashboardStats.map((stat, index) => (
                <SummaryCard 
                    key={index}
                    stat={stat} 
                />
            ))}
        </div>
    );
}
