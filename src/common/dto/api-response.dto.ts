export class ApiMessage {
  title: string;
  body: string;
}

export class ApiResponse<T = any> {
  success: boolean;
  message: ApiMessage;
  data?: T;
}
