// src/documents/dto/guia-hija/update-guia-hija.dto.ts
import { IsOptional, IsInt, IsNumber, Min } from 'class-validator';

export class UpdateGuiaHijaDto {
    @IsOptional()
    @IsInt()
    id_producto?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    fulls?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    pcs?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    kgs?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    stems?: number;
}