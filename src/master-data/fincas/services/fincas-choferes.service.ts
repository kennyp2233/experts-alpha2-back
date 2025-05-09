import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { FincasService } from './fincas.service';

@Injectable()
export class FincasChoferesService {
    constructor(
        private prisma: PrismaService,
        private fincasService: FincasService
    ) { }

    async getChoferes(fincaId: number) {
        // Verificar si existe la finca
        await this.fincasService.findOne(fincaId);

        return this.prisma.fincaChofer.findMany({
            where: { id_finca: fincaId },
            include: {
                chofer: true,
            },
        });
    }

    async asignarChofer(fincaId: number, idChofer: number) {
        // Verificar si existe la finca
        await this.fincasService.findOne(fincaId);

        // Verificar si existe el chofer
        const chofer = await this.prisma.chofer.findUnique({
            where: { id: idChofer },
        });

        if (!chofer) {
            throw new NotFoundException(`Chofer con ID ${idChofer} no encontrado`);
        }

        // Verificar si ya está asignado
        const asignacionExistente = await this.prisma.fincaChofer.findFirst({
            where: {
                id_finca: fincaId,
                id_chofer: idChofer,
            },
        });

        if (asignacionExistente) {
            throw new BadRequestException(`El chofer ya está asignado a esta finca`);
        }

        return this.prisma.fincaChofer.create({
            data: {
                id_finca: fincaId,
                id_chofer: idChofer,
            },
            include: {
                chofer: true,
                finca: {
                    select: {
                        id: true,
                        nombre_finca: true,
                        tag: true,
                    },
                },
            },
        });
    }

    async eliminarChofer(fincaId: number, idChofer: number) {
        // Verificar si existe la finca
        await this.fincasService.findOne(fincaId);

        // Verificar si existe la asignación
        const asignacion = await this.prisma.fincaChofer.findFirst({
            where: {
                id_finca: fincaId,
                id_chofer: idChofer,
            },
        });

        if (!asignacion) {
            throw new NotFoundException(`Asignación de chofer no encontrada`);
        }

        return this.prisma.fincaChofer.delete({
            where: {
                id_fincas_choferes: asignacion.id_fincas_choferes,
            },
        });
    }
}