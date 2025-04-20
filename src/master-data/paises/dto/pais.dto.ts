import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePaisDto {
    @IsString()
    siglas_pais: string;

    @IsString()
    nombre: string;

    @IsNumber()
    @IsOptional()
    id_acuerdo?: number;
}

export class UpdatePaisDto extends CreatePaisDto { }