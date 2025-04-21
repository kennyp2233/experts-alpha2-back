import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { DocumentoCoordinacionRepository } from '../../repositories/documento-coordinacion.repository';
import { GuiaMadreRepository } from '../../repositories/guia-madre.repository';
import { CreateDocCoordDto } from '../../dto/documento-coordinacion/create-doc-coord.dto';
import { UpdateDocCoordDto } from '../../dto/documento-coordinacion/update-doc-coord.dto';
import { EstadoGuiaMadre, WorkflowEvents, TipoEntidad } from '../../documents.constants';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class DocumentoCoordinacionCrudService {
    constructor(
        private prisma: PrismaService,
        private docCoordinacionRepository: DocumentoCoordinacionRepository,
        private guiaMadreRepository: GuiaMadreRepository,
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
        const guiaMadre = await this.guiaMadreRepository.findById(id_guia_madre);

        if (!guiaMadre) {
            throw new NotFoundException(`Guía madre con ID ${id_guia_madre} no encontrada`);
        }

        if (guiaMadre.documento_coordinacion) {
            throw new BadRequestException(`La guía madre ${id_guia_madre} ya está asignada a un documento de coordinación`);
        }

        const estadoDisponible = await this.guiaMadreRepository.findEstadoByNombre(EstadoGuiaMadre.DISPONIBLE);

        if (!estadoDisponible || guiaMadre.id_estado_actual !== estadoDisponible.id) {
            throw new BadRequestException(`La guía madre ${id_guia_madre} no está disponible para asignación`);
        }

        // Obtener el estado inicial para documento de coordinación
        const estadoInicial = await this.docCoordinacionRepository.findEstadoInicial();

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

        return this.prisma.$transaction(async (prisma) => {
            // Cambiar estado de guía madre a ASIGNADA
            const estadoAsignada = await this.guiaMadreRepository.findEstadoByNombre(EstadoGuiaMadre.ASIGNADA);

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
            // Primero el consignatario principal
            await prisma.documentoConsignatario.create({
                data: {
                    id_documento_coordinacion: docCoordinacion.id,
                    id_consignatario: id_consignatario_principal,
                    es_principal: true
                }
            });

            // Luego los adicionales
            for (const consignatario of consignatarios_adicionales) {
                await prisma.documentoConsignatario.create({
                    data: {
                        id_documento_coordinacion: docCoordinacion.id,
                        id_consignatario: consignatario.id_consignatario,
                        es_principal: false
                    }
                });
            }

            // Emitir evento de creación (opcional)
            this.eventEmitter.emit('documento.creado', {
                id: docCoordinacion.id,
                usuarioId,
                fecha: new Date()
            });

            // Retornar documento creado con sus relaciones
            return this.docCoordinacionRepository.findById(docCoordinacion.id);
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
            const estadoDoc = await this.docCoordinacionRepository.findEstadoByNombre(estado);
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
            this.docCoordinacionRepository.findAll({
                where,
                skip,
                take: limit
            }),
            this.docCoordinacionRepository.count(where),
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
        const documento = await this.docCoordinacionRepository.findById(id);

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
        const docCoordinacion = await this.docCoordinacionRepository.findById(id);

        if (!docCoordinacion) {
            throw new NotFoundException(`Documento de coordinación con ID ${id} no encontrado`);
        }

        // Verificar que no está en un estado que impida la edición
        if (docCoordinacion.estadoActual.es_estado_final) {
            throw new BadRequestException(`No se puede modificar un documento en estado final ${docCoordinacion.estadoActual.nombre}`);
        }

        return this.prisma.$transaction(async (prisma) => {
            // Actualizar datos básicos del documento si hay cambios
            if (Object.keys(dataToUpdate).length > 0) {
                await this.docCoordinacionRepository.update(id, {
                    ...dataToUpdate,
                    updatedAt: new Date()
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

            // Emitir evento de actualización (opcional)
            this.eventEmitter.emit('documento.actualizado', {
                id,
                usuarioId,
                fecha: new Date()
            });

            // Retornar documento actualizado con sus relaciones
            return this.docCoordinacionRepository.findById(id);
        });
    }

    /**
     * Asigna consignatarios a un documento de coordinación
     */
    async asignarConsignatarios(id: number, consignatarios: { id_consignatario: number, es_principal: boolean }[]) {
        // Verificar que el documento de coordinación existe
        const docCoordinacion = await this.docCoordinacionRepository.findById(id);

        if (!docCoordinacion) {
            throw new NotFoundException(`Documento de coordinación con ID ${id} no encontrado`);
        }

        // Verificar que no está en un estado final donde no se permitan cambios
        if (docCoordinacion.estadoActual.es_estado_final) {
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
            await this.docCoordinacionRepository.deleteConsignatarios(id);

            // Crear nuevos registros de consignatarios
            const consignatariosCreados: Array<{
                id_documento_coordinacion: number;
                id_consignatario: number;
                es_principal: boolean;
                consignatario: {
                    id: number;
                    nombre: string;
                    ruc: string | null;
                    direccion: string | null;
                    telefono: string | null;
                    email: string | null;
                    ciudad: string | null;
                    pais: string | null;
                    id_embarcador: number;
                    id_cliente: number;
                };
            }> = [];
            for (const consignatario of consignatarios) {
                const nuevo = await this.docCoordinacionRepository.createConsignatario({
                    id_documento_coordinacion: id,
                    id_consignatario: consignatario.id_consignatario,
                    es_principal: consignatario.es_principal
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
     * Obtiene el resumen de KGs y cajas por documento de coordinación
     */
    async getResumenCajas(id: number) {
        const docCoord = await this.docCoordinacionRepository.findById(id);

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