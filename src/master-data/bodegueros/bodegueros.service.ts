// src/master-data/bodegueros/bodegueros.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBodegueroDto, UpdateBodegueroDto } from './dto/bodeguero.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BodeguerosService {
    constructor(private prisma: PrismaService) { }

    async findAll(includeInactive: boolean = false) {
        const where = includeInactive ? {} : { estado: true };

        return this.prisma.bodeguero.findMany({
            where,
            select: {
                id: true,
                nombre: true,
                ci: true,
                estado: true
                // Excluimos clave_bodega por seguridad
            },
        });
    }

    async findOne(id: number) {
        const bodeguero = await this.prisma.bodeguero.findUnique({
            where: { id },
            select: {
                id: true,
                nombre: true,
                ci: true,
                estado: true
                // Excluimos clave_bodega por seguridad
            },
        });

        if (!bodeguero) {
            throw new NotFoundException(`Bodeguero con ID ${id} no encontrado`);
        }

        return bodeguero;
    }

    async create(createBodegueroDto: CreateBodegueroDto) {
        // Verificar que la cédula no exista ya
        const existingBodeguero = await this.prisma.bodeguero.findFirst({
            where: { ci: createBodegueroDto.ci },
        });

        if (existingBodeguero) {
            throw new BadRequestException(`Ya existe un bodeguero con la cédula ${createBodegueroDto.ci}`);
        }

        // Encriptar la clave de bodega
        const hashedClave = await bcrypt.hash(createBodegueroDto.clave_bodega, 10);

        const result = await this.prisma.bodeguero.create({
            data: {
                ...createBodegueroDto,
                clave_bodega: hashedClave,
            },
        });

        // Retornar sin la clave por seguridad
        return {
            id: result.id,
            nombre: result.nombre,
            ci: result.ci,
            estado: result.estado,
        };
    }

    async update(id: number, updateBodegueroDto: UpdateBodegueroDto) {
        // Verificar si existe
        await this.findOne(id);

        // Verificar que la cédula no exista ya (si se está cambiando)
        const bodegueroToUpdate = await this.prisma.bodeguero.findUnique({
            where: { id },
        });

        if (bodegueroToUpdate && updateBodegueroDto.ci !== bodegueroToUpdate.ci) {
            const existingBodeguero = await this.prisma.bodeguero.findFirst({
                where: { ci: updateBodegueroDto.ci },
            });

            if (existingBodeguero) {
                throw new BadRequestException(`Ya existe un bodeguero con la cédula ${updateBodegueroDto.ci}`);
            }
        }

        // Preparar los datos a actualizar
        const dataToUpdate: any = {
            nombre: updateBodegueroDto.nombre,
            ci: updateBodegueroDto.ci,
            estado: updateBodegueroDto.estado,
        };

        // Si se proporciona una nueva clave, encriptarla
        if (updateBodegueroDto.clave_bodega) {
            dataToUpdate.clave_bodega = await bcrypt.hash(updateBodegueroDto.clave_bodega, 10);
        }

        const result = await this.prisma.bodeguero.update({
            where: { id },
            data: dataToUpdate,
        });

        // Retornar sin la clave por seguridad
        return {
            id: result.id,
            nombre: result.nombre,
            ci: result.ci,
            estado: result.estado,
        };
    }

    async remove(id: number) {
        // Verificar si existe
        await this.findOne(id);

        // Eliminación lógica
        return this.prisma.bodeguero.update({
            where: { id },
            data: {
                estado: false,
            },
            select: {
                id: true,
                nombre: true,
                ci: true,
                estado: true,
            },
        });
    }

    async restore(id: number) {
        // Verificar si existe
        await this.findOne(id);

        return this.prisma.bodeguero.update({
            where: { id },
            data: {
                estado: true,
            },
            select: {
                id: true,
                nombre: true,
                ci: true,
                estado: true,
            },
        });
    }
}
