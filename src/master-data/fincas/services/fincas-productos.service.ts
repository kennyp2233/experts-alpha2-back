import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { FincasService } from './fincas.service';

@Injectable()
export class FincasProductosService {
    constructor(
        private prisma: PrismaService,
        private fincasService: FincasService
    ) { }

    async getProductos(fincaId: number) {
        // Verificar si existe la finca
        await this.fincasService.findOne(fincaId);

        return this.prisma.fincaProducto.findMany({
            where: { id_finca: fincaId },
            include: {
                producto: true,
            },
        });
    }

    async asignarProducto(fincaId: number, idProducto: number) {
        // Verificar si existe la finca
        await this.fincasService.findOne(fincaId);

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
                id_finca: fincaId,
                id_producto: idProducto,
            },
        });

        if (asignacionExistente) {
            throw new BadRequestException(`El producto ya está asignado a esta finca`);
        }

        return this.prisma.fincaProducto.create({
            data: {
                id_finca: fincaId,
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

    async eliminarProducto(fincaId: number, idProducto: number) {
        // Verificar si existe la finca
        await this.fincasService.findOne(fincaId);

        // Verificar si existe la asignación
        const asignacion = await this.prisma.fincaProducto.findFirst({
            where: {
                id_finca: fincaId,
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
}