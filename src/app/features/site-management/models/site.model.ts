export type SiteStatus = 'Pending' | 'Active' | 'OnHold' | 'Completed';

export interface Site {
  id: string;
  siteName: string;
  projectId: string;
  projectName: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  assignedEngineerId?: string | null;
  assignedEngineerName?: string | null;
  status: SiteStatus;
  progressPercentage: number;
  startDate?: string | null;
  endDate?: string | null;
  description?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
