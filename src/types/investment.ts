import type { InvestmentPlanStatus, InvestmentStatus } from "./enums";
import type { DecimalString, IsoDateString } from "./api";

export type InvestmentPlanRecord = {
  id: string;
  name: string;
  description?: string | null;
  minAmount: DecimalString;
  maxAmount?: DecimalString | null;
  durationDays: number;
  returnPercentage: DecimalString;
  assetsIncluded?: string | null;
  status?: InvestmentPlanStatus;
  sortOrder?: number;
};

export type InvestmentRecord = {
  id: string;
  status: InvestmentStatus;
  principal: DecimalString;
  currentValue: DecimalString;
  profit: DecimalString;
  performancePct: DecimalString;
  startDate: IsoDateString;
  maturityDate: IsoDateString;
  maturedAt?: IsoDateString | null;
  plan: {
    id: string;
    name: string;
    durationDays: number;
    returnPercentage: DecimalString;
  } | null;
};

export type InvestmentsListResponse = {
  investments: InvestmentRecord[];
  plans: InvestmentPlanRecord[];
};

export type InvestmentPurchaseResponse = {
  message: string;
  investment: {
    id: string;
    status: InvestmentStatus;
    principal: DecimalString;
    currentValue: DecimalString;
    profit: DecimalString;
    maturityDate: IsoDateString;
    planName: string;
  };
};
