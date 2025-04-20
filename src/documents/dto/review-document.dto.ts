
// src/documents/dto/review-document.dto.ts
import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';

export enum DocumentoEstado {
    PENDIENTE = 'PENDIENTE',
    APROBADO = 'APROBADO',
    RECHAZADO = 'RECHAZADO',
}

export class ReviewDocumentoFincaDto {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsEnum(DocumentoEstado)
    @IsNotEmpty()
    estado: DocumentoEstado;

    @IsString()
    @IsOptional()
    comentario?: string;
}
