// src/master-data/fincas/dto/assign-chofer.dto.ts
import { IsInt, IsNotEmpty } from 'class-validator';

export class AssignChoferDto {
    @IsInt()
    @IsNotEmpty()
    id_chofer: number;
}
