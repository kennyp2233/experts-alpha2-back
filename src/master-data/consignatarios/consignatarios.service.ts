// src/master-data/consignatarios/consignatarios.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
    CreateConsignatarioDto,
    UpdateConsignatarioDto,
    UpdateConsignatarioInfoAdicionalDto
} from './dto/consignatario.dto';

@Injectable()
export class ConsignatariosService {
    constructor(private prisma: PrismaService) { }

    async findAll(idCliente?: number) {
        const where = idCliente ? { id_cliente: idCliente } : {};

        return this.prisma.consignatario.findMany({
            where,
            include: {
                cliente: {
                    select: {
                        nombre: true,
                    },
                },
                embarcador: {
                    select: {
                        nombre: true,
                    },
                },
                cae_sice: true,
                facturacion: true,
                fito: true,
                guia_h: true,
                guia_m: {
                    include: {
                        destino: true,
                    },
                },
                transmision: true,
            },
        });
    }

    async search(term: string) {
        const searchTerm = term ? `%${term}%` : '%';

        return this.prisma.$queryRaw`
      SELECT c.*, cl.nombre as cliente_nombre, e.nombre as embarcador_nombre
      FROM "Consignatario" c
      JOIN "Cliente" cl ON c.id_cliente = cl.id
      JOIN "Embarcador" e ON c.id_embarcador = e.id
      WHERE 
        c.nombre ILIKE ${searchTerm} OR
        c.ruc ILIKE ${searchTerm} OR
        cl.nombre ILIKE ${searchTerm} OR
        e.nombre ILIKE ${searchTerm} OR
        c.ciudad ILIKE ${searchTerm} OR
        c.pais ILIKE ${searchTerm}
      ORDER BY c.nombre
    `;
    }

    async findOne(id: number) {
        const consignatario = await this.prisma.consignatario.findUnique({
            where: { id },
            include: {
                cliente: true,
                embarcador: true,
                cae_sice: true,
                facturacion: true,
                fito: true,
                guia_h: true,
                guia_m: {
                    include: {
                        destino: true,
                    },
                },
                transmision: true,
                documentosCoordinacion: {
                    select: {
                        id: true,
                        fecha_vuelo: true,
                        guia_madre: {
                            select: {
                                prefijo: true,
                                secuencial: true,
                            },
                        },
                    },
                    take: 5, // Limitar a los últimos 5 documentos
                    orderBy: {
                        fecha_vuelo: 'desc',
                    },
                },
            },
        });

        if (!consignatario) {
            throw new NotFoundException(`Consignatario con ID ${id} no encontrado`);
        }

        return consignatario;
    }

    async create(createConsignatarioDto: CreateConsignatarioDto) {
        // Verificar que el cliente existe
        const cliente = await this.prisma.cliente.findUnique({
            where: { id: createConsignatarioDto.id_cliente },
        });

        if (!cliente) {
            throw new NotFoundException(`Cliente con ID ${createConsignatarioDto.id_cliente} no encontrado`);
        }

        // Verificar que el embarcador existe
        const embarcador = await this.prisma.embarcador.findUnique({
            where: { id: createConsignatarioDto.id_embarcador },
        });

        if (!embarcador) {
            throw new NotFoundException(`Embarcador con ID ${createConsignatarioDto.id_embarcador} no encontrado`);
        }

        // Crear el consignatario con sus tablas relacionadas
        return this.prisma.$transaction(async (tx) => {
            // Crear consignatario base
            const nuevoConsignatario = await tx.consignatario.create({
                data: {
                    nombre: createConsignatarioDto.nombre,
                    ruc: createConsignatarioDto.ruc,
                    direccion: createConsignatarioDto.direccion,
                    telefono: createConsignatarioDto.telefono,
                    email: createConsignatarioDto.email,
                    ciudad: createConsignatarioDto.ciudad,
                    pais: createConsignatarioDto.pais,
                    id_cliente: createConsignatarioDto.id_cliente,
                    id_embarcador: createConsignatarioDto.id_embarcador,
                },
            });

            // Crear tablas relacionadas con datos vacíos
            await tx.consignatarioCaeSice.create({
                data: {
                    id_consignatario: nuevoConsignatario.id,
                },
            });

            await tx.consignatarioFacturacion.create({
                data: {
                    id_consignatario: nuevoConsignatario.id,
                },
            });

            await tx.consignatarioFito.create({
                data: {
                    id_consignatario: nuevoConsignatario.id,
                },
            });

            await tx.consignatarioGuiaH.create({
                data: {
                    id_consignatario: nuevoConsignatario.id,
                },
            });

            await tx.consignatarioGuiaM.create({
                data: {
                    id_consignatario: nuevoConsignatario.id,
                },
            });

            await tx.consignatarioTransmision.create({
                data: {
                    id_consignatario: nuevoConsignatario.id,
                },
            });

            // Retornar el consignatario completo
            return this.findOne(nuevoConsignatario.id);
        });
    }

