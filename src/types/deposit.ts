import type { DepositMethod, DepositStatus } from "./enums";
import type { DecimalString, IsoDateString } from "./api";

export type CryptoSummary = {
  id?: string;
  symbol: string;
  name: string;
};

export type NetworkSummary = {
  id?: string;
  name: string;
  chainId?: string | null;
};

export type DepositRecord = {
  id: string;
  method: DepositMethod;
  status: DepositStatus;
  amount: DecimalString;
  walletAddress: string | null;
  proofUrl: string | null;
  paymentReference: string | null;
  adminNote?: string | null;
  reviewedAt?: IsoDateString | null;
  reviewedById?: string | null;
  createdAt: IsoDateString;
  cryptocurrency?: CryptoSummary;
  network?: NetworkSummary | null;
};

export type DepositUserSummary = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type AdminDepositRecord = DepositRecord & {
  user: DepositUserSummary;
};

export type ManualDepositConfig = {
  id: string;
  cryptocurrencyId: string;
  networkId: string;
  walletAddress: string;
  qrCodeUrl: string | null;
  warningMessage: string | null;
  cryptocurrency: CryptoSummary;
  network: NetworkSummary;
};

export type AutomaticDepositConfig = {
  id: string;
  cryptocurrencyId: string;
  networkId: string | null;
  paymentUrl: string;
  walletAddress: string | null;
  qrCodeUrl: string | null;
  warningMessage: string | null;
  cryptocurrency: CryptoSummary;
  network: NetworkSummary | null;
};

export type DepositOptionsResponse = {
  cryptocurrencies: Array<{
    id: string;
    symbol: string;
    name: string;
    networks: NetworkSummary[];
  }>;
  manual: ManualDepositConfig[];
  automatic: AutomaticDepositConfig[];
};

export type ManualDepositResponse = {
  message: string;
  deposit: DepositRecord;
};

export type AutomaticInitiateResponse = {
  message: string;
  depositId: string;
  paymentUrl: string;
  returnHint: string;
  amount: DecimalString;
  walletAddress: string | null;
  warningMessage: string | null;
  cryptocurrency: CryptoSummary;
  network: NetworkSummary | null;
};

export type AutomaticProofResponse = {
  message: string;
  deposit: DepositRecord;
};

export type DepositListResponse = {
  deposits: DepositRecord[];
};

export type AdminDepositListResponse = {
  deposits: AdminDepositRecord[];
};

export type LedgerTransactionSummary = {
  id: string;
  reference: string;
  balanceBefore: DecimalString;
  balanceAfter: DecimalString;
  availableBalance?: DecimalString;
  investedBalance?: DecimalString;
};

export type AdminDepositApproveResponse = {
  message: string;
  deposit: {
    id: string;
    status: DepositStatus;
    amount: DecimalString;
    reviewedAt?: IsoDateString | null;
  };
  transaction: LedgerTransactionSummary;
};

export type AdminDepositDeclineResponse = {
  message: string;
  deposit: {
    id: string;
    status: DepositStatus;
    amount: DecimalString;
    adminNote?: string | null;
    reviewedAt?: IsoDateString | null;
  };
};
