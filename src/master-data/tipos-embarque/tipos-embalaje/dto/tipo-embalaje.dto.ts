// src/master-data/tipos-embarque/tipos-embalaje/dto/tipo-embalaje.dto.ts
import { IsString } from 'class-validator';

export class CreateTipoEmbalajeDto {
    @IsString()
    nombre: string;
}

export class UpdateTipoEmbalajeDto extends CreateTipoEmbalajeDto { }