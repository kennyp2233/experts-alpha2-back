import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma/prisma.service';
import { DocumentoCoordinacionRepository } from '../../repositories/documento-coordinacion.repository';
import { GuiaMadreRepository } from '../../repositories/guia-madre.repository';
import { EstadoDocCoord, EstadoGuiaMadre, TipoEntidad, WorkflowEvents } from '../../documents.constants';
import { TransicionEstadoService } from '../../domain/workflow/transicion-estado.service';

@Injectable()
export class DocumentoCoordinacionEstadoService {
    constructor(
        private prisma: PrismaService,
        private docCoordinacionRepository: DocumentoCoordinacionRepository,
        private guiaMadreRepository: GuiaMadreRepository,
        private transicionEstadoService: TransicionEstadoService,
        private eventEmitter: EventEmitter2,
    ) { }

    /**
     * Cambia el estado de un documento de coordinación
     */
    async cambiarEstado(id: number, nuevoEstadoId: number, comentario: string, usuarioId: string) {
        // Verificar que el documento existe
        const docCoordinacion = await this.docCoordinacionRepository.findById(id);

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
        const esValida = await this.transicionEstadoService.validarTransicion({
            tipoEntidad: TipoEntidad.DOC_COORDINACION,
            estadoOrigenId: docCoordinacion.id_estado_actual,
            estadoDestinoId: nuevoEstadoId
        });

        if (!esValida) {
            throw new ForbiddenException(
                `Transición de estado no permitida de ${docCoordinacion.estadoActual.nombre} a ${nuevoEstado.nombre}`
            );
        }

        // Obtener información adicional de la transición
        const infoTransicion = await this.transicionEstadoService.getTransicionInfo(
            TipoEntidad.DOC_COORDINACION,
            docCoordinacion.id_estado_actual,
            nuevoEstadoId
        );

        // Si requiere comentario, verificar que se proporcionó
        if (infoTransicion.requiere_comentario && !comentario) {
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

        return this.docCoordinacionRepository.findById(id);
    }

    /**
     * Corta un documento de coordinación (finaliza el proceso)
     */
    async cortarDocumento(id: number, comentario: string, usuarioId: string) {
        // Verificar que el documento existe
        const docCoordinacion = await this.docCoordinacionRepository.findById(id);

        if (!docCoordinacion) {
            throw new NotFoundException(`Documento de coordinación con ID ${id} no encontrado`);
        }

        // Verificar que no está ya cortado o cancelado
        if (docCoordinacion.estadoActual.es_estado_final) {
            throw new BadRequestException(`El documento ya está en estado final ${docCoordinacion.estadoActual.nombre}`);
        }

        // Verificar que tiene al menos una guía hija
        if (docCoordinacion.guias_hijas.length === 0) {
            throw new BadRequestException('No se puede cortar un documento sin guías hijas asignadas');
        }

        // Obtener el estado "CORTADO"
        const estadoCortado = await this.docCoordinacionRepository.findEstadoByNombre(EstadoDocCoord.CORTADO);

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

            // Emitir evento de corte
            this.eventEmitter.emit(WorkflowEvents.DOC_COORD_CORTE, {
                docCoordId: id,
                usuarioId,
                fecha: new Date()
            });

            // Retornar documento actualizado
            return this.docCoordinacionRepository.findById(id);
        });
    }

    /**
     * Cancela un documento de coordinación
     */
    async cancelarDocumento(id: number, motivo: string, usuarioId: string) {
        // Verificar que el documento existe
        const docCoordinacion = await this.docCoordinacionRepository.findById(id);

        if (!docCoordinacion) {
            throw new NotFoundException(`Documento de coordinación con ID ${id} no encontrado`);
        }

        // No permitir cancelar documentos que ya están en estado final
        if (docCoordinacion.estadoActual.es_estado_final) {
            throw new BadRequestException(`No se puede cancelar un documento en estado ${docCoordinacion.estadoActual.nombre}`);
        }

        // Obtener el estado "CANCELADO"
        const estadoCancelado = await this.docCoordinacionRepository.findEstadoByNombre(EstadoDocCoord.CANCELADO);

        if (!estadoCancelado) {
            throw new BadRequestException('Estado CANCELADO no configurado para documentos de coordinación');
        }

        // Obtener el estado "DISPONIBLE" para guía madre
        const estadoDisponible = await this.guiaMadreRepository.findEstadoByNombre(EstadoGuiaMadre.DISPONIBLE);

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
            return this.docCoordinacionRepository.findById(id);
        });
    }
}