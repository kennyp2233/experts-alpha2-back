// src/master-data/tipos-embarque/dto/tipo-embarque.dto.ts
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTipoEmbarqueDto {
    @IsString()
    @IsOptional()
    tag?: string;

    @IsString()
    @IsOptional()
    nombre?: string;

    @IsNumber()
    @IsOptional()
    id_tipo_carga?: number;

    @IsNumber()
    @IsOptional()
    id_tipo_embalaje?: number;

    @IsString()
    @IsOptional()
    regimen?: string;

    @IsString()
    @IsOptional()
    mercancia?: string;

    @IsString()
    @IsOptional()
    harmonised_comidity?: string;
}

export class UpdateTipoEmbarqueDto extends CreateTipoEmbarqueDto { }
