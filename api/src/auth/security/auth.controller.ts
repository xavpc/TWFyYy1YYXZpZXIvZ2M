import { Controller, Post, Body, UseGuards, Get, Res, Ip, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiKeyGuard } from './guards/api-key.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import { Response } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
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
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Res() res: Response) {
    await this.authService.logout(res);
  }
}
