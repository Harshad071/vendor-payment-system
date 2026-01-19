import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(username: string, password: string) {
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
