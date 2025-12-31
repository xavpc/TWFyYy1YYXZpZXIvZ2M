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

  async verifyToken(token: string, isRefreshToken = false): Promise<any> {
    try {
      await this.tokenVerifyLimiter.consume(token);

      return this.jwtService.verify(token, {
        secret: isRefreshToken
          ? this.configService.get<string>('JWT_REFRESH_SECRET')
          : this.configService.get<string>('JWT_SECRET'),
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
      throw new UnauthorizedException('Invalid token');
    }
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, hashedPassword);
  }

  async validateLogin(ip: string): Promise<void> {
    try {
      await this.loginLimiter.consume(ip);
    } catch (error) {
      throw new UnauthorizedException('Too many login attempts. Please try again later.');
    }
  }


}