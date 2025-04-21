import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GuiaHijaRepository } from '../../repositories/guia-hija.repository';
import { TransicionEstadoService } from 'src/master-documents/domain/workflow/transicion-estado.service';
import { EstadoGuiaHija, TipoEntidad, WorkflowEvents, EstadoDocCoord } from '../../documents.constants';
import { CambioEstadoDto } from '../../dto/guia-madre/cambio-estado.dto';
import { UpdateGuiaHijaDto } from '../../dto/guia-hija/update-guia-hija.dto';

@Injectable()
export class GuiaHijaEstadoService {
    constructor(
        private guiaHijaRepository: GuiaHijaRepository,
        private transicionEstadoService: TransicionEstadoService,
        private eventEmitter: EventEmitter2,
    ) { }

    /**
     * Cambia el estado de una guía hija
     */
    async cambiarEstado(id: number, cambioEstadoDto: CambioEstadoDto, usuarioId: string) {
        const { nuevoEstadoId, comentario } = cambioEstadoDto;

        const guiaHija = await this.guiaHijaRepository.findById(id);

        if (!guiaHija) {
            throw new NotFoundException(`Guía hija con ID ${id} no encontrada`);
        }

        // No permitir cambios de estado si el documento está cortado o cancelado
        if (guiaHija.documento_coordinacion.estadoActual.nombre === EstadoDocCoord.CORTADO ||
            guiaHija.documento_coordinacion.estadoActual.nombre === EstadoDocCoord.CANCELADO) {
            throw new BadRequestException(
                `No se puede cambiar el estado de una guía hija cuando el documento de coordinación está ${guiaHija.documento_coordinacion.estadoActual.nombre}`
            );
        }

        // Verificar que el nuevo estado existe y es del tipo correcto
        const nuevoEstado = await this.guiaHijaRepository.findEstadoByNombre(nuevoEstadoId.toString());

        if (!nuevoEstado) {
            throw new BadRequestException(`Estado con ID ${nuevoEstadoId} no válido para guías hijas`);
        }

        // Verificar que la transición es permitida
        const esValida = await this.transicionEstadoService.validarTransicion({
            tipoEntidad: TipoEntidad.GUIA_HIJA,
            estadoOrigenId: guiaHija.id_estado_actual,
            estadoDestinoId: nuevoEstadoId
        });

        if (!esValida) {
            throw new ForbiddenException(`Transición de estado no permitida de ${guiaHija.estadoActual.nombre} a ${nuevoEstado.nombre}`);
        }

        // Obtener información adicional de la transición
        const infoTransicion = await this.transicionEstadoService.getTransicionInfo(
            TipoEntidad.GUIA_HIJA,
            guiaHija.id_estado_actual,
            nuevoEstadoId
        );

        // Si requiere comentario, verificar que se proporcionó
        if (infoTransicion.requiere_comentario && !comentario) {
            throw new BadRequestException(`Esta transición requiere un comentario`);
        }

        // Ejecutar la transición
        await this.guiaHijaRepository.update(id, {
            id_estado_actual: nuevoEstadoId,
            updatedAt: new Date(),
        });

        await this.guiaHijaRepository.createHistorialEstado({
            id_guia_hija: id,
            id_estado: nuevoEstadoId,
            id_usuario: usuarioId,
            comentario: comentario || `Cambio de estado a ${nuevoEstado.nombre}`,
        });

        // Emitir evento de cambio de estado
        this.eventEmitter.emit(WorkflowEvents.GUIA_HIJA_ESTADO_CAMBIADO, {
            guiaHijaId: id,
            estadoAnterior: guiaHija.id_estado_actual,
            estadoNuevo: nuevoEstadoId,
            usuarioId,
            fecha: new Date(),
        });

        return this.guiaHijaRepository.findById(id);
    }

