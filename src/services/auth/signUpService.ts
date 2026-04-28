import { api } from '@/lib/api';
import { SignUpFormData } from '@/lib/validations/auth';

export const signUpService = {
  async register(data: SignUpFormData) {
    const response = await api.post('/users', data);
    return response.data;
  }
};