import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TipoEntidad } from 'src/master-documents/documents.constants';

@Injectable()
export class DocumentoCoordinacionRepository {
    constructor(private prisma: PrismaService) { }

    async findById(id: number) {
        return this.prisma.documentoCoordinacion.findUnique({
            where: { id },
            include: {
                guia_madre: {
                    include: {
                        documento_base: {
                            include: {
                                aerolinea: true,
                                referencia: true,
                            },
                        },
                        estadoActual: true,
                    },
                },
                producto: true,
                agencia_iata: true,
                destino_awb: true,
                destino_final_docs: true,
                estadoActual: true,
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
                DocumentoConsignatario: {
                    include: {
                        consignatario: {
                            include: {
                                cliente: true,
                                embarcador: true,
                                cae_sice: true,
                                facturacion: true,
                                fito: true,
                                guia_h: true,
                                guia_m: true,
                                transmision: true
                            }
                        }
                    },
                    orderBy: {
                        es_principal: 'desc' // Primero los principales
                    }
                },
                guias_hijas: {
                    include: {
                        finca: true,
                        producto: true,
                        estadoActual: true,
                    },
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
                origen_from1: true,
                destino_to1: true,
                aerolinea_by1: true,
                destino_to2: true,
                aerolinea_by2: true,
                destino_to3: true,
                aerolinea_by3: true,
            },
        });
    }

    async findAll(params: {
        where?: any,
        skip?: number,
        take?: number,
        orderBy?: any
    }) {
        const { where = {}, skip, take, orderBy = [
            { fecha_vuelo: 'desc' },
            { createdAt: 'desc' },
        ] } = params;

        return this.prisma.documentoCoordinacion.findMany({
            where,
            skip,
            take,
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
                producto: true,
                agencia_iata: true,
                destino_awb: true,
                destino_final_docs: true,
                estadoActual: true,
                DocumentoConsignatario: {
                    include: {
                        consignatario: true
                    }
                },
                guias_hijas: {
                    include: {
                        finca: true,
                        estadoActual: true,
                    },
                },
            },
            orderBy,
        });
    }

    async count(where: any) {
        return this.prisma.documentoCoordinacion.count({ where });
    }

    async create(data: any) {
        return this.prisma.documentoCoordinacion.create({
            data,
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
                producto: true,
                agencia_iata: true,
                destino_awb: true,
                destino_final_docs: true,
                estadoActual: true,
            },
        });
    }

    async update(id: number, data: any) {
        return this.prisma.documentoCoordinacion.update({
            where: { id },
            data,
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
                producto: true,
                agencia_iata: true,
                destino_awb: true,
                destino_final_docs: true,
                estadoActual: true,
            },
        });
    }

    async createHistorialEstado(data: {
        id_doc_coordinacion: number;
        id_estado: number;
        id_usuario: string;
        comentario?: string;
    }) {
        return this.prisma.documentoCoordinacionEstado.create({
            data,
        });
    }

    async findEstadoByNombre(nombre: string) {
        return this.prisma.estadoDocumento.findFirst({
            where: {
                nombre,
                tipo_entidad: TipoEntidad.DOC_COORDINACION,
            },
        });
    }

    async findEstadoInicial() {
        return this.prisma.estadoDocumento.findFirst({
            where: {
                tipo_entidad: TipoEntidad.DOC_COORDINACION,
                es_estado_inicial: true,
            },
        });
    }

    async createConsignatario(data: {
        id_documento_coordinacion: number;
        id_consignatario: number;
        es_principal: boolean;
    }) {
        return this.prisma.documentoConsignatario.create({
            data,
            include: {
                consignatario: true
            }
        });
    }

    async deleteConsignatarios(id_documento_coordinacion: number) {
        return this.prisma.documentoConsignatario.deleteMany({
            where: { id_documento_coordinacion }
        });
    }

    async findConsignatarios(id_documento_coordinacion: number) {
        return this.prisma.documentoConsignatario.findMany({
            where: { id_documento_coordinacion },
            include: {
                consignatario: {
                    include: {
                        cliente: true,
                        embarcador: true,
                        cae_sice: true,
                        facturacion: true,
                        fito: true,
                        guia_h: true,
                        guia_m: true,
                        transmision: true
                    }
                }
            },
            orderBy: {
                es_principal: 'desc' // Primero los principales
            }
        });
    }
}