// src/master-data/funcionarios-agrocalidad/dto/funcionario-agrocalidad.dto.ts
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateFuncionarioAgrocalidadDto {
    @IsString()
    nombre: string;

    @IsString()
    @IsOptional()
    telefono?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsBoolean()
    @IsOptional()
    estado?: boolean = true;
}

export class UpdateFuncionarioAgrocalidadDto extends CreateFuncionarioAgrocalidadDto { }