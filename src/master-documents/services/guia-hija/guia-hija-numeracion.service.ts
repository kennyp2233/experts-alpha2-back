// src/master-documents/services/guia-hija/guia-hija-numeracion.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { GuiaHijaRepository } from '../../repositories/guia-hija.repository';
import {
    FormatoGuiaHija,
    FORMATO_GUIA_HIJA,
    PREFIJO_GUIA_HIJA_DEFAULT,
    ReglaAsignacionGuiaHija,
    REGLA_ASIGNACION_DEFAULT
} from '../../documents.constants';
import { FormatoGuiasUtils } from '../../utils/formato-guias.utils';

interface GenerarNumeroGuiaHijaOptions {
    id_finca: number;
    id_guia_madre: number;
    id_consignatario: number;
    id_producto: number;
    formato?: FormatoGuiaHija;
    prefijoPersonalizado?: string;
}

@Injectable()
export class GuiaHijaNumeracionService {
    constructor(
        private prisma: PrismaService,
        private guiaHijaRepository: GuiaHijaRepository
    ) { }

    /**
     * Genera un número para una nueva guía hija siguiendo las reglas de asignación configuradas
     */
    async generarNumeroGuiaHija(options: GenerarNumeroGuiaHijaOptions): Promise<string> {
        const {
            id_finca,
            id_guia_madre,
            id_consignatario,
            id_producto,
            formato = FORMATO_GUIA_HIJA,
            prefijoPersonalizado
        } = options;

        // 1. Verificar si ya existe una guía hija para la combinación específica según la regla configurada
        const guiaExistente = await this.buscarGuiaExistente(
            id_finca,
            id_guia_madre,
            id_consignatario,
            id_producto,
            REGLA_ASIGNACION_DEFAULT
        );

        // Si existe una guía hija para esta combinación específica, reutilizar su número
        if (guiaExistente) {
            return guiaExistente.numero_guia_hija;
        }

        // 2. Generar un nuevo número según el formato configurado
        const anioActual = new Date().getFullYear();

        switch (formato) {
            case FormatoGuiaHija.ANNO_SECUENCIAL:
                // Buscar la última guía del año actual para obtener el siguiente secuencial
                const ultimaGuia = await this.guiaHijaRepository.getLastByYear(anioActual);
                const nuevoSecuencial = ultimaGuia ? ultimaGuia.secuencial + 1 : 1;
                return FormatoGuiasUtils.formatearNumeroGuiaHija(anioActual, nuevoSecuencial);

            case FormatoGuiaHija.PREFIJO_SECUENCIAL:
                const prefijo = prefijoPersonalizado || PREFIJO_GUIA_HIJA_DEFAULT;
                return await this.guiaHijaRepository.getNextAvailableNumber(prefijo);

            case FormatoGuiaHija.SECUENCIAL_SIMPLE:
                // Para secuencial simple, buscar el último número y agregar 1
                const ultimoSecuencial = await this.prisma.guiaHija.findFirst({
                    orderBy: { secuencial: 'desc' }
                });
                const secuencial = ultimoSecuencial ? ultimoSecuencial.secuencial + 1 : 1;
                return secuencial.toString().padStart(8, '0');

            case FormatoGuiaHija.PERSONALIZADO:
                // Para formato personalizado, usar el prefijo + año actual + secuencial
                const prefijo2 = prefijoPersonalizado || '';
                const ultimaGuiaPersonalizada = await this.prisma.guiaHija.findFirst({
                    where: {
                        numero_guia_hija: {
                            startsWith: `${prefijo2}${anioActual}`
                        }
                    },
                    orderBy: { secuencial: 'desc' }
                });
                const secuencialPersonalizado = ultimaGuiaPersonalizada ? ultimaGuiaPersonalizada.secuencial + 1 : 1;
                return `${prefijo2}${anioActual}${secuencialPersonalizado.toString().padStart(4, '0')}`;

            default:
                // Por defecto, usar año + secuencial
                const ultimaGuiaDef = await this.guiaHijaRepository.getLastByYear(anioActual);
                const nuevoSecuencialDef = ultimaGuiaDef ? ultimaGuiaDef.secuencial + 1 : 1;
                return FormatoGuiasUtils.formatearNumeroGuiaHija(anioActual, nuevoSecuencialDef);
        }
    }

