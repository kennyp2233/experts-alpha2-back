// src/documents/dto/update-document.dto.ts
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class UpdateDocumentoFincaDto {
    @IsString()
    @IsOptional()
    id: string;

    @IsString()
    @IsOptional()
    comentario?: string;
}