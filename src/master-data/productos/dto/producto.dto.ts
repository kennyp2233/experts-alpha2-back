// src/master-data/productos/dto/producto.dto.ts
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductoDto {
    @IsString()
    @IsOptional()
    tag?: string;

    @IsString()
    @IsOptional()
    nombre?: string;

    @IsString()
    @IsOptional()
    descripcion?: string;

    @IsString()
    @IsOptional()
    nombre_botanico?: string;

    @IsString()
    @IsOptional()
    especie?: string;

    @IsNumber()
    @IsOptional()
    id_medida?: number;

    @IsNumber()
    @IsOptional()
    precio_unitario?: number;

    @IsBoolean()
    @IsOptional()
    estado?: boolean = true;

    @IsNumber()
    @IsOptional()
    id_opcion?: number;

    @IsNumber()
    @IsOptional()
    stems_por_full?: number;

    @IsNumber()
    @IsOptional()
    id_sesa?: number;

    @IsString()
    medida: string;

    @IsString()
    opcion: string;
}

export class UpdateProductoDto extends CreateProductoDto { }

export class ProductoArancelesDto {
    @IsString()
    @IsOptional()
    aranceles_destino?: string;

    @IsString()
    @IsOptional()
    aranceles_codigo?: string;
}

export class ProductoCompuestoDto {
    @IsString()
    @IsOptional()
    destino?: string;

    @IsString()
    @IsOptional()
    declaracion?: string;
}

export class ProductoMiProDto {
    @IsString()
    @IsOptional()
    acuerdo?: string;

    @IsString()
    @IsOptional()
    djocode?: string;

    @IsString()
    @IsOptional()
    tariffcode?: string;
}