import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TipoEntidad } from 'src/master-documents/documents.constants';

@Injectable()
export class GuiaHijaRepository {
    constructor(private prisma: PrismaService) { }

    async findById(id: number) {
        return this.prisma.guiaHija.findUnique({
            where: { id },
            include: {
                finca: true,
                producto: true,
                estadoActual: true,
                documento_coordinacion: {
                    include: {
                        guia_madre: {
                            include: {
                                documento_base: {
                                    include: {
                                        aerolinea: true,
                                    },
                                },
                            },
                        },
                        DocumentoConsignatario: {
                            include: {
                                consignatario: true
                            }
                        },
                        estadoActual: true,
                    },
                },
                guia_madre: true,
                historialEstados: {
                    include: {
                        estado: true,
                        usuario: {
                            select: {
                                id: true,
                                usuario: true,
                                email: true,
                            },
                        },
                    },
                    orderBy: {
                        fecha_cambio: 'desc',
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
        const { where = {}, skip, take, orderBy = [{ createdAt: 'desc' }] } = params;

        return this.prisma.guiaHija.findMany({
            where,
            skip,
            take,
            include: {
                finca: true,
                producto: true,
                estadoActual: true,
                documento_coordinacion: {
                    include: {
                        guia_madre: {
                            include: {
                                documento_base: {
                                    include: {
                                        aerolinea: true,
                                    },
                                },
                            },
                        },
                        DocumentoConsignatario: {
                            where: { es_principal: true },
                            include: {
                                consignatario: true
                            }
                        }
                    },
                },
                guia_madre: true,
            },
            orderBy,
        });
    }

    async count(where: any) {
        return this.prisma.guiaHija.count({ where });
    }

    async create(data: any) {
        return this.prisma.guiaHija.create({
            data,
            include: {
                producto: true,
                finca: true
            }
        });
    }

    async update(id: number, data: any) {
        return this.prisma.guiaHija.update({
            where: { id },
            data,
            include: {
                finca: true,
                producto: true,
                estadoActual: true,
                documento_coordinacion: {
                    include: {
                        guia_madre: true,
                    },
                },
            },
        });
    }

    async createHistorialEstado(data: {
        id_guia_hija: number;
        id_estado: number;
        id_usuario: string;
        comentario?: string;
    }) {
        return this.prisma.guiaHijaEstado.create({
            data,
        });
    }

    async findEstadoByNombre(nombre: string) {
        return this.prisma.estadoDocumento.findFirst({
            where: {
                nombre,
                tipo_entidad: TipoEntidad.GUIA_HIJA,
            },
        });
    }

    async findEstadoInicial() {
        return this.prisma.estadoDocumento.findFirst({
            where: {
                tipo_entidad: TipoEntidad.GUIA_HIJA,
                es_estado_inicial: true,
            },
        });
    }

    async getLastByYear(anio: number) {
        return this.prisma.guiaHija.findFirst({
            where: { anio },
            orderBy: { secuencial: 'desc' },
        });
    }

    async findByFincaAndGuiaMadre(id_finca: number, id_guia_madre: number) {
        return this.prisma.guiaHija.findFirst({
            where: {
                id_finca,
                id_guia_madre,
            },
        });
    }

    async findByFinca(id_finca: number, estado?: string) {
        const where: any = { id_finca };

        if (estado) {
            const estadoDoc = await this.findEstadoByNombre(estado);
            if (estadoDoc) {
                where.id_estado_actual = estadoDoc.id;
            }
        }

        return this.findAll({ where });
    }

    async findByDocumentoCoordinacion(id_documento_coordinacion: number) {
        return this.prisma.guiaHija.findMany({
            where: { id_documento_coordinacion },
            include: {
                finca: true,
                producto: true,
                estadoActual: true,
            },
            orderBy: { createdAt: 'asc' },
        });
    }
}