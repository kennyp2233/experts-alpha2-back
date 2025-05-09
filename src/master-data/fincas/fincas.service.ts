// src/master-data/fincas/fincas.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFincaDto, UpdateFincaDto } from './dto/finca.dto';

@Injectable()
export class FincasService {
    constructor(private prisma: PrismaService) { }

    async findAll(includeInactive: boolean = false) {
        const where = includeInactive ? {} : { activo: true };

        return this.prisma.finca.findMany({
            where,
            include: {
                fincas_choferes: {
                    select: {
                        id_fincas_choferes: true,
                        chofer: {
                            select: {
                                id: true,
                                nombre: true,
                            },
                        },
                    },
                },
                fincas_productos: {
                    select: {
                        id_fincas_productos: true,
                        producto: {
                            select: {
                                id: true,
                                nombre: true,
                                tag: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        documentos: true,
                        guias_hijas: true,
                    },
                },
            },
        });
    }

    async search(term: string) {
        const searchTerm = term ? `%${term}%` : '%';

        return this.prisma.$queryRaw`
      SELECT f.*, 
        COUNT(DISTINCT fc.id_chofer) as choferes_count,
        COUNT(DISTINCT fp.id_producto) as productos_count,
        COUNT(DISTINCT df.id) as documentos_count,
        COUNT(DISTINCT gh.id) as guias_count
      FROM "Finca" f
      LEFT JOIN "FincaChofer" fc ON f.id = fc.id_finca
      LEFT JOIN "FincaProducto" fp ON f.id = fp.id_finca
      LEFT JOIN "DocumentoFinca" df ON f.id = df.id_finca
      LEFT JOIN "GuiaHija" gh ON f.id = gh.id_finca
      WHERE 
        f.nombre_finca ILIKE ${searchTerm} OR
        f.tag ILIKE ${searchTerm} OR
        f.ruc_finca ILIKE ${searchTerm} OR
        f.i_general_cod_sesa ILIKE ${searchTerm}
      GROUP BY f.id
      ORDER BY f.nombre_finca
    `;
    }

    async findOne(id: number) {
        const finca = await this.prisma.finca.findUnique({
            where: { id },
            include: {
                fincas_choferes: {
                    include: {
                        chofer: true,
                    },
                },
                fincas_productos: {
                    include: {
                        producto: true,
                    },
                },
                guias_hijas: {
                    take: 5,
                    orderBy: {
                        createdAt: 'desc',
                    },
                    include: {
                        guia_madre: {
                            select: {
                                prefijo: true,
                                secuencial: true,
                            },
                        },
                    },
                },
                documentos: {
                    include: {
                        tipoDocumento: true,
                        revisor: {
                            select: {
                                id: true,
                                usuario: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        if (!finca) {
            throw new NotFoundException(`Finca con ID ${id} no encontrada`);
        }

        return finca;
    }

    async getChoferes(id: number) {
        // Verificar si existe la finca
        await this.findOne(id);

        return this.prisma.fincaChofer.findMany({
            where: { id_finca: id },
            include: {
                chofer: true,
            },
        });
    }

    async getProductos(id: number) {
        // Verificar si existe la finca
        await this.findOne(id);

        return this.prisma.fincaProducto.findMany({
            where: { id_finca: id },
            include: {
                producto: true,
            },
        });
    }

    async getDocumentos(id: number) {
        // Verificar si existe la finca
        await this.findOne(id);

        return this.prisma.documentoFinca.findMany({
            where: { id_finca: id },
            include: {
                tipoDocumento: true,
                revisor: {
                    select: {
                        id: true,
                        usuario: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                fecha_subida: 'desc',
            },
        });
    }

    async create(createFincaDto: CreateFincaDto) {
        // Verificar que el tag es único
        const existingFinca = await this.prisma.finca.findFirst({
            where: { tag: createFincaDto.tag },
        });

        if (existingFinca) {
            throw new BadRequestException(`Ya existe una finca con el tag ${createFincaDto.tag}`);
        }

        // Verificar que el RUC es único (si se proporciona)
        if (createFincaDto.ruc_finca) {
            const existingFincaRuc = await this.prisma.finca.findFirst({
                where: { ruc_finca: createFincaDto.ruc_finca },
            });

            if (existingFincaRuc) {
                throw new BadRequestException(`Ya existe una finca con el RUC ${createFincaDto.ruc_finca}`);
            }
        }

        return this.prisma.finca.create({
            data: createFincaDto,
        });
    }

    async update(id: number, updateFincaDto: UpdateFincaDto) {
        // Verificar si existe
        const finca = await this.findOne(id);

        // Verificar que el tag es único (si se está cambiando)
        const fincaToUpdate = await this.prisma.finca.findUnique({
            where: { id },
        });

        if (fincaToUpdate && updateFincaDto.tag !== fincaToUpdate.tag) {
            const existingFinca = await this.prisma.finca.findFirst({
                where: { tag: updateFincaDto.tag },
            });

            if (existingFinca) {
                throw new BadRequestException(`Ya existe una finca con el tag ${updateFincaDto.tag}`);
            }
        }

        // Verificar que el RUC es único (si se está cambiando y se proporciona)
        if (fincaToUpdate && updateFincaDto.ruc_finca && fincaToUpdate.ruc_finca !== updateFincaDto.ruc_finca) {
            const existingFincaRuc = await this.prisma.finca.findFirst({
                where: { ruc_finca: updateFincaDto.ruc_finca },
            });

            if (existingFincaRuc) {
                throw new BadRequestException(`Ya existe una finca con el RUC ${updateFincaDto.ruc_finca}`);
            }
        }

        // Verificar si hay cambios que requieren reaprobación
        // Obtener todos los roles de usuario con esta finca
        const usuariosRoles = await this.prisma.usuarioRol.findMany({
            where: {
                metadata: {
                    path: ['id_finca'],
                    equals: id
                },
                rol: {
                    nombre: 'FINCA'
                },
                estado: 'APROBADO'
            }
        });

        // Si hay usuarios aprobados y se cambian campos críticos, volver a pendiente
        if (usuariosRoles.length > 0 && fincaToUpdate) {
            const camposRestringidos = ['ruc_finca', 'i_general_cod_sesa'];
            let requiereReaprobacion = false;

            for (const campo of camposRestringidos) {
                if (updateFincaDto[campo] !== undefined &&
                    updateFincaDto[campo] !== fincaToUpdate[campo]) {
                    requiereReaprobacion = true;
                    break;
                }
            }

            if (requiereReaprobacion) {
                // Cambiar el estado de todos los roles a PENDIENTE
                for (const rol of usuariosRoles) {
                    await this.prisma.usuarioRol.update({
                        where: { id: rol.id },
                        data: { estado: 'PENDIENTE' }
                    });
                }
            }
        }

        return this.prisma.finca.update({
            where: { id },
            data: updateFincaDto,
        });
    }

    async asignarChofer(id: number, idChofer: number) {
        // Verificar si existe la finca
        await this.findOne(id);

        // Verificar si existe el chofer
        const chofer = await this.prisma.chofer.findUnique({
            where: { id: idChofer },
        });

        if (!chofer) {
            throw new NotFoundException(`Chofer con ID ${idChofer} no encontrado`);
        }

        // Verificar si ya está asignado
        const asignacionExistente = await this.prisma.fincaChofer.findFirst({
            where: {
                id_finca: id,
                id_chofer: idChofer,
            },
        });

        if (asignacionExistente) {
            throw new BadRequestException(`El chofer ya está asignado a esta finca`);
        }

        return this.prisma.fincaChofer.create({
            data: {
                id_finca: id,
                id_chofer: idChofer,
            },
            include: {
                chofer: true,
                finca: {
                    select: {
                        id: true,
                        nombre_finca: true,
                        tag: true,
                    },
                },
            },
        });
    }

    async eliminarChofer(id: number, idChofer: number) {
        // Verificar si existe la finca
        await this.findOne(id);

        // Verificar si existe la asignación
        const asignacion = await this.prisma.fincaChofer.findFirst({
            where: {
                id_finca: id,
                id_chofer: idChofer,
            },
        });

        if (!asignacion) {
            throw new NotFoundException(`Asignación de chofer no encontrada`);
        }

        return this.prisma.fincaChofer.delete({
            where: {
                id_fincas_choferes: asignacion.id_fincas_choferes,
            },
        });
    }

    async asignarProducto(id: number, idProducto: number) {
        // Verificar si existe la finca
        await this.findOne(id);

        // Verificar si existe el producto
        const producto = await this.prisma.producto.findUnique({
            where: { id: idProducto },
        });

        if (!producto) {
            throw new NotFoundException(`Producto con ID ${idProducto} no encontrado`);
        }

        // Verificar si ya está asignado
        const asignacionExistente = await this.prisma.fincaProducto.findFirst({
            where: {
                id_finca: id,
                id_producto: idProducto,
            },
        });

        if (asignacionExistente) {
            throw new BadRequestException(`El producto ya está asignado a esta finca`);
        }

        return this.prisma.fincaProducto.create({
            data: {
                id_finca: id,
                id_producto: idProducto,
            },
            include: {
                producto: true,
                finca: {
                    select: {
                        id: true,
                        nombre_finca: true,
                        tag: true,
                    },
                },
            },
        });
    }

    async eliminarProducto(id: number, idProducto: number) {
        // Verificar si existe la finca
        await this.findOne(id);

        // Verificar si existe la asignación
        const asignacion = await this.prisma.fincaProducto.findFirst({
            where: {
                id_finca: id,
                id_producto: idProducto,
            },
        });

        if (!asignacion) {
            throw new NotFoundException(`Asignación de producto no encontrada`);
        }

        return this.prisma.fincaProducto.delete({
            where: {
                id_fincas_productos: asignacion.id_fincas_productos,
            },
        });
    }

    async remove(id: number) {
        // Verificar si existe
        await this.findOne(id);

        // Verificar si tiene guías hijas asociadas
        const guiasCount = await this.prisma.guiaHija.count({
            where: { id_finca: id },
        });

        if (guiasCount > 0) {
            throw new BadRequestException(
                `No se puede eliminar la finca porque tiene ${guiasCount} guías hijas asociadas`
            );
        }

        // Eliminación lógica
        return this.prisma.finca.update({
            where: { id },
            data: {
                activo: false,
            },
        });
    }

    async restore(id: number) {
        // Verificar si existe
        await this.findOne(id);

        return this.prisma.finca.update({
            where: { id },
            data: {
                activo: true,
            },
        });
    }

    async verificarDocumentos(id: number) {
        // Verificar si existe la finca
        await this.findOne(id);

        // Obtener todos los tipos de documentos obligatorios
        const tiposObligatorios = await this.prisma.tipoDocumentoFinca.findMany({
            where: { es_obligatorio: true },
        });

        // Obtener los documentos actuales de la finca
        const documentosFinca = await this.prisma.documentoFinca.findMany({
            where: {
                id_finca: id,
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
            finca_id: id,
            documentos_completos: tiposPendientes.length === 0,
            tipos_pendientes: tiposPendientes,
            documentos_aprobados: documentosFinca,
        };
    }

    async validateRegistrationCompletion(fincaId: number) {
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
                    nombre: 'FINCA',
                },
                estado: 'PENDIENTE',
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        usuario: true,
                        email: true,
                        createdAt: true,
                    },
                },
            },
        });

        // Obtener todas las fincas asociadas a esos roles
        const fincasPendientes = await Promise.all(
            rolesPendientes.map(async (rol) => {
                if (!rol.metadata || !rol.metadata['id_finca']) {
                    return null;
                }

                const fincaId = rol.metadata['id_finca'];

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
                    return null;
                }

                // Verificar si los documentos obligatorios están completos
                const documentosObligatorios = finca.documentos.filter(
                    doc => doc.tipoDocumento.es_obligatorio
                );

                const documentosCompletados = documentosObligatorios.filter(
                    doc => doc.ruta_archivo
                );

                const registroCompleto = documentosObligatorios.length === documentosCompletados.length;

                return {
                    id_rol: rol.id,
                    usuario: rol.usuario,
                    finca: finca,
                    fecha_registro: rol.createdAt,
                    documentos_obligatorios: documentosObligatorios.length,
                    documentos_completados: documentosCompletados.length,
                    registro_completo: registroCompleto,
                    documentos: finca.documentos,
                };
            })
        );

        // Filtrar nulls y ordenar por fecha de registro
        return fincasPendientes
            .filter(finca => finca !== null)
            .sort((a, b) => a.fecha_registro.getTime() - b.fecha_registro.getTime());
    }
}
