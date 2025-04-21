// src/master-data/subagencias/dto/subagencia.dto.ts
import { IsBoolean, IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSubagenciaDto {
    @IsString()
    nombre: string;

    @IsString()
    @IsOptional()
    ci_ruc?: string;

    @IsString()
    @IsOptional()
    direccion?: string;

    @IsString()
    @IsOptional()
    telefono?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    ciudad?: string;

    @IsString()
    @IsOptional()
    pais?: string;

    @IsString()
    @IsOptional()
    provincia?: string;

    @IsString()
    @IsOptional()
    representante?: string;

    @IsNumber()
    @IsOptional()
    comision?: number;

    @IsBoolean()
    @IsOptional()
    estado?: boolean = true;
}

export class UpdateSubagenciaDto extends CreateSubagenciaDto { }