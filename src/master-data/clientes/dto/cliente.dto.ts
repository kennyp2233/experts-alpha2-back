// src/master-data/clientes/dto/cliente.dto.ts
import { IsBoolean, IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateClienteDto {
    @IsString()
    nombre: string;

    @IsString()
    @IsOptional()
    ruc?: string;

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
    cliente_codigo_pais?: string;

    @IsNumber()
    @IsOptional()
    fitos_valor?: number;

    @IsNumber()
    @IsOptional()
    form_a?: number;

    @IsNumber()
    @IsOptional()
    transport?: number;

    @IsNumber()
    @IsOptional()
    termo?: number;

    @IsNumber()
    @IsOptional()
    mica?: number;

    @IsNumber()
    @IsOptional()
    handling?: number;

    @IsString()
    @IsOptional()
    cuenta_contable?: string;

    @IsString()
    @IsOptional()
    nombre_factura?: string;

    @IsString()
    @IsOptional()
    ruc_factura?: string;

    @IsString()
    @IsOptional()
    direccion_factura?: string;

    @IsString()
    @IsOptional()
    telefono_factura?: string;

    @IsBoolean()
    @IsOptional()
    activo?: boolean = true;
}

export class UpdateClienteDto extends CreateClienteDto { }