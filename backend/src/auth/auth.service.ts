import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface User {
  id: string;
  username: string;
  email: string;
}

// Demo user - for production, implement proper user management
const DEMO_USER: User = {
  id: '1',
  username: 'admin',
  email: 'admin@vendor-system.local',
};

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(username: string, password: string) {
    // Simple hardcoded auth - for production, verify against database
    if (username === 'admin' && password === 'admin123') {
      const token = this.jwtService.sign({
        id: DEMO_USER.id,
        username: DEMO_USER.username,
        email: DEMO_USER.email,
      });

      return {
        accessToken: token,
        user: DEMO_USER,
        expiresIn: '24h',
      };
    }

    return null;
  }

  validateToken(payload: any): User {
    return {
      id: payload.id,
      username: payload.username,
      email: payload.email,
    };
  }
}

;
export default AuthService;
