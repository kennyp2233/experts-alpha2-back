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

    /**
     * Encuentra una guía hija por finca y guía madre
     */
    async findByFincaAndGuiaMadre(id_finca: number, id_guia_madre: number) {
        return this.prisma.guiaHija.findFirst({
            where: {
                id_finca,
                id_guia_madre,
            },
            include: {
                documento_coordinacion: {
                    include: {
                        DocumentoConsignatario: {
                            include: {
                                consignatario: true
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Encuentra una guía hija por combinación única de finca, guía madre, consignatario y producto
     */
    async findByUniqueCombination(
        id_finca: number,
        id_guia_madre: number,
        id_consignatario: number,
        id_producto: number
    ) {
        return this.prisma.guiaHija.findFirst({
            where: {
                id_finca,
                id_guia_madre,
                id_producto,
                documento_coordinacion: {
                    DocumentoConsignatario: {
                        some: {
                            id_consignatario,
                            es_principal: true
                        }
                    }
                }
            },
            include: {
                documento_coordinacion: {
                    include: {
                        DocumentoConsignatario: {
                            where: {
                                es_principal: true
                            },
                            include: {
                                consignatario: true
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Obtiene la última guía hija para una finca específica
     */
    async getLastByFinca(id_finca: number, anio: number) {
        return this.prisma.guiaHija.findFirst({
            where: {
                id_finca,
                anio
            },
            orderBy: { secuencial: 'desc' },
        });
    }

    /**
     * Busca guías hijas por finca
     */
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

    /**
     * Encuentra guías hijas por documento de coordinación
     */
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

    /**
     * Encuentra el número de guías hijas existentes para una finca
     */
    async countGuiasByFinca(id_finca: number) {
        return this.prisma.guiaHija.count({
            where: { id_finca }
        });
    }

    /**
     * Encuentra todas las guías hijas existentes para una combinación de finca y marcación (consignatario)
     */
    async findByFincaAndConsignatario(id_finca: number, id_consignatario: number) {
        return this.prisma.guiaHija.findMany({
            where: {
                id_finca,
                documento_coordinacion: {
                    DocumentoConsignatario: {
                        some: {
                            id_consignatario,
                            es_principal: true
                        }
                    }
                }
            },
            include: {
                producto: true,
                documento_coordinacion: {
                    include: {
                        DocumentoConsignatario: {
                            where: {
                                es_principal: true
                            },
                            include: {
                                consignatario: true
                            }
                        }
                    }
                }
            },
            orderBy: { secuencial: 'asc' }
        });
    }

    /**
     * Busca una guía hija por número específico
     */
    async findByNumero(numeroGuiaHija: string) {
        return this.prisma.guiaHija.findFirst({
            where: { numero_guia_hija: numeroGuiaHija },
            include: {
                finca: true,
                producto: true
            }
        });
    }

    /**
     * Busca el próximo número disponible para guías hijas según un formato personalizado
     * @param prefijo Prefijo para el formato (por ejemplo, empresa, año)
     * @param formatoNumerico Si es true, busca el siguiente número disponible. Si es false, genera uno aleatorio único.
     */
    async getNextAvailableNumber(prefijo: string, formatoNumerico: boolean = true) {
        if (formatoNumerico) {
            // Buscar el último número de guía que comienza con el prefijo
            const ultimaGuia = await this.prisma.guiaHija.findFirst({
                where: {
                    numero_guia_hija: {
                        startsWith: prefijo
                    }
                },
                orderBy: {
                    numero_guia_hija: 'desc'
                }
            });

            if (!ultimaGuia) {
                // Si no hay guías previas, empezar con 1
                return `${prefijo}0001`;
            }

            // Extraer el número secuencial del final
            const match = ultimaGuia.numero_guia_hija.match(new RegExp(`^${prefijo}(\\d+)$`));
            if (match && match[1]) {
                const ultimoSecuencial = parseInt(match[1]);
                const nuevoSecuencial = ultimoSecuencial + 1;
                return `${prefijo}${nuevoSecuencial.toString().padStart(4, '0')}`;
            }

            // Si no hay formato reconocible, comenzar con 1
            return `${prefijo}0001`;
        } else {
            // Implementación para números no secuenciales
            // Por ahora, usar timestamp como único
            const timestamp = Date.now().toString().slice(-8);
            return `${prefijo}${timestamp}`;
        }
    }
}