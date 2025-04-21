// src/master-data/choferes/choferes.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateChoferDto, UpdateChoferDto } from './dto/chofer.dto';

@Injectable()
export class ChoferesService {
    constructor(private prisma: PrismaService) { }

    async findAll(includeInactive: boolean = false) {
        const where = includeInactive ? {} : { estado: true };

        return this.prisma.chofer.findMany({
            where,
            include: {
                fincas_choferes: {
                    include: {
                        finca: {
                            select: {
                                id: true,
                                nombre_finca: true,
                                tag: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async findOne(id: number) {
        const chofer = await this.prisma.chofer.findUnique({
            where: { id },
            include: {
                fincas_choferes: {
                    include: {
                        finca: {
                            select: {
                                id: true,
                                nombre_finca: true,
                                tag: true,
                            },
                        },
                    },
                },
            },
        });

        if (!chofer) {
            throw new NotFoundException(`Chofer con ID ${id} no encontrado`);
        }

        return chofer;
    }

    async create(createChoferDto: CreateChoferDto) {
        // Verificar que la identificación no existe
        const existingChofer = await this.prisma.chofer.findFirst({
            where: { ruc: createChoferDto.ruc },
        });

        if (existingChofer) {
            throw new BadRequestException(`Ya existe un chofer con la identificación ${createChoferDto.ruc}`);
        }

        return this.prisma.chofer.create({
            data: createChoferDto,
        });
    }

    async update(id: number, updateChoferDto: UpdateChoferDto) {
        // Verificar si existe
        await this.findOne(id);

        // Verificar que la identificación no existe (si se está cambiando)
        const choferToUpdate = await this.prisma.chofer.findUnique({
            where: { id },
        });

        if (choferToUpdate && updateChoferDto.ruc !== choferToUpdate.ruc) {
            const existingChofer = await this.prisma.chofer.findFirst({
                where: { ruc: updateChoferDto.ruc },
            });

            if (existingChofer) {
                throw new BadRequestException(`Ya existe un chofer con la identificación ${updateChoferDto.ruc}`);
            }
        }

        return this.prisma.chofer.update({
            where: { id },
            data: updateChoferDto,
        });
    }

    async remove(id: number) {
        // Verificar si existe
        await this.findOne(id);

        // Eliminación lógica
        return this.prisma.chofer.update({
            where: { id },
            data: {
                estado: false,
            },
        });
    }

    async restore(id: number) {
        // Verificar si existe
        await this.findOne(id);

        return this.prisma.chofer.update({
            where: { id },
            data: {
                estado: true,
            },
        });
    }
}