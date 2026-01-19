import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and get JWT token' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      properties: {
        access_token: { type: 'string' },
        user: { type: 'object' },
        expiresIn: { type: 'string' },
      },
    },
  })
  async login(loginDto: LoginDto) {
    const result = await this.authService.login(
      loginDto.username,
      loginDto.password,
    );

    if (!result) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return result;
  }
}

;
export default AuthController;
