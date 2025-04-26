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
     * Soporta tanto el formato numérico estándar como formatos personalizados
     * 
     * @param anio Año de la guía o prefijo personalizado
     * @param secuencial Número secuencial de la guía
     * @param formato Formato opcional para personalizar la guía (por defecto: año + secuencial)
     * @returns Número de guía formateado
     */
    static formatearNumeroGuiaHija(anio: number | string, secuencial: number, formato?: string): string {
        // Si se proporciona un formato personalizado, usarlo
        if (formato) {
            // Reemplazar placeholders en el formato
            return formato
                .replace('AAAA', typeof anio === 'number' ? anio.toString() : anio)
                .replace('NNNN', secuencial.toString().padStart(4, '0'));
        }

        // Formato por defecto: año + secuencial con padding (ej: 20250001)
        return `${anio}${secuencial.toString().padStart(4, '0')}`;
    }

    /**
     * Crea un formato de guía hija personalizado
     * Permite crear formatos alfanuméricos como "EXP0001" o cualquier otro formato requerido
     * 
     * @param prefijo Prefijo para la guía (ej: "EXP")
     * @param secuencial Número secuencial
     * @param digitosSecuencial Número de dígitos para el secuencial (padding)
     * @returns Número de guía formateado
     */
    static crearGuiaPersonalizada(prefijo: string, secuencial: number, digitosSecuencial: number = 4): string {
        return `${prefijo}${secuencial.toString().padStart(digitosSecuencial, '0')}`;
    }

    /**
     * Verifica si un número de guía hija tiene un formato válido
     * @param numeroGuia Número de guía a verificar
     * @param formatoEsperado Formato esperado (regex o patrón explícito)
     * @returns True si el formato es válido, false si no
     */
    static validarFormatoGuiaHija(numeroGuia: string, formatoEsperado?: string | RegExp): boolean {
        // Si no se proporciona un formato específico, verificar que sea un valor válido
        if (!formatoEsperado) {
            return Boolean(numeroGuia && numeroGuia.trim().length > 0);
        }

        // Si es una expresión regular
        if (formatoEsperado instanceof RegExp) {
            return formatoEsperado.test(numeroGuia);
        }

        // Si es un formato específico (como AAAANNNN)
        const formatoRegex = this.convertirFormatoARegex(formatoEsperado);
        return formatoRegex.test(numeroGuia);
    }

    /**
     * Convierte un formato de guía (como AAAANNNN) a una expresión regular para validación
     * @param formato Formato de guía
     * @returns Expresión regular para validar el formato
     */
    private static convertirFormatoARegex(formato: string): RegExp {
        // Reemplazar placeholders con patrones regex
        const patronRegex = formato
            .replace('AAAA', '\\d{4}')   // 4 dígitos para el año
            .replace('NNNN', '\\d{4}')   // 4 dígitos para el secuencial
            .replace('NNN', '\\d{3}')    // 3 dígitos
            .replace('NN', '\\d{2}')     // 2 dígitos
            .replace('N', '\\d');        // 1 dígito

        return new RegExp(`^${patronRegex}$`);
    }

    /**
     * Parse un número de guía hija en sus componentes
     * @param numeroGuia Número de guía a analizar
     * @param formato Formato de la guía (por defecto: AAAANNNN)
     * @returns Objeto con componentes extraídos según el formato
     */
    static parseGuiaHija(numeroGuia: string, formato: string = 'AAAANNNN'): any {
        if (!this.validarFormatoGuiaHija(numeroGuia, formato)) {
            return null;
        }

        // Formato estándar AAAANNNN (año y secuencial)
        if (formato === 'AAAANNNN') {
            return {
                anio: parseInt(numeroGuia.substring(0, 4)),
                secuencial: parseInt(numeroGuia.substring(4))
            };
        }

        // Para formatos personalizados, extraer según posición
        const result: any = {};
        let pos = 0;

        if (formato.includes('AAAA')) {
            const startPos = formato.indexOf('AAAA');
            result.anio = parseInt(numeroGuia.substring(startPos, startPos + 4));
            pos = startPos + 4;
        }

        if (formato.includes('NNNN')) {
            const startPos = formato.indexOf('NNNN');
            result.secuencial = parseInt(numeroGuia.substring(startPos, startPos + 4));
        }

        // Extraer prefijos alfanuméricos si existen
        const prefixMatch = formato.match(/^[A-Z]+/);
        if (prefixMatch) {
            result.prefijo = numeroGuia.substring(0, prefixMatch[0].length);
        }

        return result;
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