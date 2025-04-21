// src/master-documents/services/workflow.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TipoEntidad } from '../documents.constants';
import { CambioEstadoResult, TransicionEstado, EstadoDocumento } from '../interfaces/workflow.interface';

@Injectable()
export class WorkflowService {
    constructor(private prisma: PrismaService) { }

    /**
     * Obtiene todos los estados configurados para un tipo de entidad
     */
    async getEstadosByTipoEntidad(tipoEntidad: TipoEntidad): Promise<EstadoDocumento[]> {
        const estados = await this.prisma.estadoDocumento.findMany({
            where: { tipo_entidad: tipoEntidad },
            orderBy: { id: 'asc' },
        });
        return estados.map(estado => ({
            ...estado,
            tipo_entidad: estado.tipo_entidad as TipoEntidad,
            descripcion: estado.descripcion ?? undefined,
            color: estado.color ?? undefined
        }));
    }

    /**
     * Obtiene todas las transiciones permitidas para un tipo de entidad
     */
    async getTransicionesByTipoEntidad(tipoEntidad: TipoEntidad): Promise<TransicionEstado[]> {
        const transiciones = await this.prisma.transicionPermitida.findMany({
            where: { tipo_entidad: tipoEntidad },
            include: {
                estadoOrigen: true,
                estadoDestino: true,
            },
            orderBy: [
                { id_estado_origen: 'asc' },
                { id_estado_destino: 'asc' },
            ],
        });

        // Transformar los roles_permitidos de string a array
        return transiciones.map(t => ({
            id: t.id,
            tipo_entidad: t.tipo_entidad as TipoEntidad,
            id_estado_origen: t.id_estado_origen,
            id_estado_destino: t.id_estado_destino,
            roles_permitidos: JSON.parse(t.roles_permitidos),
            requiere_comentario: t.requiere_comentario,
            nombre_accion: t.nombre_accion ?? undefined,
        }));
    }

    /**
     * Obtiene las transiciones disponibles para un estado específico
     */
    async getTransicionesFromEstado(
        tipoEntidad: TipoEntidad,
        estadoId: number,
        roleIds: number[]
    ): Promise<TransicionEstado[]> {
        const transiciones = await this.prisma.transicionPermitida.findMany({
            where: {
                tipo_entidad: tipoEntidad,
                id_estado_origen: estadoId,
            },
            include: {
                estadoOrigen: true,
                estadoDestino: true,
            },
            orderBy: { id_estado_destino: 'asc' },
        });

        // Filtrar por roles y transformar
        return transiciones
            .filter(t => {
                const rolesPermitidos = JSON.parse(t.roles_permitidos);
                return roleIds.some(id => rolesPermitidos.includes(id));
            })
            .map(t => ({
                id: t.id,
                tipo_entidad: t.tipo_entidad as TipoEntidad,
                id_estado_origen: t.id_estado_origen,
                id_estado_destino: t.id_estado_destino,
                roles_permitidos: JSON.parse(t.roles_permitidos),
                requiere_comentario: t.requiere_comentario,
                nombre_accion: t.nombre_accion ?? undefined,
            }));
    }

    /**
     * Valida si una transición es permitida
     */
    async validarTransicion(
        tipoEntidad: TipoEntidad,
        estadoOrigenId: number,
        estadoDestinoId: number,
        roleIds: number[]
    ): Promise<boolean> {
        const transicion = await this.prisma.transicionPermitida.findFirst({
            where: {
                tipo_entidad: tipoEntidad,
                id_estado_origen: estadoOrigenId,
                id_estado_destino: estadoDestinoId,
            },
        });

        if (!transicion) {
            return false;
        }

        const rolesPermitidos = JSON.parse(transicion.roles_permitidos);
        return roleIds.some(id => rolesPermitidos.includes(id));
    }

    /**
     * Obtiene el historial de cambios de estado para una entidad
     */
    async getHistorialEstados(tipoEntidad: TipoEntidad, entidadId: number): Promise<any[]> {
        let historial: any[] = [];

        switch (tipoEntidad) {
            case TipoEntidad.GUIA_MADRE:
                historial = await this.prisma.guiaMadreEstado.findMany({
                    where: { id_guia_madre: entidadId },
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
                    orderBy: { fecha_cambio: 'desc' },
                });
                break;
            case TipoEntidad.DOC_COORDINACION:
                historial = await this.prisma.documentoCoordinacionEstado.findMany({
                    where: { id_doc_coordinacion: entidadId },
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
                    orderBy: { fecha_cambio: 'desc' },
                });
                break;
            case TipoEntidad.GUIA_HIJA:
                historial = await this.prisma.guiaHijaEstado.findMany({
                    where: { id_guia_hija: entidadId },
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
                    orderBy: { fecha_cambio: 'desc' },
                });
                break;
            default:
                throw new BadRequestException(`Tipo de entidad ${tipoEntidad} no válido`);
        }

        return historial;
    }

