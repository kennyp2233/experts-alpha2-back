// src/documents/services/guias-madre.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateGuiaMadreDto } from '../dto/guia-madre/create-guia-madre.dto';
import { UpdateGuiaMadreDto } from '../dto/guia-madre/update-guia-madre.dto';
import { EstadoGuiaMadre, WorkflowEvents, INCREMENTO_SECUENCIAL, INCREMENTO_ESPECIAL_6 } from '../documents.constants';

@Injectable()
export class GuiasMadreService {
    constructor(
        private prisma: PrismaService,
        private eventEmitter: EventEmitter2,
    ) { }

    /**
     * Genera secuenciales siguiendo la lógica específica:
     * - Suma 11 en cada incremento.
     * - Si el último dígito es 6, suma 4 en lugar de 11.
     */
    generarSecuenciales(inicial: number, cantidad: number): number[] {
        const secuenciales: number[] = [];
        let actual = inicial;

        for (let i = 0; i < cantidad; i++) {
            secuenciales.push(actual);
            const ultimoDigito = actual % 10;

            if (ultimoDigito === 6) {
                actual += INCREMENTO_ESPECIAL_6;
            } else {
                actual += INCREMENTO_SECUENCIAL;
            }
        }

        return secuenciales;
    }

    /**
     * Previsualiza los secuenciales que se generarían
     */
    previsualizarSecuenciales(inicial: number, cantidad: number): number[] {
        return this.generarSecuenciales(inicial, cantidad);
    }

    /**
     * Crea guías madre en lote
     */
    async createLote(createGuiaMadreDto: CreateGuiaMadreDto, usuarioId: string) {
        const { prefijo, secuencial_inicial, cantidad, id_aerolinea, id_referencia, fecha, id_stock, prestamo, observaciones } = createGuiaMadreDto;

        // Obtener el ID del estado inicial para guía madre
        const estadoInicial = await this.prisma.estadoDocumento.findFirst({
            where: {
                tipo_entidad: 'GUIA_MADRE',
                es_estado_inicial: true,
            },
        });

        if (!estadoInicial) {
            throw new BadRequestException('No se encontró un estado inicial configurado para guías madre');
        }

        // Generar los secuenciales
        const secuenciales = this.generarSecuenciales(secuencial_inicial, cantidad);

        return this.prisma.$transaction(async (prisma) => {
            // Crear el documento base
            const documentoBase = await prisma.documentoBase.create({
                data: {
                    fecha: fecha ? new Date(fecha) : new Date(),
                    id_aerolinea,
                    id_referencia,
                    id_stock,
                },
            });

            // Crear las guías madre
            const guiasCreadas: any[] = [];

            for (const secuencial of secuenciales) {
                const guiaMadre = await prisma.guiaMadre.create({
                    data: {
                        prefijo,
                        secuencial,
                        id_documento_base: documentoBase.id,
                        id_estado_actual: estadoInicial.id,
                        prestamo,
                        observaciones,
                        fecha_prestamo: prestamo ? new Date() : null,
                    },
                });

                // Crear el registro de historial de estado
                await prisma.guiaMadreEstado.create({
                    data: {
                        id_guia_madre: guiaMadre.id,
                        id_estado: estadoInicial.id,
                        id_usuario: usuarioId,
                        comentario: 'Creación inicial',
                    },
                });

                guiasCreadas.push(guiaMadre);
            }

            return {
                documento_base: documentoBase,
                guias_madre: guiasCreadas,
                cantidad_creada: guiasCreadas.length,
            };
        });
    }

