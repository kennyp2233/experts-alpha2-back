// src/master-documents/services/documento-coordinacion.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateDocCoordDto } from '../dto/documento-coordinacion/create-doc-coord.dto';
import { UpdateDocCoordDto } from '../dto/documento-coordinacion/update-doc-coord.dto';
import { CambioEstadoDto } from '../dto/guia-madre/cambio-estado.dto';
import { AsignarConsignatarioDto } from '../dto/documento-coordinacion/asignar-consignatario.dto';
import {
    TipoEntidad,
    EstadoGuiaMadre,
    EstadoDocCoord,
    EstadoGuiaHija,
    WorkflowEvents
} from '../documents.constants';

@Injectable()
export class DocumentoCoordinacionService {
    constructor(
        private prisma: PrismaService,
        private eventEmitter: EventEmitter2,
    ) { }

    /**
     * Crea un nuevo documento de coordinación
     */
    async create(createDocCoordDto: CreateDocCoordDto, usuarioId: string) {
        const {
            id_guia_madre,
            id_consignatario_principal,
            id_producto,
            id_agencia_iata,
            id_destino_awb,
            id_destino_final_docs,
            fecha_vuelo,
            pago,
            consignatarios_adicionales = [],
            ...extraData
        } = createDocCoordDto;

        // Verificar que la guía madre existe y está disponible
        const guiaMadre = await this.prisma.guiaMadre.findUnique({
            where: { id: id_guia_madre },
            include: {
                documento_coordinacion: true,
                estadoActual: true,
            },
        });

        if (!guiaMadre) {
            throw new NotFoundException(`Guía madre con ID ${id_guia_madre} no encontrada`);
        }

        if (guiaMadre.documento_coordinacion) {
            throw new BadRequestException(`La guía madre ${id_guia_madre} ya está asignada a un documento de coordinación`);
        }

        const estadoDisponible = await this.prisma.estadoDocumento.findFirst({
            where: {
                nombre: EstadoGuiaMadre.DISPONIBLE,
                tipo_entidad: TipoEntidad.GUIA_MADRE,
            },
        });

        if (!estadoDisponible || guiaMadre.id_estado_actual !== estadoDisponible.id) {
            throw new BadRequestException(`La guía madre ${id_guia_madre} no está disponible para asignación`);
        }

        // Obtener el estado inicial para documento de coordinación
        const estadoInicial = await this.prisma.estadoDocumento.findFirst({
            where: {
                tipo_entidad: TipoEntidad.DOC_COORDINACION,
                es_estado_inicial: true,
            },
        });

        if (!estadoInicial) {
            throw new BadRequestException('No se encontró un estado inicial configurado para documentos de coordinación');
        }

        // Verificar que el consignatario principal existe
        const consignatarioPrincipal = await this.prisma.consignatario.findUnique({
            where: { id: id_consignatario_principal },
        });

        if (!consignatarioPrincipal) {
            throw new NotFoundException(`Consignatario principal con ID ${id_consignatario_principal} no encontrado`);
        }

        // Verificar consignatarios adicionales
        const idsConsignatariosAdicionales = consignatarios_adicionales.map(c => c.id_consignatario);
        if (idsConsignatariosAdicionales.length > 0) {
            const consignatariosEncontrados = await this.prisma.consignatario.findMany({
                where: {
                    id: {
                        in: idsConsignatariosAdicionales
                    }
                }
            });

            if (consignatariosEncontrados.length !== idsConsignatariosAdicionales.length) {
                throw new NotFoundException(`Uno o más consignatarios adicionales no existen`);
            }
        }

        // Preparar todos los consignatarios (principal y adicionales)
        const todosConsignatarios = [
            { id_consignatario: id_consignatario_principal, es_principal: true },
            ...consignatarios_adicionales.map(c => ({
                id_consignatario: c.id_consignatario,
                es_principal: false
            }))
        ];

        // Crear documento de coordinación en transacción
        return this.prisma.$transaction(async (prisma) => {
            // Cambiar estado de guía madre a ASIGNADA
            const estadoAsignada = await prisma.estadoDocumento.findFirst({
                where: {
                    nombre: EstadoGuiaMadre.ASIGNADA,
                    tipo_entidad: TipoEntidad.GUIA_MADRE,
                },
            });

            if (!estadoAsignada) {
                throw new BadRequestException('Estado ASIGNADA no configurado para guías madre');
            }

            await prisma.guiaMadre.update({
                where: { id: id_guia_madre },
                data: { id_estado_actual: estadoAsignada.id },
            });

            await prisma.guiaMadreEstado.create({
                data: {
                    id_guia_madre,
                    id_estado: estadoAsignada.id,
                    id_usuario: usuarioId,
                    comentario: 'Asignación a documento de coordinación',
                },
            });

            // Crear documento de coordinación
            const docCoordinacion = await prisma.documentoCoordinacion.create({
                data: {
                    id_guia_madre,
                    id_producto,
                    id_agencia_iata,
                    id_destino_awb,
                    id_destino_final_docs,
                    id_estado_actual: estadoInicial.id,
                    pago,
                    fecha_vuelo: new Date(fecha_vuelo),
                    fecha_asignacion: new Date(),
                    ...extraData,
                },
            });

            // Crear registro de estado inicial
            await prisma.documentoCoordinacionEstado.create({
                data: {
                    id_doc_coordinacion: docCoordinacion.id,
                    id_estado: estadoInicial.id,
                    id_usuario: usuarioId,
                    comentario: 'Creación inicial',
                },
            });

            // Crear relaciones con consignatarios
            for (const consignatario of todosConsignatarios) {
                await prisma.documentoConsignatario.create({
                    data: {
                        id_documento_coordinacion: docCoordinacion.id,
                        id_consignatario: consignatario.id_consignatario,
                        es_principal: consignatario.es_principal
                    }
                });
            }

            // Retornar documento creado con sus relaciones
            return prisma.documentoCoordinacion.findUnique({
                where: { id: docCoordinacion.id },
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
                    }
                },
            });
        });
    }

    /**
     * Obtiene todos los documentos de coordinación con filtros opcionales
     */
    async findAll(
        page = 1,
        limit = 10,
        estado?: string,
        consignatario?: number,
        producto?: number,
        aerolinea?: number,
        fechaDesde?: string,
        fechaHasta?: string
    ) {
        const skip = (page - 1) * limit;
        const where: any = {};

        // Filtrar por estado si se proporciona
        if (estado) {
            const estadoDoc = await this.prisma.estadoDocumento.findFirst({
                where: { nombre: estado, tipo_entidad: TipoEntidad.DOC_COORDINACION },
            });

            if (estadoDoc) {
                where.id_estado_actual = estadoDoc.id;
            }
        }

        // Filtrar por consignatario si se proporciona
        if (consignatario) {
            where.DocumentoConsignatario = {
                some: {
                    id_consignatario: consignatario
                }
            };
        }

        // Filtrar por producto si se proporciona
        if (producto) {
            where.id_producto = producto;
        }

        // Filtrar por aerolínea si se proporciona
        if (aerolinea) {
            where.guia_madre = {
                documento_base: {
                    id_aerolinea: aerolinea,
                },
            };
        }

        // Filtrar por rango de fechas si se proporciona
        if (fechaDesde || fechaHasta) {
            where.fecha_vuelo = {};

            if (fechaDesde) {
                where.fecha_vuelo.gte = new Date(fechaDesde);
            }

            if (fechaHasta) {
                where.fecha_vuelo.lte = new Date(fechaHasta);
            }
        }

        const [documentos, total] = await Promise.all([
            this.prisma.documentoCoordinacion.findMany({
                where,
                skip,
                take: limit,
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
                orderBy: [
                    { fecha_vuelo: 'desc' },
                    { createdAt: 'desc' },
                ],
            }),
            this.prisma.documentoCoordinacion.count({ where }),
        ]);

        return {
            data: documentos,
            meta: {
                total,
                page,
                limit,
                lastPage: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Obtiene un documento de coordinación por su ID
     */
    async findOne(id: number) {
        const documento = await this.prisma.documentoCoordinacion.findUnique({
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

        if (!documento) {
            throw new NotFoundException(`Documento de coordinación con ID ${id} no encontrado`);
        }

        return documento;
    }

    /**
     * Actualiza un documento de coordinación
     */
    async update(id: number, updateDocCoordDto: UpdateDocCoordDto, usuarioId: string) {
        const { consignatarios, ...dataToUpdate } = updateDocCoordDto;

        // Verificar que el documento existe
        const docCoordinacion = await this.prisma.documentoCoordinacion.findUnique({
            where: { id },
            include: {
                estadoActual: true,
                DocumentoConsignatario: true
            }
        });

        if (!docCoordinacion) {
            throw new NotFoundException(`Documento de coordinación con ID ${id} no encontrado`);
        }

        // Verificar que no está en un estado que impida la edición
        if (docCoordinacion.estadoActual.nombre === EstadoDocCoord.CORTADO ||
            docCoordinacion.estadoActual.nombre === EstadoDocCoord.CANCELADO) {
            throw new BadRequestException(`No se puede modificar un documento ${docCoordinacion.estadoActual.nombre}`);
        }

        // Ejecutar transacción para actualizaciones
        return this.prisma.$transaction(async (prisma) => {
            // Actualizar datos básicos del documento si hay cambios
            if (Object.keys(dataToUpdate).length > 0) {
                await prisma.documentoCoordinacion.update({
                    where: { id },
                    data: {
                        ...dataToUpdate,
                        updatedAt: new Date()
                    }
                });
            }

            // Actualizar consignatarios si se proporcionan
            if (consignatarios && consignatarios.length > 0) {
                // Verificar que solo hay un consignatario principal
                const principalesCount = consignatarios.filter(c => c.es_principal).length;
                if (principalesCount !== 1) {
                    throw new BadRequestException('Debe haber exactamente un consignatario principal');
                }

                // Eliminar consignatarios actuales
                await prisma.documentoConsignatario.deleteMany({
                    where: { id_documento_coordinacion: id }
                });

                // Crear nuevos registros de consignatarios
                for (const consignatario of consignatarios) {
                    await prisma.documentoConsignatario.create({
                        data: {
                            id_documento_coordinacion: id,
                            id_consignatario: consignatario.id_consignatario,
                            es_principal: consignatario.es_principal
                        }
                    });
                }
            }

            // Retornar documento actualizado con sus relaciones
            return prisma.documentoCoordinacion.findUnique({
                where: { id },
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
                            producto: true,
                            estadoActual: true
                        }
                    }
                },
            });
        });
    }

    /**
     * Asigna consignatarios a un documento de coordinación
     */
    async asignarConsignatarios(id: number, consignatarios: { id_consignatario: number, es_principal: boolean }[]) {
        // Verificar que el documento de coordinación existe
        const docCoordinacion = await this.prisma.documentoCoordinacion.findUnique({
            where: { id },
            include: {
                DocumentoConsignatario: true
            }
        });

        if (!docCoordinacion) {
            throw new NotFoundException(`Documento de coordinación con ID ${id} no encontrado`);
        }

        // Verificar que no está en un estado final donde no se permitan cambios
        const estadoFinal = await this.prisma.estadoDocumento.findFirst({
            where: {
                id: docCoordinacion.id_estado_actual,
                es_estado_final: true
            }
        });

        if (estadoFinal) {
            throw new BadRequestException('No se pueden modificar consignatarios en un documento con estado final');
        }

        // Verificar que solo hay un consignatario principal
        const principalesCount = consignatarios.filter(c => c.es_principal).length;
        if (principalesCount !== 1) {
            throw new BadRequestException('Debe haber exactamente un consignatario principal');
        }

        // Ejecutar transacción para actualizar consignatarios
        return this.prisma.$transaction(async (prisma) => {
            // Eliminar consignatarios actuales
            await prisma.documentoConsignatario.deleteMany({
                where: { id_documento_coordinacion: id }
            });

            // Crear nuevos registros de consignatarios
            const consignatariosCreados: Array<{
                id_documento_coordinacion: number;
                id_consignatario: number;
                es_principal: boolean;
                consignatario: any;
            }> = [];
            for (const consignatario of consignatarios) {
                const nuevo = await prisma.documentoConsignatario.create({
                    data: {
                        id_documento_coordinacion: id,
                        id_consignatario: consignatario.id_consignatario,
                        es_principal: consignatario.es_principal
                    },
                    include: {
                        consignatario: true
                    }
                });
                consignatariosCreados.push(nuevo);
            }

            // Actualizar el documento de coordinación con el resultado
            return {
                id_documento_coordinacion: id,
                consignatarios: consignatariosCreados
            };
        });
    }

    /**
     * Cambia el estado de un documento de coordinación
     */
    async cambiarEstado(id: number, nuevoEstadoId: number, comentario: string, usuarioId: string) {
        // Verificar que el documento existe
        const docCoordinacion = await this.prisma.documentoCoordinacion.findUnique({
            where: { id },
            include: {
                estadoActual: true,
            },
        });

        if (!docCoordinacion) {
            throw new NotFoundException(`Documento de coordinación con ID ${id} no encontrado`);
        }

        // Verificar que el nuevo estado existe y es del tipo correcto
        const nuevoEstado = await this.prisma.estadoDocumento.findFirst({
            where: {
                id: nuevoEstadoId,
                tipo_entidad: TipoEntidad.DOC_COORDINACION,
            },
        });

        if (!nuevoEstado) {
            throw new BadRequestException(`Estado con ID ${nuevoEstadoId} no válido para documentos de coordinación`);
        }

        // Verificar que la transición es permitida
        const transicionPermitida = await this.prisma.transicionPermitida.findFirst({
            where: {
                tipo_entidad: TipoEntidad.DOC_COORDINACION,
                id_estado_origen: docCoordinacion.id_estado_actual,
                id_estado_destino: nuevoEstadoId,
            },
        });

        if (!transicionPermitida) {
            throw new ForbiddenException(`Transición de estado no permitida de ${docCoordinacion.estadoActual.nombre} a ${nuevoEstado.nombre}`);
        }

        // Si requiere comentario, verificar que se proporcionó
        if (transicionPermitida.requiere_comentario && !comentario) {
            throw new BadRequestException(`Esta transición requiere un comentario`);
        }

        // Ejecutar la transición
        await this.prisma.$transaction([
            this.prisma.documentoCoordinacion.update({
                where: { id },
                data: {
                    id_estado_actual: nuevoEstadoId,
                    updatedAt: new Date(),
                },
            }),
            this.prisma.documentoCoordinacionEstado.create({
                data: {
                    id_doc_coordinacion: id,
                    id_estado: nuevoEstadoId,
                    id_usuario: usuarioId,
                    comentario: comentario || `Cambio de estado a ${nuevoEstado.nombre}`,
                },
            }),
        ]);

        // Emitir evento de cambio de estado
        this.eventEmitter.emit(WorkflowEvents.DOC_COORD_ESTADO_CAMBIADO, {
            docCoordId: id,
            estadoAnterior: docCoordinacion.id_estado_actual,
            estadoNuevo: nuevoEstadoId,
            usuarioId,
            fecha: new Date(),
        });

        return this.findOne(id);
    }

    /**
     * Corta un documento de coordinación (finaliza el proceso)
     */
    async cortarDocumento(id: number, comentario: string, usuarioId: string) {
        // Verificar que el documento existe
        const docCoordinacion = await this.prisma.documentoCoordinacion.findUnique({
            where: { id },
            include: {
                estadoActual: true,
                guias_hijas: true
            }
        });

        if (!docCoordinacion) {
            throw new NotFoundException(`Documento de coordinación con ID ${id} no encontrado`);
        }

        // Verificar que no está ya cortado o cancelado
        if (docCoordinacion.estadoActual.nombre === EstadoDocCoord.CORTADO ||
            docCoordinacion.estadoActual.nombre === EstadoDocCoord.CANCELADO) {
            throw new BadRequestException(`El documento ya está en estado ${docCoordinacion.estadoActual.nombre}`);
        }

        // Verificar que tiene al menos una guía hija
        if (docCoordinacion.guias_hijas.length === 0) {
            throw new BadRequestException('No se puede cortar un documento sin guías hijas asignadas');
        }

        // Obtener el estado "CORTADO"
        const estadoCortado = await this.prisma.estadoDocumento.findFirst({
            where: {
                nombre: EstadoDocCoord.CORTADO,
                tipo_entidad: TipoEntidad.DOC_COORDINACION
            }
        });

        if (!estadoCortado) {
            throw new BadRequestException('Estado CORTADO no configurado para documentos de coordinación');
        }

        // Ejecutar transacción para el corte
        return this.prisma.$transaction(async (prisma) => {
            // Actualizar el estado del documento
            await prisma.documentoCoordinacion.update({
                where: { id },
                data: {
                    id_estado_actual: estadoCortado.id,
                    updatedAt: new Date()
                }
            });

            // Registrar el cambio de estado
            await prisma.documentoCoordinacionEstado.create({
                data: {
                    id_doc_coordinacion: id,
                    id_estado: estadoCortado.id,
                    id_usuario: usuarioId,
                    comentario: comentario || 'Documento cortado'
                }
            });

            // Opcionalmente: actualizar estados de guías hijas relacionadas
            // según tu lógica de negocio específica

            // Emitir evento de corte
            this.eventEmitter.emit(WorkflowEvents.DOC_COORD_CORTE, {
                docCoordId: id,
                usuarioId,
                fecha: new Date()
            });

            // Retornar documento actualizado
            return prisma.documentoCoordinacion.findUnique({
                where: { id },
                include: {
                    guia_madre: true,
                    producto: true,
                    estadoActual: true,
                    DocumentoConsignatario: {
                        include: {
                            consignatario: true
                        }
                    },
                    guias_hijas: {
                        include: {
                            finca: true,
                            producto: true,
                            estadoActual: true
                        }
                    }
                }
            });
        });
    }

    /**
     * Cancela un documento de coordinación
     */
    async cancelarDocumento(id: number, motivo: string, usuarioId: string) {
        // Verificar que el documento existe
        const docCoordinacion = await this.prisma.documentoCoordinacion.findUnique({
            where: { id },
            include: {
                estadoActual: true,
                guia_madre: true,
            },
        });

        if (!docCoordinacion) {
            throw new NotFoundException(`Documento de coordinación con ID ${id} no encontrado`);
        }

        // No permitir cancelar documentos que ya están en estado final
        if (docCoordinacion.estadoActual.es_estado_final) {
            throw new BadRequestException(`No se puede cancelar un documento en estado ${docCoordinacion.estadoActual.nombre}`);
        }

        // Obtener el estado "CANCELADO"
        const estadoCancelado = await this.prisma.estadoDocumento.findFirst({
            where: {
                nombre: EstadoDocCoord.CANCELADO,
                tipo_entidad: TipoEntidad.DOC_COORDINACION,
            },
        });

        if (!estadoCancelado) {
            throw new BadRequestException('Estado CANCELADO no configurado para documentos de coordinación');
        }

        // Obtener el estado "DISPONIBLE" para guía madre
        const estadoDisponible = await this.prisma.estadoDocumento.findFirst({
            where: {
                nombre: EstadoGuiaMadre.DISPONIBLE,
                tipo_entidad: TipoEntidad.GUIA_MADRE,
            },
        });

        if (!estadoDisponible) {
            throw new BadRequestException('Estado DISPONIBLE no configurado para guías madre');
        }

        // Ejecutar transacción para la cancelación
        return this.prisma.$transaction(async (prisma) => {
            // Actualizar el estado del documento
            await prisma.documentoCoordinacion.update({
                where: { id },
                data: {
                    id_estado_actual: estadoCancelado.id,
                    updatedAt: new Date(),
                },
            });

            // Registrar el cambio de estado
            await prisma.documentoCoordinacionEstado.create({
                data: {
                    id_doc_coordinacion: id,
                    id_estado: estadoCancelado.id,
                    id_usuario: usuarioId,
                    comentario: motivo || 'Documento cancelado',
                },
            });

            // Liberar la guía madre (cambiar a DISPONIBLE)
            await prisma.guiaMadre.update({
                where: { id: docCoordinacion.guia_madre.id },
                data: {
                    id_estado_actual: estadoDisponible.id,
                },
            });

            await prisma.guiaMadreEstado.create({
                data: {
                    id_guia_madre: docCoordinacion.guia_madre.id,
                    id_estado: estadoDisponible.id,
                    id_usuario: usuarioId,
                    comentario: 'Liberada por cancelación de documento de coordinación',
                },
            });

            // Emitir evento de cancelación
            this.eventEmitter.emit(WorkflowEvents.DOC_COORD_ESTADO_CAMBIADO, {
                docCoordId: id,
                estadoAnterior: docCoordinacion.id_estado_actual,
                estadoNuevo: estadoCancelado.id,
                usuarioId,
                fecha: new Date(),
            });

            // Retornar documento actualizado
            return prisma.documentoCoordinacion.findUnique({
                where: { id },
                include: {
                    guia_madre: true,
                    producto: true,
                    estadoActual: true,
                    DocumentoConsignatario: {
                        include: {
                            consignatario: true
                        }
                    },
                    guias_hijas: {
                        include: {
                            finca: true,
                            producto: true,
                            estadoActual: true
                        }
                    }
                }
            });
        });
    }

    /**
    * Obtiene el resumen de KGs y cajas por documento de coordinación
    */
    async getResumenCajas(id: number) {
        const docCoord = await this.prisma.documentoCoordinacion.findUnique({
            where: { id },
            include: {
                guias_hijas: true
            }
        });

        if (!docCoord) {
            throw new NotFoundException(`Documento de coordinación con ID ${id} no encontrado`);
        }

        // Calcular totales
        const totales = {
            fulls: 0,
            halfs: 0,
            quarters: 0,
            eighths: 0,
            sixths: 0,
            pcs: 0,
            kgs: 0,
            stems: 0
        };

        docCoord.guias_hijas.forEach(gh => {
            // Sumar piezas calculadas
            totales.fulls += gh.fulls || 0;

            // Sumar piezas contables
            totales.pcs += gh.pcs || 0;

            // Sumar kgs
            totales.kgs += gh.kgs || 0;

            // Sumar stems
            totales.stems += gh.stems || 0;
        });

        return {
            id_documento_coordinacion: id,
            totales
        };
    }
}