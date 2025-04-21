// src/documents/dto/guia-madre/update-guia-madre.dto.ts
import { IsOptional, IsBoolean, IsString, IsDateString } from 'class-validator';

export class UpdateGuiaMadreDto {
    @IsOptional()
    @IsBoolean()
    prestamo?: boolean;

    @IsOptional()
    @IsString()
    observaciones?: string;

    @IsOptional()
    @IsDateString()
    fecha_prestamo?: string;

    @IsOptional()
    @IsBoolean()
    devolucion?: boolean;

    @IsOptional()
    @IsDateString()
    fecha_devolucion?: string;
}