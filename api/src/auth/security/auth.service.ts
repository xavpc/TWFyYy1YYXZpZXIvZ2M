import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  private readonly loginLimiter: RateLimiterMemory;
  private readonly tokenVerifyLimiter: RateLimiterMemory;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
   
    this.loginLimiter = new RateLimiterMemory({
      points: 5, 
      duration: 60, 
    });

    this.tokenVerifyLimiter = new RateLimiterMemory({
      points: 100, 
      duration: 60, 
    });
  }
  private generateJti(): string {
    return `${Date.now()}-${randomUUID()}`;
  }

  async createAccessToken(payload: any): Promise<string> {
    const jti = this.generateJti();
    return this.jwtService.sign(
      {
        ...payload,
        jti,
      },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '30m',
      },
    );
  }

  async createRefreshToken(payload: any): Promise<string> {
    const jti = this.generateJti();
    return this.jwtService.sign(
      {
        ...payload,
        jti,
      },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      },
    );
  }



}