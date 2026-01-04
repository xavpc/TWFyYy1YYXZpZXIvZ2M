import { Controller, Post, Body, UseGuards, Get, Res, Ip, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiKeyGuard } from './guards/api-key.guard'
import { JwtAuthGuardv2 } from './guards/jwt.guard';
import { Response } from 'express';
import { ApiBody, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiHeader({
    name: 'x-api-key',
    description: 'API Key for authentication',
    required: true,
    example: 'qweqweqwe'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'admin' },
        password: { type: 'string', example: 'admin123' }
      },
      required: ['username', 'password']
    }
  })
  @UseGuards(ApiKeyGuard)
  @HttpCode(200)
  @Post('login')
  async login(
    @Body() credentials: { username: string; password: string },
    @Ip() ip: string,
    @Res() res: Response
  ) {
    await this.authService.login(credentials.username, credentials.password, ip, res);
  }

  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(JwtAuthGuardv2)
  @Post('logout')
  async logout(@Res() res: Response) {
    await this.authService.logout(res);
  }
}
