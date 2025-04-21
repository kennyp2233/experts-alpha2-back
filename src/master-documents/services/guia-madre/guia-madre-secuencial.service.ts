import { Injectable } from '@nestjs/common';
import { INCREMENTO_SECUENCIAL, INCREMENTO_ESPECIAL_6 } from '../../documents.constants';

@Injectable()
export class GuiaMadreSecuencialService {
    /**
     * Genera secuenciales siguiendo la lógica específica:
     * - Suma 11 en cada incremento.
     * - Si el último dígito es 6, suma 4 en lugar de 11.
     */
    generarSecuenciales(inicial: number, cantidad: number): number[] {
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
     * Previsualiza los secuenciales que se generarían
     */
    previsualizarSecuenciales(inicial: number, cantidad: number): number[] {
        return this.generarSecuenciales(inicial, cantidad);
    }

    /**
     * Valida si un secuencial sigue las reglas de la lógica de negocio
     */
    validarSecuencial(secuencial: number, referencia?: number): boolean {
        // Si tenemos una referencia, verificar que la diferencia sigue 
        // el patrón de incremento esperado
        if (referencia) {
            const diferencia = secuencial - referencia;
            const ultimoDigitoReferencia = referencia % 10;

            if (ultimoDigitoReferencia === 6) {
                return diferencia === INCREMENTO_ESPECIAL_6;
            } else {
                return diferencia === INCREMENTO_SECUENCIAL;
            }
        }

        // Sin referencia, solo verificar que el número es válido
        return secuencial > 0;
    }
}