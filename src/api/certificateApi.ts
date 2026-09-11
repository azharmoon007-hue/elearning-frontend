import api from './axios';
import { CertificateDto } from '../types';

export const certificateApi = {
  getByNumber: async (certificateNumber: string): Promise<CertificateDto> => {
    const res = await api.get<CertificateDto>(`/certificates/number/${encodeURIComponent(certificateNumber)}`);
    return res.data;
  },

  getByStudentAndCourse: async (studentId: number, courseId: number): Promise<CertificateDto> => {
    const res = await api.get<CertificateDto>(`/certificates/student/${studentId}/course/${courseId}`);
    return res.data;
  },
};
