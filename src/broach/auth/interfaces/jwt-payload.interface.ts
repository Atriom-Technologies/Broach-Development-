import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
  userType: string;
  iat?: number;
  exp?: number;
}

export interface UserFromJwt {
  id: string;
  email: string;
  userType: string;
}
export interface RequestWithUserPayload extends Request {
  user: UserFromJwt;
}
