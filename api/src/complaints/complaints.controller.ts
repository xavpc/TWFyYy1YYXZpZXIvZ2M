import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaints.dto';
import { UpdateComplaintDto } from './dto/update-complaints.dto';

@Controller('mobile.complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Post()
  create(@Body() createComplaintDto: CreateComplaintDto) {
    return this.complaintsService.create(createComplaintDto);
  }

  @Get()
  findAll() {
    return this.complaintsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) complaint_id: string) {
    return this.complaintsService.findOne(complaint_id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) complaint_id: string,
    @Body() updateComplaintDto: UpdateComplaintDto,
  ) {
    return this.complaintsService.update(complaint_id, updateComplaintDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) complaint_id: string) {
    return this.complaintsService.remove(complaint_id);
  }
}