    async update(id: number, updateConsignatarioDto: UpdateConsignatarioDto) {
        // Verificar si existe
        await this.findOne(id);

        // Verificar que el cliente existe
        if (updateConsignatarioDto.id_cliente) {
            const cliente = await this.prisma.cliente.findUnique({
                where: { id: updateConsignatarioDto.id_cliente },
            });

            if (!cliente) {
                throw new NotFoundException(`Cliente con ID ${updateConsignatarioDto.id_cliente} no encontrado`);
            }
        }

        // Verificar que el embarcador existe
        if (updateConsignatarioDto.id_embarcador) {
            const embarcador = await this.prisma.embarcador.findUnique({
                where: { id: updateConsignatarioDto.id_embarcador },
            });

            if (!embarcador) {
                throw new NotFoundException(`Embarcador con ID ${updateConsignatarioDto.id_embarcador} no encontrado`);
            }
        }

        return this.prisma.consignatario.update({
            where: { id },
            data: updateConsignatarioDto,
            include: {
                cliente: true,
                embarcador: true,
            },
        });
    }

    async updateInfoAdicional(id: number, updateInfoDto: UpdateConsignatarioInfoAdicionalDto) {
        // Verificar si existe
        await this.findOne(id);

        return this.prisma.$transaction(async (tx) => {
            // Actualizar información de CAE/SICE
            if (updateInfoDto.cae_sice) {
                await tx.consignatarioCaeSice.update({
                    where: { id_consignatario: id },
                    data: updateInfoDto.cae_sice,
                });
            }

            // Actualizar información de facturación
            if (updateInfoDto.facturacion) {
                await tx.consignatarioFacturacion.update({
                    where: { id_consignatario: id },
                    data: updateInfoDto.facturacion,
                });
            }

            // Actualizar información fitosanitaria
            if (updateInfoDto.fito) {
                await tx.consignatarioFito.update({
                    where: { id_consignatario: id },
                    data: updateInfoDto.fito,
                });
            }

            // Actualizar información para guías hijas
            if (updateInfoDto.guia_h) {
                await tx.consignatarioGuiaH.update({
                    where: { id_consignatario: id },
                    data: updateInfoDto.guia_h,
                });
            }

            // Actualizar información para guías madre
            if (updateInfoDto.guia_m) {
                // Verificar que el destino existe si se proporciona
                if (updateInfoDto.guia_m.id_destino) {
                    const destino = await tx.destino.findUnique({
                        where: { id: updateInfoDto.guia_m.id_destino },
                    });

                    if (!destino) {
                        throw new NotFoundException(`Destino con ID ${updateInfoDto.guia_m.id_destino} no encontrado`);
                    }
                }

                await tx.consignatarioGuiaM.update({
                    where: { id_consignatario: id },
                    data: updateInfoDto.guia_m,
                });
            }

            // Actualizar información para transmisión
            if (updateInfoDto.transmision) {
                await tx.consignatarioTransmision.update({
                    where: { id_consignatario: id },
                    data: updateInfoDto.transmision,
                });
            }

            // Retornar el consignatario con toda la información actualizada
            return this.findOne(id);
        });
    }

    async remove(id: number) {
        // Verificar si existe
        await this.findOne(id);

        // Verificar si tiene documentos de coordinación
        const docsCount = await this.prisma.documentoCoordinacion.count({
            where: { id_consignatario: id },
        });

        if (docsCount > 0) {
            throw new BadRequestException(
                `No se puede eliminar el consignatario porque está siendo utilizado en ${docsCount} documentos de coordinación`
            );
        }

        // Iniciar transacción para eliminar el consignatario y sus tablas relacionadas
        return this.prisma.$transaction(async (tx) => {
            // Eliminar tablas relacionadas
            await tx.consignatarioCaeSice.delete({
                where: { id_consignatario: id },
            });

            await tx.consignatarioFacturacion.delete({
                where: { id_consignatario: id },
            });

            await tx.consignatarioFito.delete({
                where: { id_consignatario: id },
            });

            await tx.consignatarioGuiaH.delete({
                where: { id_consignatario: id },
            });

            await tx.consignatarioGuiaM.delete({
                where: { id_consignatario: id },
            });

            await tx.consignatarioTransmision.delete({
                where: { id_consignatario: id },
            });

            // Eliminar el consignatario
            return tx.consignatario.delete({
                where: { id },
            });
        });
    }
}