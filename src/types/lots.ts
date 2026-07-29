export interface Lot {
    id: string;

    lot: string;

    owner: string;

    salePrice: number;

    downPayment: number;

    balance: number;

    installmentCount: number;

    installmentValue: number;

    nextDueDate: string;

    status: "current" | "overdue";

    overdueCount?: number;

    overdueBalance?: number;

    lastPaymentDate?: string;

    paymentMethod?: string;
}