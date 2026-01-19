import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dtos/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(dto: LoginDto) {
    const { username, password } = dto;

    if (!username || !password) {
      throw new BadRequestException('Username and password are required');
    }

    // Hardcoded user (as per assignment)
    if (username !== 'admin' || password !== 'admin123') {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      username: 'admin',
      role: 'admin',
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user: {
        username: 'admin',
        role: 'admin',
      },
      expiresIn: '1d',
    };
  }
}

;
export default AuthService;
