import { ApiProperty } from '@nestjs/swagger';
import { Employee } from '@prisma/client';

export class EmployeeResponse {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Employee request successful' })
  message: string;

  @ApiProperty({ type: Employee })
  data: Employee;
}

export class EmployeeListResponse {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Employees retrieved successfully' })
  message: string;

  @ApiProperty({ type: [Employee], description: 'List of employees' })
  data: Employee[];

  @ApiProperty({ example: 1, description: 'Total number of employees' })
  total: number;
}

export class EmployeeErrorResponse {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Employee not found' })
  message: string;

  @ApiProperty({
    example: {
      code: 'NOT_FOUND',
      details: 'No employee found with the specified ID',
    },
    required: false,
  })
  error?: Record<string, any>;
}