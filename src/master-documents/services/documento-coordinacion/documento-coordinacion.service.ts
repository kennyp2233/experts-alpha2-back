import { Injectable } from '@nestjs/common';
import { DocumentoCoordinacionCrudService } from './documento-coordinacion-crud.service';
import { DocumentoCoordinacionEstadoService } from './documento-coordinacion-estado.service';
import { CreateDocCoordDto } from '../../dto/documento-coordinacion/create-doc-coord.dto';
import { UpdateDocCoordDto } from '../../dto/documento-coordinacion/update-doc-coord.dto';

/**
 * Servicio principal que actúa como fachada para las operaciones de documentos de coordinación,
 * delegando a servicios especializados.
 */
@Injectable()
export class DocumentoCoordinacionService {
    constructor(
        private crudService: DocumentoCoordinacionCrudService,
        private estadoService: DocumentoCoordinacionEstadoService,
    ) { }

    /**
     * Crea un nuevo documento de coordinación
     */
    async create(createDocCoordDto: CreateDocCoordDto, usuarioId: string) {
        return this.crudService.create(createDocCoordDto, usuarioId);
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
        return this.crudService.findAll(
            page,
            limit,
            estado,
            consignatario,
            producto,
            aerolinea,
            fechaDesde,
            fechaHasta
        );
    }

    /**
     * Obtiene un documento de coordinación por su ID
     */
    async findOne(id: number) {
        return this.crudService.findOne(id);
    }

    /**
     * Actualiza un documento de coordinación
     */
    async update(id: number, updateDocCoordDto: UpdateDocCoordDto, usuarioId: string) {
        return this.crudService.update(id, updateDocCoordDto, usuarioId);
    }

    /**
     * Asigna consignatarios a un documento de coordinación
     */
    async asignarConsignatarios(id: number, consignatarios: { id_consignatario: number, es_principal: boolean }[]) {
        return this.crudService.asignarConsignatarios(id, consignatarios);
    }

    /**
     * Cambia el estado de un documento de coordinación
     */
    async cambiarEstado(id: number, nuevoEstadoId: number, comentario: string, usuarioId: string) {
        return this.estadoService.cambiarEstado(id, nuevoEstadoId, comentario, usuarioId);
    }

    /**
     * Corta un documento de coordinación (finaliza el proceso)
     */
    async cortarDocumento(id: number, comentario: string, usuarioId: string) {
        return this.estadoService.cortarDocumento(id, comentario, usuarioId);
    }

    /**
     * Cancela un documento de coordinación
     */
    async cancelarDocumento(id: number, motivo: string, usuarioId: string) {
        return this.estadoService.cancelarDocumento(id, motivo, usuarioId);
    }

    /**
     * Obtiene el resumen de KGs y cajas por documento de coordinación
     */
    async getResumenCajas(id: number) {
        return this.crudService.getResumenCajas(id);
    }
}