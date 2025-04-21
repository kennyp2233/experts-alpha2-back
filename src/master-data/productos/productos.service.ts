// src/master-data/productos/productos.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
    CreateProductoDto,
    UpdateProductoDto,
    ProductoArancelesDto,
    ProductoCompuestoDto,
    ProductoMiProDto
} from './dto/producto.dto';

@Injectable()
export class ProductosService {
    constructor(private prisma: PrismaService) { }

    async findAll(includeInactive: boolean = false) {
        const where = includeInactive ? {} : { estado: true };

        return this.prisma.producto.findMany({
            where,
            include: {
                aranceles: true,
                producto_compuesto: true,
                mipro: true,
            },
        });
    }

    async search(term: string) {
        const searchTerm = term ? `%${term}%` : '%';

        return this.prisma.$queryRaw`
      SELECT p.*, 
        COUNT(DISTINCT a.id) as aranceles_count,
        COUNT(DISTINCT c.id) as compuestos_count,
        COUNT(DISTINCT m.id) as mipro_count,
        COUNT(DISTINCT fp.id_fincas_productos) as fincas_count,
        COUNT(DISTINCT gh.id) as guias_count
      FROM "Producto" p
      LEFT JOIN "ProductosAranceles" a ON p.id = a.id_producto
      LEFT JOIN "ProductosCompuesto" c ON p.id = c.id_producto
      LEFT JOIN "ProductosMiPro" m ON p.id = m.id_producto
      LEFT JOIN "FincaProducto" fp ON p.id = fp.id_producto
      LEFT JOIN "GuiaHija" gh ON p.id = gh.id_producto
      WHERE 
        p.nombre ILIKE ${searchTerm} OR
        p.tag ILIKE ${searchTerm} OR
        p.descripcion ILIKE ${searchTerm} OR
        p.nombre_botanico ILIKE ${searchTerm}
      GROUP BY p.id
      ORDER BY p.nombre
    `;
    }

    async findOne(id: number) {
        const producto = await this.prisma.producto.findUnique({
            where: { id },
            include: {
                aranceles: true,
                producto_compuesto: true,
                mipro: true,
                fincas_productos: {
                    include: {
                        finca: {
                            select: {
                                id: true,
                                nombre_finca: true,
                                tag: true,
                            },
                        },
                    },
                },
                guiash: {
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
                        finca: {
                            select: {
                                id: true,
                                nombre_finca: true,
                                tag: true,
                            },
                        },
                    },
                },
            },
        });

        if (!producto) {
            throw new NotFoundException(`Producto con ID ${id} no encontrado`);
        }

