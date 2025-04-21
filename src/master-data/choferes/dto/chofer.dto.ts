// src/master-data/choferes/dto/chofer.dto.ts
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateChoferDto {
    @IsString()
    nombre: string;

    @IsString()
    ruc: string;

    @IsString()
    @IsOptional()
    placas_camion?: string;

    @IsString()
    @IsOptional()
    telefono?: string;

    @IsString()
    @IsOptional()
    camion?: string;

    @IsBoolean()
    @IsOptional()
    estado?: boolean = true;
}

export class UpdateChoferDto extends CreateChoferDto { }