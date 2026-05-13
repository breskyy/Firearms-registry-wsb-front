// API Types for EWeaponRegistry Backend

// ============================================================================
// ENUMS
// ============================================================================

export type UserRole = 'Citizen' | 'Shop' | 'WpaOfficer' | 'Admin';

export type PermitType = 'Sport' | 'Collection' | 'Protection' | 'Hunting' | 'Other';

export type PermitStatus = 'Active' | 'Suspended' | 'Revoked' | 'Expired';

export type PermitApplicationStatus =
  | 'Submitted'
  | 'UnderReview'
  | 'Approved'
  | 'Rejected'
  | 'RequiresCorrection';

export type PromiseApplicationStatus =
  | 'Submitted'
  | 'Paid'
  | 'UnderReview'
  | 'Approved'
  | 'Rejected'
  | 'RequiresCorrection';

export type PromiseStatus =
  | 'Draft'
  | 'Submitted'
  | 'Paid'
  | 'UnderReview'
  | 'Approved'
  | 'Rejected'
  | 'Active'
  | 'Used'
  | 'Expired';

export type PaymentStatus = 'Pending' | 'Paid' | 'Refunded' | 'Overdue';

export type FirearmCategory = 'A' | 'B' | 'C';

export type FirearmStatus = 'Registered' | 'Transferred' | 'Lost' | 'Archived';

export type TransferType = 'Sale' | 'Donation' | 'Inheritance' | 'AdministrativeCorrection';

export type TransferRequestStatus =
  | 'PendingAcceptance'
  | 'Accepted'
  | 'Rejected'
  | 'Cancelled'
  | 'Completed';

export type MedicalAlertType =
  | 'MedicalExamExpiring'
  | 'PsychologicalExamExpiring'
  | 'MedicalExamExpired'
  | 'PsychologicalExamExpired';

// ============================================================================
// AUTH
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    isActive: boolean;
  };
}

