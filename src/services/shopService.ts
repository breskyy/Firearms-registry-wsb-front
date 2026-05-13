import apiClient from './api';
import type {
  VerifyPermitRequest,
  VerifyPermitResponse,
  RegisterSaleRequest,
  RegisterSaleResponse,
} from '../types/api';

export const shopService = {
  /**
   * Verify customer's promise (by QR token or promise number)
   */
  async verifyPermit(data: VerifyPermitRequest): Promise<VerifyPermitResponse> {
    const response = await apiClient.post<VerifyPermitResponse>('/shop/verify-permit', data);
    return response.data;
  },

  /**
   * Register firearm sale (atomic operation)
   */
  async registerSale(data: RegisterSaleRequest): Promise<RegisterSaleResponse> {
    const response = await apiClient.post<RegisterSaleResponse>(
      '/shop/firearms/register-sale',
      data
    );
    return response.data;
  },
};
