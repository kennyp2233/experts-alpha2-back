import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GuiaMadreRepository } from '../../repositories/guia-madre.repository';
import { EstadoGuiaMadre, TipoEntidad, WorkflowEvents } from '../../documents.constants';
import { TransicionEstadoService } from 'src/master-documents/domain/workflow/transicion-estado.service';

@Injectable()
export class GuiaMadreEstadoService {
    constructor(
        private guiaMadreRepository: GuiaMadreRepository,
        private transicionEstadoService: TransicionEstadoService,
        private eventEmitter: EventEmitter2,
    ) { }

    /**
     * Cambia el estado de una guía madre
     */
    async cambiarEstado(
        id: number,
        nuevoEstadoId: number,
        usuarioId: string,
        comentario?: string
    ) {
        const guiaMadre = await this.guiaMadreRepository.findById(id);

        if (!guiaMadre) {
            throw new BadRequestException(`Guía madre con ID ${id} no encontrada`);
        }

        // Validar que la transición está permitida
        const esValida = await this.transicionEstadoService.validarTransicion({
            tipoEntidad: TipoEntidad.GUIA_MADRE,
            estadoOrigenId: guiaMadre.id_estado_actual,
            estadoDestinoId: nuevoEstadoId
        });

        if (!esValida) {
            throw new ForbiddenException('Transición de estado no permitida');
        }

        // Actualizar el estado
        await this.guiaMadreRepository.update(id, {
            id_estado_actual: nuevoEstadoId,
            updatedAt: new Date()
        });

        // Crear registro de historial de estado
        await this.guiaMadreRepository.createHistorialEstado({
            id_guia_madre: id,
            id_estado: nuevoEstadoId,
            id_usuario: usuarioId,
            comentario
        });

        // Emitir evento de cambio de estado
        this.eventEmitter.emit(WorkflowEvents.GUIA_MADRE_ESTADO_CAMBIADO, {
            guiaMadreId: id,
            estadoAnterior: guiaMadre.id_estado_actual,
            estadoNuevo: nuevoEstadoId,
            usuarioId,
            fecha: new Date()
        });

        return this.guiaMadreRepository.findById(id);
    }

    /**
     * Marca una guía madre como prestada
     */
    async registrarPrestamo(
        id: number,
        observaciones: string,
        usuarioId: string,
        fechaPrestamo?: string
    ) {
        const guiaMadre = await this.guiaMadreRepository.findById(id);

        if (!guiaMadre) {
            throw new BadRequestException(`Guía madre con ID ${id} no encontrada`);
        }

        if (guiaMadre.prestamo) {
            throw new BadRequestException('La guía madre ya se encuentra en préstamo');
        }

        // No permitir prestar si está asignada a un documento de coordinación
        if (guiaMadre.documento_coordinacion) {
            throw new BadRequestException(
                'No se puede prestar una guía madre asignada a un documento de coordinación'
            );
        }

        // Obtener el estado de préstamo
        const estadoPrestado = await this.guiaMadreRepository.findEstadoByNombre(
            EstadoGuiaMadre.PRESTADA
        );

        if (!estadoPrestado) {
            throw new BadRequestException('Estado de préstamo no configurado');
        }

        // Actualizar la guía madre
        await this.guiaMadreRepository.update(id, {
            prestamo: true,
            fecha_prestamo: fechaPrestamo ? new Date(fechaPrestamo) : new Date(),
            observaciones,
            id_estado_actual: estadoPrestado.id,
            updatedAt: new Date()
        });

        // Crear registro de historial de estado
        await this.guiaMadreRepository.createHistorialEstado({
            id_guia_madre: id,
            id_estado: estadoPrestado.id,
            id_usuario: usuarioId,
            comentario: 'Préstamo de guía'
        });

        // Emitir evento de préstamo
        this.eventEmitter.emit(WorkflowEvents.GUIA_MADRE_PRESTAMO, {
            guiaMadreId: id,
            usuarioId,
            fecha: fechaPrestamo ? new Date(fechaPrestamo) : new Date()
        });

        return this.guiaMadreRepository.findById(id);
    }

    /**
     * Marca una guía madre como devuelta
     */
    async registrarDevolucion(
        id: number,
        observaciones: string,
        usuarioId: string,
        fechaDevolucion?: string
    ) {
        const guiaMadre = await this.guiaMadreRepository.findById(id);

        if (!guiaMadre) {
            throw new BadRequestException(`Guía madre con ID ${id} no encontrada`);
        }

        if (!guiaMadre.prestamo || guiaMadre.devolucion) {
            throw new BadRequestException(
                'La guía madre no se encuentra en préstamo o ya fue devuelta'
            );
        }

        // Obtener el estado de devolución
        const estadoDevuelta = await this.guiaMadreRepository.findEstadoByNombre(
            EstadoGuiaMadre.DEVUELTA
        );

        if (!estadoDevuelta) {
            throw new BadRequestException('Estado de devolución no configurado');
        }

        // Actualizar la guía madre
        await this.guiaMadreRepository.update(id, {
            devolucion: true,
            fecha_devolucion: fechaDevolucion ? new Date(fechaDevolucion) : new Date(),
            observaciones,
            id_estado_actual: estadoDevuelta.id,
            updatedAt: new Date()
        });

        // Crear registro de historial de estado
        await this.guiaMadreRepository.createHistorialEstado({
            id_guia_madre: id,
            id_estado: estadoDevuelta.id,
            id_usuario: usuarioId,
            comentario: 'Devolución de guía'
        });

        // Emitir evento de devolución
        this.eventEmitter.emit(WorkflowEvents.GUIA_MADRE_DEVOLUCION, {
            guiaMadreId: id,
            usuarioId,
            fecha: fechaDevolucion ? new Date(fechaDevolucion) : new Date()
        });

        return this.guiaMadreRepository.findById(id);
    }
}