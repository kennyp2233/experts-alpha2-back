import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFincaDto, UpdateFincaDto } from '../dto';

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
}