    /**
     * Realiza un cambio de estado, validando la transición
     */
    async cambiarEstado(
        tipoEntidad: TipoEntidad,
        entidadId: number,
        nuevoEstadoId: number,
        usuarioId: string,
        roleIds: number[],
        comentario?: string
    ): Promise<CambioEstadoResult> {
        // Obtener el estado actual de la entidad
        let estadoActualId: number;
        let entidad: any;

        switch (tipoEntidad) {
            case TipoEntidad.GUIA_MADRE:
                entidad = await this.prisma.guiaMadre.findUnique({
                    where: { id: entidadId },
                    select: { id_estado_actual: true },
                });
                break;
            case TipoEntidad.DOC_COORDINACION:
                entidad = await this.prisma.documentoCoordinacion.findUnique({
                    where: { id: entidadId },
                    select: { id_estado_actual: true },
                });
                break;
            case TipoEntidad.GUIA_HIJA:
                entidad = await this.prisma.guiaHija.findUnique({
                    where: { id: entidadId },
                    select: { id_estado_actual: true },
                });
                break;
            default:
                throw new BadRequestException(`Tipo de entidad ${tipoEntidad} no válido`);
        }

        if (!entidad) {
            throw new NotFoundException(`Entidad con ID ${entidadId} no encontrada`);
        }

        estadoActualId = entidad.id_estado_actual;

        // Validar la transición
        const esTransicionValida = await this.validarTransicion(
            tipoEntidad,
            estadoActualId,
            nuevoEstadoId,
            roleIds
        );

        if (!esTransicionValida) {
            throw new ForbiddenException('Transición de estado no permitida');
        }

        // Obtener información adicional de la transición
        const transicion = await this.prisma.transicionPermitida.findFirst({
            where: {
                tipo_entidad: tipoEntidad,
                id_estado_origen: estadoActualId,
                id_estado_destino: nuevoEstadoId,
            },
        });

        // Verificar si requiere comentario
        if (!transicion) {
            throw new ForbiddenException('Transición no encontrada');
        }

        if (transicion.requiere_comentario && !comentario) {
            throw new BadRequestException('Esta transición requiere un comentario');
        }

        // Realizar el cambio de estado en transacción
        return this.prisma.$transaction(async (prisma) => {
            // Actualizar el estado de la entidad
            switch (tipoEntidad) {
                case TipoEntidad.GUIA_MADRE:
                    await prisma.guiaMadre.update({
                        where: { id: entidadId },
                        data: { id_estado_actual: nuevoEstadoId },
                    });

                    await prisma.guiaMadreEstado.create({
                        data: {
                            id_guia_madre: entidadId,
                            id_estado: nuevoEstadoId,
                            id_usuario: usuarioId,
                            comentario,
                        },
                    });
                    break;
                case TipoEntidad.DOC_COORDINACION:
                    await prisma.documentoCoordinacion.update({
                        where: { id: entidadId },
                        data: { id_estado_actual: nuevoEstadoId },
                    });

                    await prisma.documentoCoordinacionEstado.create({
                        data: {
                            id_doc_coordinacion: entidadId,
                            id_estado: nuevoEstadoId,
                            id_usuario: usuarioId,
                            comentario,
                        },
                    });
                    break;
                case TipoEntidad.GUIA_HIJA:
                    await prisma.guiaHija.update({
                        where: { id: entidadId },
                        data: { id_estado_actual: nuevoEstadoId },
                    });

                    await prisma.guiaHijaEstado.create({
                        data: {
                            id_guia_hija: entidadId,
                            id_estado: nuevoEstadoId,
                            id_usuario: usuarioId,
                            comentario,
                        },
                    });
                    break;
            }

            // Retornar información del cambio
            return {
                estado_anterior: estadoActualId,
                estado_nuevo: nuevoEstadoId,
                comentario,
                fecha_cambio: new Date(),
                usuario_id: usuarioId,
            };
        });
    }
}