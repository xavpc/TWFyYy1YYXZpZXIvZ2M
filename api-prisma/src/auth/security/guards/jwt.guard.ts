import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AuthService } from '../auth.service';
import { RequestUser } from '../interfaces/request-user.interface';
@Injectable()
export class JwtAuthGuardv2 extends AuthGuard('jwt') {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
  const request = context.switchToHttp().getRequest<RequestUser>();
  const response = context.switchToHttp().getResponse<Response>();
  
  try {
    const result = await super.canActivate(context);
    if (result) {
      return true;
    }
  } catch (error) {
    console.log(`access_token error: ${error.message}`);
  }
  
  const refreshToken = request.cookies?.refresh_token;
  if (!refreshToken) {
    throw new UnauthorizedException('Authentication required, Please Log in');
  }
  
  try {
    const payload = this.jwtService.verify(refreshToken, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });
    
    const accessToken = await this.jwtService.signAsync(
      {
        sub: payload.sub,
        username: payload.username,
        role: payload.role,
        employee_id: payload.employee_id
      }, 
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m'
      }
    );
    
    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 
    });
    
    console.log(`token generated`);
    
    request.user = {
      userId: payload.sub,
      username: payload.username,
      role: payload.role,
      employee_id: payload.employee_id
    };
    
    return true;
  } catch (refreshError) {
    console.log(`refresh_token error: ${refreshError.message}`);
    throw new UnauthorizedException('Authentication required');
  }
}
}