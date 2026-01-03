import { PartialType } from '@nestjs/mapped-types';
import { CreateComplaintDto } from './create-complaints.dto';

export class UpdateComplaintDto extends PartialType(CreateComplaintDto) {}