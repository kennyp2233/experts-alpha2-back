// src/master-data/embarcadores/dto/embarcador.dto.ts
import { IsBoolean, IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateEmbarcadorDto {
    @IsString()
    nombre: string;

    @IsString()
    @IsOptional()
    ci?: string;

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
    provincia?: string;

    @IsString()
    @IsOptional()
    pais?: string;

    @IsString()
    @IsOptional()
    embarcador_codigo_pais?: string;

    @IsNumber()
    @IsOptional()
    handling?: number;

    @IsBoolean()
    @IsOptional()
    estado?: boolean = true;
}

export class UpdateEmbarcadorDto extends CreateEmbarcadorDto { }