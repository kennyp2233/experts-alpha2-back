// src/documents/dto/guia-madre/create-guia-madre.dto.ts
import { IsNotEmpty, IsNumber, IsOptional, IsInt, Min, IsBoolean, IsDateString, IsString } from 'class-validator';

export class CreateGuiaMadreDto {
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    prefijo: number;

    @IsNotEmpty()
    @IsInt()
    @Min(1)
    secuencial_inicial: number;

    @IsNotEmpty()
    @IsInt()
    @Min(1)
    cantidad: number;

    @IsNotEmpty()
    @IsInt()
    id_aerolinea: number;

    @IsOptional()
    @IsInt()
    id_referencia?: number; // Agencia IATA

    @IsOptional()
    @IsDateString()
    fecha?: string;

    @IsOptional()
    @IsString()
    id_stock?: string;

    @IsOptional()
    @IsBoolean()
    prestamo?: boolean;

    @IsOptional()
    @IsString()
    observaciones?: string;
}