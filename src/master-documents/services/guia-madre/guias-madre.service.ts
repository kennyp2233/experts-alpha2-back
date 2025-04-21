import { Injectable } from '@nestjs/common';
import { GuiaMadreCrudService } from './guia-madre-crud.service';
import { GuiaMadreEstadoService } from './guia-madre-estado.service';
import { GuiaMadreSecuencialService } from './guia-madre-secuencial.service';
import { CreateGuiaMadreDto } from '../../dto/guia-madre/create-guia-madre.dto';
import { UpdateGuiaMadreDto } from '../../dto/guia-madre/update-guia-madre.dto';
import { CambioEstadoDto } from '../../dto/guia-madre/cambio-estado.dto';

/**
 * Servicio principal que actúa como fachada para las operaciones de guías madre,
 * delegando a servicios especializados.
 */
@Injectable()
export class GuiasMadreService {
    constructor(
        private crudService: GuiaMadreCrudService,
        private estadoService: GuiaMadreEstadoService,
        private secuencialService: GuiaMadreSecuencialService,
    ) { }

    /**
     * Genera secuenciales siguiendo la lógica específica:
     * - Suma 11 en cada incremento.
     * - Si el último dígito es 6, suma 4 en lugar de 11.
     */
    generarSecuenciales(inicial: number, cantidad: number): number[] {
        return this.secuencialService.generarSecuenciales(inicial, cantidad);
    }

    /**
     * Previsualiza los secuenciales que se generarían
     */
    previsualizarSecuenciales(inicial: number, cantidad: number): number[] {
        return this.secuencialService.previsualizarSecuenciales(inicial, cantidad);
    }

    /**
     * Crea guías madre en lote
     */
    async createLote(createGuiaMadreDto: CreateGuiaMadreDto, usuarioId: string) {
        return this.crudService.createLote(createGuiaMadreDto, usuarioId);
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
        return this.crudService.findAll(page, limit, estado, aerolinea, disponibles);
    }

    /**
     * Obtiene una guía madre por su ID
     */
    async findOne(id: number) {
        return this.crudService.findOne(id);
    }

    /**
     * Actualiza una guía madre
     */
    async update(id: number, updateGuiaMadreDto: UpdateGuiaMadreDto, usuarioId: string) {
        return this.crudService.update(id, updateGuiaMadreDto, usuarioId);
    }

    /**
     * Cambia el estado de una guía madre
     */
    async cambiarEstado(id: number, cambioEstadoDto: CambioEstadoDto, usuarioId: string) {
        return this.estadoService.cambiarEstado(
            id,
            cambioEstadoDto.nuevoEstadoId,
            usuarioId,
            cambioEstadoDto.comentario
        );
    }

    /**
     * Obtiene guías madre disponibles para asignación
     */
    async getDisponibles(id_aerolinea?: number) {
        return this.crudService.getDisponibles(id_aerolinea);
    }
}