import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { UserService } from '../user/user.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Response } from 'express';

@Injectable()
export class AuthService {
  private readonly loginLimiter: RateLimiterMemory;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    this.loginLimiter = new RateLimiterMemory({
      points: 5, 
      duration: 60,
    });
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    const validApiKey = this.configService.get<string>('API_KEY');
    return apiKey === validApiKey;
  }

  async login(username: string, password: string, ip: string, res: Response) {
 
    try {
      await this.loginLimiter.consume(ip);
    } catch {
      throw new UnauthorizedException('Too many login attempts. Please try again later.');
    }


    const user = await this.userService.findByUsername(username);
    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('Invalid credentials');
    }


    const isPasswordValid = await this.verifyPassword(password, user.hashed_password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);


    this.setTokenCookies(res, tokens);


    return {
      user_id: user.user_id,
      username: user.username,
      role: user.role,
      employee_id: user.employee_id
    };
  }

  async logout(res: Response) {
    this.clearTokenCookies(res);
  }

  private async generateTokens(user: any) {
    const payload: JwtPayload = {
      sub: user.user_id,
      username: user.username,
      role: user.role,
      employee_id: user.employee_id
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m'
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d'
      })
    ]);

    return { accessToken, refreshToken };
  }

  private setTokenCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });
  }

  private clearTokenCookies(res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
  }

  async verifyPassword(plainText: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainText, hashedPassword);
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
}