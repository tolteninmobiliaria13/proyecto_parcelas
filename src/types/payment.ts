export type PaymentStatus = 'paid' | 'overdue' | 'pending' | 'none';

export interface MonthlyPayment {
  id?: string;
  month: string;
  year: number;
  status: PaymentStatus;
  amount: number;
  dueDate?: string;
  paidDate?: string;
  receiptNumber?: string;
  daysOverdue?: number;
}

export interface LotPaymentMatrix {
  id: string;
  lotNumber: string;
  clientName: string;
  project: string;
  paidMonths: number;
  overdueMonths: number;
  totalMonths: number;
  installmentAmount: number;
  payments: MonthlyPayment[];
}