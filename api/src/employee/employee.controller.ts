import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeResponse, EmployeeListResponse, ErrorResponse } from './dto/response.dto';

@ApiTags('Employees')
@Controller('web.employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post('')
  @ApiOperation({ summary: 'Create a new employee' })
  @ApiBody({ type: CreateEmployeeDto, description: 'Employee data to create' })
  @ApiResponse({
    status: 201,
    description: 'Employee created successfully',
    type: EmployeeResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data',
    type: ErrorResponse,
  })
  async create(@Body() createEmployeeDto: CreateEmployeeDto) {
    const newEmployee = await this.employeeService.create(createEmployeeDto);
    return {
      success: true,
      message: 'Employee created successfully',
      data: newEmployee,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all employees' })
  @ApiResponse({
    status: 200,
    description: 'Employees retrieved successfully',
    type: EmployeeListResponse,
  })
  async findAll() {
    const employees = await this.employeeService.findAll();
    return {
      success: true,
      message: 'Employees retrieved successfully',
      data: employees,
      total: employees.length,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an employee by ID' })
  @ApiParam({ name: 'id', description: 'Employee ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Employee retrieved successfully',
    type: EmployeeResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Employee not found',
    type: ErrorResponse,
  })
  async findOne(@Param('id') id: string) {
    const employee = await this.employeeService.findOne(id);
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return {
      success: true,
      message: 'Employee retrieved successfully',
      data: employee,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an employee' })
  @ApiParam({ name: 'id', description: 'Employee ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({ type: CreateEmployeeDto, description: 'Employee data to update' })
  @ApiResponse({
    status: 200,
    description: 'Employee updated successfully',
    type: EmployeeResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data',
    type: ErrorResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Employee not found',
    type: ErrorResponse,
  })
  async update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    const updatedEmployee = await this.employeeService.update(id, updateEmployeeDto);
    return {
      success: true,
      message: 'Employee updated successfully',
      data: updatedEmployee,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an employee' })
  @ApiParam({ name: 'id', description: 'Employee ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Employee deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Employee deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Employee not found',
    type: ErrorResponse,
  })
  async remove(@Param('id') id: string) {
    await this.employeeService.remove(id);
    return {
      success: true,
      message: 'Employee deleted successfully',
    };
  }
}