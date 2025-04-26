// src/documents/documents.constants.ts

// Tipos de entidades para workflow
export enum TipoEntidad {
    GUIA_MADRE = 'GUIA_MADRE',
    DOC_COORDINACION = 'DOC_COORDINACION',
    GUIA_HIJA = 'GUIA_HIJA',
}

// Estados para Guía Madre - Simplificado
export enum EstadoGuiaMadre {
    DISPONIBLE = 'DISPONIBLE',     // Guía disponible para usar
    ASIGNADA = 'ASIGNADA',         // Asignada a un documento de coordinación
    PRESTADA = 'PRESTADA',         // Prestada a otra entidad
    DEVUELTA = 'DEVUELTA'          // Devuelta después de un préstamo
}

// Estados para Documento de Coordinación - Simplificado
export enum EstadoDocCoord {
    CREADO = 'CREADO',             // Documento recién creado
    EN_COORDINACION = 'EN_COORDINACION', // En proceso de coordinación con fincas
    COORDINADO = 'COORDINADO',     // Todas las guías hijas asignadas
    CORTADO = 'CORTADO',           // Documento finalizado, no se permiten más cambios
    CANCELADO = 'CANCELADO'        // Documento cancelado
}

// Estados para Guía Hija - Simplificado
export enum EstadoGuiaHija {
    REGISTRADA = 'REGISTRADA',     // Guía hija creada
    CONFIRMADA = 'CONFIRMADA',     // Información confirmada por la finca
    PROCESADA = 'PROCESADA',       // Procesada y lista para envío
    ENVIADA = 'ENVIADA',           // Producto enviado
    CANCELADA = 'CANCELADA'        // Cancelada
}

// Tipos de pago
export enum TipoPago {
    PREPAID = 'PREPAID',
    COLLECT = 'COLLECT',
}

// Eventos del sistema para workflow
export enum WorkflowEvents {
    GUIA_MADRE_ESTADO_CAMBIADO = 'guiaMadre.cambioEstado',
    DOC_COORD_ESTADO_CAMBIADO = 'docCoord.cambioEstado',
    GUIA_HIJA_ESTADO_CAMBIADO = 'guiaHija.cambioEstado',
    GUIA_HIJA_ASIGNADA = 'guiaHija.asignada',
    GUIA_MADRE_PRESTAMO = 'guiaMadre.prestamo',
    GUIA_MADRE_DEVOLUCION = 'guiaMadre.devolucion',
    DOC_COORD_CORTE = 'docCoord.corte',
}

// Tipos de cajas (para cálculos de peso)
export enum TipoCaja {
    FULL = 'FB',     // Full Box
    HALF = 'HB',     // Half Box (1/2)
    QUARTER = 'QB',  // Quarter Box (1/4)
    EIGHTH = 'EB',   // Eighth Box (1/8)
    SIXTH = 'SB',    // Sixth Box (1/6)
}

// Pesos estándar por tipo de caja (en kg)
export const PESO_ESTANDAR = {
    [TipoCaja.FULL]: 25,      // Ejemplo: una caja completa pesa 25 kg
    [TipoCaja.HALF]: 12.5,    // La mitad
    [TipoCaja.QUARTER]: 6.25, // Un cuarto
    [TipoCaja.EIGHTH]: 3.125, // Un octavo
    [TipoCaja.SIXTH]: 4.167,  // Un sexto
};

// Formatos de número de guía hija disponibles
export enum FormatoGuiaHija {
    ANNO_SECUENCIAL = 'AAAANNNN',      // Año (4 dígitos) + Secuencial (4 dígitos)
    PREFIJO_SECUENCIAL = 'PREFNNNN',   // Prefijo personalizado + Secuencial (4 dígitos)
    SECUENCIAL_SIMPLE = 'NNNNNNNN',    // Solo secuencial (8 dígitos)
    PERSONALIZADO = 'CUSTOM'           // Formato totalmente personalizado
}

// Formato de número de guía hija por defecto
export const FORMATO_GUIA_HIJA = FormatoGuiaHija.ANNO_SECUENCIAL;

// Prefijo por defecto para guías hijas (para formato PREFIJO_SECUENCIAL)
export const PREFIJO_GUIA_HIJA_DEFAULT = 'EXP';

// Incremento para secuenciales de guías madre
export const INCREMENTO_SECUENCIAL = 11;
export const INCREMENTO_ESPECIAL_6 = 4; // Incremento especial cuando el último dígito es 6

// Reglas para asignación de guías hijas
export enum ReglaAsignacionGuiaHija {
    FINCA_UNICA = 'FINCA_UNICA',                    // Una guía única por finca
    FINCA_GUIA_MADRE = 'FINCA_GUIA_MADRE',          // Una guía por combinación finca-guía madre
    FINCA_MARCACION = 'FINCA_MARCACION',            // Una guía por combinación finca-marcación
    FINCA_GUIA_MADRE_MARCACION = 'FINCA_GUIA_MADRE_MARCACION', // Una guía por combinación finca-guía madre-marcación
    FINCA_GUIA_MADRE_MARCACION_PRODUCTO = 'FINCA_GUIA_MADRE_MARCACION_PRODUCTO' // Una guía por combinación finca-guía madre-marcación-producto
}

// Regla de asignación de guías hijas por defecto
export const REGLA_ASIGNACION_DEFAULT = ReglaAsignacionGuiaHija.FINCA_GUIA_MADRE_MARCACION_PRODUCTO;