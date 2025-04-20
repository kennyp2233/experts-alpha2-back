// src/documents/dto/create-document.dto.ts
import { IsNotEmpty, IsInt, IsString, IsOptional } from 'class-validator';

export class CreateDocumentoFincaDto {
  @IsInt()
  @IsNotEmpty()
  id_finca: number;

  @IsInt()
  @IsNotEmpty()
  id_tipo_documento: number;

  @IsString()
  @IsOptional()
  comentario?: string;
}
