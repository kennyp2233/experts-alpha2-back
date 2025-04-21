// src/master-documents/controllers/documento-coordinacion.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
    Query,
    ParseIntPipe,
    NotFoundException
} from '@nestjs/common';
import { DocumentoCoordinacionService } from '../services/documento-coordinacion.service';
import { CreateDocCoordDto } from '../dto/documento-coordinacion/create-doc-coord.dto';
import { UpdateDocCoordDto } from '../dto/documento-coordinacion/update-doc-coord.dto';
import { AsignarConsignatarioDto } from '../dto/documento-coordinacion/asignar-consignatario.dto';
import { CambioEstadoDto } from '../dto/guia-madre/cambio-estado.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { IsOptional, IsString } from 'class-validator';

export class CortarDocumentoDto {
    @IsOptional()
    @IsString()
    comentario?: string;
}

@Controller('documentos-coordinacion')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentoCoordinacionController {
    constructor(
        private readonly documentoCoordinacionService: DocumentoCoordinacionService,
        private readonly prisma: PrismaService, // Para consultas directas a la base de datos
    ) { }

    @Post()
    @Roles('ADMIN', 'OPERADOR')
    create(@Body() createDocCoordDto: CreateDocCoordDto, @Request() req) {
        return this.documentoCoordinacionService.create(createDocCoordDto, req.user.id);
    }

    @Get()
    @Roles('ADMIN', 'OPERADOR', 'CLIENTE', 'FINCA')
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('estado') estado?: string,
        @Query('consignatario') consignatario?: string,
        @Query('producto') producto?: string,
        @Query('aerolinea') aerolinea?: string,
        @Query('fechaDesde') fechaDesde?: string,
        @Query('fechaHasta') fechaHasta?: string,
        @Request() req?,
    ) {
        // Filtrado adicional por roles si es necesario
        // Por ejemplo, si es cliente solo ver sus documentos
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 10;
        const consignatarioNum = consignatario ? parseInt(consignatario, 10) : undefined;
        const productoNum = producto ? parseInt(producto, 10) : undefined;
        const aerolineaNum = aerolinea ? parseInt(aerolinea, 10) : undefined;

        return this.documentoCoordinacionService.findAll(
            pageNum,
            limitNum,
            estado,
            consignatarioNum,
            productoNum,
            aerolineaNum,
            fechaDesde,
            fechaHasta,
        );
    }

    @Get(':id')
    @Roles('ADMIN', 'OPERADOR', 'CLIENTE', 'FINCA')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.documentoCoordinacionService.findOne(id);
    }

    @Patch(':id')
    @Roles('ADMIN', 'OPERADOR')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDocCoordDto: UpdateDocCoordDto,
        @Request() req,
    ) {
        return this.documentoCoordinacionService.update(id, updateDocCoordDto, req.user.id);
    }

    @Post(':id/consignatarios')
    @Roles('ADMIN', 'OPERADOR')
    async asignarConsignatarios(
        @Param('id', ParseIntPipe) id: number,
        @Body() asignarConsignatarioDto: AsignarConsignatarioDto,
        @Request() req
    ) {
        return this.documentoCoordinacionService.asignarConsignatarios(
            id,
            asignarConsignatarioDto.consignatarios
        );
    }

    @Get(':id/consignatarios')
    @Roles('ADMIN', 'OPERADOR', 'CLIENTE', 'FINCA')
    async getConsignatarios(@Param('id', ParseIntPipe) id: number) {
        const docConsignatarios = await this.prisma.documentoConsignatario.findMany({
            where: { id_documento_coordinacion: id },
            include: {
                consignatario: {
                    include: {
                        cliente: true,
                        embarcador: true,
                        cae_sice: true,
                        facturacion: true,
                        fito: true,
                        guia_h: true,
                        guia_m: true,
                        transmision: true
                    }
                }
            },
            orderBy: {
                es_principal: 'desc' // Primero los principales
            }
        });

        if (docConsignatarios.length === 0) {
            throw new NotFoundException(`No se encontraron consignatarios para el documento ${id}`);
        }

        return docConsignatarios;
    }

    @Post(':id/cortar')
    @Roles('ADMIN', 'OPERADOR')
    async cortarDocumento(
        @Param('id', ParseIntPipe) id: number,
        @Body() cortarDocumentoDto: CortarDocumentoDto,
        @Request() req
    ) {
        return this.documentoCoordinacionService.cortarDocumento(
            id,
            cortarDocumentoDto.comentario || '',
            req.user.id
        );
    }

    @Post(':id/estado')
    @Roles('ADMIN', 'OPERADOR')
    async cambiarEstado(
        @Param('id', ParseIntPipe) id: number,
        @Body() cambioEstadoDto: CambioEstadoDto,
        @Request() req
    ) {
        return this.documentoCoordinacionService.cambiarEstado(
            id,
            cambioEstadoDto.nuevoEstadoId,
            cambioEstadoDto.comentario || '',
            req.user.id
        );
    }

    @Get(':id/historial-estados')
    @Roles('ADMIN', 'OPERADOR', 'CLIENTE', 'FINCA')
    async getHistorialEstados(@Param('id', ParseIntPipe) id: number) {
        const historial = await this.prisma.documentoCoordinacionEstado.findMany({
            where: { id_doc_coordinacion: id },
            include: {
                estado: true,
                usuario: {
                    select: {
                        id: true,
                        usuario: true,
                        email: true
                    }
                }
            },
            orderBy: { fecha_cambio: 'desc' }
        });

        if (historial.length === 0) {
            throw new NotFoundException(`No se encontró historial para el documento ${id}`);
        }

        return historial;
    }

    @Post(':id/cancelar')
    @Roles('ADMIN', 'OPERADOR')
    async cancelarDocumento(
        @Param('id', ParseIntPipe) id: number,
        @Body() cancelarDto: { motivo?: string },
        @Request() req
    ) {
        return this.documentoCoordinacionService.cancelarDocumento(
            id,
            cancelarDto.motivo || '',
            req.user.id
        );
    }

    @Get(':id/resumen-cajas')
    @Roles('ADMIN', 'OPERADOR', 'CLIENTE', 'FINCA')
    async getResumenCajas(@Param('id', ParseIntPipe) id: number) {
        return this.documentoCoordinacionService.getResumenCajas(id);
    }
}