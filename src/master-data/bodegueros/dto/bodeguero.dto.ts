// src/master-data/bodegueros/dto/bodeguero.dto.ts
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateBodegueroDto {
    @IsString()
    nombre: string;

    @IsString()
    ci: string;

    @IsString()
    clave_bodega: string;

    @IsBoolean()
    @IsOptional()
    estado?: boolean = true;
}

export class UpdateBodegueroDto {
    @IsString()
    nombre: string;

    @IsString()
    ci: string;

    @IsString()
    @IsOptional()
    clave_bodega?: string;

    @IsBoolean()
    @IsOptional()
    estado?: boolean;
}