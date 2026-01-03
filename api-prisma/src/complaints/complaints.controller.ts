import { Controller, Get, Post, Body, Param, ParseUUIDPipe, Delete, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaints.dto';
import { UpdateComplaintDto } from './dto/update-complaints.dto';
import { 
  ComplaintResponse,
  ComplaintListResponse,
  ComplaintsErrorResponse
} from './dto/response.dto';

@ApiTags('Complaints')
@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new complaint' })
  @ApiBody({ type: CreateComplaintDto })
  @ApiResponse({
    status: 201,
    description: 'Complaint created successfully',
    type: ComplaintResponse
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data',
    type: ComplaintsErrorResponse
  })
  async create(@Body() createComplaintDto: CreateComplaintDto) {
    const complaint = await this.complaintsService.create(createComplaintDto);
    return {
      success: true,
      message: 'Complaint created successfully',
      data: new ComplaintResponse(complaint)
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all complaints' })
  @ApiResponse({
    status: 200,
    description: 'Complaints retrieved successfully',
    type: ComplaintListResponse
  })
  async findAll() {
    const complaints = await this.complaintsService.findAll();
    return {
      success: true,
      message: 'Complaints retrieved successfully',
      data: complaints,
      total: complaints.length
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a complaint by ID' })
  @ApiParam({
    name: 'id',
    description: 'Complaint ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: 200,
    description: 'Complaint retrieved successfully',
    type: ComplaintResponse
  })
  @ApiResponse({
    status: 404,
    description: 'Complaint not found',
    type: ComplaintsErrorResponse
  })
  async findOne(@Param('id', ParseUUIDPipe) complaint_id: string) {
    const complaint = await this.complaintsService.findOne(complaint_id);
    return {
      success: true,
      message: 'Complaint retrieved successfully',
      data: complaint
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a complaint' })
  @ApiParam({
    name: 'id',
    description: 'Complaint ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({ type: CreateComplaintDto })
  @ApiResponse({
    status: 200,
    description: 'Complaint updated successfully',
    type: ComplaintResponse
  })
  @ApiResponse({
    status: 404,
    description: 'Complaint not found',
    type: ComplaintsErrorResponse
  })
  async update(
    @Param('id', ParseUUIDPipe) complaint_id: string,
    @Body() updateComplaintDto: UpdateComplaintDto,
  ) {
    const updatedComplaint = await this.complaintsService.update(complaint_id, updateComplaintDto);
    return {
      success: true,
      message: 'Complaint updated successfully',
      data: updatedComplaint
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a complaint' })
  @ApiParam({
    name: 'id',
    description: 'Complaint ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: 200,
    description: 'Complaint deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Complaint deleted successfully'
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Complaint not found',
    type: ComplaintsErrorResponse
  })
  async remove(@Param('id', ParseUUIDPipe) complaint_id: string) {
    await this.complaintsService.remove(complaint_id);
    return {
      success: true,
      message: 'Complaint deleted successfully'
    };
  }
}