    /**
     * Obtiene todas las guías madre con paginación opcional
     */
    async findAll(
        page = 1,
        limit = 10,
        estado?: string,
        aerolinea?: number,
        disponibles?: boolean
    ) {
        const skip = (page - 1) * limit;
        const where: any = {};

        // Filtrar por estado si se proporciona
        if (estado) {
            const estadoDoc = await this.prisma.estadoDocumento.findFirst({
                where: { nombre: estado, tipo_entidad: 'GUIA_MADRE' },
            });

            if (estadoDoc) {
                where.id_estado_actual = estadoDoc.id;
            }
        }

        // Filtrar por aerolínea si se proporciona
        if (aerolinea) {
            where.documento_base = {
                id_aerolinea: aerolinea,
            };
        }

        // Filtrar solo disponibles (no asignadas, no prestadas o devueltas)
        if (disponibles) {
            const estadoDisponible = await this.prisma.estadoDocumento.findFirst({
                where: { nombre: EstadoGuiaMadre.DISPONIBLE, tipo_entidad: 'GUIA_MADRE' },
            });

            if (estadoDisponible) {
                where.id_estado_actual = estadoDisponible.id;
                where.prestamo = false;
                where.devolucion = false;
            }
        }

        const [guiasMadre, total] = await Promise.all([
            this.prisma.guiaMadre.findMany({
                where,
                skip,
                take: limit,
                include: {
                    documento_base: {
                        include: {
                            aerolinea: true,
                            referencia: true,
                        },
                    },
                    estadoActual: true,
                },
                orderBy: [
                    { prefijo: 'asc' },
                    { secuencial: 'asc' },
                ],
            }),
            this.prisma.guiaMadre.count({ where }),
        ]);

        return {
            data: guiasMadre,
            meta: {
                total,
                page,
                limit,
                lastPage: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Obtiene una guía madre por su ID
     */
    async findOne(id: number) {
        const guiaMadre = await this.prisma.guiaMadre.findUnique({
            where: { id },
            include: {
                documento_base: {
                    include: {
                        aerolinea: true,
                        referencia: true,
                    },
                },
                estadoActual: true,
                historialEstados: {
                    include: {
                        estado: true,
                        usuario: true,
                    },
                    orderBy: {
                        fecha_cambio: 'desc',
                    },
                },
                documento_coordinacion: {
                    include: {
                        estadoActual: true,
                    },
                },
                guias_hijas: {
                    include: {
                        finca: true,
                        estadoActual: true,
                    },
                },
            },
        });

        if (!guiaMadre) {
            throw new NotFoundException(`Guía madre con ID ${id} no encontrada`);
        }

        return guiaMadre;
    }

    /**
     * Actualiza una guía madre
     */
    async update(id: number, updateGuiaMadreDto: UpdateGuiaMadreDto, usuarioId: string) {
        const guiaMadre = await this.prisma.guiaMadre.findUnique({
            where: { id },
            include: {
                documento_coordinacion: true,
            },
        });

        if (!guiaMadre) {
            throw new NotFoundException(`Guía madre con ID ${id} no encontrada`);
        }

        // No permitir actualizar si está asignada a un documento de coordinación
        if (guiaMadre.documento_coordinacion) {
            throw new BadRequestException('No se puede actualizar una guía madre asignada a un documento de coordinación');
        }

        const { prestamo, observaciones, fecha_prestamo, devolucion, fecha_devolucion } = updateGuiaMadreDto;

        // Lógica para préstamo
        if (prestamo === true && !guiaMadre.prestamo) {
            // Cambiar estado a PRESTADA
            const estadoPrestamo = await this.prisma.estadoDocumento.findFirst({
                where: { nombre: EstadoGuiaMadre.PRESTADA, tipo_entidad: 'GUIA_MADRE' },
            });

            if (!estadoPrestamo) {
                throw new BadRequestException('Estado de préstamo no configurado');
            }

            await this.prisma.$transaction([
                this.prisma.guiaMadre.update({
                    where: { id },
                    data: {
                        prestamo: true,
                        fecha_prestamo: fecha_prestamo ? new Date(fecha_prestamo) : new Date(),
                        observaciones,
                        id_estado_actual: estadoPrestamo.id,
                    },
                }),
                this.prisma.guiaMadreEstado.create({
                    data: {
                        id_guia_madre: id,
                        id_estado: estadoPrestamo.id,
                        id_usuario: usuarioId,
                        comentario: 'Préstamo de guía',
                    },
                }),
            ]);

            this.eventEmitter.emit(WorkflowEvents.GUIA_MADRE_PRESTAMO, {
                guiaMadreId: id,
                usuarioId,
                fecha: fecha_prestamo ? new Date(fecha_prestamo) : new Date(),
            });
        }

        // Lógica para devolución
        if (devolucion === true && !guiaMadre.devolucion) {
            // Cambiar estado a DEVUELTA
            const estadoDevuelta = await this.prisma.estadoDocumento.findFirst({
                where: { nombre: EstadoGuiaMadre.DEVUELTA, tipo_entidad: 'GUIA_MADRE' },
            });

            if (!estadoDevuelta) {
                throw new BadRequestException('Estado de devolución no configurado');
            }

            await this.prisma.$transaction([
                this.prisma.guiaMadre.update({
                    where: { id },
                    data: {
                        devolucion: true,
                        fecha_devolucion: fecha_devolucion ? new Date(fecha_devolucion) : new Date(),
                        observaciones,
                        id_estado_actual: estadoDevuelta.id,
                    },
                }),
                this.prisma.guiaMadreEstado.create({
                    data: {
                        id_guia_madre: id,
                        id_estado: estadoDevuelta.id,
                        id_usuario: usuarioId,
                        comentario: 'Devolución de guía',
                    },
                }),
            ]);

            this.eventEmitter.emit(WorkflowEvents.GUIA_MADRE_DEVOLUCION, {
                guiaMadreId: id,
                usuarioId,
                fecha: fecha_devolucion ? new Date(fecha_devolucion) : new Date(),
            });
        }

        // Actualización simple si no hay cambios de estado
        if ((prestamo === undefined || prestamo === guiaMadre.prestamo) &&
            (devolucion === undefined || devolucion === guiaMadre.devolucion)) {
            return this.prisma.guiaMadre.update({
                where: { id },
                data: {
                    observaciones,
                },
                include: {
                    documento_base: {
                        include: {
                            aerolinea: true,
                        },
                    },
                    estadoActual: true,
                },
            });
        }

        return this.findOne(id);
    }

    /**
     * Obtiene guías madre disponibles para asignación
     */
    async getDisponibles(id_aerolinea?: number) {
        const estadoDisponible = await this.prisma.estadoDocumento.findFirst({
            where: { nombre: EstadoGuiaMadre.DISPONIBLE, tipo_entidad: 'GUIA_MADRE' },
        });

        if (!estadoDisponible) {
            throw new BadRequestException('Estado disponible no configurado');
        }

        const where: any = {
            id_estado_actual: estadoDisponible.id,
            prestamo: false,
            devolucion: false,
            documento_coordinacion: null, // No asignada a ningún documento de coordinación
        };

        if (id_aerolinea) {
            where.documento_base = {
                id_aerolinea,
            };
        }

        return this.prisma.guiaMadre.findMany({
            where,
            include: {
                documento_base: {
                    include: {
                        aerolinea: true,
                    },
                },
                estadoActual: true,
            },
            orderBy: [
                { prefijo: 'asc' },
                { secuencial: 'asc' },
            ],
        });
    }
}