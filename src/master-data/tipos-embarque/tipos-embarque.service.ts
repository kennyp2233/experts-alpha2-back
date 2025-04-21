// src/master-data/tipos-embarque/tipos-embarque.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTipoEmbarqueDto, UpdateTipoEmbarqueDto } from './dto/tipo-embarque.dto';

@Injectable()
export class TiposEmbarqueService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.tipoEmbarque.findMany({
            include: {
                carga: true,
                embalaje: true,
            },
        });
    }

    async findOne(id: number) {
        const tipoEmbarque = await this.prisma.tipoEmbarque.findUnique({
            where: { id },
            include: {
                carga: true,
                embalaje: true,
            },
        });

        if (!tipoEmbarque) {
            throw new NotFoundException(`Tipo de embarque con ID ${id} no encontrado`);
        }

        return tipoEmbarque;
    }

    async create(createTipoEmbarqueDto: CreateTipoEmbarqueDto) {
        // Validar que el tipo de carga existe (si se proporciona)
        if (createTipoEmbarqueDto.id_tipo_carga) {
            const tipoCarga = await this.prisma.tipoCarga.findUnique({
                where: { id: createTipoEmbarqueDto.id_tipo_carga },
            });

            if (!tipoCarga) {
                throw new NotFoundException(`Tipo de carga con ID ${createTipoEmbarqueDto.id_tipo_carga} no encontrado`);
            }
        }

        // Validar que el tipo de embalaje existe (si se proporciona)
        if (createTipoEmbarqueDto.id_tipo_embalaje) {
            const tipoEmbalaje = await this.prisma.tipoEmbalaje.findUnique({
                where: { id: createTipoEmbarqueDto.id_tipo_embalaje },
            });

            if (!tipoEmbalaje) {
                throw new NotFoundException(`Tipo de embalaje con ID ${createTipoEmbarqueDto.id_tipo_embalaje} no encontrado`);
            }
        }

        return this.prisma.tipoEmbarque.create({
            data: createTipoEmbarqueDto,
            include: {
                carga: true,
                embalaje: true,
            },
        });
    }

    async update(id: number, updateTipoEmbarqueDto: UpdateTipoEmbarqueDto) {
        // Verificar si existe
        await this.findOne(id);

        // Validar que el tipo de carga existe (si se proporciona)
        if (updateTipoEmbarqueDto.id_tipo_carga) {
            const tipoCarga = await this.prisma.tipoCarga.findUnique({
                where: { id: updateTipoEmbarqueDto.id_tipo_carga },
            });

            if (!tipoCarga) {
                throw new NotFoundException(`Tipo de carga con ID ${updateTipoEmbarqueDto.id_tipo_carga} no encontrado`);
            }
        }

        // Validar que el tipo de embalaje existe (si se proporciona)
        if (updateTipoEmbarqueDto.id_tipo_embalaje) {
            const tipoEmbalaje = await this.prisma.tipoEmbalaje.findUnique({
                where: { id: updateTipoEmbarqueDto.id_tipo_embalaje },
            });

            if (!tipoEmbalaje) {
                throw new NotFoundException(`Tipo de embalaje con ID ${updateTipoEmbarqueDto.id_tipo_embalaje} no encontrado`);
            }
        }

        return this.prisma.tipoEmbarque.update({
            where: { id },
            data: updateTipoEmbarqueDto,
            include: {
                carga: true,
                embalaje: true,
            },
        });
    }

    async remove(id: number) {
        // Verificar si existe
        await this.findOne(id);

        return this.prisma.tipoEmbarque.delete({
            where: { id },
        });
    }
}