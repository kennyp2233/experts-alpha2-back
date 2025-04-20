import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateOrigenDto {
    @IsString()
    tag: string;

    @IsString()
    nombre: string;

    @IsString()
    @IsOptional()
    aeropuerto?: string;

    @IsNumber()
    @IsOptional()
    id_pais?: number;

    @IsNumber()
    @IsOptional()
    id_cae_aduana?: number;
}

export class UpdateOrigenDto extends CreateOrigenDto { }