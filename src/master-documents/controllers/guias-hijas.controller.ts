// src/master-documents/controllers/guias-hijas.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    Request,
    ParseIntPipe
} from '@nestjs/common';
import { GuiasHijasService } from '../services/guias-hijas.service';
import { AsignarGuiaHijaDto } from '../dto/guia-hija/asignar-guia-hija.dto';
import { UpdateGuiaHijaDto } from '../dto/guia-hija/update-guia-hija.dto';
import { CambioEstadoDto } from '../dto/guia-madre/cambio-estado.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('guias-hijas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GuiasHijasController {
    constructor(private readonly guiasHijasService: GuiasHijasService) { }

    @Post('asignar/:id_documento/:id_finca')
    @Roles('ADMIN', 'OPERADOR')
    asignarGuiaHija(
        @Param('id_documento', ParseIntPipe) id_documento: number,
        @Param('id_finca', ParseIntPipe) id_finca: number,
        @Body() asignarGuiaHijaDto: AsignarGuiaHijaDto,
    ) {
        return this.guiasHijasService.asignarGuiaHija(id_documento, id_finca, asignarGuiaHijaDto);
    }

    @Get()
    @Roles('ADMIN', 'OPERADOR', 'CLIENTE', 'FINCA')
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('finca') finca?: string,
        @Query('producto') producto?: string,
        @Query('estado') estado?: string,
        @Query('documento') documento?: string,
        @Request() req?,
    ) {
        // Aplicar filtro por rol si es necesario
        // Por ejemplo, si es finca solo ver sus guías
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 10;
        const fincaNum = finca ? parseInt(finca, 10) : undefined;
        const productoNum = producto ? parseInt(producto, 10) : undefined;
        const documentoNum = documento ? parseInt(documento, 10) : undefined;

        return this.guiasHijasService.findAll(
            pageNum,
            limitNum,
            fincaNum,
            productoNum,
            estado,
            documentoNum,
        );
    }

    @Get(':id')
    @Roles('ADMIN', 'OPERADOR', 'CLIENTE', 'FINCA')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.guiasHijasService.findOne(id);
    }

    @Patch(':id')
    @Roles('ADMIN', 'OPERADOR')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateGuiaHijaDto: UpdateGuiaHijaDto,
        @Request() req,
    ) {
        return this.guiasHijasService.update(id, updateGuiaHijaDto, req.user.id);
    }

    @Post(':id/confirmar')
    @Roles('FINCA')
    confirmarGuiaHija(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateGuiaHijaDto: UpdateGuiaHijaDto,
        @Request() req,
    ) {
        return this.guiasHijasService.confirmarGuiaHija(id, updateGuiaHijaDto, req.user.id);
    }

    @Post(':id/estado')
    @Roles('ADMIN', 'OPERADOR')
    cambiarEstado(
        @Param('id', ParseIntPipe) id: number,
        @Body() cambioEstadoDto: CambioEstadoDto,
        @Request() req,
    ) {
        return this.guiasHijasService.cambiarEstado(id, cambioEstadoDto, req.user.id);
    }

    @Post(':id/cancelar')
    @Roles('ADMIN', 'OPERADOR')
    cancelar(
        @Param('id', ParseIntPipe) id: number,
        @Body() cancelarDto: { motivo?: string },
        @Request() req,
    ) {
        return this.guiasHijasService.cancelar(id, cancelarDto.motivo || '', req.user.id);
    }

    @Get('finca/:id_finca')
    @Roles('ADMIN', 'OPERADOR', 'FINCA')
    findByFinca(
        @Param('id_finca', ParseIntPipe) id_finca: number,
        @Query('estado') estado?: string,
    ) {
        return this.guiasHijasService.findByFinca(id_finca, estado);
    }

    @Get('documento/:id_documento')
    @Roles('ADMIN', 'OPERADOR', 'CLIENTE', 'FINCA')
    findByDocumentoCoordenacion(@Param('id_documento', ParseIntPipe) id_documento: number) {
        return this.guiasHijasService.findByDocumentoCoordenacion(id_documento);
    }
}