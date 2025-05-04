// src/documents/dto/create-document.dto.ts
import { IsNotEmpty, IsInt, IsString, IsOptional } from 'class-validator';

export class CreateDocumentoFincaDto {
  // Remove the id_finca field as it will be retrieved from user metadata
  @IsInt()
  @IsNotEmpty()
  id_tipo_documento: number;

  @IsString()
  @IsOptional()
  comentario?: string;
}