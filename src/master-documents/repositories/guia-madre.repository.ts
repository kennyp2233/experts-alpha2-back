import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EstadoGuiaMadre } from 'src/master-documents/documents.constants';

@Injectable()
export class GuiaMadreRepository {
    constructor(private prisma: PrismaService) { }

    async findById(id: number) {
        return this.prisma.guiaMadre.findUnique({
            where: { id },
            include: {
                documento_base: {
                    include: {
                        aerolinea: true,
                        referencia: true,
                    },
                },
                estadoActual: true,
                historialEstados: {
                    include: {
                        estado: true,
                        usuario: true,
                    },
                    orderBy: {
                        fecha_cambio: 'desc',
                    },
                },
                documento_coordinacion: {
                    include: {
                        estadoActual: true,
                    },
                },
                guias_hijas: {
                    include: {
                        finca: true,
                        estadoActual: true,
                    },
                },
            },
        });
    }

    async findAll(params: {
        where?: any,
        skip?: number,
        take?: number,
        orderBy?: any
    }) {
        const { where = {}, skip, take, orderBy = [{ prefijo: 'asc' }, { secuencial: 'asc' }] } = params;

        return this.prisma.guiaMadre.findMany({
            where,
            skip,
            take,
            include: {
                documento_base: {
                    include: {
                        aerolinea: true,
                        referencia: true,
                    },
                },
                estadoActual: true,
            },
            orderBy,
        });
    }

    async count(where: any) {
        return this.prisma.guiaMadre.count({ where });
    }

    async create(data: any) {
        return this.prisma.guiaMadre.create({
            data,
            include: {
                documento_base: {
                    include: {
                        aerolinea: true,
                    },
                },
                estadoActual: true,
            },
        });
    }

    async update(id: number, data: any) {
        return this.prisma.guiaMadre.update({
            where: { id },
            data,
            include: {
                documento_base: {
                    include: {
                        aerolinea: true,
                    },
                },
                estadoActual: true,
            },
        });
    }

    async createHistorialEstado(data: {
        id_guia_madre: number;
        id_estado: number;
        id_usuario: string;
        comentario?: string;
    }) {
        return this.prisma.guiaMadreEstado.create({
            data,
        });
    }

    async findEstadoByNombre(nombre: string) {
        return this.prisma.estadoDocumento.findFirst({
            where: {
                nombre,
                tipo_entidad: 'GUIA_MADRE',
            },
        });
    }

    async findDisponibles(aerolineaId?: number) {
        const estadoDisponible = await this.findEstadoByNombre(EstadoGuiaMadre.DISPONIBLE);

        if (!estadoDisponible) {
            return [];
        }

        const where: any = {
            id_estado_actual: estadoDisponible.id,
            prestamo: false,
            devolucion: false,
            documento_coordinacion: null,
        };

        if (aerolineaId) {
            where.documento_base = {
                id_aerolinea: aerolineaId,
            };
        }

        return this.findAll({ where });
    }
}