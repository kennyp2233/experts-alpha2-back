
// src/documents/dto/upload-document-file.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class UploadDocumentoFileDto {
  @IsString()
  @IsNotEmpty()
  id_documento: string;
}