    /**
     * Busca una guía hija existente según las reglas de asignación configuradas
     */
    async buscarGuiaExistente(
        id_finca: number,
        id_guia_madre: number,
        id_consignatario: number,
        id_producto: number,
        regla: ReglaAsignacionGuiaHija = REGLA_ASIGNACION_DEFAULT
    ): Promise<any | null> {
        switch (regla) {
            case ReglaAsignacionGuiaHija.FINCA_UNICA:
                // Solo se considera la finca, cualquier guía de esta finca servirá
                const guiasFinca = await this.prisma.guiaHija.findFirst({
                    where: { id_finca },
                    orderBy: { createdAt: 'asc' }
                });
                return guiasFinca;

            case ReglaAsignacionGuiaHija.FINCA_GUIA_MADRE:
                // Se considera la combinación finca + guía madre
                return this.guiaHijaRepository.findByFincaAndGuiaMadre(id_finca, id_guia_madre);

            case ReglaAsignacionGuiaHija.FINCA_MARCACION:
                // Se considera la combinación finca + marcación (consignatario)
                const guiasFincaMarcacion = await this.prisma.guiaHija.findFirst({
                    where: {
                        id_finca,
                        documento_coordinacion: {
                            DocumentoConsignatario: {
                                some: {
                                    id_consignatario,
                                    es_principal: true
                                }
                            }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                });
                return guiasFincaMarcacion;

            case ReglaAsignacionGuiaHija.FINCA_GUIA_MADRE_MARCACION:
                // Se considera la combinación finca + guía madre + marcación
                const guiasFincaMadreConsig = await this.prisma.guiaHija.findFirst({
                    where: {
                        id_finca,
                        id_guia_madre,
                        documento_coordinacion: {
                            DocumentoConsignatario: {
                                some: {
                                    id_consignatario,
                                    es_principal: true
                                }
                            }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                });
                return guiasFincaMadreConsig;

            case ReglaAsignacionGuiaHija.FINCA_GUIA_MADRE_MARCACION_PRODUCTO:
                // Se considera la combinación finca + guía madre + marcación + producto
                return this.guiaHijaRepository.findByUniqueCombination(
                    id_finca,
                    id_guia_madre,
                    id_consignatario,
                    id_producto
                );

            default:
                // Por defecto usar la regla más específica
                return this.guiaHijaRepository.findByUniqueCombination(
                    id_finca,
                    id_guia_madre,
                    id_consignatario,
                    id_producto
                );
        }
    }

    /**
     * Valida si un número de guía hija ya existe en el sistema
     */
    async validarNumeroUnico(numeroGuiaHija: string): Promise<boolean> {
        const guiaExistente = await this.guiaHijaRepository.findByNumero(numeroGuiaHija);
        return !guiaExistente; // Retorna true si el número NO existe (es único)
    }

    /**
     * Parsea un número de guía hija en sus componentes según el formato
     */
    parseNumeroGuiaHija(numeroGuiaHija: string): any {
        // Tratar de detectar automáticamente el formato
        // Formato año + secuencial (AAAANNNN)
        if (/^\d{8}$/.test(numeroGuiaHija)) {
            const anio = parseInt(numeroGuiaHija.substring(0, 4));
            const secuencial = parseInt(numeroGuiaHija.substring(4));

            // Verificar si el año es válido (entre 2000 y el año actual + 1)
            const anioActual = new Date().getFullYear();
            if (anio >= 2000 && anio <= anioActual + 1) {
                return {
                    formato: FormatoGuiaHija.ANNO_SECUENCIAL,
                    anio,
                    secuencial
                };
            } else {
                // Si el año no es válido, considerarlo como secuencial simple
                return {
                    formato: FormatoGuiaHija.SECUENCIAL_SIMPLE,
                    secuencial: parseInt(numeroGuiaHija)
                };
            }
        }

        // Formato prefijo + secuencial (PREFNNNN)
        const prefijoMatch = numeroGuiaHija.match(/^([A-Za-z]+)(\d+)$/);
        if (prefijoMatch) {
            return {
                formato: FormatoGuiaHija.PREFIJO_SECUENCIAL,
                prefijo: prefijoMatch[1],
                secuencial: parseInt(prefijoMatch[2])
            };
        }

        // Formato personalizado
        return {
            formato: FormatoGuiaHija.PERSONALIZADO,
            valor: numeroGuiaHija
        };
    }
}