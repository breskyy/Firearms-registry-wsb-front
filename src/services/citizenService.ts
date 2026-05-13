import apiClient from './api';
import type {
  CitizenProfileDto,
  PermitDto,
  PermitApplicationDto,
  CreatePermitApplicationRequest,
  PromiseDto,
  PromiseApplicationDto,
  CreatePromiseApplicationRequest,
  FirearmDto,
  FirearmDetailsDto,
  ReportLostRequest,
  TransferRequestDto,
  CreateTransferRequestRequest,
  MedicalAlertDto,
  PaginatedResult,
  PaginationParams,
} from '../types/api';

export const citizenService = {
  // ============================================================================
  // PROFILE
  // ============================================================================

  async getProfile(): Promise<CitizenProfileDto> {
    const response = await apiClient.get<CitizenProfileDto>('/citizen/me');
    return response.data;
  },

  // ============================================================================
  // PERMIT APPLICATIONS
  // ============================================================================

  async getPermitApplications(
    params?: PaginationParams
  ): Promise<PaginatedResult<PermitApplicationDto>> {
    const response = await apiClient.get<PaginatedResult<PermitApplicationDto>>(
      '/citizen/me/permit-applications',
      { params }
    );
    return response.data;
  },

  async createPermitApplication(
    data: CreatePermitApplicationRequest
  ): Promise<PermitApplicationDto> {
    const response = await apiClient.post<PermitApplicationDto>(
      '/citizen/me/permit-applications',
      data
    );
    return response.data;
  },

  // ============================================================================
  // PERMITS
  // ============================================================================

  async getPermits(params?: PaginationParams): Promise<PaginatedResult<PermitDto>> {
    const response = await apiClient.get<PaginatedResult<PermitDto>>('/citizen/me/permits', {
      params,
    });
    return response.data;
  },

  // ============================================================================
  // PROMISE APPLICATIONS
  // ============================================================================

  async getPromiseApplications(
    params?: PaginationParams
  ): Promise<PaginatedResult<PromiseApplicationDto>> {
    const response = await apiClient.get<PaginatedResult<PromiseApplicationDto>>(
      '/citizen/me/promise-applications',
      { params }
    );
    return response.data;
  },

  async createPromiseApplication(
    data: CreatePromiseApplicationRequest
  ): Promise<PromiseApplicationDto> {
    const response = await apiClient.post<PromiseApplicationDto>(
      '/citizen/me/promise-applications',
      data
    );
    return response.data;
  },

  // ============================================================================
  // PROMISES
  // ============================================================================

  async getPromises(params?: PaginationParams): Promise<PaginatedResult<PromiseDto>> {
    const response = await apiClient.get<PaginatedResult<PromiseDto>>('/citizen/me/promises', {
      params,
    });
    return response.data;
  },

  // ============================================================================
  // FIREARMS
  // ============================================================================

  async getFirearms(params?: PaginationParams): Promise<PaginatedResult<FirearmDto>> {
    const response = await apiClient.get<PaginatedResult<FirearmDto>>('/citizen/me/firearms', {
      params,
    });
    return response.data;
  },

  async getFirearmDetails(id: string): Promise<FirearmDetailsDto> {
    const response = await apiClient.get<FirearmDetailsDto>(`/citizen/me/firearms/${id}`);
    return response.data;
  },

  async reportLost(id: string, data: ReportLostRequest): Promise<void> {
    await apiClient.post(`/citizen/me/firearms/${id}/report-lost`, data);
  },

  // ============================================================================
  // TRANSFERS
  // ============================================================================

  async getTransferRequests(
    params?: PaginationParams
  ): Promise<PaginatedResult<TransferRequestDto>> {
    const response = await apiClient.get<PaginatedResult<TransferRequestDto>>(
      '/citizen/me/transfer-requests',
      { params }
    );
    return response.data;
  },

  async createTransferRequest(
    data: CreateTransferRequestRequest
  ): Promise<TransferRequestDto> {
    const response = await apiClient.post<TransferRequestDto>(
      '/citizen/me/transfer-requests',
      data
    );
    return response.data;
  },

  async acceptTransfer(id: string): Promise<void> {
    await apiClient.post(`/citizen/me/transfer-requests/${id}/accept`);
  },

  async rejectTransfer(id: string): Promise<void> {
    await apiClient.post(`/citizen/me/transfer-requests/${id}/reject`);
  },

  // ============================================================================
  // MEDICAL ALERTS
  // ============================================================================

  async getMedicalAlerts(params?: PaginationParams): Promise<PaginatedResult<MedicalAlertDto>> {
    const response = await apiClient.get<PaginatedResult<MedicalAlertDto>>(
      '/citizen/me/medical-alerts',
      { params }
    );
    return response.data;
  },
};
