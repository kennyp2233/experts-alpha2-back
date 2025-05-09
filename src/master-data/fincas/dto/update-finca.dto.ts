// src/master-data/fincas/dto/update-finca.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateFincaDto } from './create-finca.dto';

export class UpdateFincaDto extends PartialType(CreateFincaDto) { }