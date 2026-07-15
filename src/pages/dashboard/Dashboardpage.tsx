import DashboardLayout from "../../components/layout/DashboardLayout";
import SummaryCardsGrid from "../../components/dashboard/cards/summaryCardsGrid";
import LotsTable from "../../components/dashboard/table/LotsTable";

export default function DashboardPage() {
    return (
        <DashboardLayout>
            <SummaryCardsGrid />
            <LotsTable />
        </DashboardLayout>
    );
}