import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';

@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: any) {
    const { username, password } = body;

    if (!username || !password) {
      throw new BadRequestException('Username or password missing');
    }

    return this.authService.login(username, password);
  }
}

;
export default AuthController;
