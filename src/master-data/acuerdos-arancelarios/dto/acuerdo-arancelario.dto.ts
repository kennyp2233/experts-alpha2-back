
// src/master-data/acuerdos-arancelarios/dto/acuerdo-arancelario.dto.ts
import { IsString } from 'class-validator';

export class CreateAcuerdoArancelarioDto {
    @IsString()
    nombre: string;
}

export class UpdateAcuerdoArancelarioDto extends CreateAcuerdoArancelarioDto { }