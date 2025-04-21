// src/master-data/tipos-embarque/tipos-carga/tipos-carga.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTipoCargaDto, UpdateTipoCargaDto } from './dto/tipo-carga.dto';

@Injectable()
export class TiposCargaService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.tipoCarga.findMany();
    }

    async findOne(id: number) {
        const tipoCarga = await this.prisma.tipoCarga.findUnique({
            where: { id },
            include: {
                tipos_embarque: true,
            },
        });

        if (!tipoCarga) {
            throw new NotFoundException(`Tipo de carga con ID ${id} no encontrado`);
        }

        return tipoCarga;
    }

    async create(createTipoCargaDto: CreateTipoCargaDto) {
        return this.prisma.tipoCarga.create({
            data: createTipoCargaDto,
        });
    }

    async update(id: number, updateTipoCargaDto: UpdateTipoCargaDto) {
        // Verificar si existe
        await this.findOne(id);

        return this.prisma.tipoCarga.update({
            where: { id },
            data: updateTipoCargaDto,
        });
    }

    async remove(id: number) {
        // Verificar si existe
        await this.findOne(id);

        // Verificar si está siendo utilizado en tipos de embarque
        const embarquesCount = await this.prisma.tipoEmbarque.count({
            where: { id_tipo_carga: id },
        });

        if (embarquesCount > 0) {
            throw new BadRequestException(
                `No se puede eliminar el tipo de carga porque está siendo utilizado en ${embarquesCount} tipos de embarque`
            );
        }

        return this.prisma.tipoCarga.delete({
            where: { id },
        });
    }
}