import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaisDto, UpdatePaisDto } from './dto/pais.dto';

@Injectable()
export class PaisesService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.pais.findMany({
            include: {
                acuerdos_arancelario: true,
            },
        });
    }

    async findOne(id: number) {
        const pais = await this.prisma.pais.findUnique({
            where: { id_pais: id },
            include: {
                acuerdos_arancelario: true,
            },
        });

        if (!pais) {
            throw new NotFoundException(`País con ID ${id} no encontrado`);
        }

        return pais;
    }

    async create(createPaisDto: CreatePaisDto) {
        // Verificar que el código del país es único
        const existingPais = await this.prisma.pais.findUnique({
            where: { siglas_pais: createPaisDto.siglas_pais },
        });

        if (existingPais) {
            throw new BadRequestException(`Ya existe un país con el código ${createPaisDto.siglas_pais}`);
        }

        // Verificar que el acuerdo arancelario existe si se proporciona
        if (createPaisDto.id_acuerdo) {
            const acuerdo = await this.prisma.acuerdoArancelario.findUnique({
                where: { id_acuerdo: createPaisDto.id_acuerdo },
            });

            if (!acuerdo) {
                throw new NotFoundException(`Acuerdo arancelario con ID ${createPaisDto.id_acuerdo} no encontrado`);
            }
        }

        return this.prisma.pais.create({
            data: createPaisDto,
            include: {
                acuerdos_arancelario: true,
            },
        });
    }

    async update(id: number, updatePaisDto: UpdatePaisDto) {
        // Verificar si existe el país
        await this.findOne(id);

        // Verificar que el código del país es único (si se está cambiando)
        const paisToUpdate = await this.prisma.pais.findUnique({
            where: { id_pais: id },
        });

        if (paisToUpdate && updatePaisDto.siglas_pais !== paisToUpdate.siglas_pais) {
            const existingPais = await this.prisma.pais.findUnique({
                where: { siglas_pais: updatePaisDto.siglas_pais },
            });

            if (existingPais) {
                throw new BadRequestException(`Ya existe un país con el código ${updatePaisDto.siglas_pais}`);
            }
        }

        // Verificar que el acuerdo arancelario existe si se proporciona
        if (updatePaisDto.id_acuerdo) {
            const acuerdo = await this.prisma.acuerdoArancelario.findUnique({
                where: { id_acuerdo: updatePaisDto.id_acuerdo },
            });

            if (!acuerdo) {
                throw new NotFoundException(`Acuerdo arancelario con ID ${updatePaisDto.id_acuerdo} no encontrado`);
            }
        }

        return this.prisma.pais.update({
            where: { id_pais: id },
            data: updatePaisDto,
            include: {
                acuerdos_arancelario: true,
            },
        });
    }

    async remove(id: number) {
        // Verificar si existe
        await this.findOne(id);

        // Verificar si el país está siendo utilizado
        const usageCount = await this.prisma.$transaction([
            this.prisma.origen.count({ where: { id_pais: id } }),
            this.prisma.destino.count({ where: { id_pais: id } }),
        ]);

        // Si el país está siendo utilizado, lanzar error
        if (usageCount.some(count => count > 0)) {
            throw new BadRequestException(
                `No se puede eliminar el país porque está siendo utilizado en orígenes o destinos`
            );
        }

        return this.prisma.pais.delete({
            where: { id_pais: id },
        });
    }

    async search(term: string) {
        const searchTerm = term ? `%${term}%` : '%';

        return this.prisma.$queryRaw`
      SELECT p.*, aa.nombre as acuerdo_nombre
      FROM "Pais" p
      LEFT JOIN "AcuerdoArancelario" aa ON p.id_acuerdo = aa.id_acuerdo
      WHERE 
        p.siglas_pais ILIKE ${searchTerm} OR
        p.nombre ILIKE ${searchTerm}
      ORDER BY p.nombre
    `;
    }
}