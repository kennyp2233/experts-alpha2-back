// src/master-documents/dto/documento-coordinacion/asignar-consignatario.dto.ts
import { IsNotEmpty, IsInt, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ConsignatarioItemDto {
    @IsNotEmpty()
    @IsInt()
    id_consignatario: number;

    @IsNotEmpty()
    @IsBoolean()
    es_principal: boolean;
}

export class AsignarConsignatarioDto {
    @IsNotEmpty()
    @IsInt()
    id_documento_coordinacion: number;

    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ConsignatarioItemDto)
    consignatarios: ConsignatarioItemDto[];
}