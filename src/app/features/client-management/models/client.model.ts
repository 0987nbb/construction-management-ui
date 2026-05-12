export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ClientProject {
  id: string;
  name: string;
  code: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  company: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  projects: ClientProject[];
}
