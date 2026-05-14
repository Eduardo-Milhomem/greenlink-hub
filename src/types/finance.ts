import { ID } from "./common";
import { BillingStatus } from "./contract";

export type FinancialCategoryType = "revenue" | "expense";

export interface Receivable {
  id: ID;
  description: string;
  customerId: string;
  contractId?: string;
  orderId?: string;
  categoryId?: string;
  costCenterId?: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  openAmount: number;
  status: BillingStatus;
  originType?: string;
  originId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payable {
  id: ID;
  description: string;
  supplierId?: string;
  categoryId?: string;
  costCenterId?: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  openAmount: number;
  status: BillingStatus;
  createdAt: string;
  updatedAt: string;
}
