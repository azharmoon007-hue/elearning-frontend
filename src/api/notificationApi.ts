import api from './axios';
import { NotificationDto, Page } from '../types';

export const notificationApi = {
  getUserNotifications: async (userId: number, page: number = 0, size: number = 10): Promise<Page<NotificationDto>> => {
    const res = await api.get<Page<NotificationDto>>(`/notifications/user/${userId}`, { params: { page, size } });
    return res.data;
  },

  getUnreadNotifications: async (userId: number): Promise<Page<NotificationDto>> => {
    const res = await api.get<Page<NotificationDto>>(`/notifications/user/${userId}/unread`);
    return res.data;
  },

  getUnreadCount: async (userId: number): Promise<number> => {
    const res = await api.get<number>(`/notifications/user/${userId}/unread/count`);
    return res.data;
  },

  markAsRead: async (id: number): Promise<void> => {
    await api.patch(`/notifications/${id}/read`);
  },
};
