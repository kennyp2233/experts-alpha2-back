// src/master-data/tipos-embarque/tipos-carga/dto/tipo-carga.dto.ts
import { IsString } from 'class-validator';

export class CreateTipoCargaDto {
    @IsString()
    nombre: string;
}

export class UpdateTipoCargaDto extends CreateTipoCargaDto { }