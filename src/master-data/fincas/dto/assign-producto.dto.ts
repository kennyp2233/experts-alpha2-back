// src/master-data/fincas/dto/assign-producto.dto.ts
import { IsInt, IsNotEmpty } from 'class-validator';

export class AssignProductoDto {
    @IsInt()
    @IsNotEmpty()
    id_producto: number;
}