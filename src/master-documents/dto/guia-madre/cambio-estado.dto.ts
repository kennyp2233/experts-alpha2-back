// src/documents/dto/guia-madre/cambio-estado.dto.ts
import { IsNotEmpty, IsInt, IsOptional, IsString } from 'class-validator';

export class CambioEstadoDto {
    @IsNotEmpty()
    @IsInt()
    nuevoEstadoId: number;

    @IsOptional()
    @IsString()
    comentario?: string;
}