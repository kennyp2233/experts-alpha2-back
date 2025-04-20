// src/auth/dto/register-farm.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength, IsPhoneNumber, IsOptional, IsBoolean } from 'class-validator';

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
    @IsNotEmpty()
    tag: string;

    @IsString()
    @IsNotEmpty()
    ruc_finca: string;

    @IsString()
    @IsNotEmpty()
    tipo_documento: string;

    @IsBoolean()
    @IsOptional()
    genera_guias_certificadas?: boolean;

    @IsString()
    @IsNotEmpty()
    @IsPhoneNumber()
    i_general_telefono: string;

    @IsEmail()
    @IsNotEmpty()
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
}