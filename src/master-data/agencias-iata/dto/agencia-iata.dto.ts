// src/master-data/agencias-iata/dto/agencia-iata.dto.ts
import { IsBoolean, IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAgenciaIataDto {
    @IsString()
    alias_shipper: string;

    @IsString()
    @IsOptional()
    nombre_shipper?: string;

    @IsString()
    @IsOptional()
    ruc_shipper?: string;

    @IsString()
    @IsOptional()
    direccion_shipper?: string;

    @IsString()
    @IsOptional()
    telefono_shipper?: string;

    @IsString()
    @IsOptional()
    ciudad_shipper?: string;

    @IsString()
    @IsOptional()
    pais_shipper?: string;

    @IsString()
    @IsOptional()
    nombre_carrier?: string;

    @IsString()
    @IsOptional()
    ruc_carrier?: string;

    @IsString()
    @IsOptional()
    direccion_carrier?: string;

    @IsString()
    @IsOptional()
    telefono_carrier?: string;

    @IsString()
    @IsOptional()
    ciudad_carrier?: string;

    @IsString()
    @IsOptional()
    pais_carrier?: string;

    @IsString()
    @IsOptional()
    iata_code_carrier?: string;

    @IsString()
    @IsOptional()
    registro_exportador?: string;

    @IsString()
    @IsOptional()
    codigo_operador?: string;

    @IsString()
    @IsOptional()
    codigo_consolidador?: string;

    @IsNumber()
    @IsOptional()
    comision?: number;

    @IsBoolean()
    @IsOptional()
    estado_agencia_iata?: boolean = true;
}

export class UpdateAgenciaIataDto extends CreateAgenciaIataDto { }