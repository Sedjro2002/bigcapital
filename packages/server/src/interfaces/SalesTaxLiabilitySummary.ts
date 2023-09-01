export interface SalesTaxLiabilitySummaryQuery {
  fromDate: Date;
  toDate: Date;
  basis: 'cash' | 'accrual';
}

export interface SalesTaxLiabilitySummaryAmount {
  amount: number;
  formattedAmount: string;
  currencyCode: string;
}

export interface SalesTaxLiabilitySummaryTotal {
  taxableAmount: SalesTaxLiabilitySummaryAmount;
  taxAmount: SalesTaxLiabilitySummaryAmount;
  collectedTaxAmount: SalesTaxLiabilitySummaryAmount;
}

export interface SalesTaxLiabilitySummaryRate {
  taxName: string;
  taxableAmount: SalesTaxLiabilitySummaryAmount;
  taxAmount: SalesTaxLiabilitySummaryAmount;
  taxPercentage: any;
  collectedTaxAmount: SalesTaxLiabilitySummaryAmount;
}

export enum SalesTaxLiabilitySummaryTableRowType {
  TaxRate = 'TaxRate',
  Total = 'Total',
}

export interface SalesTaxLiabilitySummaryReportData {
  taxRates: SalesTaxLiabilitySummaryRate[];
  total: SalesTaxLiabilitySummaryTotal;
}

export type SalesTaxLiabilitySummaryPayableById = Record<
  string,
  { taxRateId: number; credit: number; debit: number }
>;

export type SalesTaxLiabilitySummarySalesById = Record<
  string,
  { taxRateId: number; credit: number; debit: number }
>;
