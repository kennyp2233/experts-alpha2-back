import {
    FORMATO_GUIA_HIJA,
    INCREMENTO_SECUENCIAL,
    INCREMENTO_ESPECIAL_6
} from '../documents.constants';

/**
 * Clase de utilidad para formateo y validación de guías
 */
export class FormatoGuiasUtils {
    /**
     * Formatea el número de guía hija según el formato establecido
     * @param anio Año de la guía
     * @param secuencial Número secuencial de la guía
     * @returns Número de guía formateado
     */
    static formatearNumeroGuiaHija(anio: number, secuencial: number): string {
        return `${anio}${secuencial.toString().padStart(4, '0')}`;
    }

    /**
     * Verifica si un número de guía hija tiene el formato correcto
     * @param numeroGuia Número de guía a verificar
     * @returns True si el formato es válido, false si no
     */
    static validarFormatoGuiaHija(numeroGuia: string): boolean {
        // El formato esperado es AAAANNNN (año de 4 dígitos + secuencial de 4 dígitos)
        const regex = /^\d{8}$/;
        if (!regex.test(numeroGuia)) {
            return false;
        }

        // Extraer año y secuencial
        const anio = parseInt(numeroGuia.substring(0, 4));
        const secuencial = parseInt(numeroGuia.substring(4));

        // Validar que el año sea razonable (no futuro y no muy antiguo)
        const anioActual = new Date().getFullYear();
        if (anio < 2000 || anio > anioActual + 1) {
            return false;
        }

        // Validar que el secuencial sea positivo
        return secuencial > 0;
    }

    /**
     * Parse un número de guía hija en sus componentes
     * @param numeroGuia Número de guía a analizar
     * @returns Objeto con año y secuencial
     */
    static parseGuiaHija(numeroGuia: string): { anio: number, secuencial: number } | null {
        if (!this.validarFormatoGuiaHija(numeroGuia)) {
            return null;
        }

        return {
            anio: parseInt(numeroGuia.substring(0, 4)),
            secuencial: parseInt(numeroGuia.substring(4))
        };
    }

    /**
     * Genera secuenciales para guías madre siguiendo la lógica específica:
     * - Suma 11 (INCREMENTO_SECUENCIAL) en cada incremento.
     * - Si el último dígito es 6, suma 4 (INCREMENTO_ESPECIAL_6) en lugar de 11.
     * @param inicial Número secuencial inicial
     * @param cantidad Cantidad de secuenciales a generar
     * @returns Array de secuenciales generados
     */
    static generarSecuencialesGuiaMadre(inicial: number, cantidad: number): number[] {
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
     * Formatea un número de guía madre según el formato prefijo-secuencial
     * @param prefijo Prefijo de la guía madre
     * @param secuencial Secuencial de la guía madre
     * @returns Número de guía madre formateado
     */
    static formatearNumeroGuiaMadre(prefijo: number, secuencial: number): string {
        return `${prefijo}-${secuencial}`;
    }

    /**
     * Calcula el siguiente secuencial de una guía madre
     * @param secuencial Secuencial actual
     * @returns Siguiente secuencial
     */
    static calcularSiguienteSecuencial(secuencial: number): number {
        const ultimoDigito = secuencial % 10;

        if (ultimoDigito === 6) {
            return secuencial + INCREMENTO_ESPECIAL_6;
        }

        return secuencial + INCREMENTO_SECUENCIAL;
    }
}