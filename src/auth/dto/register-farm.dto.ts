// src/auth/dto/register-farm.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength, IsPhoneNumber, IsOptional, IsBoolean, IsArray, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

// DTO para productos asociados a la finca
class ProductoFincaDto {
    @IsInt()
    @IsNotEmpty()
    id_producto: number;
}

// DTO para choferes asociados a la finca
class ChoferFincaDto {
    @IsInt()
    @IsNotEmpty()
    id_chofer: number;
}

export class RegisterFarmDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @IsString()
    @IsNotEmpty()
    nombre_finca: string;

    @IsString()
    @IsOptional()
    tag: string;

    @IsString()
    @IsNotEmpty()
    ruc_finca: string;

    @IsString()
    @IsOptional()
    tipo_documento: string;

    @IsBoolean()
    @IsOptional()
    genera_guias_certificadas?: boolean;

    @IsString()
    @IsOptional()
    @IsPhoneNumber()
    i_general_telefono: string;

    @IsEmail()
    @IsOptional()
    i_general_email: string;

    @IsString()
    @IsOptional()
    i_general_ciudad?: string;

    @IsString()
    @IsOptional()
    i_general_provincia?: string;

    @IsString()
    @IsOptional()
    i_general_pais?: string;

    @IsString()
    @IsOptional()
    i_general_cod_sesa?: string;

    @IsString()
    @IsOptional()
    i_general_cod_pais?: string;

    // Nuevos campos para datos adicionales
    @IsString()
    @IsOptional()
    a_nombre?: string;

    @IsString()
    @IsOptional()
    a_codigo?: string;

    @IsString()
    @IsOptional()
    a_direccion?: string;

    // Lista opcional de productos asociados a la finca
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => ProductoFincaDto)
    productos?: ProductoFincaDto[];

    // Lista opcional de choferes asociados a la finca
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => ChoferFincaDto)
    choferes?: ChoferFincaDto[];
}