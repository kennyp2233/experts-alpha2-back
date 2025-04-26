// src/master-data/clientes/clientes.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClienteDto, UpdateClienteDto } from './dto/cliente.dto';

@Injectable()
export class ClientesService {
    constructor(private prisma: PrismaService) { }

    async findAll(includeInactive: boolean = false) {
        const where = includeInactive ? {} : { activo: true };

        return this.prisma.cliente.findMany({
            where,
            include: {
                puntosFidelizacion: true,
                consignatarios: {
                    select: {
                        id: true,
                        nombre: true,
                    },
                },
            },
        });
    }

    async search(term: string) {
        const searchTerm = term ? `%${term}%` : '%';

        return this.prisma.$queryRaw`
      SELECT c.*, COUNT(con.id) as consignatarios_count, pf.puntos_actuales
      FROM "Cliente" c
      LEFT JOIN "Consignatario" con ON c.id = con.id_cliente
      LEFT JOIN "PuntosFidelizacion" pf ON c.id = pf.id_cliente
      WHERE 
        c.nombre ILIKE ${searchTerm} OR
        c.ruc ILIKE ${searchTerm} OR
        c.email ILIKE ${searchTerm} OR
        c.ciudad ILIKE ${searchTerm}
      GROUP BY c.id, pf.puntos_actuales
      ORDER BY c.nombre
    `;
    }

    async findOne(id: number) {
        const cliente = await this.prisma.cliente.findUnique({
            where: { id },
            include: {
                puntosFidelizacion: true,
                consignatarios: {
                    include: {
                        embarcador: true,
                    },
                },

            },
        });

        if (!cliente) {
            throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
        }

        return cliente;
    }

    async create(createClienteDto: CreateClienteDto) {
        // Verificar que el RUC no existe (si se proporciona)
        if (createClienteDto.ruc) {
            const existingCliente = await this.prisma.cliente.findFirst({
                where: { ruc: createClienteDto.ruc },
            });

            if (existingCliente) {
                throw new BadRequestException(`Ya existe un cliente con el RUC ${createClienteDto.ruc}`);
            }
        }

        // Crear cliente con puntos de fidelización iniciales
        return this.prisma.$transaction(async (tx) => {
            const nuevoCliente = await tx.cliente.create({
                data: createClienteDto,
            });

            // Crear registro de puntos de fidelización
            await tx.puntosFidelizacion.create({
                data: {
                    id_cliente: nuevoCliente.id,
                    puntos_actuales: 0,
                    puntos_totales: 0,
                },
            });

            // Retornar cliente con sus puntos
            return tx.cliente.findUnique({
                where: { id: nuevoCliente.id },
                include: {
                    puntosFidelizacion: true,
                },
            });
        });
    }

    async update(id: number, updateClienteDto: UpdateClienteDto) {
        // Verificar si existe
        await this.findOne(id);

        // Verificar que el RUC no existe (si se está cambiando y se proporciona)
        if (updateClienteDto.ruc) {
            const clienteToUpdate = await this.prisma.cliente.findUnique({
                where: { id },
            });

            if (clienteToUpdate && updateClienteDto.ruc !== clienteToUpdate.ruc) {
                const existingCliente = await this.prisma.cliente.findFirst({
                    where: { ruc: updateClienteDto.ruc },
                });

                if (existingCliente) {
                    throw new BadRequestException(`Ya existe un cliente con el RUC ${updateClienteDto.ruc}`);
                }
            }
        }

        return this.prisma.cliente.update({
            where: { id },
            data: updateClienteDto,
            include: {
                puntosFidelizacion: true,
            },
        });
    }

    async remove(id: number) {
        // Verificar si existe
        await this.findOne(id);

        // Verificar si tiene consignatarios activos
        const consignatariosCount = await this.prisma.consignatario.count({
            where: { id_cliente: id },
        });

        if (consignatariosCount > 0) {
            throw new BadRequestException(
                `No se puede eliminar el cliente porque tiene ${consignatariosCount} consignatarios asociados`
            );
        }

        // Eliminación lógica
        return this.prisma.cliente.update({
            where: { id },
            data: {
                activo: false,
            },
        });
    }

    async restore(id: number) {
        // Verificar si existe
        await this.findOne(id);

        return this.prisma.cliente.update({
            where: { id },
            data: {
                activo: true,
            },
        });
    }
}