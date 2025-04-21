
// src/master-data/tipos-embarque/tipos-embalaje/tipos-embalaje.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTipoEmbalajeDto, UpdateTipoEmbalajeDto } from './dto/tipo-embalaje.dto';

@Injectable()
export class TiposEmbalajeService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.tipoEmbalaje.findMany();
    }

    async findOne(id: number) {
        const tipoEmbalaje = await this.prisma.tipoEmbalaje.findUnique({
            where: { id },
            include: {
                tipos_embarque: true,
            },
        });

        if (!tipoEmbalaje) {
            throw new NotFoundException(`Tipo de embalaje con ID ${id} no encontrado`);
        }

        return tipoEmbalaje;
    }

    async create(createTipoEmbalajeDto: CreateTipoEmbalajeDto) {
        return this.prisma.tipoEmbalaje.create({
            data: createTipoEmbalajeDto,
        });
    }

    async update(id: number, updateTipoEmbalajeDto: UpdateTipoEmbalajeDto) {
        // Verificar si existe
        await this.findOne(id);

        return this.prisma.tipoEmbalaje.update({
            where: { id },
            data: updateTipoEmbalajeDto,
        });
    }

    async remove(id: number) {
        // Verificar si existe
        await this.findOne(id);

        // Verificar si está siendo utilizado en tipos de embarque
        const embarquesCount = await this.prisma.tipoEmbarque.count({
            where: { id_tipo_embalaje: id },
        });

        if (embarquesCount > 0) {
            throw new BadRequestException(
                `No se puede eliminar el tipo de embalaje porque está siendo utilizado en ${embarquesCount} tipos de embarque`
            );
        }

        return this.prisma.tipoEmbalaje.delete({
            where: { id },
        });
    }
}
