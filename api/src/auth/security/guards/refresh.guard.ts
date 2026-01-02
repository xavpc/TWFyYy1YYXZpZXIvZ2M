// refresh.guard.ts
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AuthService } from '../auth.service';
import { RequestUser } from '../interfaces/request-user.interface';
@Injectable()
export class RefreshTokenGuard extends AuthGuard('jwt') {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const result = await super.canActivate(context);
      if (result) {
        return true; 
      }
    } catch (error) {
      const request = context.switchToHttp().getRequest<RequestUser>();
      const response = context.switchToHttp().getResponse<Response>();
      
      const refreshToken = request.cookies?.refresh_token;
      if (!refreshToken) {
        throw new UnauthorizedException('Authentication required');
      }
      
      try {
        const payload = this.jwtService.verify(refreshToken, {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        });
        const tokens = await this.authService.refreshTokens(payload);
        

        this.authService.setTokenCookies(response, tokens);
        
        request.user = {
          userId: payload.sub,
          username: payload.username,
          role: payload.role,
          employee_id: payload.employee_id
        };
        
        return true;
      } catch (refreshError) {
        throw new UnauthorizedException('Authentication required');
      }
    }
    
    return false;
  }
}