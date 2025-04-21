// src/master-data/cae-aduanas/cae-aduanas.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCaeAduanaDto, UpdateCaeAduanaDto } from './dto/cae-aduana.dto';

@Injectable()
export class CaeAduanasService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.caeAduana.findMany({
            include: {
                origenes: true,
            },
        });
    }

    async findOne(id: number) {
        const caeAduana = await this.prisma.caeAduana.findUnique({
            where: { id_cae_aduana: id },
            include: {
                origenes: true,
            },
        });

        if (!caeAduana) {
            throw new NotFoundException(`CAE Aduana con ID ${id} no encontrada`);
        }

        return caeAduana;
    }

    async create(createCaeAduanaDto: CreateCaeAduanaDto) {
        // Verificar si ya existe un código de aduana
        if (createCaeAduanaDto.codigo_aduana) {
            const existingAduana = await this.prisma.caeAduana.findFirst({
                where: { codigo_aduana: createCaeAduanaDto.codigo_aduana },
            });

            if (existingAduana) {
                throw new BadRequestException(`Ya existe una aduana con el código ${createCaeAduanaDto.codigo_aduana}`);
            }
        }

        return this.prisma.caeAduana.create({
            data: createCaeAduanaDto,
        });
    }

    async update(id: number, updateCaeAduanaDto: UpdateCaeAduanaDto) {
        // Verificar si existe
        await this.findOne(id);

        // Verificar si ya existe un código de aduana (si se está cambiando)
        if (updateCaeAduanaDto.codigo_aduana) {
            const aduanaToUpdate = await this.prisma.caeAduana.findUnique({
                where: { id_cae_aduana: id },
            });

            if (
                aduanaToUpdate &&
                updateCaeAduanaDto.codigo_aduana !== aduanaToUpdate.codigo_aduana
            ) {
                const existingAduana = await this.prisma.caeAduana.findFirst({
                    where: { codigo_aduana: updateCaeAduanaDto.codigo_aduana },
                });

                if (existingAduana) {
                    throw new BadRequestException(
                        `Ya existe una aduana con el código ${updateCaeAduanaDto.codigo_aduana}`
                    );
                }
            }
        }

        return this.prisma.caeAduana.update({
            where: { id_cae_aduana: id },
            data: updateCaeAduanaDto,
        });
    }

    async remove(id: number) {
        // Verificar si existe
        await this.findOne(id);

        // Verificar si está siendo utilizada por orígenes
        const origenesCount = await this.prisma.origen.count({
            where: { id_cae_aduana: id },
        });

        if (origenesCount > 0) {
            throw new BadRequestException(
                `No se puede eliminar la aduana porque está siendo utilizada por ${origenesCount} orígenes`
            );
        }

        return this.prisma.caeAduana.delete({
            where: { id_cae_aduana: id },
        });
    }
}
