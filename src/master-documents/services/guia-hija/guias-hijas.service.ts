import { Injectable } from '@nestjs/common';
import { GuiaHijaCrudService } from './guia-hija-crud.service';
import { GuiaHijaEstadoService } from './guia-hija-estado.service';
import { AsignarGuiaHijaDto } from '../../dto/guia-hija/asignar-guia-hija.dto';
import { UpdateGuiaHijaDto } from '../../dto/guia-hija/update-guia-hija.dto';
import { CambioEstadoDto } from '../../dto/guia-madre/cambio-estado.dto';

/**
 * Servicio principal que actúa como fachada para las operaciones de guías hijas,
 * delegando a servicios especializados.
 */
@Injectable()
export class GuiasHijasService {
    constructor(
        private crudService: GuiaHijaCrudService,
        private estadoService: GuiaHijaEstadoService,
    ) { }

    /**
     * Asigna una guía hija a un documento de coordinación para una finca específica
     */
    async asignarGuiaHija(
        id_documento_coordinacion: number,
        id_finca: number,
        asignarGuiaHijaDto?: AsignarGuiaHijaDto
    ) {
        return this.crudService.asignarGuiaHija(
            id_documento_coordinacion,
            id_finca,
            asignarGuiaHijaDto
        );
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
        return this.crudService.findAll(
            page,
            limit,
            finca,
            producto,
            estado,
            docCoordinacion
        );
    }

    /**
     * Obtiene una guía hija por su ID
     */
    async findOne(id: number) {
        return this.crudService.findOne(id);
    }

    /**
     * Actualiza una guía hija
     */
    async update(id: number, updateGuiaHijaDto: UpdateGuiaHijaDto, usuarioId: string) {
        return this.crudService.update(id, updateGuiaHijaDto, usuarioId);
    }

    /**
     * Confirma una guía hija (usado principalmente por fincas)
     */
    async confirmarGuiaHija(id: number, updateGuiaHijaDto: UpdateGuiaHijaDto, usuarioId: string) {
        return this.estadoService.confirmarGuiaHija(id, updateGuiaHijaDto, usuarioId);
    }

    /**
     * Cambia el estado de una guía hija
     */
    async cambiarEstado(id: number, cambioEstadoDto: CambioEstadoDto, usuarioId: string) {
        return this.estadoService.cambiarEstado(id, cambioEstadoDto, usuarioId);
    }

    /**
     * Cancela una guía hija
     */
    async cancelar(id: number, motivo: string, usuarioId: string) {
        return this.estadoService.cancelar(id, motivo, usuarioId);
    }

    /**
     * Obtiene guías hijas por finca, con opción de filtrar por estado
     */
    async findByFinca(id_finca: number, estado?: string) {
        return this.crudService.findByFinca(id_finca, estado);
    }

    /**
     * Obtiene guías hijas por documento de coordinación
     */
    async findByDocumentoCoordenacion(id_documento_coordinacion: number) {
        return this.crudService.findByDocumentoCoordenacion(id_documento_coordinacion);
    }
}