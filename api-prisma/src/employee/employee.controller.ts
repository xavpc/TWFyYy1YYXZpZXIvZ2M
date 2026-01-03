import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeResponse, EmployeeListResponse, EmployeeErrorResponse } from './dto/response.dto';
import { Employee } from './employee.entity';
import { FilterEmployeeDto } from './dto/filter-employee.dto';

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
    type: EmployeeErrorResponse,
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
  @ApiOperation({ 
    summary: 'Get all employees with filtering, pagination, and sorting',
    description: 'Retrieve employees with optional filtering by name, email, status, etc. Supports pagination and sorting.'
  })
  @ApiQuery({ 
    name: 'first_name', 
    required: false, 
    description: 'Filter by first name (partial match)',
    example: 'John'
  })
  @ApiQuery({ 
    name: 'middle_name', 
    required: false, 
    description: 'Filter by middle name (partial match)',
    example: 'Michael'
  })
  @ApiQuery({ 
    name: 'last_name', 
    required: false, 
    description: 'Filter by last name (partial match)',
    example: 'Smith'
  })
  @ApiQuery({ 
    name: 'email', 
    required: false, 
    description: 'Filter by email (partial match)',
    example: 'john@example.com'
  })
  @ApiQuery({ 
    name: 'address', 
    required: false, 
    description: 'Filter by address (partial match)',
    example: 'Tokyo'
  })
  @ApiQuery({ 
    name: 'contact_number', 
    required: false, 
    description: 'Filter by contact number (partial match)',
    example: '090-1234'
  })
  @ApiQuery({ 
    name: 'age', 
    required: false, 
    description: 'Filter by exact age',
    type: Number,
    example: 30
  })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    description: 'Filter by employee status',
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED']
  })
  @ApiQuery({ 
    name: 'search', 
    required: false, 
    description: 'Global search across all text fields',
    example: 'john'
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    description: 'Page number for pagination',
    type: Number,
    example: 1
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    description: 'Number of items per page',
    type: Number,
    example: 10
  })
  @ApiQuery({ 
    name: 'sort_by', 
    required: false, 
    description: 'Field to sort by',
    example: 'first_name'
  })
  @ApiQuery({ 
    name: 'sort_order', 
    required: false, 
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    example: 'ASC'
  })
  @ApiResponse({
    status: 200,
    description: 'Employees retrieved successfully',
    type: EmployeeListResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid query parameters'
  })
  async findAll(@Query() filterDto: FilterEmployeeDto) {
    const result = await this.employeeService.findAll(filterDto);
    
    const totalPages = filterDto?.limit ? Math.ceil(result.total / filterDto.limit) : 1;
    
    return {
      success: true,
      message: 'Employees retrieved successfully',
      data: result.data,
      total: result.total,
      page: filterDto?.page || 1,
      limit: filterDto?.limit || result.data.length,
      totalPages,
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
    type: EmployeeErrorResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Employee not found',
    type: EmployeeErrorResponse,
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
    type: EmployeeErrorResponse,
  })
  async remove(@Param('id') id: string) {
    await this.employeeService.remove(id);
    return {
      success: true,
      message: 'Employee deleted successfully',
    };
  }
}