import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma/prisma.service';
import { GuiaHijaRepository } from '../../repositories/guia-hija.repository';
import { DocumentoCoordinacionRepository } from '../../repositories/documento-coordinacion.repository';
import { AsignarGuiaHijaDto } from '../../dto/guia-hija/asignar-guia-hija.dto';
import { UpdateGuiaHijaDto } from '../../dto/guia-hija/update-guia-hija.dto';
import { FormatoGuiasUtils } from '../../utils/formato-guias.utils';
import {
    WorkflowEvents,
    EstadoDocCoord,
    FormatoGuiaHija,
    FORMATO_GUIA_HIJA,
    ReglaAsignacionGuiaHija,
    REGLA_ASIGNACION_DEFAULT
} from '../../documents.constants';
import { GuiaHijaNumeracionService } from './guia-hija-numeracion.service';

@Injectable()
export class GuiaHijaCrudService {
    constructor(
        private prisma: PrismaService,
        private guiaHijaRepository: GuiaHijaRepository,
        private docCoordinacionRepository: DocumentoCoordinacionRepository,
        private eventEmitter: EventEmitter2,
        private numeracionService: GuiaHijaNumeracionService,
    ) { }

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
            const estadoDoc = await this.guiaHijaRepository.findEstadoByNombre(estado);
            if (estadoDoc) {
                where.id_estado_actual = estadoDoc.id;
            }
        }

        if (docCoordinacion) {
            where.id_documento_coordinacion = docCoordinacion;
        }

        const [guiasHijas, total] = await Promise.all([
            this.guiaHijaRepository.findAll({
                where,
                skip,
                take: limit
            }),
            this.guiaHijaRepository.count(where),
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
        const guiaHija = await this.guiaHijaRepository.findById(id);

        if (!guiaHija) {
            throw new NotFoundException(`Guía hija con ID ${id} no encontrada`);
        }

        return guiaHija;
    }

    /**
     * Asigna una guía hija a un documento de coordinación para una finca específica
     * siguiendo las reglas de negocio para la numeración:
     * 1. Si es la primera guía para una finca, se crea un nuevo secuencial
     * 2. Si la finca ya tiene una guía para la misma guía madre, se usa la misma numeración
     * 3. Si la finca tiene guías para otras guías madre, se asigna el siguiente secuencial disponible
     * 4. Se debe considerar también la marcación (consignatario) y el producto
     */
    async asignarGuiaHija(id_documento_coordinacion: number, id_finca: number, asignarGuiaHijaDto?: AsignarGuiaHijaDto) {
        return this.prisma.$transaction(async (prisma) => {
            // Obtener documento coordinación con la información completa
            const docCoordinacion = await this.docCoordinacionRepository.findById(id_documento_coordinacion);

            if (!docCoordinacion) {
                throw new Error('Documento de coordinación no encontrado');
            }

            const id_guia_madre = docCoordinacion.guia_madre.id;
            const id_producto = asignarGuiaHijaDto?.id_producto || docCoordinacion.id_producto;

            // Obtener información del consignatario principal
            const consignatarioPrincipal = docCoordinacion.DocumentoConsignatario.find(dc => dc.es_principal);
            if (!consignatarioPrincipal) {
                throw new BadRequestException('El documento de coordinación no tiene un consignatario principal asignado');
            }
            const id_consignatario = consignatarioPrincipal.consignatario.id;

            // Buscar una guía hija existente según las reglas de asignación configuradas
            const guiaHijaExistente = await this.numeracionService.buscarGuiaExistente(
                id_finca,
                id_guia_madre,
                id_consignatario,
                id_producto,
                REGLA_ASIGNACION_DEFAULT
            );

            // Si existe una guía hija para esta combinación específica, se usa la misma numeración
            if (guiaHijaExistente) {
                // Verificar si corresponde al mismo documento de coordinación
                if (guiaHijaExistente.id_documento_coordinacion !== id_documento_coordinacion) {
                    // Actualizar la guía hija para asociarla al nuevo documento de coordinación
                    const dataToUpdate: any = {
                        id_documento_coordinacion,
                        updatedAt: new Date()
                    };

                    // Actualizar campos adicionales si se proporcionan
                    if (asignarGuiaHijaDto?.fulls !== undefined) dataToUpdate.fulls = asignarGuiaHijaDto.fulls;
                    if (asignarGuiaHijaDto?.pcs !== undefined) dataToUpdate.pcs = asignarGuiaHijaDto.pcs;
                    if (asignarGuiaHijaDto?.kgs !== undefined) dataToUpdate.kgs = asignarGuiaHijaDto.kgs;
                    if (asignarGuiaHijaDto?.stems !== undefined) dataToUpdate.stems = asignarGuiaHijaDto.stems;

                    return this.guiaHijaRepository.update(guiaHijaExistente.id, dataToUpdate);
                }

                return guiaHijaExistente;
            }

            // Si no existe guía para esta combinación, generar un nuevo número de guía
            const anioActual = new Date().getFullYear();

            // Generar el número de guía hija usando el servicio de numeración
            const numeroGuiaHija = await this.numeracionService.generarNumeroGuiaHija({
                id_finca,
                id_guia_madre,
                id_consignatario,
                id_producto,
                formato: FORMATO_GUIA_HIJA
            });

            // Extraer los componentes del número de guía
            const guiaComponents = this.numeracionService.parseNumeroGuiaHija(numeroGuiaHija);
            let nuevoSecuencial = 1;

            // Si el formato incluye un secuencial, usarlo
            if (guiaComponents.secuencial) {
                nuevoSecuencial = guiaComponents.secuencial;
            } else {
                // Si no hay secuencial en el formato, generar uno
                const ultimaGuia = await this.guiaHijaRepository.getLastByYear(anioActual);
                nuevoSecuencial = ultimaGuia ? ultimaGuia.secuencial + 1 : 1;
            }

            // Obtener estado inicial para guía hija
            const estadoInicial = await this.guiaHijaRepository.findEstadoInicial();

            if (!estadoInicial) {
                throw new BadRequestException('No se encontró un estado inicial configurado para guías hijas');
            }

            // Preparar datos para creación
            const createData: any = {
                id_documento_coordinacion,
                id_guia_madre,
                id_finca,
                id_producto,
                id_estado_actual: estadoInicial.id,
                numero_guia_hija: numeroGuiaHija,
                anio: anioActual,
                secuencial: nuevoSecuencial,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Añadir campos adicionales si se proporcionan
            if (asignarGuiaHijaDto?.fulls !== undefined) createData.fulls = asignarGuiaHijaDto.fulls;
            if (asignarGuiaHijaDto?.pcs !== undefined) createData.pcs = asignarGuiaHijaDto.pcs;
            if (asignarGuiaHijaDto?.kgs !== undefined) createData.kgs = asignarGuiaHijaDto.kgs;
            if (asignarGuiaHijaDto?.stems !== undefined) createData.stems = asignarGuiaHijaDto.stems;

            const nuevaGuiaHija = await this.guiaHijaRepository.create(createData);

            // Crear registro de historial de estado
            await this.guiaHijaRepository.createHistorialEstado({
                id_guia_hija: nuevaGuiaHija.id,
                id_estado: estadoInicial.id,
                id_usuario: '00000000-0000-0000-0000-000000000000', // Usuario sistema
                comentario: 'Creación inicial',
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
     * Actualiza una guía hija
     */
    async update(id: number, updateGuiaHijaDto: UpdateGuiaHijaDto, usuarioId: string) {
        const guiaHija = await this.guiaHijaRepository.findById(id);

        if (!guiaHija) {
            throw new NotFoundException(`Guía hija con ID ${id} no encontrada`);
        }

        // No permitir actualizar si el documento de coordinación está cortado o cancelado
        if (guiaHija.documento_coordinacion.estadoActual.nombre === EstadoDocCoord.CORTADO ||
            guiaHija.documento_coordinacion.estadoActual.nombre === EstadoDocCoord.CANCELADO) {
            throw new BadRequestException(
                `No se puede modificar una guía hija cuando el documento de coordinación está ${guiaHija.documento_coordinacion.estadoActual.nombre}`
            );
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

        return this.guiaHijaRepository.update(id, dataToUpdate);
    }

    /**
     * Obtiene guías hijas por finca, con opción de filtrar por estado
     */
    async findByFinca(id_finca: number, estado?: string) {
        return this.guiaHijaRepository.findByFinca(id_finca, estado);
    }

    /**
     * Obtiene guías hijas por documento de coordinación
     */
    async findByDocumentoCoordenacion(id_documento_coordinacion: number) {
        return this.guiaHijaRepository.findByDocumentoCoordinacion(id_documento_coordinacion);
    }
}