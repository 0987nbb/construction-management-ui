export type UserRole = 'Admin' | 'Project Manager' | 'Engineer' | 'Accountant' | 'Client';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}
