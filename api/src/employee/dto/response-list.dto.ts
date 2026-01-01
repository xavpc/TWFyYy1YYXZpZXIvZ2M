import { ApiProperty } from '@nestjs/swagger';
import { Employee } from '../employee.entity';

export class EmployeeListResponse {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Response message', example: 'Employees retrieved successfully' })
  message: string;

  @ApiProperty({ 
    description: 'List of employees',
    type: [Employee]
  })
  data: Employee[];

  @ApiProperty({ description: 'Total number of employees', example: 150 })
  total: number;

  @ApiProperty({ description: 'Current page number', example: 1, required: false })
  page?: number;

  @ApiProperty({ description: 'Number of items per page', example: 10, required: false })
  limit?: number;

  @ApiProperty({ description: 'Total number of pages', example: 15, required: false })
  totalPages?: number;
}