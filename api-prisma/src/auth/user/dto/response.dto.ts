import { ApiProperty } from '@nestjs/swagger';
import { Users } from '../user.entity';
import { UserRole } from '../enums/user-role.enum';
import { UserStatus } from '../enums/user-status.enum';

export class UserResponse {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Users operation successful' })
  message: string;

  @ApiProperty({
    type: 'object',
    properties: {
      user_id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
      username: { type: 'string', example: 'john.doe' },
      role: { 
        type: 'string',
        enum: Object.values(UserRole),
        example: UserRole.GARBAGE_COLLECTOR
      },
      status: { 
        type: 'string',
        enum: Object.values(UserStatus),
        example: UserStatus.ACTIVE
      },
      employee_id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' }
    }
  })
  data: Partial<Users>;
}

export class UserListResponse {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Users retrieved successfully' })
  message: string;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        user_id: { type: 'string' },
        username: { type: 'string' },
        role: { 
          type: 'string',
          enum: Object.values(UserRole)
        },
        status: { 
          type: 'string',
          enum: Object.values(UserStatus)
        },
        employee_id: { type: 'string' }
      }
    }
  })
  data: Partial<Users>[];

  @ApiProperty({ example: 10 })
  total: number;
}