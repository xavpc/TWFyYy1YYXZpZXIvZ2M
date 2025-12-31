import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeResponse, EmployeeListResponse, ErrorResponse } from './dto/response.dto';
import { Employee } from './employee.entity';

@ApiTags('Employees')
@Controller('employees')
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


  @Get('search/:field/:value')
  @ApiOperation({ summary: 'Search employees by specific field' })
  @ApiParam({ name: 'field', enum: [
    'first_name',
    'middle_name',
    'last_name',
    'email',
    'address',
    'contact_number',
    'age',
    'employee_id'
  ] })
  @ApiParam({ name: 'value', description: 'Search value' })
  async searchByField(
    @Param('field') field: keyof Omit<Employee, 'devices'>,
    @Param('value') value: string,
  ) {
    return this.employeeService.searchByField(field, value);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Global search across all employee fields',
    description: 
      'This endpoint allows you to perform a search across multiple employee fields ' +
      '(e.g., first_name, last_name, address, etc.). It returns all employees where ' +
      'any of their fields contains the specified search term.\n\n' +
      '**Example usage**:\n' +
      '- Search by name: `/employees/search?global_search=hana` will return employees whose ' +
      'first name, last name, or any other field contains "hana".\n' +
      '- The search term is case-insensitive and will match partial text.'
  })
  @ApiQuery({
    name: 'global_search',
    description: 'Search term to query across all employee fields (e.g., first_name, last_name, address).',
    required: true,
    example: 'hana',
  })
  async globalSearch(@Query('global_search') searchTerm: string) {
    if (!searchTerm) {
      throw new BadRequestException('Search term is required');
    }
    return this.employeeService.globalSearch(searchTerm);
  }

  @Get('advanced-search')
  @ApiOperation({
    summary: 'Advanced search with multiple criteria',
    description: 
      'This endpoint allows you to perform an advanced search on employee fields based on multiple criteria. ' +
      'The search criteria are provided as a JSON string, where the keys are the field names (e.g., first_name, last_name, address), ' +
      'and the values are the search terms. This is similar to how tags or filters work in a library application, where you can filter ' +
      'by multiple properties at once.\n\n' +
      '### **Example usage**:\n' +
      '- **Advanced search with multiple fields**:\n' +
      '```\n' +
      '/employees/advanced-search?criteria={"first_name":"Ha","last_name":"a","address":"404 Osaka Blvd"}\n' +
      '```\n' +
      'This will return all employees where the first name contains "Ha", the last name contains "a", and the address contains "404 Osaka Blvd".\n' +
      'The search term is case-insensitive, and partial matches are allowed.\n\n' +
      '**Supported fields**:\n' +
      '- first_name\n' +
      '- last_name\n' +
      '- address\n' +
      '- [add more fields as necessary]'
  })
  @ApiQuery({
    name: 'criteria',
    description: 'A JSON string of search criteria, where the keys are employee fields (e.g., first_name, last_name, address), and the values are the search terms. Use partial strings for a fuzzy search. Example: \`{"first_name":"Ha","last_name":"a","address":"404 Osaka Blvd"}\`',
    required: true,
    example: '{"first_name":"Ha","last_name":"a","address":"404 Osaka Blvd"}',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully returned matching employee records based on search criteria',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid search criteria format. Ensure it is a valid JSON string.',
  })
  async advancedSearch(@Query('criteria') criteriaString: string) {
    try {
      const criteria = JSON.parse(criteriaString);
      return this.employeeService.advancedSearch(criteria);
    } catch (error) {
      throw new BadRequestException('Invalid search criteria format');
    }
  }
  
  


  @Put(':id')
  @ApiOperation({ summary: 'Update an employee' })
  @ApiParam({ name: 'id', description: 'Employee ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({ type: UpdateEmployeeDto, description: 'Employee data to update' })
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