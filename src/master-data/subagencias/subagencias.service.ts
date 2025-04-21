// src/master-data/subagencias/subagencias.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubagenciaDto, UpdateSubagenciaDto } from './dto/subagencia.dto';

@Injectable()
export class SubagenciasService {
    constructor(private prisma: PrismaService) { }

    async findAll(includeInactive: boolean = false) {
        const where = includeInactive ? {} : { estado: true };

        return this.prisma.subAgencia.findMany({
            where,
        });
    }

    async findOne(id: number) {
        const subagencia = await this.prisma.subAgencia.findUnique({
            where: { id },
        });

        if (!subagencia) {
            throw new NotFoundException(`Subagencia con ID ${id} no encontrada`);
        }

        return subagencia;
    }

    async create(createSubagenciaDto: CreateSubagenciaDto) {
        return this.prisma.subAgencia.create({
            data: createSubagenciaDto,
        });
    }

    async update(id: number, updateSubagenciaDto: UpdateSubagenciaDto) {
        // Verificar si existe
        await this.findOne(id);

        return this.prisma.subAgencia.update({
            where: { id },
            data: updateSubagenciaDto,
        });
    }

    async remove(id: number) {
        // Verificar si existe
        await this.findOne(id);

        // Eliminación lógica
        return this.prisma.subAgencia.update({
            where: { id },
            data: {
                estado: false,
            },
        });
    }

    async restore(id: number) {
        // Verificar si existe
        await this.findOne(id);

        return this.prisma.subAgencia.update({
            where: { id },
            data: {
                estado: true,
            },
        });
    }
}
