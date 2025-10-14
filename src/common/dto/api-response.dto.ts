export class ApiMessage {
  title: string;
  body: string;
}

export class ApiResponse<T = any> {
  success: boolean;
  message: ApiMessage;
  data?: T;
}
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
  message?: {
    title: string;
    body: string;
  };
}
