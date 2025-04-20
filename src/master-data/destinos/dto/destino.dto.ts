import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDestinoDto {
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

    @IsString()
    @IsOptional()
    sesa_id?: string;

    @IsString()
    @IsOptional()
    leyenda_fito?: string;

    @IsBoolean()
    @IsOptional()
    cobro_fitos?: boolean = false;
}

export class UpdateDestinoDto extends CreateDestinoDto { }