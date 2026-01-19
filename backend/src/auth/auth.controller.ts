import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';

@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiConsumes('application/json')
  @ApiBody({ type: LoginDto })
  login(@Body() body: any) {
    return this.authService.login(body.username, body.password);
  }
}

;
export default AuthController;
