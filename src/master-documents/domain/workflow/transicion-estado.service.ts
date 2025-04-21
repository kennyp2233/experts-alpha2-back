import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { TipoEntidad } from '../../documents.constants';

interface ValidarTransicionParams {
    tipoEntidad: TipoEntidad;
    estadoOrigenId: number;
    estadoDestinoId: number;
    roleIds?: number[];
}

interface EjecutarTransicionParams {
    tipoEntidad: TipoEntidad;
    entidadId: number;
    estadoOrigenId: number;
    estadoDestinoId: number;
    usuarioId: string;
    comentario?: string;
}

@Injectable()
export class TransicionEstadoService {
    constructor(private prisma: PrismaService) { }

    /**
     * Valida si una transición de estado está permitida
     */
    async validarTransicion(params: ValidarTransicionParams): Promise<boolean> {
        const { tipoEntidad, estadoOrigenId, estadoDestinoId, roleIds } = params;

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

        // Si no se proporcionan roles, solo validamos que la transición exista
        if (!roleIds) {
            return true;
        }

        // Validar roles permitidos
        try {
            const rolesPermitidos = JSON.parse(transicion.roles_permitidos);
            return roleIds.some(id => rolesPermitidos.includes(id));
        } catch (error) {
            // Error al parsear los roles permitidos
            return false;
        }
    }

    /**
     * Obtiene datos adicionales de una transición
     */
    async getTransicionInfo(tipoEntidad: TipoEntidad, estadoOrigenId: number, estadoDestinoId: number) {
        const transicion = await this.prisma.transicionPermitida.findFirst({
            where: {
                tipo_entidad: tipoEntidad,
                id_estado_origen: estadoOrigenId,
                id_estado_destino: estadoDestinoId,
            },
            include: {
                estadoOrigen: true,
                estadoDestino: true,
            },
        });

        if (!transicion) {
            throw new BadRequestException('Transición no encontrada');
        }

        return {
            requiere_comentario: transicion.requiere_comentario,
            nombre_accion: transicion.nombre_accion,
            estadoOrigen: transicion.estadoOrigen,
            estadoDestino: transicion.estadoDestino,
        };
    }

    /**
     * Obtiene todas las transiciones permitidas desde un estado
     */
    async getTransicionesDesdeEstado(
        tipoEntidad: TipoEntidad,
        estadoId: number,
        roleIds?: number[]
    ) {
        const transiciones = await this.prisma.transicionPermitida.findMany({
            where: {
                tipo_entidad: tipoEntidad,
                id_estado_origen: estadoId,
            },
            include: {
                estadoDestino: true,
            },
        });

        // Si se proporcionan roles, filtrar las transiciones por roles permitidos
        if (roleIds && roleIds.length > 0) {
            return transiciones.filter(t => {
                try {
                    const rolesPermitidos = JSON.parse(t.roles_permitidos);
                    return roleIds.some(id => rolesPermitidos.includes(id));
                } catch (error) {
                    return false;
                }
            });
        }

        return transiciones;
    }

    /**
     * Ejecuta una transición de estado en la entidad especificada
     */
    async ejecutarTransicion(params: EjecutarTransicionParams) {
        const { tipoEntidad, entidadId, estadoOrigenId, estadoDestinoId, usuarioId, comentario } = params;

        // Validar que la transición está permitida
        const esValida = await this.validarTransicion({
            tipoEntidad,
            estadoOrigenId,
            estadoDestinoId
        });

        if (!esValida) {
            throw new ForbiddenException('Transición de estado no permitida');
        }

        // Obtener información adicional de la transición
        const infoTransicion = await this.getTransicionInfo(tipoEntidad, estadoOrigenId, estadoDestinoId);

        // Verificar si requiere comentario
        if (infoTransicion.requiere_comentario && !comentario) {
            throw new BadRequestException('Esta transición requiere un comentario');
        }

        // Ejecutar la transición según el tipo de entidad
        switch (tipoEntidad) {
            case TipoEntidad.GUIA_MADRE:
                await this.prisma.$transaction([
                    this.prisma.guiaMadre.update({
                        where: { id: entidadId },
                        data: {
                            id_estado_actual: estadoDestinoId,
                            updatedAt: new Date()
                        },
                    }),
                    this.prisma.guiaMadreEstado.create({
                        data: {
                            id_guia_madre: entidadId,
                            id_estado: estadoDestinoId,
                            id_usuario: usuarioId,
                            comentario: comentario || `Cambio de estado a ${infoTransicion.estadoDestino.nombre}`,
                        },
                    }),
                ]);
                break;

            case TipoEntidad.DOC_COORDINACION:
                await this.prisma.$transaction([
                    this.prisma.documentoCoordinacion.update({
                        where: { id: entidadId },
                        data: {
                            id_estado_actual: estadoDestinoId,
                            updatedAt: new Date()
                        },
                    }),
                    this.prisma.documentoCoordinacionEstado.create({
                        data: {
                            id_doc_coordinacion: entidadId,
                            id_estado: estadoDestinoId,
                            id_usuario: usuarioId,
                            comentario: comentario || `Cambio de estado a ${infoTransicion.estadoDestino.nombre}`,
                        },
                    }),
                ]);
                break;

            case TipoEntidad.GUIA_HIJA:
                await this.prisma.$transaction([
                    this.prisma.guiaHija.update({
                        where: { id: entidadId },
                        data: {
                            id_estado_actual: estadoDestinoId,
                            updatedAt: new Date()
                        },
                    }),
                    this.prisma.guiaHijaEstado.create({
                        data: {
                            id_guia_hija: entidadId,
                            id_estado: estadoDestinoId,
                            id_usuario: usuarioId,
                            comentario: comentario || `Cambio de estado a ${infoTransicion.estadoDestino.nombre}`,
                        },
                    }),
                ]);
                break;

            default:
                throw new BadRequestException(`Tipo de entidad no soportado: ${tipoEntidad}`);
        }

        return {
            entidadId,
            tipoEntidad,
            estadoAnterior: estadoOrigenId,
            estadoNuevo: estadoDestinoId,
            comentario: comentario || `Cambio de estado a ${infoTransicion.estadoDestino.nombre}`,
            fechaCambio: new Date(),
            usuarioId
        };
    }
}