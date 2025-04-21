import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { GuiaMadreRepository } from '../../repositories/guia-madre.repository';
import { GuiaMadreSecuencialService } from './guia-madre-secuencial.service';
import { CreateGuiaMadreDto } from '../../dto/guia-madre/create-guia-madre.dto';
import { UpdateGuiaMadreDto } from '../../dto/guia-madre/update-guia-madre.dto';
import { GuiaMadreEstadoService } from './guia-madre-estado.service';
import { EstadoGuiaMadre } from '../../documents.constants';

@Injectable()
export class GuiaMadreCrudService {
    constructor(
        private prisma: PrismaService,
        private guiaMadreRepository: GuiaMadreRepository,
        private secuencialService: GuiaMadreSecuencialService,
        private estadoService: GuiaMadreEstadoService,
    ) { }

    /**
     * Crea un lote de guías madre
     */
    async createLote(createGuiaMadreDto: CreateGuiaMadreDto, usuarioId: string) {
        const {
            prefijo,
            secuencial_inicial,
            cantidad,
            id_aerolinea,
            id_referencia,
            fecha,
            id_stock,
            prestamo,
            observaciones
        } = createGuiaMadreDto;

        // Obtener el ID del estado inicial para guía madre
        const estadoInicial = await this.guiaMadreRepository.findEstadoByNombre(EstadoGuiaMadre.DISPONIBLE);

        if (!estadoInicial) {
            throw new BadRequestException('No se encontró un estado inicial configurado para guías madre');
        }

        // Generar los secuenciales
        const secuenciales = this.secuencialService.generarSecuenciales(secuencial_inicial, cantidad);

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
            const estadoDoc = await this.guiaMadreRepository.findEstadoByNombre(estado);
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
            const estadoDisponible = await this.guiaMadreRepository.findEstadoByNombre(EstadoGuiaMadre.DISPONIBLE);
            if (estadoDisponible) {
                where.id_estado_actual = estadoDisponible.id;
                where.prestamo = false;
                where.devolucion = false;
            }
        }

        const [guiasMadre, total] = await Promise.all([
            this.guiaMadreRepository.findAll({
                where,
                skip,
                take: limit
            }),
            this.guiaMadreRepository.count(where),
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
        const guiaMadre = await this.guiaMadreRepository.findById(id);

        if (!guiaMadre) {
            throw new NotFoundException(`Guía madre con ID ${id} no encontrada`);
        }

        return guiaMadre;
    }

    /**
     * Actualiza una guía madre
     */
    async update(id: number, updateGuiaMadreDto: UpdateGuiaMadreDto, usuarioId: string) {
        const guiaMadre = await this.guiaMadreRepository.findById(id);

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
            return this.estadoService.registrarPrestamo(
                id,
                observaciones || '',
                usuarioId,
                fecha_prestamo
            );
        }

        // Lógica para devolución
        if (devolucion === true && !guiaMadre.devolucion) {
            return this.estadoService.registrarDevolucion(
                id,
                observaciones || '',
                usuarioId,
                fecha_devolucion
            );
        }

        // Actualización simple si no hay cambios de estado
        if ((prestamo === undefined || prestamo === guiaMadre.prestamo) &&
            (devolucion === undefined || devolucion === guiaMadre.devolucion)) {
            return this.guiaMadreRepository.update(id, {
                observaciones,
            });
        }

        return this.findOne(id);
    }

    /**
     * Obtiene guías madre disponibles para asignación
     */
    async getDisponibles(id_aerolinea?: number) {
        return this.guiaMadreRepository.findDisponibles(id_aerolinea);
    }
}