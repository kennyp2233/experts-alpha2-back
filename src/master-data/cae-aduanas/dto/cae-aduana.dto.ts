// src/master-data/cae-aduanas/dto/cae-aduana.dto.ts
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCaeAduanaDto {
    @IsNumber()
    @IsOptional()
    codigo_aduana?: number;

    @IsString()
    @IsOptional()
    nombre?: string;
}

export class UpdateCaeAduanaDto extends CreateCaeAduanaDto { }