// src/master-documents/services/guias-hijas.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AsignarGuiaHijaDto } from '../dto/guia-hija/asignar-guia-hija.dto';
import { UpdateGuiaHijaDto } from '../dto/guia-hija/update-guia-hija.dto';
import { CambioEstadoDto } from '../dto/guia-madre/cambio-estado.dto';
import { TipoEntidad, EstadoGuiaHija, WorkflowEvents, FORMATO_GUIA_HIJA, EstadoDocCoord } from '../documents.constants';

@Injectable()
export class GuiasHijasService {
    constructor(
        private prisma: PrismaService,
        private eventEmitter: EventEmitter2,
    ) { }

    /**
     * Asigna una guía hija a un documento de coordinación para una finca específica
     */
    async asignarGuiaHija(id_documento_coordinacion: number, id_finca: number, asignarGuiaHijaDto?: AsignarGuiaHijaDto) {
        return this.prisma.$transaction(async (prisma) => {
            // Obtener documento coordinación
            const docCoordinacion = await prisma.documentoCoordinacion.findUnique({
                where: { id: id_documento_coordinacion },
            });

            if (!docCoordinacion) {
                throw new Error('Documento de coordinación no encontrado');
            }

            const id_guia_madre = docCoordinacion.id_guia_madre;

            // Verificar existencia previa
            const guiaHijaExistente = await this.findByFincaAndGuiaMadre(id_finca, id_guia_madre);

            // Si existe una guía hija para esta combinación, actualizar si es necesario
            if (guiaHijaExistente) {
                // Si el documento de coordinación es diferente, actualizar
                const dataToUpdate: any = {};

                if (guiaHijaExistente.id_documento_coordinacion !== id_documento_coordinacion) {
                    dataToUpdate.id_documento_coordinacion = id_documento_coordinacion;
                }

                // Actualizar campos adicionales si se proporcionan
                if (asignarGuiaHijaDto?.id_producto) dataToUpdate.id_producto = asignarGuiaHijaDto.id_producto;
                if (asignarGuiaHijaDto?.fulls !== undefined) dataToUpdate.fulls = asignarGuiaHijaDto.fulls;
                if (asignarGuiaHijaDto?.pcs !== undefined) dataToUpdate.pcs = asignarGuiaHijaDto.pcs;
                if (asignarGuiaHijaDto?.kgs !== undefined) dataToUpdate.kgs = asignarGuiaHijaDto.kgs;
                if (asignarGuiaHijaDto?.stems !== undefined) dataToUpdate.stems = asignarGuiaHijaDto.stems;

                // Solo actualizar si hay cambios
                if (Object.keys(dataToUpdate).length > 0) {
                    dataToUpdate.updatedAt = new Date();
                    await prisma.guiaHija.update({
                        where: { id: guiaHijaExistente.id },
                        data: dataToUpdate,
                    });
                }

                return prisma.guiaHija.findUnique({
                    where: { id: guiaHijaExistente.id },
                    include: {
                        producto: true,
                        finca: true
                    }
                });
            }

            // Crear nueva guía hija
            const anioActual = new Date().getFullYear();
            const ultimaGuia = await this.getLastGuiaHijaByYear(anioActual);
            const nuevoSecuencial = ultimaGuia ? ultimaGuia.secuencial + 1 : 1;
            const numeroGuiaHija = this.formatearNumeroGuiaHija(anioActual, nuevoSecuencial);

            // Obtener estado inicial para guía hija
            const estadoInicial = await prisma.estadoDocumento.findFirst({
                where: {
                    tipo_entidad: TipoEntidad.GUIA_HIJA,
                    es_estado_inicial: true,
                },
            });

            if (!estadoInicial) {
                throw new BadRequestException('No se encontró un estado inicial configurado para guías hijas');
            }

            // Preparar datos para creación
            const createData: any = {
                id_documento_coordinacion,
                id_guia_madre,
                id_finca,
                id_estado_actual: estadoInicial.id,
                numero_guia_hija: numeroGuiaHija,
                anio: anioActual,
                secuencial: nuevoSecuencial,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Añadir campos adicionales si se proporcionan
            if (asignarGuiaHijaDto?.id_producto) createData.id_producto = asignarGuiaHijaDto.id_producto;
            if (asignarGuiaHijaDto?.fulls !== undefined) createData.fulls = asignarGuiaHijaDto.fulls;
            if (asignarGuiaHijaDto?.pcs !== undefined) createData.pcs = asignarGuiaHijaDto.pcs;
            if (asignarGuiaHijaDto?.kgs !== undefined) createData.kgs = asignarGuiaHijaDto.kgs;
            if (asignarGuiaHijaDto?.stems !== undefined) createData.stems = asignarGuiaHijaDto.stems;

            const nuevaGuiaHija = await prisma.guiaHija.create({
                data: createData,
                include: {
                    producto: true,
                    finca: true
                }
            });

            // Crear registro de historial de estado
            await prisma.guiaHijaEstado.create({
                data: {
                    id_guia_hija: nuevaGuiaHija.id,
                    id_estado: estadoInicial.id,
                    id_usuario: '00000000-0000-0000-0000-000000000000', // Usuario sistema
                    comentario: 'Creación inicial',
                },
            });

            // Emitir evento de asignación
            this.eventEmitter.emit(WorkflowEvents.GUIA_HIJA_ASIGNADA, {
                guiaHijaId: nuevaGuiaHija.id,
                docCoordId: id_documento_coordinacion,
                fincaId: id_finca,
                fecha: new Date(),
            });

            return nuevaGuiaHija;
        });
    }

    /**
     * Obtiene la última guía hija por año para generación de secuenciales
     */
    async getLastGuiaHijaByYear(anio: number) {
        return this.prisma.guiaHija.findFirst({
            where: { anio },
            orderBy: { secuencial: 'desc' },
        });
    }

    /**
     * Formatea el número de guía hija según el formato establecido
     */
    formatearNumeroGuiaHija(anio: number, secuencial: number): string {
        return `${anio}${secuencial.toString().padStart(4, '0')}`;
    }

    /**
     * Busca una guía hija por combinación de finca y guía madre
     */
    async findByFincaAndGuiaMadre(id_finca: number, id_guia_madre: number) {
        return this.prisma.guiaHija.findFirst({
            where: {
                id_finca,
                id_guia_madre,
            },
        });
    }

    /**
     * Obtiene todas las guías hijas con filtros opcionales
     */
    async findAll(
        page = 1,
        limit = 10,
        finca?: number,
        producto?: number,
        estado?: string,
        docCoordinacion?: number
    ) {
        const skip = (page - 1) * limit;
        const where: any = {};

        // Aplicar filtros si se proporcionan
        if (finca) {
            where.id_finca = finca;
        }

        if (producto) {
            where.id_producto = producto;
        }

        if (estado) {
            const estadoDoc = await this.prisma.estadoDocumento.findFirst({
                where: { nombre: estado, tipo_entidad: TipoEntidad.GUIA_HIJA },
            });

            if (estadoDoc) {
                where.id_estado_actual = estadoDoc.id;
            }
        }

        if (docCoordinacion) {
            where.id_documento_coordinacion = docCoordinacion;
        }

        const [guiasHijas, total] = await Promise.all([
            this.prisma.guiaHija.findMany({
                where,
                skip,
                take: limit,
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
                orderBy: [
                    { createdAt: 'desc' },
                ],
            }),
            this.prisma.guiaHija.count({ where }),
        ]);

        return {
            data: guiasHijas,
            meta: {
                total,
                page,
                limit,
                lastPage: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Obtiene una guía hija por su ID
     */
    async findOne(id: number) {
        const guiaHija = await this.prisma.guiaHija.findUnique({
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
                        }
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

        if (!guiaHija) {
            throw new NotFoundException(`Guía hija con ID ${id} no encontrada`);
        }

        return guiaHija;
    }

    /**
     * Actualiza una guía hija
     */
    async update(id: number, updateGuiaHijaDto: UpdateGuiaHijaDto, usuarioId: string) {
        const guiaHija = await this.prisma.guiaHija.findUnique({
            where: { id },
            include: {
                estadoActual: true,
                documento_coordinacion: {
                    include: {
                        estadoActual: true,
                    },
                },
            },
        });

        if (!guiaHija) {
            throw new NotFoundException(`Guía hija con ID ${id} no encontrada`);
        }

        // No permitir actualizar si el documento de coordinación está cortado o cancelado
        if (guiaHija.documento_coordinacion.estadoActual.nombre === EstadoDocCoord.CORTADO ||
            guiaHija.documento_coordinacion.estadoActual.nombre === EstadoDocCoord.CANCELADO) {
            throw new BadRequestException(`No se puede modificar una guía hija cuando el documento de coordinación está ${guiaHija.documento_coordinacion.estadoActual.nombre}`);
        }

        // No permitir actualizar si la guía hija está en estado final
        if (guiaHija.estadoActual.es_estado_final) {
            throw new BadRequestException(`No se puede modificar una guía hija en estado ${guiaHija.estadoActual.nombre}`);
        }

        // Actualizar campos de la guía hija
        const dataToUpdate: any = {
            updatedAt: new Date(),
        };

        if (updateGuiaHijaDto.id_producto !== undefined) dataToUpdate.id_producto = updateGuiaHijaDto.id_producto;
        if (updateGuiaHijaDto.fulls !== undefined) dataToUpdate.fulls = updateGuiaHijaDto.fulls;
        if (updateGuiaHijaDto.pcs !== undefined) dataToUpdate.pcs = updateGuiaHijaDto.pcs;
        if (updateGuiaHijaDto.kgs !== undefined) dataToUpdate.kgs = updateGuiaHijaDto.kgs;
        if (updateGuiaHijaDto.stems !== undefined) dataToUpdate.stems = updateGuiaHijaDto.stems;

        return this.prisma.guiaHija.update({
            where: { id },
            data: dataToUpdate,
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

    /**
     * Cambia el estado de una guía hija
     */
    async cambiarEstado(id: number, cambioEstadoDto: CambioEstadoDto, usuarioId: string) {
        const { nuevoEstadoId, comentario } = cambioEstadoDto;

        const guiaHija = await this.prisma.guiaHija.findUnique({
            where: { id },
            include: {
                estadoActual: true,
                documento_coordinacion: {
                    include: {
                        estadoActual: true,
                    },
                },
            },
        });

        if (!guiaHija) {
            throw new NotFoundException(`Guía hija con ID ${id} no encontrada`);
        }

        // No permitir cambios de estado si el documento está cortado o cancelado
        if (guiaHija.documento_coordinacion.estadoActual.nombre === EstadoDocCoord.CORTADO ||
            guiaHija.documento_coordinacion.estadoActual.nombre === EstadoDocCoord.CANCELADO) {
            throw new BadRequestException(`No se puede cambiar el estado de una guía hija cuando el documento de coordinación está ${guiaHija.documento_coordinacion.estadoActual.nombre}`);
        }

        // Verificar que el nuevo estado existe y es del tipo correcto
        const nuevoEstado = await this.prisma.estadoDocumento.findFirst({
            where: {
                id: nuevoEstadoId,
                tipo_entidad: TipoEntidad.GUIA_HIJA,
            },
        });

        if (!nuevoEstado) {
            throw new BadRequestException(`Estado con ID ${nuevoEstadoId} no válido para guías hijas`);
        }

        // Verificar que la transición es permitida
        const transicionPermitida = await this.prisma.transicionPermitida.findFirst({
            where: {
                tipo_entidad: TipoEntidad.GUIA_HIJA,
                id_estado_origen: guiaHija.id_estado_actual,
                id_estado_destino: nuevoEstadoId,
            },
        });

        if (!transicionPermitida) {
            throw new ForbiddenException(`Transición de estado no permitida de ${guiaHija.estadoActual.nombre} a ${nuevoEstado.nombre}`);
        }

        // Si requiere comentario, verificar que se proporcionó
        if (transicionPermitida.requiere_comentario && !comentario) {
            throw new BadRequestException(`Esta transición requiere un comentario`);
        }

        // Ejecutar la transición
        await this.prisma.$transaction([
            this.prisma.guiaHija.update({
                where: { id },
                data: {
                    id_estado_actual: nuevoEstadoId,
                    updatedAt: new Date(),
                },
            }),
            this.prisma.guiaHijaEstado.create({
                data: {
                    id_guia_hija: id,
                    id_estado: nuevoEstadoId,
                    id_usuario: usuarioId,
                    comentario: comentario || `Cambio de estado a ${nuevoEstado.nombre}`,
                },
            }),
        ]);

        // Emitir evento de cambio de estado
        this.eventEmitter.emit(WorkflowEvents.GUIA_HIJA_ESTADO_CAMBIADO, {
            guiaHijaId: id,
            estadoAnterior: guiaHija.id_estado_actual,
            estadoNuevo: nuevoEstadoId,
            usuarioId,
            fecha: new Date(),
        });

        return this.findOne(id);
    }

    /**
     * Cancela una guía hija
     */
    async cancelar(id: number, motivo: string, usuarioId: string) {
        const guiaHija = await this.prisma.guiaHija.findUnique({
            where: { id },
            include: {
                estadoActual: true,
                documento_coordinacion: {
                    include: {
                        estadoActual: true,
                    },
                },
            },
        });

        if (!guiaHija) {
            throw new NotFoundException(`Guía hija con ID ${id} no encontrada`);
        }

        // No permitir cancelar si el documento está cortado o cancelado
        if (guiaHija.documento_coordinacion.estadoActual.nombre === EstadoDocCoord.CORTADO ||
            guiaHija.documento_coordinacion.estadoActual.nombre === EstadoDocCoord.CANCELADO) {
            throw new BadRequestException(`No se puede cancelar una guía hija cuando el documento de coordinación está ${guiaHija.documento_coordinacion.estadoActual.nombre}`);
        }

        // No permitir cancelar si ya está en estado final
        if (guiaHija.estadoActual.es_estado_final) {
            throw new BadRequestException(`No se puede cancelar una guía hija en estado ${guiaHija.estadoActual.nombre}`);
        }

        // Obtener el estado "CANCELADA"
        const estadoCancelada = await this.prisma.estadoDocumento.findFirst({
            where: {
                nombre: EstadoGuiaHija.CANCELADA,
                tipo_entidad: TipoEntidad.GUIA_HIJA,
            },
        });

        if (!estadoCancelada) {
            throw new BadRequestException('Estado CANCELADA no configurado para guías hijas');
        }

        // Ejecutar la cancelación
        await this.prisma.$transaction([
            this.prisma.guiaHija.update({
                where: { id },
                data: {
                    id_estado_actual: estadoCancelada.id,
                    updatedAt: new Date(),
                },
            }),
            this.prisma.guiaHijaEstado.create({
                data: {
                    id_guia_hija: id,
                    id_estado: estadoCancelada.id,
                    id_usuario: usuarioId,
                    comentario: motivo || 'Guía hija cancelada',
                },
            }),
        ]);

        // Emitir evento de cambio de estado
        this.eventEmitter.emit(WorkflowEvents.GUIA_HIJA_ESTADO_CAMBIADO, {
            guiaHijaId: id,
            estadoAnterior: guiaHija.id_estado_actual,
            estadoNuevo: estadoCancelada.id,
            usuarioId,
            fecha: new Date(),
        });

        return this.findOne(id);
    }

    /**
     * Obtiene guías hijas por finca, con opción de filtrar por estado
     */
    async findByFinca(id_finca: number, estado?: string) {
        const where: any = { id_finca };

        if (estado) {
            const estadoDoc = await this.prisma.estadoDocumento.findFirst({
                where: { nombre: estado, tipo_entidad: TipoEntidad.GUIA_HIJA },
            });

            if (estadoDoc) {
                where.id_estado_actual = estadoDoc.id;
            }
        }

        return this.prisma.guiaHija.findMany({
            where,
            include: {
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
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Obtiene guías hijas por documento de coordinación
     */
    async findByDocumentoCoordenacion(id_documento_coordinacion: number) {
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
     * Confirma una guía hija (usado principalmente por fincas)
     */
    async confirmarGuiaHija(id: number, datos: UpdateGuiaHijaDto, usuarioId: string) {
        const guiaHija = await this.prisma.guiaHija.findUnique({
            where: { id },
            include: {
                estadoActual: true,
                documento_coordinacion: {
                    include: {
                        estadoActual: true,
                    },
                },
            },
        });

        if (!guiaHija) {
            throw new NotFoundException(`Guía hija con ID ${id} no encontrada`);
        }

        // Verificar que está en estado REGISTRADA (o el estado inicial correspondiente)
        if (guiaHija.estadoActual.nombre !== EstadoGuiaHija.REGISTRADA) {
            throw new BadRequestException(`Solo se pueden confirmar guías hijas en estado REGISTRADA`);
        }

        // Obtener el estado "CONFIRMADA"
        const estadoConfirmada = await this.prisma.estadoDocumento.findFirst({
            where: {
                nombre: EstadoGuiaHija.CONFIRMADA,
                tipo_entidad: TipoEntidad.GUIA_HIJA,
            },
        });

        if (!estadoConfirmada) {
            throw new BadRequestException('Estado CONFIRMADA no configurado para guías hijas');
        }

        // Actualizar datos y cambiar estado
        return this.prisma.$transaction(async (prisma) => {
            // Actualizar datos
            const dataToUpdate: any = {
                id_estado_actual: estadoConfirmada.id,
                updatedAt: new Date(),
            };

            if (datos.id_producto) dataToUpdate.id_producto = datos.id_producto;
            if (datos.fulls !== undefined) dataToUpdate.fulls = datos.fulls;
            if (datos.pcs !== undefined) dataToUpdate.pcs = datos.pcs;
            if (datos.kgs !== undefined) dataToUpdate.kgs = datos.kgs;
            if (datos.stems !== undefined) dataToUpdate.stems = datos.stems;

            // Actualizar guía hija
            await prisma.guiaHija.update({
                where: { id },
                data: dataToUpdate,
            });

            // Registrar cambio de estado
            await prisma.guiaHijaEstado.create({
                data: {
                    id_guia_hija: id,
                    id_estado: estadoConfirmada.id,
                    id_usuario: usuarioId,
                    comentario: 'Guía hija confirmada por finca',
                },
            });

            // Emitir evento de cambio de estado
            this.eventEmitter.emit(WorkflowEvents.GUIA_HIJA_ESTADO_CAMBIADO, {
                guiaHijaId: id,
                estadoAnterior: guiaHija.id_estado_actual,
                estadoNuevo: estadoConfirmada.id,
                usuarioId,
                fecha: new Date(),
            });

            return this.findOne(id);
        });
    }
}