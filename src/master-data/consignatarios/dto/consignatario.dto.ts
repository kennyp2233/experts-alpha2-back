// src/master-data/consignatarios/dto/consignatario.dto.ts
import { IsEmail, IsInt, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateConsignatarioDto {
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

    @IsInt()
    id_cliente: number;

    @IsInt()
    id_embarcador: number;
}

export class UpdateConsignatarioDto extends CreateConsignatarioDto { }

// DTOs para información adicional
export class ConsignatarioCaeSiceDto {
    @IsString()
    @IsOptional()
    consignee_nombre?: string;

    @IsString()
    @IsOptional()
    consignee_direccion?: string;

    @IsString()
    @IsOptional()
    consignee_documento?: string;

    @IsString()
    @IsOptional()
    consignee_siglas_pais?: string;

    @IsString()
    @IsOptional()
    notify_nombre?: string;

    @IsString()
    @IsOptional()
    notify_direccion?: string;

    @IsString()
    @IsOptional()
    notify_documento?: string;

    @IsString()
    @IsOptional()
    notify_siglas_pais?: string;

    @IsString()
    @IsOptional()
    hawb_nombre?: string;

    @IsString()
    @IsOptional()
    hawb_direccion?: string;

    @IsString()
    @IsOptional()
    hawb_documento?: string;

    @IsString()
    @IsOptional()
    hawb_siglas_pais?: string;

    @IsString()
    @IsOptional()
    consignee_tipo_documento?: string;

    @IsString()
    @IsOptional()
    notify_tipo_documento?: string;

    @IsString()
    @IsOptional()
    hawb_tipo_documento?: string;
}

export class ConsignatarioFacturacionDto {
    @IsString()
    @IsOptional()
    factura_nombre?: string;

    @IsString()
    @IsOptional()
    factura_ruc?: string;

    @IsString()
    @IsOptional()
    factura_direccion?: string;

    @IsString()
    @IsOptional()
    factura_telefono?: string;
}

export class ConsignatarioFitoDto {
    @IsString()
    @IsOptional()
    fito_declared_name?: string;

    @IsString()
    @IsOptional()
    fito_forma_a?: string;

    @IsString()
    @IsOptional()
    fito_nombre?: string;

    @IsString()
    @IsOptional()
    fito_direccion?: string;

    @IsString()
    @IsOptional()
    fito_pais?: string;
}

export class ConsignatarioGuiaHDto {
    @IsString()
    @IsOptional()
    guia_h_consignee?: string;

    @IsString()
    @IsOptional()
    guia_h_name_adress?: string;

    @IsString()
    @IsOptional()
    guia_h_notify?: string;
}

export class ConsignatarioGuiaMDto {
    @IsInt()
    @IsOptional()
    id_destino?: number;

    @IsString()
    @IsOptional()
    guia_m_consignee?: string;

    @IsString()
    @IsOptional()
    guia_m_name_address?: string;

    @IsString()
    @IsOptional()
    guia_m_notify?: string;
}

export class ConsignatarioTransmisionDto {
    @IsString()
    @IsOptional()
    consignee_nombre_trans?: string;

    @IsString()
    @IsOptional()
    consignee_direccion_trans?: string;

    @IsString()
    @IsOptional()
    consignee_ciudad_trans?: string;

    @IsString()
    @IsOptional()
    consignee_provincia_trans?: string;

    @IsString()
    @IsOptional()
    consignee_pais_trans?: string;

    @IsString()
    @IsOptional()
    consignee_eueori_trans?: string;

    @IsString()
    @IsOptional()
    notify_nombre_trans?: string;

    @IsString()
    @IsOptional()
    notify_direccion_trans?: string;

    @IsString()
    @IsOptional()
    notify_ciudad_trans?: string;

    @IsString()
    @IsOptional()
    notify_provincia_trans?: string;

    @IsString()
    @IsOptional()
    notify_pais_trans?: string;

    @IsString()
    @IsOptional()
    notify_eueori_trans?: string;

    @IsString()
    @IsOptional()
    hawb_nombre_trans?: string;

    @IsString()
    @IsOptional()
    hawb_direccion_trans?: string;

    @IsString()
    @IsOptional()
    hawb_ciudad_trans?: string;

    @IsString()
    @IsOptional()
    hawb_provincia_trans?: string;

    @IsString()
    @IsOptional()
    hawb_pais_trans?: string;

    @IsString()
    @IsOptional()
    hawb_eueori_trans?: string;
}

export class UpdateConsignatarioInfoAdicionalDto {
    @IsObject()
    @IsOptional()
    @ValidateNested()
    @Type(() => ConsignatarioCaeSiceDto)
    cae_sice?: ConsignatarioCaeSiceDto;

    @IsObject()
    @IsOptional()
    @ValidateNested()
    @Type(() => ConsignatarioFacturacionDto)
    facturacion?: ConsignatarioFacturacionDto;

    @IsObject()
    @IsOptional()
    @ValidateNested()
    @Type(() => ConsignatarioFitoDto)
    fito?: ConsignatarioFitoDto;

    @IsObject()
    @IsOptional()
    @ValidateNested()
    @Type(() => ConsignatarioGuiaHDto)
    guia_h?: ConsignatarioGuiaHDto;

    @IsObject()
    @IsOptional()
    @ValidateNested()
    @Type(() => ConsignatarioGuiaMDto)
    guia_m?: ConsignatarioGuiaMDto;

    @IsObject()
    @IsOptional()
    @ValidateNested()
    @Type(() => ConsignatarioTransmisionDto)
    transmision?: ConsignatarioTransmisionDto;
}