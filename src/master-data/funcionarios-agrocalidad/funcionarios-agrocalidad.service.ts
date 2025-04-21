// src/master-data/funcionarios-agrocalidad/funcionarios-agrocalidad.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFuncionarioAgrocalidadDto, UpdateFuncionarioAgrocalidadDto } from './dto/funcionario-agrocalidad.dto';

@Injectable()
export class FuncionariosAgrocalidadService {
    constructor(private prisma: PrismaService) { }

    async findAll(includeInactive: boolean = false) {
        const where = includeInactive ? {} : { estado: true };

        return this.prisma.funcionarioAgrocalidad.findMany({
            where,
        });
    }

    async findOne(id: number) {
        const funcionario = await this.prisma.funcionarioAgrocalidad.findUnique({
            where: { id },
        });

        if (!funcionario) {
            throw new NotFoundException(`Funcionario Agrocalidad con ID ${id} no encontrado`);
        }

        return funcionario;
    }

    async create(createFuncionarioDto: CreateFuncionarioAgrocalidadDto) {
        return this.prisma.funcionarioAgrocalidad.create({
            data: createFuncionarioDto,
        });
    }

    async update(id: number, updateFuncionarioDto: UpdateFuncionarioAgrocalidadDto) {
        // Verificar si existe
        await this.findOne(id);

        return this.prisma.funcionarioAgrocalidad.update({
            where: { id },
            data: updateFuncionarioDto,
        });
    }

    async remove(id: number) {
        // Verificar si existe
        await this.findOne(id);

        // Eliminación lógica
        return this.prisma.funcionarioAgrocalidad.update({
            where: { id },
            data: {
                estado: false,
            },
        });
    }

    async restore(id: number) {
        // Verificar si existe
        await this.findOne(id);

        return this.prisma.funcionarioAgrocalidad.update({
            where: { id },
            data: {
                estado: true,
            },
        });
    }
}
