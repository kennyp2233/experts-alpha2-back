// src/master-data/fincas/dto/finca.dto.ts
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateFincaDto {
    @IsString()
    nombre_finca: string;

    @IsString()
    tag: string;

    @IsString()
    @IsOptional()
    ruc_finca?: string;

    @IsString()
    tipo_documento: string;

    @IsBoolean()
    @IsOptional()
    genera_guias_certificadas?: boolean;

    @IsString()
    @IsOptional()
    i_general_telefono?: string;

    @IsEmail()
    @IsOptional()
    i_general_email?: string;

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

    @IsString()
    @IsOptional()
    a_nombre?: string;

    @IsString()
    @IsOptional()
    a_codigo?: string;

    @IsString()
    @IsOptional()
    a_direccion?: string;

    @IsBoolean()
    @IsOptional()
    activo?: boolean = true;
}

export class UpdateFincaDto extends CreateFincaDto { }

export class AsignarChoferDto {
    @IsString()
    id_chofer: number;
}

export class AsignarProductoDto {
    @IsString()
    id_producto: number;
}