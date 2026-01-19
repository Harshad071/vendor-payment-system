import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: any) {
    console.log('RAW BODY:', body);

    if (!body) {
      throw new BadRequestException('Body is undefined');
    }

    const { username, password } = body;

    if (!username || !password) {
      throw new BadRequestException('Username or password missing');
    }

    return this.authService.login(username, password);
  }
}

;
export default AuthController;
