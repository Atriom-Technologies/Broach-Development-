import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
  userType: string;
  sessionId: string
  iat?: number;
  exp?: number;
}

export interface UserFromJwt {
  id: string;
  email: string;
  userType: string;
  sessionId: string;
}
export interface RequestWithUserPayload extends Request {
  user: UserFromJwt;
}
