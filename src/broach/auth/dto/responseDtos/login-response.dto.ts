import { UserDto } from './user.dto';

export class LoginResponseDto {
  message: string;
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  user: UserDto;
}
