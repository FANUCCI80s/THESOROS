import type { WithdrawalStatus } from "./enums";
import type { DecimalString, IsoDateString } from "./api";
import type { CryptoSummary, NetworkSummary } from "./deposit";

export type WithdrawalRecord = {
  id: string;
  status: WithdrawalStatus;
  amount: DecimalString;
  destinationAddress: string;
  adminNote?: string | null;
  txHash?: string | null;
  reviewedAt?: IsoDateString | null;
  createdAt: IsoDateString;
  cryptocurrency?: CryptoSummary;
  network?: NetworkSummary | null;
};

export type WithdrawalListResponse = {
  withdrawals: WithdrawalRecord[];
};

export type WithdrawalCreateResponse = {
  message: string;
  withdrawal: {
    id: string;
    status: WithdrawalStatus;
    amount: DecimalString;
  };
};

export type AdminWithdrawalRecord = WithdrawalRecord & {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
};
