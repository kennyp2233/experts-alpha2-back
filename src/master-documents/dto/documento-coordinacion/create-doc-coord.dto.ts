// src/documents/dto/documento-coordinacion/create-doc-coord.dto.ts
import { IsNotEmpty, IsInt, IsOptional, IsString, IsDateString, IsNumber, IsEnum, IsArray, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class ConsignatarioDto {
    @IsNotEmpty()
    @IsInt()
    id_consignatario: number;

    @IsNotEmpty()
    @IsBoolean()
    es_principal: boolean;
}

export class CreateDocCoordDto {
    @IsNotEmpty()
    @IsInt()
    id_guia_madre: number;

    @IsNotEmpty()
    @IsInt()
    id_consignatario_principal: number;

    @IsNotEmpty()
    @IsInt()
    id_producto: number;

    @IsNotEmpty()
    @IsInt()
    id_agencia_iata: number;

    @IsNotEmpty()
    @IsInt()
    id_destino_awb: number;

    @IsNotEmpty()
    @IsInt()
    id_destino_final_docs: number;

    @IsNotEmpty()
    @IsDateString()
    fecha_vuelo: string;

    @IsNotEmpty()
    @IsEnum(['PREPAID', 'COLLECT'])
    pago: string;

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

    // Consignatarios adicionales
    @IsOptional()
    @IsArray()
    @Type(() => ConsignatarioDto)
    consignatarios_adicionales?: ConsignatarioDto[];
}