// src/master-documents/listeners/workflow-events.listener.ts
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { WorkflowEvents, TipoEntidad, EstadoDocCoord, EstadoGuiaHija } from '../documents.constants';

@Injectable()
export class WorkflowEventsListener {
    constructor(private prisma: PrismaService) { }

    /**
     * Manejador para cambios de estado en guías madre
     */
    @OnEvent(WorkflowEvents.GUIA_MADRE_ESTADO_CAMBIADO)
    async handleGuiaMadreEstadoCambiado(payload: {
        guiaMadreId: number;
        estadoAnterior: number;
        estadoNuevo: number;
        usuarioId: string;
        fecha: Date;
    }) {
        // Implementar lógica según el cambio de estado
        // Por ejemplo, notificar, actualizar estadísticas, etc.
        console.log(`Guía madre ${payload.guiaMadreId} cambió de estado ${payload.estadoAnterior} a ${payload.estadoNuevo}`);
    }

    /**
     * Manejador para cambios de estado en documentos de coordinación
     */
    @OnEvent(WorkflowEvents.DOC_COORD_ESTADO_CAMBIADO)
    async handleDocCoordEstadoCambiado(payload: {
        docCoordId: number;
        estadoAnterior: number;
        estadoNuevo: number;
        usuarioId: string;
        fecha: Date;
    }) {
        console.log(`Documento de coordinación ${payload.docCoordId} cambió de estado ${payload.estadoAnterior} a ${payload.estadoNuevo}`);

        // Obtener información del estado nuevo
        const estadoNuevo = await this.prisma.estadoDocumento.findUnique({
            where: { id: payload.estadoNuevo }
        });

        // Implementar lógica según el nuevo estado
        if (estadoNuevo && estadoNuevo.nombre === EstadoDocCoord.COORDINADO) {
            // Cuando se marca como coordinado, podríamos actualizar alguna estadística
            // o enviar notificaciones a las fincas
        }
    }

