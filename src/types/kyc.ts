import type { KycDocumentType, KycStatus } from "./enums";
import type { IsoDateString } from "./api";

export type KycDocumentRecord = {
  id: string;
  type: KycDocumentType;
  fileName: string;
  fileUrl: string;
  mimeType?: string | null;
  size?: number | null;
  uploadedAt: IsoDateString;
};

export type KycRecord = {
  status: KycStatus;
  fullName?: string | null;
  dateOfBirth?: IsoDateString | null;
  nationality?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  postalCode?: string | null;
  phoneNumber?: string | null;
  submittedAt?: IsoDateString | null;
  reviewedAt?: IsoDateString | null;
  rejectionReason?: string | null;
  documents?: KycDocumentRecord[];
};

export type KycMeResponse = {
  kyc: KycRecord | { status: "NOT_SUBMITTED" };
};

export type KycSubmitResponse = {
  message: string;
  status: KycStatus;
};

export type AdminKycListItem = KycRecord & {
  id: string;
  userId: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
};
