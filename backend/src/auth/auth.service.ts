import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(username: string, password: string) {
    if (username !== 'admin' || password !== 'admin123') {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { username: 'admin', role: 'ADMIN' };

    return {
      access_token: this.jwtService.sign(payload),
      user: payload,
      expiresIn: '1h',
    };
  }
}

;
export default AuthService;
