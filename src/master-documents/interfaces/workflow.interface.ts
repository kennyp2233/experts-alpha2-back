// src/documents/interfaces/workflow.interface.ts
import { TipoEntidad } from '../documents.constants';

export interface CambioEstadoResult {
    estado_anterior: number;
    estado_nuevo: number;
    comentario?: string;
    fecha_cambio: Date;
    usuario_id: string;
}

export interface TransicionEstado {
    id: number;
    tipo_entidad: TipoEntidad;
    id_estado_origen: number;
    id_estado_destino: number;
    roles_permitidos: string[];
    requiere_comentario: boolean;
    nombre_accion?: string;
}

export interface EstadoDocumento {
    id: number;
    nombre: string;
    descripcion?: string;
    tipo_entidad: TipoEntidad;
    es_estado_inicial: boolean;
    es_estado_final: boolean;
    color?: string;
}