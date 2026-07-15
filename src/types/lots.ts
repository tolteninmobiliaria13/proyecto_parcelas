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

    lastPaymentDate?: string;

    paymentMethod?: string;
}