export interface UserDto {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

// ============================================================================
// CITIZEN
// ============================================================================

export interface CitizenProfileDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  peselMasked: string; // ostatnie 4 cyfry
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

// PERMITS
export interface PermitDto {
  id: string;
  permitNumber: string;
  permitType: PermitType;
  permitStatus: PermitStatus;
  issueDate: string;
  expiryDate: string | null;
  maxFirearms: number;
  usedSlots: number;
  availableSlots: number;
  medicalExamExpiryDate: string;
  psychologicalExamExpiryDate: string;
  isValid: boolean;
}

export interface PermitApplicationDto {
  id: string;
  applicationNumber: string;
  requestedPermitType: PermitType;
  reason: string;
  status: PermitApplicationStatus;
  submittedDate: string;
  reviewedDate: string | null;
  rejectionReason: string | null;
  correctionNotes: string | null;
}

export interface CreatePermitApplicationRequest {
  requestedPermitType: PermitType;
  reason: string;
}

// PROMISES
export interface PromiseDto {
  id: string;
  promiseNumber: string;
  qrToken: string;
  promiseStatus: PromiseStatus;
  paymentStatus: PaymentStatus;
  permitId: string;
  permitNumber: string;
  requestedWeaponType: string;
  requestedQuantity: number;
  remainingQuantity: number;
  issueDate: string;
  expiryDate: string;
  isValid: boolean;
}

export interface PromiseApplicationDto {
  id: string;
  applicationNumber: string;
  permitId: string;
  requestedWeaponType: string;
  requestedQuantity: number;
  status: PromiseApplicationStatus;
  paymentStatus: PaymentStatus;
  submittedDate: string;
  reviewedDate: string | null;
  rejectionReason: string | null;
  correctionNotes: string | null;
}

export interface CreatePromiseApplicationRequest {
  permitId: string;
  requestedWeaponType: string;
  requestedQuantity: number;
}

// FIREARMS
export interface FirearmDto {
  id: string;
  registrationNumber: string;
  brand: string;
  model: string;
  category: FirearmCategory;
  caliber: string;
  serialNumber: string;
  productionYear: number;
  registrationDate: string;
  status: FirearmStatus;
  permitId: string;
  permitNumber: string;
  ownerId: string;
  ownerName: string;
}

export interface FirearmDetailsDto extends FirearmDto {
  ownershipHistory: OwnershipHistoryDto[];
}

export interface OwnershipHistoryDto {
  ownerName: string;
  ownerPesel: string; // maskowany dla Citizen, pełny dla WPA
  acquiredDate: string;
  transferType: TransferType | null;
}

export interface ReportLostRequest {
  description: string;
}

// TRANSFERS
export interface TransferRequestDto {
  id: string;
  transferNumber: string;
  firearmId: string;
  firearmBrand: string;
  firearmModel: string;
  firearmSerialNumber: string;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  buyerPesel: string; // maskowany
  transferType: TransferType;
  status: TransferRequestStatus;
  initiatedDate: string;
  completedDate: string | null;
  rejectionReason: string | null;
  isSeller: boolean;
  isBuyer: boolean;
}

export interface CreateTransferRequestRequest {
  firearmId: string;
  buyerPesel: string;
  transferType: TransferType;
}

// MEDICAL ALERTS
export interface MedicalAlertDto {
  id: string;
  citizenId: string;
  citizenName: string;
  citizenPesel: string; // maskowany dla Citizen
  permitId: string;
  permitNumber: string;
  medicalAlertType: MedicalAlertType;
  expiryDate: string;
  daysUntilExpiry: number;
  isResolved: boolean;
}

// ============================================================================
// SHOP
// ============================================================================

export interface VerifyPermitRequest {
  qrToken?: string;
  promiseNumber?: string;
}

export interface VerifyPermitResponse {
  isValid: boolean;
  message: string;
  citizenName: string;
  permitNumber: string;
  permitType: PermitType;
  availableSlots: number;
  weaponType: string;
  remainingPromiseQuantity: number;
  promiseExpiryDate: string;
  medicalExamsValid: boolean;
}

export interface RegisterSaleRequest {
  qrToken: string;
  brand: string;
  model: string;
  category: FirearmCategory;
  caliber: string;
  serialNumber: string;
  productionYear: number;
}

export interface RegisterSaleResponse {
  success: boolean;
  message: string;
  firearmId: string;
  registrationNumber: string;
}

// ============================================================================
// WPA
// ============================================================================

// WPA Citizen
export interface WpaCitizenDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  pesel: string; // PEŁNY dla WPA!
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  totalFirearms: number;
  activeAlerts: number;
  permits: PermitDto[];
}

// WPA Permit Applications
export interface WpaPermitApplicationDto extends PermitApplicationDto {
  citizenId: string;
  citizenName: string;
  citizenPesel: string; // PEŁNY
  reviewedByOfficerId: string | null;
  reviewedByOfficerName: string | null;
}

export interface ApprovePermitApplicationRequest {
  maxFirearms: number;
  medicalExamExpiryDate: string;
  psychologicalExamExpiryDate: string;
}

export interface RejectApplicationRequest {
  reason: string;
}

export interface RequireCorrectionRequest {
  reason: string;
}

// WPA Promise Applications
export interface WpaPromiseApplicationDto extends PromiseApplicationDto {
  citizenId: string;
  citizenName: string;
  citizenPesel: string; // PEŁNY
  permitType: PermitType;
  reviewedByOfficerId: string | null;
  reviewedByOfficerName: string | null;
}

// WPA Firearms Search
export interface WpaFirearmSearchResult {
  id: string;
  registrationNumber: string;
  brand: string;
  model: string;
  category: FirearmCategory;
  caliber: string;
  serialNumber: string;
  status: FirearmStatus;
  ownerName: string;
  ownerPesel: string; // PEŁNY
  permitNumber: string;
  permitType: PermitType;
}

// WPA Permit Management
export interface SuspendPermitRequest {
  reason: string;
}

export interface RevokePermitRequest {
  reason: string;
}

export interface RestorePermitRequest {
  reason: string;
}

export interface UpdateMedicalExamsRequest {
  medicalExamExpiryDate: string;
  psychologicalExamExpiryDate: string;
}

// ============================================================================
// PAGINATION
// ============================================================================

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

// ============================================================================
// COMMON
// ============================================================================

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface HealthCheckResponse {
  status: string;
  version: string;
  timestamp: string;
}
