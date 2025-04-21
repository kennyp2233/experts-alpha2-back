
// src/master-data/fincas/fincas.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { FincasService } from './fincas.service';
import {
    CreateFincaDto,
    UpdateFincaDto,
    AsignarChoferDto,
    AsignarProductoDto
} from './dto/finca.dto';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Public } from '../../auth/decorators/public.decorator';

@Controller('datos-maestros/fincas')
export class FincasController {
    constructor(private readonly fincasService: FincasService) { }

    @Get()
    async findAll(@Query('includeInactive') includeInactive?: boolean) {
        return this.fincasService.findAll(includeInactive === true);
    }

    @Get('search')
    async search(@Query('term') term: string) {
        return this.fincasService.search(term);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.fincasService.findOne(id);
    }

    @Get(':id/choferes')
    async getChoferes(@Param('id', ParseIntPipe) id: number) {
        return this.fincasService.getChoferes(id);
    }

    @Get(':id/productos')
    async getProductos(@Param('id', ParseIntPipe) id: number) {
        return this.fincasService.getProductos(id);
    }

    @Get(':id/documentos')
    async getDocumentos(@Param('id', ParseIntPipe) id: number) {
        return this.fincasService.getDocumentos(id);
    }

    @Post()
    @Roles('ADMIN')
    async create(@Body() createFincaDto: CreateFincaDto) {
        return this.fincasService.create(createFincaDto);
    }

    @Patch(':id')
    @Roles('ADMIN')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateFincaDto: UpdateFincaDto,
    ) {
        return this.fincasService.update(id, updateFincaDto);
    }

    @Post(':id/choferes')
    @Roles('ADMIN')
    async asignarChofer(
        @Param('id', ParseIntPipe) id: number,
        @Body() asignarChoferDto: AsignarChoferDto,
    ) {
        return this.fincasService.asignarChofer(id, asignarChoferDto.id_chofer);
    }

    @Delete(':id/choferes/:idChofer')
    @Roles('ADMIN')
    @HttpCode(HttpStatus.NO_CONTENT)
    async eliminarChofer(
        @Param('id', ParseIntPipe) id: number,
        @Param('idChofer', ParseIntPipe) idChofer: number,
    ) {
        await this.fincasService.eliminarChofer(id, idChofer);
    }

    @Post(':id/productos')
    @Roles('ADMIN')
    async asignarProducto(
        @Param('id', ParseIntPipe) id: number,
        @Body() asignarProductoDto: AsignarProductoDto,
    ) {
        return this.fincasService.asignarProducto(id, asignarProductoDto.id_producto);
    }

    @Delete(':id/productos/:idProducto')
    @Roles('ADMIN')
    @HttpCode(HttpStatus.NO_CONTENT)
    async eliminarProducto(
        @Param('id', ParseIntPipe) id: number,
        @Param('idProducto', ParseIntPipe) idProducto: number,
    ) {
        await this.fincasService.eliminarProducto(id, idProducto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.fincasService.remove(id);
    }

    @Patch(':id/restore')
    @Roles('ADMIN')
    async restore(@Param('id', ParseIntPipe) id: number) {
        return this.fincasService.restore(id);
    }

    // Endpoint público para verificar documentos de una finca
    @Public()
    @Get(':id/verificar-documentos')
    async verificarDocumentos(@Param('id', ParseIntPipe) id: number) {
        return this.fincasService.verificarDocumentos(id);
    }
}
