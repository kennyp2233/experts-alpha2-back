// src/master-data/agencias-iata/agencias-iata.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAgenciaIataDto, UpdateAgenciaIataDto } from './dto/agencia-iata.dto';

@Injectable()
export class AgenciasIataService {
    constructor(private prisma: PrismaService) { }

    async findAll(includeInactive: boolean = false) {
        const where = includeInactive ? {} : { estado_agencia_iata: true };

        return this.prisma.agenciaIata.findMany({
            where,
        });
    }

    async search(term: string) {
        const searchTerm = term ? `%${term}%` : '%';

        return this.prisma.$queryRaw`
      SELECT *
      FROM "AgenciaIata"
      WHERE 
        alias_shipper ILIKE ${searchTerm} OR
        nombre_shipper ILIKE ${searchTerm} OR
        ciudad_shipper ILIKE ${searchTerm} OR
        pais_shipper ILIKE ${searchTerm} OR
        nombre_carrier ILIKE ${searchTerm} OR
        iata_code_carrier ILIKE ${searchTerm}
      ORDER BY alias_shipper
    `;
    }

    async findOne(id: number) {
        const agenciaIata = await this.prisma.agenciaIata.findUnique({
            where: { id },
        });

        if (!agenciaIata) {
            throw new NotFoundException(`Agencia IATA con ID ${id} no encontrada`);
        }

        return agenciaIata;
    }

    async create(createAgenciaIataDto: CreateAgenciaIataDto) {
        // Verificar que el alias no exista ya
        const existingAgencia = await this.prisma.agenciaIata.findUnique({
            where: { alias_shipper: createAgenciaIataDto.alias_shipper },
        });

        if (existingAgencia) {
            throw new BadRequestException(`Ya existe una agencia con el alias ${createAgenciaIataDto.alias_shipper}`);
        }

        return this.prisma.agenciaIata.create({
            data: createAgenciaIataDto,
        });
    }

    async update(id: number, updateAgenciaIataDto: UpdateAgenciaIataDto) {
        // Verificar si existe
        await this.findOne(id);

        // Verificar que el alias no exista ya (si se está cambiando)
        const agenciaToUpdate = await this.prisma.agenciaIata.findUnique({
            where: { id },
        });

        if (agenciaToUpdate && updateAgenciaIataDto.alias_shipper !== agenciaToUpdate.alias_shipper) {
            const existingAgencia = await this.prisma.agenciaIata.findUnique({
                where: { alias_shipper: updateAgenciaIataDto.alias_shipper },
            });

            if (existingAgencia) {
                throw new BadRequestException(`Ya existe una agencia con el alias ${updateAgenciaIataDto.alias_shipper}`);
            }
        }

        return this.prisma.agenciaIata.update({
            where: { id },
            data: updateAgenciaIataDto,
        });
    }

    async remove(id: number) {
        // Verificar si existe
        await this.findOne(id);

        // Opción 1: Eliminación lógica
        return this.prisma.agenciaIata.update({
            where: { id },
            data: {
                estado_agencia_iata: false,
            },
        });
    }

    async restore(id: number) {
        // Verificar si existe
        await this.findOne(id);

        return this.prisma.agenciaIata.update({
            where: { id },
            data: {
                estado_agencia_iata: true,
            },
        });
    }
}