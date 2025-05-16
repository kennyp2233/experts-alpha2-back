import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { FincasService } from './fincas.service';
import { VerificationResult, RegistrationCompletionResult } from '../interfaces/verification-result.interface';

@Injectable()
export class FincasVerificationService {
    constructor(
        private prisma: PrismaService,
        private fincasService: FincasService
    ) { }

    async verificarDocumentos(fincaId: number): Promise<VerificationResult> {
        // Verificar si existe la finca
        await this.fincasService.findOne(fincaId);

        // Obtener todos los tipos de documentos obligatorios
        const tiposObligatorios = await this.prisma.tipoDocumentoFinca.findMany({
            where: { es_obligatorio: true },
        });

        // Obtener los documentos actuales de la finca
        const documentosFinca = await this.prisma.documentoFinca.findMany({
            where: {
                id_finca: fincaId,
                estado: 'APROBADO', // Solo considerar documentos aprobados
            },
            include: {
                tipoDocumento: true,
            },
        });

        // Verificar cuáles tipos obligatorios están pendientes
        const tiposPendientes = tiposObligatorios.filter(tipo => {
            return !documentosFinca.some(doc => doc.id_tipo_documento === tipo.id);
        });

        return {
            finca_id: fincaId,
            documentos_completos: tiposPendientes.length === 0,
            tipos_pendientes: tiposPendientes,
            documentos_aprobados: documentosFinca,
        };
    }

    async validateRegistrationCompletion(fincaId: number): Promise<RegistrationCompletionResult> {
        // Verificar si la finca existe
        const finca = await this.prisma.finca.findUnique({
            where: { id: fincaId },
            include: {
                documentos: {
                    include: {
                        tipoDocumento: true,
                    },
                },
            },
        });

        if (!finca) {
            throw new NotFoundException(`Finca con ID ${fincaId} no encontrada`);
        }

        // Campos obligatorios de la finca
        const camposObligatorios = [
            'nombre_finca',
            'ruc_finca',
            'i_general_telefono',
            'i_general_email',
            'i_general_ciudad',
            'i_general_provincia',
            'i_general_pais',
        ];

        const camposFaltantes = camposObligatorios.filter(campo => !finca[campo]);

        // Documentos obligatorios sin subir
        const documentosSinSubir = finca.documentos.filter(
            doc => doc.tipoDocumento.es_obligatorio && !doc.ruta_archivo
        );

        if (camposFaltantes.length > 0 || documentosSinSubir.length > 0) {
            return {
                registroCompleto: false,
                camposFaltantes,
                documentosFaltantes: documentosSinSubir.map(doc => doc.tipoDocumento.nombre),
                mensaje: 'El registro de la finca está incompleto'
            };
        }

        return {
            registroCompleto: true,
            mensaje: 'El registro de la finca está completo'
        };
    }

    async getPendingFarms() {
        // Buscar todos los roles de finca pendientes
        const rolesPendientes = await this.prisma.usuarioRol.findMany({
            where: {
                rol: {
                    nombre: 'FINCA'
                },
                estado: 'PENDIENTE'
            },
            include: {
                usuario: true,
                rol: true
            }
        });

        // Extraer los IDs de fincas
        const fincaIds = rolesPendientes.map(rol => {
            const metadata = rol.metadata as any;
            return metadata?.id_finca || null;
        }).filter(id => id !== null);

        // Obtener información de las fincas
        const fincas = await this.prisma.finca.findMany({
            where: {
                id: {
                    in: fincaIds
                }
            },
            include: {
                documentos: {
                    include: {
                        tipoDocumento: true
                    }
                }
            }
        });

        // Asociar cada finca con sus usuarios pendientes
        return fincas.map(finca => {
            const usuariosPendientes = rolesPendientes.filter(rol => {
                const metadata = rol.metadata as any;
                return metadata?.id_finca === finca.id;
            });

            return {
                finca,
                usuarios_pendientes: usuariosPendientes
            };
        });
    }

    async getFincasEnVerificacion(options: {
        conDocumentos?: boolean;
        estadoDocumentos?: string;
    }) {
        // Buscar roles de finca pendientes
        const rolesPendientes = await this.prisma.usuarioRol.findMany({
            where: {
                rol: {
                    nombre: 'FINCA'
                },
                estado: 'PENDIENTE'
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        usuario: true,
                        email: true,
                        createdAt: true
                    }
                },
                rol: true
            }
        });

        const resultado: any = [];

        // Para cada rol pendiente, obtener la finca con sus documentos
        for (const rol of rolesPendientes) {
            const metadata = rol.metadata as any;
            if (!metadata?.id_finca) continue;

            // Obtener la finca con sus documentos
            const finca = await this.prisma.finca.findUnique({
                where: { id: metadata.id_finca },
                include: {
                    documentos: {
                        include: {
                            tipoDocumento: true
                        }
                    }
                }
            });

            if (!finca) continue;

            // Filtrar según opciones
            if (options.conDocumentos && finca.documentos.length === 0) {
                continue;
            }

            if (options.estadoDocumentos) {
                // Comprobar si algún documento tiene el estado solicitado
                const tieneDocumentoConEstado = finca.documentos.some(
                    doc => doc.estado === options.estadoDocumentos
                );

                if (!tieneDocumentoConEstado) {
                    continue;
                }
            }

            // Calcular estadísticas de progreso
            const tiposObligatorios = await this.prisma.tipoDocumentoFinca.findMany({
                where: { es_obligatorio: true }
            });

            const totalRequeridos = tiposObligatorios.length;
            const documentosSubidos = finca.documentos.length;
            const documentosAprobados = finca.documentos.filter(doc => doc.estado === 'APROBADO').length;
            const documentosRechazados = finca.documentos.filter(doc => doc.estado === 'RECHAZADO').length;

            const porcentajeCompletado = totalRequeridos > 0
                ? (documentosSubidos / totalRequeridos) * 100
                : 0;

            const porcentajeAprobado = documentosSubidos > 0
                ? (documentosAprobados / documentosSubidos) * 100
                : 0;

            // Añadir al resultado
            resultado.push({
                finca: {
                    ...finca,
                    progreso_verificacion: {
                        total_documentos_requeridos: totalRequeridos,
                        documentos_subidos: documentosSubidos,
                        documentos_aprobados: documentosAprobados,
                        documentos_rechazados: documentosRechazados,
                        porcentaje_completado: Math.round(porcentajeCompletado),
                        porcentaje_aprobado: Math.round(porcentajeAprobado)
                    }
                },
                usuario: rol.usuario,
                rol_pendiente: rol
            });
        }

        // Ordenar por fecha de creación (más reciente primero)
        resultado.sort((a, b) =>
            new Date(b.usuario.createdAt).getTime() -
            new Date(a.usuario.createdAt).getTime()
        );

        return {
            total: resultado.length,
            fincas: resultado
        };
    }
}