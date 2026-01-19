import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';

@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiBody({ type: LoginDto })
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