    /**
     * Manejador para el evento de corte de documento de coordinación
     */
    @OnEvent(WorkflowEvents.DOC_COORD_CORTE)
    async handleDocCoordCorte(payload: {
        docCoordId: number;
        usuarioId: string;
        fecha: Date;
    }) {
        console.log(`Documento de coordinación ${payload.docCoordId} ha sido cortado`);

        // Implementar lógica de corte
        // Por ejemplo: actualizar estados de guías hijas, enviar notificaciones,
        // generar documentos PDF, etc.

        // También podría registrar puntos de fidelización si el cliente tiene programa de puntos
        try {
            // Obtener información del documento y cliente asociado
            const docCoord = await this.prisma.documentoCoordinacion.findUnique({
                where: { id: payload.docCoordId },
                include: {
                    DocumentoConsignatario: {
                        where: { es_principal: true },
                        include: {
                            consignatario: {
                                include: {
                                    cliente: true
                                }
                            }
                        }
                    },
                    guias_hijas: true
                }
            });

            if (docCoord && docCoord.DocumentoConsignatario.length > 0) {
                const clienteId = docCoord.DocumentoConsignatario[0].consignatario.id_cliente;

                // Verificar si el cliente tiene programa de puntos
                const puntosFidelizacion = await this.prisma.puntosFidelizacion.findUnique({
                    where: { id_cliente: clienteId }
                });

                if (puntosFidelizacion) {
                    // Calcular puntos basados en el número de guías hijas o alguna otra métrica
                    const puntosGanados = docCoord.guias_hijas.length * 10; // Ejemplo: 10 puntos por guía hija

                    // Registrar la transacción de puntos
                    await this.prisma.transaccionPuntos.create({
                        data: {
                            id_puntos: puntosFidelizacion.id,
                            tipo: 'GANADOS',
                            cantidad: puntosGanados,
                            motivo: `Puntos por corte de guía ${docCoord.id}`,
                            id_documento_ref: docCoord.id,
                            tipo_documento_ref: 'DOC_COORDINACION',
                            id_usuario_creador: payload.usuarioId,
                            fecha_transaccion: new Date(),
                            fecha_expiracion: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Expiran en 1 año
                        }
                    });

                    // Actualizar saldo de puntos
                    await this.prisma.puntosFidelizacion.update({
                        where: { id: puntosFidelizacion.id },
                        data: {
                            puntos_actuales: { increment: puntosGanados },
                            puntos_totales: { increment: puntosGanados }
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error al procesar puntos de fidelización:', error);
        }
    }

    /**
     * Manejador para cambios de estado en guías hijas
     */
    @OnEvent(WorkflowEvents.GUIA_HIJA_ESTADO_CAMBIADO)
    async handleGuiaHijaEstadoCambiado(payload: {
        guiaHijaId: number;
        estadoAnterior: number;
        estadoNuevo: number;
        usuarioId: string;
        fecha: Date;
    }) {
        console.log(`Guía hija ${payload.guiaHijaId} cambió de estado ${payload.estadoAnterior} a ${payload.estadoNuevo}`);

        // Obtener información del estado nuevo
        const estadoNuevo = await this.prisma.estadoDocumento.findUnique({
            where: { id: payload.estadoNuevo }
        });

        // Implementar lógica según el nuevo estado
        if (estadoNuevo && estadoNuevo.nombre === EstadoGuiaHija.CONFIRMADA) {
            // Cuando una finca confirma una guía hija, podríamos actualizar el estado 
            // del documento de coordinación si todas las guías están confirmadas
            try {
                const guiaHija = await this.prisma.guiaHija.findUnique({
                    where: { id: payload.guiaHijaId },
                    select: { id_documento_coordinacion: true }
                });

                if (guiaHija) {
                    await this.verificarTodasGuiasConfirmadas(guiaHija.id_documento_coordinacion, payload.usuarioId);
                }
            } catch (error) {
                console.error('Error al verificar confirmación de guías:', error);
            }
        }
    }

    /**
     * Manejador para el evento de asignación de guía hija
     */
    @OnEvent(WorkflowEvents.GUIA_HIJA_ASIGNADA)
    async handleGuiaHijaAsignada(payload: {
        guiaHijaId: number;
        docCoordId: number;
        fincaId: number;
        fecha: Date;
    }) {
        console.log(`Guía hija ${payload.guiaHijaId} asignada al documento ${payload.docCoordId} para la finca ${payload.fincaId}`);

        // Implementar lógica de asignación, como notificaciones a la finca
    }

    /**
     * Manejador para evento de préstamo de guía madre
     */
    @OnEvent(WorkflowEvents.GUIA_MADRE_PRESTAMO)
    async handleGuiaMadrePrestamo(payload: {
        guiaMadreId: number;
        usuarioId: string;
        fecha: Date;
    }) {
        console.log(`Guía madre ${payload.guiaMadreId} marcada como prestada`);
        // Implementar lógica para préstamos
    }

    /**
     * Manejador para evento de devolución de guía madre
     */
    @OnEvent(WorkflowEvents.GUIA_MADRE_DEVOLUCION)
    async handleGuiaMadreDevolucion(payload: {
        guiaMadreId: number;
        usuarioId: string;
        fecha: Date;
    }) {
        console.log(`Guía madre ${payload.guiaMadreId} marcada como devuelta`);
        // Implementar lógica para devoluciones
    }

    /**
     * Verifica si todas las guías hijas de un documento están confirmadas,
     * y actualiza el estado del documento si es necesario
     */
    private async verificarTodasGuiasConfirmadas(docCoordinacionId: number, usuarioId: string) {
        // Obtener el documento y sus guías
        const documento = await this.prisma.documentoCoordinacion.findUnique({
            where: { id: docCoordinacionId },
            include: {
                guias_hijas: {
                    include: {
                        estadoActual: true
                    }
                },
                estadoActual: true
            }
        });

        if (!documento || documento.guias_hijas.length === 0) {
            return;
        }

        // Verificar si todas las guías están confirmadas
        const todasConfirmadas = documento.guias_hijas.every(
            gh => gh.estadoActual.nombre === EstadoGuiaHija.CONFIRMADA
        );

        // Si todas están confirmadas y el documento no está ya coordinado, actualizar
        if (todasConfirmadas && documento.estadoActual.nombre !== EstadoDocCoord.COORDINADO) {
            // Buscar el estado "COORDINADO"
            const estadoCoordinado = await this.prisma.estadoDocumento.findFirst({
                where: {
                    nombre: EstadoDocCoord.COORDINADO,
                    tipo_entidad: TipoEntidad.DOC_COORDINACION
                }
            });

            if (estadoCoordinado) {
                // Actualizar el estado del documento
                await this.prisma.$transaction([
                    this.prisma.documentoCoordinacion.update({
                        where: { id: docCoordinacionId },
                        data: { id_estado_actual: estadoCoordinado.id }
                    }),
                    this.prisma.documentoCoordinacionEstado.create({
                        data: {
                            id_doc_coordinacion: docCoordinacionId,
                            id_estado: estadoCoordinado.id,
                            id_usuario: usuarioId,
                            comentario: 'Actualizado automáticamente: todas las guías hijas confirmadas'
                        }
                    })
                ]);
            }
        }
    }
}