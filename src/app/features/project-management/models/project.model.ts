export type ProjectStatus = 'Planning' | 'InProgress' | 'OnHold' | 'Completed' | 'Cancelled';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Project {
  id: string;
  projectName: string;
  description?: string;
  clientId: string;
  clientName: string;
  startDate?: string;
  endDate?: string;
  budget: number;
  spentAmount: number;
  progressPercentage: number;
  status: ProjectStatus;
  assignedEngineerId?: string;
  assignedEngineerName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ProjectFinancial {
  id: string;
  projectName: string;
  clientName: string;
  budget: number;
  spentAmount: number;
  remainingAmount: number;
  status: ProjectStatus;
}
