import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDestinoDto, UpdateDestinoDto } from './dto/destino.dto';

@Injectable()
export class DestinosService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.destino.findMany({
            include: {
                pais: true,
            },
        });
    }

    async findOne(id: number) {
        const destino = await this.prisma.destino.findUnique({
            where: { id },
            include: {
                pais: true,
            },
        });

        if (!destino) {
            throw new NotFoundException(`Destino con ID ${id} no encontrado`);
        }

        return destino;
    }

    async create(createDestinoDto: CreateDestinoDto) {
        // Si se proporciona un id_pais, verificar que exista
        if (createDestinoDto.id_pais) {
            const country = await this.prisma.pais.findUnique({
                where: { id_pais: createDestinoDto.id_pais },
            });

            if (!country) {
                throw new NotFoundException(`País con ID ${createDestinoDto.id_pais} no encontrado`);
            }
        }

        return this.prisma.destino.create({
            data: createDestinoDto,
            include: {
                pais: true,
            },
        });
    }

    async update(id: number, updateDestinoDto: UpdateDestinoDto) {
        // Verificar si existe el destino
        await this.findOne(id);

        // Si se proporciona un id_pais, verificar que exista
        if (updateDestinoDto.id_pais) {
            const country = await this.prisma.pais.findUnique({
                where: { id_pais: updateDestinoDto.id_pais },
            });

            if (!country) {
                throw new NotFoundException(`País con ID ${updateDestinoDto.id_pais} no encontrado`);
            }
        }

        return this.prisma.destino.update({
            where: { id },
            data: updateDestinoDto,
            include: {
                pais: true,
            },
        });
    }

    async remove(id: number) {
        // Verificar si existe
        await this.findOne(id);

        // Verificar si el destino está siendo utilizado
        const usageCount = await this.prisma.$transaction([
            this.prisma.aerolinea.count({
                where: {
                    OR: [
                        { to1: id },
                        { to2: id },
                        { to3: id },
                    ],
                },
            }),
            this.prisma.documentoCoordinacion.count({
                where: {
                    OR: [
                        { id_destino_awb: id },
                        { id_destino_final_docs: id },
                        { to1: id },
                        { to2: id },
                        { to3: id },
                    ],
                },
            }),
            this.prisma.consignatarioGuiaM.count({
                where: { id_destino: id },
            }),
        ]);

        // Si el destino está siendo utilizado, lanzar error
        if (usageCount.some(count => count > 0)) {
            throw new BadRequestException(
                `No se puede eliminar el destino porque está siendo utilizado en el sistema`
            );
        }

        return this.prisma.destino.delete({
            where: { id },
        });
    }

    async search(term: string) {
        const searchTerm = term ? `%${term}%` : '%';

        return this.prisma.$queryRaw`
      SELECT d.*, p.nombre as pais_nombre, p.siglas_pais
      FROM "Destino" d
      LEFT JOIN "Pais" p ON d.id_pais = p.id_pais
      WHERE 
        d.tag ILIKE ${searchTerm} OR
        d.nombre ILIKE ${searchTerm} OR
        d.aeropuerto ILIKE ${searchTerm} OR
        p.nombre ILIKE ${searchTerm}
      ORDER BY d.nombre
    `;
    }
}