import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';


import { 
  ApiTags, ApiOperation, ApiResponse, ApiParam 
} from '@nestjs/swagger';
import { Employee } from './employee.entity';

@ApiTags('Employees')
@Controller('web.employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post('')
  @ApiOperation({ summary: 'Create a new employee' })
  @ApiResponse({ 
    status: 201, 
    description: 'The employee has been successfully created.',
    type: Employee
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.create(createEmployeeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all employees' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns an array of all employees',
    type: [Employee]
  })
  findAll() {
    return this.employeeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an employee by ID' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the employee with the specified ID',
    type: Employee
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  findOne(@Param('id') id: string) {
    return this.employeeService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an employee' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'The employee has been successfully updated',
    type: Employee
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeeService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an employee' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiResponse({ status: 200, description: 'The employee has been successfully deleted' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  remove(@Param('id') id: string) {
    return this.employeeService.remove(id);
  }
}