import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrigenDto, UpdateOrigenDto } from './dto/origen.dto';

@Injectable()
export class OrigenesService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.origen.findMany({
            include: {
                pais: true,
                cae_aduana: true,
            },
        });
    }

    async findOne(id: number) {
        const origen = await this.prisma.origen.findUnique({
            where: { id },
            include: {
                pais: true,
                cae_aduana: true,
            },
        });

        if (!origen) {
            throw new NotFoundException(`Origen con ID ${id} no encontrado`);
        }

        return origen;
    }

    async create(createOrigenDto: CreateOrigenDto) {
        // Validar que el país exista si se proporciona
        if (createOrigenDto.id_pais) {
            const pais = await this.prisma.pais.findUnique({
                where: { id_pais: createOrigenDto.id_pais },
            });

            if (!pais) {
                throw new NotFoundException(`País con ID ${createOrigenDto.id_pais} no encontrado`);
            }
        }

        // Validar que la aduana exista si se proporciona
        if (createOrigenDto.id_cae_aduana) {
            const caeAduana = await this.prisma.caeAduana.findUnique({
                where: { id_cae_aduana: createOrigenDto.id_cae_aduana },
            });

            if (!caeAduana) {
                throw new NotFoundException(`CAE Aduana con ID ${createOrigenDto.id_cae_aduana} no encontrado`);
            }
        }

        return this.prisma.origen.create({
            data: createOrigenDto,
            include: {
                pais: true,
                cae_aduana: true,
            },
        });
    }

    async update(id: number, updateOrigenDto: UpdateOrigenDto) {
        // Verificar si existe el origen
        await this.findOne(id);

        // Validar que el país exista si se proporciona
        if (updateOrigenDto.id_pais) {
            const pais = await this.prisma.pais.findUnique({
                where: { id_pais: updateOrigenDto.id_pais },
            });

            if (!pais) {
                throw new NotFoundException(`País con ID ${updateOrigenDto.id_pais} no encontrado`);
            }
        }

        // Validar que la aduana exista si se proporciona
        if (updateOrigenDto.id_cae_aduana) {
            const caeAduana = await this.prisma.caeAduana.findUnique({
                where: { id_cae_aduana: updateOrigenDto.id_cae_aduana },
            });

            if (!caeAduana) {
                throw new NotFoundException(`CAE Aduana con ID ${updateOrigenDto.id_cae_aduana} no encontrado`);
            }
        }

        return this.prisma.origen.update({
            where: { id },
            data: updateOrigenDto,
            include: {
                pais: true,
                cae_aduana: true,
            },
        });
    }

    async remove(id: number) {
        // Verificar si existe
        await this.findOne(id);

        // Verificar si el origen está siendo utilizado
        const usageCount = await this.prisma.$transaction([
            this.prisma.aerolinea.count({
                where: { from1: id },
            }),
            this.prisma.documentoCoordinacion.count({
                where: { from1: id },
            }),
        ]);

        // Si el origen está siendo utilizado, lanzar error
        if (usageCount.some(count => count > 0)) {
            throw new BadRequestException(
                `No se puede eliminar el origen porque está siendo utilizado en el sistema`
            );
        }

        return this.prisma.origen.delete({
            where: { id },
        });
    }

    async search(term: string) {
        const searchTerm = term ? `%${term}%` : '%';

        return this.prisma.$queryRaw`
      SELECT o.*, p.nombre as pais_nombre, p.siglas_pais, c.nombre as aduana_nombre
      FROM "Origen" o
      LEFT JOIN "Pais" p ON o.id_pais = p.id_pais
      LEFT JOIN "CaeAduana" c ON o.id_cae_aduana = c.id_cae_aduana
      WHERE 
        o.tag ILIKE ${searchTerm} OR
        o.nombre ILIKE ${searchTerm} OR
        o.aeropuerto ILIKE ${searchTerm} OR
        p.nombre ILIKE ${searchTerm}
      ORDER BY o.nombre
    `;
    }
}