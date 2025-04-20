import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
    CreateAerolineaDto,
    UpdateAerolineaDto,
    AerolineaPlantillaDto,
    CreateAerolineaWithPlantillaDto
} from './dto/aerolinea.dto';

@Injectable()
export class AerolineasService {
    constructor(private prisma: PrismaService) { }

    async findAll(includeInactive: boolean = false) {
        const where = includeInactive ? {} : { estado_activo: true };

        return this.prisma.aerolinea.findMany({
            where,
            include: {
                aerolineas_plantilla: true,
                origen1: true,
                destino1: true,
                via1: true,
                destino2: true,
                via2: true,
                destino3: true,
                via3: true,
            },
        });
    }

    async findOne(id: number) {
        const aerolinea = await this.prisma.aerolinea.findUnique({
            where: { id },
            include: {
                aerolineas_plantilla: true,
                origen1: true,
                destino1: true,
                via1: true,
                destino2: true,
                via2: true,
                destino3: true,
                via3: true,
            },
        });

        if (!aerolinea) {
            throw new NotFoundException(`Aerolínea con ID ${id} no encontrada`);
        }

        return aerolinea;
    }

    async create(createAerolineaDto: CreateAerolineaDto) {
        return this.prisma.aerolinea.create({
            data: createAerolineaDto,
        });
    }

    async createWithPlantilla(data: CreateAerolineaWithPlantillaDto) {
        // Iniciar una transacción para garantizar integridad
        return this.prisma.$transaction(async (tx) => {
            // Crear la aerolínea
            const aerolinea = await tx.aerolinea.create({
                data: data.aerolinea,
            });

            // Si se proporcionan datos de plantilla, crear la plantilla asociada
            if (data.plantilla) {
                await tx.aerolineasPlantilla.create({
                    data: {
                        id_aerolinea: aerolinea.id,
                        ...data.plantilla,
                    },
                });
            }

            // Retornar la aerolínea con su plantilla
            return this.findOne(aerolinea.id);
        });
    }

    async update(id: number, updateAerolineaDto: UpdateAerolineaDto) {
        // Verificar si existe
        await this.findOne(id);

        return this.prisma.aerolinea.update({
            where: { id },
            data: updateAerolineaDto,
        });
    }

    async updatePlantilla(id: number, plantillaDto: AerolineaPlantillaDto) {
        // Verificar si existe la aerolínea
        await this.findOne(id);

        // Verificar si existe la plantilla
        const existingPlantilla = await this.prisma.aerolineasPlantilla.findUnique({
            where: { id_aerolinea: id },
        });

        if (existingPlantilla) {
            // Actualizar plantilla existente
            return this.prisma.aerolineasPlantilla.update({
                where: { id_aerolinea: id },
                data: plantillaDto,
            });
        } else {
            // Crear nueva plantilla
            return this.prisma.aerolineasPlantilla.create({
                data: {
                    id_aerolinea: id,
                    ...plantillaDto,
                },
            });
        }
    }

    async remove(id: number) {
        // Verificar si existe
        await this.findOne(id);

        // Opción 1: Eliminación física (no recomendada debido a relaciones)
        // return this.prisma.aerolinea.delete({
        //   where: { id },
        // });

        // Opción 2: Eliminación lógica (recomendada)
        return this.prisma.aerolinea.update({
            where: { id },
            data: {
                estado_activo: false,
            },
        });
    }

    async restore(id: number) {
        // Verificar si existe
        await this.findOne(id);

        return this.prisma.aerolinea.update({
            where: { id },
            data: {
                estado_activo: true,
            },
        });
    }
}