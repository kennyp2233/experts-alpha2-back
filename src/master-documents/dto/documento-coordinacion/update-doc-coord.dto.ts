// src/documents/dto/documento-coordinacion/update-doc-coord.dto.ts
import { IsOptional, IsInt, IsString, IsDateString, IsNumber, IsEnum, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ConsignatarioDto } from './create-doc-coord.dto';

export class UpdateDocCoordDto {
    @IsOptional()
    @IsInt()
    id_consignatario_principal?: number;

    @IsOptional()
    @IsInt()
    id_producto?: number;

    @IsOptional()
    @IsInt()
    id_destino_awb?: number;

    @IsOptional()
    @IsInt()
    id_destino_final_docs?: number;

    @IsOptional()
    @IsDateString()
    fecha_vuelo?: string;

    @IsOptional()
    @IsEnum(['PREPAID', 'COLLECT'])
    pago?: string;

    @IsOptional()
    @IsInt()
    from1?: number;

    @IsOptional()
    @IsInt()
    to1?: number;

    @IsOptional()
    @IsInt()
    by1?: number;

    @IsOptional()
    @IsInt()
    to2?: number;

    @IsOptional()
    @IsInt()
    by2?: number;

    @IsOptional()
    @IsInt()
    to3?: number;

    @IsOptional()
    @IsInt()
    by3?: number;

    // Valores de costos
    @IsOptional()
    @IsNumber()
    costo_guia_valor?: number;

    @IsOptional()
    @IsNumber()
    combustible_valor?: number;

    @IsOptional()
    @IsNumber()
    seguridad_valor?: number;

    @IsOptional()
    @IsNumber()
    aux_calculo_valor?: number;

    @IsOptional()
    @IsNumber()
    otros_valor?: number;

    @IsOptional()
    @IsNumber()
    aux1_valor?: number;

    @IsOptional()
    @IsNumber()
    aux2_valor?: number;

    @IsOptional()
    @IsNumber()
    tarifa_rate?: number;

    @IsOptional()
    @IsNumber()
    char_weight?: number;

    // Servicios adicionales
    @IsOptional()
    @IsInt()
    form_a?: number;

    @IsOptional()
    @IsInt()
    transport?: number;

    @IsOptional()
    @IsNumber()
    pca?: number;

    @IsOptional()
    @IsInt()
    fitos?: number;

    @IsOptional()
    @IsInt()
    termografo?: number;

    @IsOptional()
    @IsInt()
    mca?: number;

    @IsOptional()
    @IsInt()
    tax?: number;

    // Consignatarios
    @IsOptional()
    @IsArray()
    @Type(() => ConsignatarioDto)
    consignatarios?: ConsignatarioDto[];
}