        return producto;
    }

    async create(createProductoDto: CreateProductoDto) {
        // Verificar que el tag es único (si se proporciona)
        if (createProductoDto.tag) {
            const existingProducto = await this.prisma.producto.findFirst({
                where: { tag: createProductoDto.tag },
            });

            if (existingProducto) {
                throw new BadRequestException(`Ya existe un producto con el tag ${createProductoDto.tag}`);
            }
        }

        return this.prisma.producto.create({
            data: createProductoDto,
        });
    }

    async update(id: number, updateProductoDto: UpdateProductoDto) {
        // Verificar si existe
        await this.findOne(id);

        // Verificar que el tag es único (si se está cambiando y se proporciona)
        if (updateProductoDto.tag) {
            const productoToUpdate = await this.prisma.producto.findUnique({
                where: { id },
            });

            if (productoToUpdate && updateProductoDto.tag !== productoToUpdate.tag) {
                const existingProducto = await this.prisma.producto.findFirst({
                    where: { tag: updateProductoDto.tag },
                });

                if (existingProducto) {
                    throw new BadRequestException(`Ya existe un producto con el tag ${updateProductoDto.tag}`);
                }
            }
        }

        return this.prisma.producto.update({
            where: { id },
            data: updateProductoDto,
        });
    }

    async crearArancel(id: number, arancelDto: ProductoArancelesDto) {
        // Verificar si existe el producto
        await this.findOne(id);

        return this.prisma.productosAranceles.create({
            data: {
                id_producto: id,
                ...arancelDto,
            },
        });
    }

    async eliminarArancel(id: number, arancelId: number) {
        // Verificar si existe el producto
        await this.findOne(id);

        // Verificar si existe el arancel
        const arancel = await this.prisma.productosAranceles.findUnique({
            where: { id: arancelId },
        });

        if (!arancel || arancel.id_producto !== id) {
            throw new NotFoundException(`Arancel con ID ${arancelId} no encontrado para este producto`);
        }

        return this.prisma.productosAranceles.delete({
            where: { id: arancelId },
        });
    }

    async crearCompuesto(id: number, compuestoDto: ProductoCompuestoDto) {
        // Verificar si existe el producto
        await this.findOne(id);

        return this.prisma.productosCompuesto.create({
            data: {
                id_producto: id,
                ...compuestoDto,
            },
        });
    }

    async eliminarCompuesto(id: number, compuestoId: number) {
        // Verificar si existe el producto
        await this.findOne(id);

        // Verificar si existe el compuesto
        const compuesto = await this.prisma.productosCompuesto.findUnique({
            where: { id: compuestoId },
        });

        if (!compuesto || compuesto.id_producto !== id) {
            throw new NotFoundException(`Compuesto con ID ${compuestoId} no encontrado para este producto`);
        }

        return this.prisma.productosCompuesto.delete({
            where: { id: compuestoId },
        });
    }

    async crearMiPro(id: number, miProDto: ProductoMiProDto) {
        // Verificar si existe el producto
        await this.findOne(id);

        return this.prisma.productosMiPro.create({
            data: {
                id_producto: id,
                ...miProDto,
            },
        });
    }

    async eliminarMiPro(id: number, miProId: number) {
        // Verificar si existe el producto
        await this.findOne(id);

        // Verificar si existe el MiPro
        const miPro = await this.prisma.productosMiPro.findUnique({
            where: { id: miProId },
        });

        if (!miPro || miPro.id_producto !== id) {
            throw new NotFoundException(`Registro MiPro con ID ${miProId} no encontrado para este producto`);
        }

        return this.prisma.productosMiPro.delete({
            where: { id: miProId },
        });
    }

    async remove(id: number) {
        // Verificar si existe
        await this.findOne(id);

        // Verificar si está siendo utilizado en guías hijas
        const guiasCount = await this.prisma.guiaHija.count({
            where: { id_producto: id },
        });

        if (guiasCount > 0) {
            throw new BadRequestException(
                `No se puede eliminar el producto porque está siendo utilizado en ${guiasCount} guías hijas`
            );
        }

        // Verificar si está siendo utilizado en documentos de coordinación
        const docsCount = await this.prisma.documentoCoordinacion.count({
            where: { id_producto: id },
        });

        if (docsCount > 0) {
            throw new BadRequestException(
                `No se puede eliminar el producto porque está siendo utilizado en ${docsCount} documentos de coordinación`
            );
        }

        // Verificar si está asignado a fincas
        const fincasCount = await this.prisma.fincaProducto.count({
            where: { id_producto: id },
        });

        if (fincasCount > 0) {
            throw new BadRequestException(
                `No se puede eliminar el producto porque está asignado a ${fincasCount} fincas`
            );
        }

        // Eliminar registros relacionados
        await this.prisma.$transaction([
            this.prisma.productosAranceles.deleteMany({
                where: { id_producto: id },
            }),
            this.prisma.productosCompuesto.deleteMany({
                where: { id_producto: id },
            }),
            this.prisma.productosMiPro.deleteMany({
                where: { id_producto: id },
            }),
        ]);

        // Eliminación lógica
        return this.prisma.producto.update({
            where: { id },
            data: {
                estado: false,
            },
        });
    }

    async restore(id: number) {
        // Verificar si existe
        await this.findOne(id);

        return this.prisma.producto.update({
            where: { id },
            data: {
                estado: true,
            },
        });
    }
}