    /**
     * Cancela una guía hija
     */
    async cancelar(id: number, motivo: string, usuarioId: string) {
        const guiaHija = await this.guiaHijaRepository.findById(id);

        if (!guiaHija) {
            throw new NotFoundException(`Guía hija con ID ${id} no encontrada`);
        }

        // No permitir cancelar si el documento está cortado o cancelado
        if (guiaHija.documento_coordinacion.estadoActual.nombre === EstadoDocCoord.CORTADO ||
            guiaHija.documento_coordinacion.estadoActual.nombre === EstadoDocCoord.CANCELADO) {
            throw new BadRequestException(
                `No se puede cancelar una guía hija cuando el documento de coordinación está ${guiaHija.documento_coordinacion.estadoActual.nombre}`
            );
        }

        // No permitir cancelar si ya está en estado final
        if (guiaHija.estadoActual.es_estado_final) {
            throw new BadRequestException(`No se puede cancelar una guía hija en estado ${guiaHija.estadoActual.nombre}`);
        }

        // Obtener el estado "CANCELADA"
        const estadoCancelada = await this.guiaHijaRepository.findEstadoByNombre(EstadoGuiaHija.CANCELADA);

        if (!estadoCancelada) {
            throw new BadRequestException('Estado CANCELADA no configurado para guías hijas');
        }

        // Ejecutar la cancelación
        await this.guiaHijaRepository.update(id, {
            id_estado_actual: estadoCancelada.id,
            updatedAt: new Date(),
        });

        await this.guiaHijaRepository.createHistorialEstado({
            id_guia_hija: id,
            id_estado: estadoCancelada.id,
            id_usuario: usuarioId,
            comentario: motivo || 'Guía hija cancelada',
        });

        // Emitir evento de cambio de estado
        this.eventEmitter.emit(WorkflowEvents.GUIA_HIJA_ESTADO_CAMBIADO, {
            guiaHijaId: id,
            estadoAnterior: guiaHija.id_estado_actual,
            estadoNuevo: estadoCancelada.id,
            usuarioId,
            fecha: new Date(),
        });

        return this.guiaHijaRepository.findById(id);
    }

    /**
     * Confirma una guía hija (usado principalmente por fincas)
     */
    async confirmarGuiaHija(id: number, datos: UpdateGuiaHijaDto, usuarioId: string) {
        const guiaHija = await this.guiaHijaRepository.findById(id);

        if (!guiaHija) {
            throw new NotFoundException(`Guía hija con ID ${id} no encontrada`);
        }

        // Verificar que está en estado REGISTRADA (o el estado inicial correspondiente)
        if (guiaHija.estadoActual.nombre !== EstadoGuiaHija.REGISTRADA) {
            throw new BadRequestException(`Solo se pueden confirmar guías hijas en estado REGISTRADA`);
        }

        // Obtener el estado "CONFIRMADA"
        const estadoConfirmada = await this.guiaHijaRepository.findEstadoByNombre(EstadoGuiaHija.CONFIRMADA);

        if (!estadoConfirmada) {
            throw new BadRequestException('Estado CONFIRMADA no configurado para guías hijas');
        }

        // Actualizar datos y cambiar estado
        const dataToUpdate: any = {
            id_estado_actual: estadoConfirmada.id,
            updatedAt: new Date(),
        };

        if (datos.id_producto) dataToUpdate.id_producto = datos.id_producto;
        if (datos.fulls !== undefined) dataToUpdate.fulls = datos.fulls;
        if (datos.pcs !== undefined) dataToUpdate.pcs = datos.pcs;
        if (datos.kgs !== undefined) dataToUpdate.kgs = datos.kgs;
        if (datos.stems !== undefined) dataToUpdate.stems = datos.stems;

        // Actualizar guía hija
        await this.guiaHijaRepository.update(id, dataToUpdate);

        // Registrar cambio de estado
        await this.guiaHijaRepository.createHistorialEstado({
            id_guia_hija: id,
            id_estado: estadoConfirmada.id,
            id_usuario: usuarioId,
            comentario: 'Guía hija confirmada por finca',
        });

        // Emitir evento de cambio de estado
        this.eventEmitter.emit(WorkflowEvents.GUIA_HIJA_ESTADO_CAMBIADO, {
            guiaHijaId: id,
            estadoAnterior: guiaHija.id_estado_actual,
            estadoNuevo: estadoConfirmada.id,
            usuarioId,
            fecha: new Date(),
        });

        return this.guiaHijaRepository.findById(id);
    }
}