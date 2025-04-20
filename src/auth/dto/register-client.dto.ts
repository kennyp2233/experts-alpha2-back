// src/auth/dto/register-client.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength, IsPhoneNumber, IsOptional } from 'class-validator';

export class RegisterClientDto {
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
    nombre: string;

    @IsString()
    @IsNotEmpty()
    @IsPhoneNumber()
    telefono: string;

    @IsString()
    @IsOptional()
    ruc?: string;

    @IsString()
    @IsOptional()
    direccion?: string;

    @IsString()
    @IsOptional()
    ciudad?: string;

    @IsString()
    @IsOptional()
    pais?: string;
}
