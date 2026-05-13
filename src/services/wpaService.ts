import apiClient from './api';
import type {
  WpaCitizenDto,
  WpaPermitApplicationDto,
  WpaPromiseApplicationDto,
  ApprovePermitApplicationRequest,
  RejectApplicationRequest,
  RequireCorrectionRequest,
  WpaFirearmSearchResult,
  MedicalAlertDto,
  SuspendPermitRequest,
  RevokePermitRequest,
  RestorePermitRequest,
  UpdateMedicalExamsRequest,
  PaginatedResult,
  PaginationParams,
  PermitApplicationStatus,
  PromiseApplicationStatus,
} from '../types/api';

export const wpaService = {
  // ============================================================================
  // PERMIT APPLICATIONS
  // ============================================================================

  async getPermitApplications(params?: PaginationParams & {
    status?: PermitApplicationStatus;
  }): Promise<PaginatedResult<WpaPermitApplicationDto>> {
    const response = await apiClient.get<PaginatedResult<WpaPermitApplicationDto>>(
      '/wpa/permit-applications',
      { params }
    );
    return response.data;
  },

  async getPermitApplicationById(id: string): Promise<WpaPermitApplicationDto> {
    const response = await apiClient.get<WpaPermitApplicationDto>(
      `/wpa/permit-applications/${id}`
    );
    return response.data;
  },

  async markPermitApplicationUnderReview(id: string): Promise<void> {
    await apiClient.post(`/wpa/permit-applications/${id}/mark-under-review`);
  },

  async approvePermitApplication(
    id: string,
    data: ApprovePermitApplicationRequest
  ): Promise<void> {
    await apiClient.post(`/wpa/permit-applications/${id}/approve`, data);
  },

  async rejectPermitApplication(id: string, data: RejectApplicationRequest): Promise<void> {
    await apiClient.post(`/wpa/permit-applications/${id}/reject`, data);
  },

  async requirePermitApplicationCorrection(
    id: string,
    data: RequireCorrectionRequest
  ): Promise<void> {
    await apiClient.post(`/wpa/permit-applications/${id}/require-correction`, data);
  },

  // ============================================================================
  // PROMISE APPLICATIONS
  // ============================================================================

  async getPromiseApplications(params?: PaginationParams & {
    status?: PromiseApplicationStatus;
  }): Promise<PaginatedResult<WpaPromiseApplicationDto>> {
    const response = await apiClient.get<PaginatedResult<WpaPromiseApplicationDto>>(
      '/wpa/promise-applications',
      { params }
    );
    return response.data;
  },

  async getPromiseApplicationById(id: string): Promise<WpaPromiseApplicationDto> {
    const response = await apiClient.get<WpaPromiseApplicationDto>(
      `/wpa/promise-applications/${id}`
    );
    return response.data;
  },

  async markPromiseApplicationUnderReview(id: string): Promise<void> {
    await apiClient.post(`/wpa/promise-applications/${id}/mark-under-review`);
  },

  async approvePromiseApplication(id: string): Promise<void> {
    await apiClient.post(`/wpa/promise-applications/${id}/approve`);
  },

  async rejectPromiseApplication(id: string, data: RejectApplicationRequest): Promise<void> {
    await apiClient.post(`/wpa/promise-applications/${id}/reject`, data);
  },

  async requirePromiseApplicationCorrection(
    id: string,
    data: RequireCorrectionRequest
  ): Promise<void> {
    await apiClient.post(`/wpa/promise-applications/${id}/require-correction`, data);
  },

  // ============================================================================
  // CITIZENS
  // ============================================================================

  async getCitizens(params?: PaginationParams): Promise<PaginatedResult<WpaCitizenDto>> {
    const response = await apiClient.get<PaginatedResult<WpaCitizenDto>>('/wpa/citizens', {
      params,
    });
    return response.data;
  },

  async getCitizenById(id: string): Promise<WpaCitizenDto> {
    const response = await apiClient.get<WpaCitizenDto>(`/wpa/citizens/${id}`);
    return response.data;
  },

  // ============================================================================
  // FIREARMS SEARCH
  // ============================================================================

  async searchFirearms(params?: PaginationParams & {
    serialNumber?: string;
    pesel?: string;
    permitNumber?: string;
    permitType?: string;
  }): Promise<PaginatedResult<WpaFirearmSearchResult>> {
    const response = await apiClient.get<PaginatedResult<WpaFirearmSearchResult>>(
      '/wpa/firearms',
      { params }
    );
    return response.data;
  },

  // ============================================================================
  // MEDICAL ALERTS
  // ============================================================================

  async getMedicalAlerts(params?: PaginationParams & {
    resolved?: boolean;
  }): Promise<PaginatedResult<MedicalAlertDto>> {
    const response = await apiClient.get<PaginatedResult<MedicalAlertDto>>(
      '/wpa/medical-alerts',
      { params }
    );
    return response.data;
  },

  // ============================================================================
  // PERMIT MANAGEMENT
  // ============================================================================

  async suspendPermit(id: string, data: SuspendPermitRequest): Promise<void> {
    await apiClient.post(`/wpa/permits/${id}/suspend`, data);
  },

  async revokePermit(id: string, data: RevokePermitRequest): Promise<void> {
    await apiClient.post(`/wpa/permits/${id}/revoke`, data);
  },

  async restorePermit(id: string, data: RestorePermitRequest): Promise<void> {
    await apiClient.post(`/wpa/permits/${id}/restore`, data);
  },

  async updateMedicalExams(id: string, data: UpdateMedicalExamsRequest): Promise<void> {
    await apiClient.patch(`/wpa/permits/${id}/medical-exams`, data);
  },
};
