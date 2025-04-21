// src/master-data/acuerdos-arancelarios/acuerdos-arancelarios.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAcuerdoArancelarioDto, UpdateAcuerdoArancelarioDto } from './dto/acuerdo-arancelario.dto';

@Injectable()
export class AcuerdosArancelariosService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.acuerdoArancelario.findMany({
            include: {
                paises: true,
            },
        });
    }

    async findOne(id: number) {
        const acuerdo = await this.prisma.acuerdoArancelario.findUnique({
            where: { id_acuerdo: id },
            include: {
                paises: true,
            },
        });

        if (!acuerdo) {
            throw new NotFoundException(`Acuerdo arancelario con ID ${id} no encontrado`);
        }

        return acuerdo;
    }

    async create(createAcuerdoArancelarioDto: CreateAcuerdoArancelarioDto) {
        return this.prisma.acuerdoArancelario.create({
            data: createAcuerdoArancelarioDto,
        });
    }

    async update(id: number, updateAcuerdoArancelarioDto: UpdateAcuerdoArancelarioDto) {
        // Verificar si existe
        await this.findOne(id);

        return this.prisma.acuerdoArancelario.update({
            where: { id_acuerdo: id },
            data: updateAcuerdoArancelarioDto,
        });
    }

    async remove(id: number) {
        // Verificar si existe
        await this.findOne(id);

        // Verificar si está siendo utilizado por países
        const paisesCount = await this.prisma.pais.count({
            where: { id_acuerdo: id },
        });

        if (paisesCount > 0) {
            throw new BadRequestException(
                `No se puede eliminar el acuerdo arancelario porque está siendo utilizado por ${paisesCount} países`
            );
        }

        return this.prisma.acuerdoArancelario.delete({
            where: { id_acuerdo: id },
        });
    }
}
