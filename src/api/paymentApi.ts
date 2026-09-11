import api from './axios';
import { PaymentDto, PaymentOrderResponseDto } from '../types';

export const paymentApi = {
  createOrder: async (courseId: number): Promise<PaymentOrderResponseDto> => {
    const res = await api.post<PaymentOrderResponseDto>('/payments/create-order', { courseId });
    return res.data;
  },

  markSuccess: async (orderId: string, paymentId: string): Promise<PaymentDto> => {
    const res = await api.post<PaymentDto>('/payments/success', null, {
      params: { orderId, paymentId }
    });
    return res.data;
  },

  markFailed: async (orderId: string): Promise<PaymentDto> => {
    const res = await api.post<PaymentDto>('/payments/failed', null, {
      params: { orderId }
    });
    return res.data;
  },
};
