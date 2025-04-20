import { IsBoolean, IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAerolineaDto {
    @IsString()
    nombre: string;

    @IsString()
    @IsOptional()
    ci_ruc?: string;

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
    contacto?: string;

    @IsString()
    @IsOptional()
    modo?: string = 'AEROLINEA';

    @IsBoolean()
    @IsOptional()
    maestra_guias_hijas?: boolean = false;

    @IsString()
    @IsOptional()
    codigo?: string;

    @IsString()
    @IsOptional()
    prefijo_awb?: string;

    @IsString()
    @IsOptional()
    codigo_cae?: string;

    @IsBoolean()
    @IsOptional()
    estado_activo?: boolean = true;

    @IsNumber()
    @IsOptional()
    from1?: number;

    @IsNumber()
    @IsOptional()
    to1?: number;

    @IsNumber()
    @IsOptional()
    by1?: number;

    @IsNumber()
    @IsOptional()
    to2?: number;

    @IsNumber()
    @IsOptional()
    by2?: number;

    @IsNumber()
    @IsOptional()
    to3?: number;

    @IsNumber()
    @IsOptional()
    by3?: number;

    @IsBoolean()
    @IsOptional()
    afiliado_cass?: boolean = false;

    @IsBoolean()
    @IsOptional()
    guias_virtuales?: boolean = true;
}

export class UpdateAerolineaDto extends CreateAerolineaDto { }

export class AerolineaPlantillaDto {
    @IsString()
    @IsOptional()
    costo_guia_abrv?: string;

    @IsString()
    @IsOptional()
    combustible_abrv?: string;

    @IsString()
    @IsOptional()
    seguridad_abrv?: string;

    @IsString()
    @IsOptional()
    aux_calculo_abrv?: string;

    @IsString()
    @IsOptional()
    iva_abrv?: string;

    @IsString()
    @IsOptional()
    otros_abrv?: string;

    @IsString()
    @IsOptional()
    aux1_abrv?: string;

    @IsString()
    @IsOptional()
    aux2_abrv?: string;

    @IsNumber()
    @IsOptional()
    costo_guia_valor?: number = 0;

    @IsNumber()
    @IsOptional()
    combustible_valor?: number = 0;

    @IsNumber()
    @IsOptional()
    seguridad_valor?: number = 0;

    @IsNumber()
    @IsOptional()
    aux_calculo_valor?: number = 0;

    @IsNumber()
    @IsOptional()
    otros_valor?: number = 0;

    @IsNumber()
    @IsOptional()
    aux1_valor?: number = 0;

    @IsNumber()
    @IsOptional()
    aux2_valor?: number = 0;

    @IsString()
    @IsOptional()
    plantilla_guia_madre?: string;

    @IsString()
    @IsOptional()
    plantilla_formato_aerolinea?: string;

    @IsString()
    @IsOptional()
    plantilla_reservas?: string;

    @IsNumber()
    @IsOptional()
    tarifa_rate?: number = 0;

    @IsNumber()
    @IsOptional()
    pca?: number = 0;

    @IsString()
    @IsOptional()
    combustible_mult?: string;

    @IsString()
    @IsOptional()
    seguridad_mult?: string;

    @IsString()
    @IsOptional()
    aux_calc_mult?: string;

    @IsNumber()
    @IsOptional()
    iva_valor?: number = 0;
}

export class CreateAerolineaWithPlantillaDto {
    aerolinea: CreateAerolineaDto;

    @IsOptional()
    plantilla?: AerolineaPlantillaDto;
}