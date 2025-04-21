// src/master-data/embarcadores/embarcadores.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmbarcadorDto, UpdateEmbarcadorDto } from './dto/embarcador.dto';

@Injectable()
export class EmbarcadoresService {
    constructor(private prisma: PrismaService) { }

    async findAll(includeInactive: boolean = false) {
        const where = includeInactive ? {} : { estado: true };

        return this.prisma.embarcador.findMany({
            where,
            include: {
                consignatarios: {
                    select: {
                        id: true,
                        nombre: true,
                    },
                },
            },
        });
    }

    async search(term: string) {
        const searchTerm = term ? `%${term}%` : '%';

        return this.prisma.$queryRaw`
      SELECT e.*, COUNT(c.id) as consignatarios_count
      FROM "Embarcador" e
      LEFT JOIN "Consignatario" c ON e.id = c.id_embarcador
      WHERE 
        e.nombre ILIKE ${searchTerm} OR
        e.ci ILIKE ${searchTerm} OR
        e.email ILIKE ${searchTerm} OR
        e.ciudad ILIKE ${searchTerm} OR
        e.pais ILIKE ${searchTerm}
      GROUP BY e.id
      ORDER BY e.nombre
    `;
    }

    async findOne(id: number) {
        const embarcador = await this.prisma.embarcador.findUnique({
            where: { id },
            include: {
                consignatarios: {
                    include: {
                        cliente: {
                            select: {
                                id: true,
                                nombre: true,
                            },
                        },
                    },
                },
            },
        });

        if (!embarcador) {
            throw new NotFoundException(`Embarcador con ID ${id} no encontrado`);
        }

        return embarcador;
    }

    async create(createEmbarcadorDto: CreateEmbarcadorDto) {
        // Verificar que la identificación no existe (si se proporciona)
        if (createEmbarcadorDto.ci) {
            const existingEmbarcador = await this.prisma.embarcador.findFirst({
                where: { ci: createEmbarcadorDto.ci },
            });

            if (existingEmbarcador) {
                throw new BadRequestException(`Ya existe un embarcador con la identificación ${createEmbarcadorDto.ci}`);
            }
        }

        return this.prisma.embarcador.create({
            data: createEmbarcadorDto,
        });
    }

    async update(id: number, updateEmbarcadorDto: UpdateEmbarcadorDto) {
        // Verificar si existe
        await this.findOne(id);

        // Verificar que la identificación no existe (si se está cambiando y se proporciona)
        if (updateEmbarcadorDto.ci) {
            const embarcadorToUpdate = await this.prisma.embarcador.findUnique({
                where: { id },
            });

            if (embarcadorToUpdate && updateEmbarcadorDto.ci !== embarcadorToUpdate.ci) {
                const existingEmbarcador = await this.prisma.embarcador.findFirst({
                    where: { ci: updateEmbarcadorDto.ci },
                });

                if (existingEmbarcador) {
                    throw new BadRequestException(
                        `Ya existe un embarcador con la identificación ${updateEmbarcadorDto.ci}`
                    );
                }
            }
        }

        return this.prisma.embarcador.update({
            where: { id },
            data: updateEmbarcadorDto,
        });
    }

    async remove(id: number) {
        // Verificar si existe
        await this.findOne(id);

        // Verificar si tiene consignatarios asociados
        const consignatariosCount = await this.prisma.consignatario.count({
            where: { id_embarcador: id },
        });

        if (consignatariosCount > 0) {
            throw new BadRequestException(
                `No se puede eliminar el embarcador porque está siendo utilizado por ${consignatariosCount} consignatarios`
            );
        }

        // Opción 1: Eliminación física
        // return this.prisma.embarcador.delete({
        //     where: { id },
        // });

        // Opción 2: Eliminación lógica (recomendada)
        return this.prisma.embarcador.update({
            where: { id },
            data: {
                estado: false,
            },
        });
    }

    async restore(id: number) {
        // Verificar si existe
        await this.findOne(id);

        return this.prisma.embarcador.update({
            where: { id },
            data: {
                estado: true,
            },
        });
    }
}