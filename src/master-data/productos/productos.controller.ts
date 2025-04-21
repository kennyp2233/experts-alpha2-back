// src/master-data/productos/productos.controller.ts
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
import { ProductosService } from './productos.service';
import {
    CreateProductoDto,
    UpdateProductoDto,
    ProductoArancelesDto,
    ProductoCompuestoDto,
    ProductoMiProDto
} from './dto/producto.dto';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('datos-maestros/productos')
export class ProductosController {
    constructor(private readonly productosService: ProductosService) { }

    @Get()
    async findAll(@Query('includeInactive') includeInactive?: boolean) {
        return this.productosService.findAll(includeInactive === true);
    }

    @Get('search')
    async search(@Query('term') term: string) {
        return this.productosService.search(term);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.productosService.findOne(id);
    }

    @Post()
    @Roles('ADMIN')
    async create(@Body() createProductoDto: CreateProductoDto) {
        return this.productosService.create(createProductoDto);
    }

    @Patch(':id')
    @Roles('ADMIN')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateProductoDto: UpdateProductoDto,
    ) {
        return this.productosService.update(id, updateProductoDto);
    }

    @Post(':id/aranceles')
    @Roles('ADMIN')
    async crearArancel(
        @Param('id', ParseIntPipe) id: number,
        @Body() arancelDto: ProductoArancelesDto,
    ) {
        return this.productosService.crearArancel(id, arancelDto);
    }

    @Delete(':id/aranceles/:arancelId')
    @Roles('ADMIN')
    @HttpCode(HttpStatus.NO_CONTENT)
    async eliminarArancel(
        @Param('id', ParseIntPipe) id: number,
        @Param('arancelId', ParseIntPipe) arancelId: number,
    ) {
        await this.productosService.eliminarArancel(id, arancelId);
    }

    @Post(':id/compuestos')
    @Roles('ADMIN')
    async crearCompuesto(
        @Param('id', ParseIntPipe) id: number,
        @Body() compuestoDto: ProductoCompuestoDto,
    ) {
        return this.productosService.crearCompuesto(id, compuestoDto);
    }

    @Delete(':id/compuestos/:compuestoId')
    @Roles('ADMIN')
    @HttpCode(HttpStatus.NO_CONTENT)
    async eliminarCompuesto(
        @Param('id', ParseIntPipe) id: number,
        @Param('compuestoId', ParseIntPipe) compuestoId: number,
    ) {
        await this.productosService.eliminarCompuesto(id, compuestoId);
    }

    @Post(':id/mipro')
    @Roles('ADMIN')
    async crearMiPro(
        @Param('id', ParseIntPipe) id: number,
        @Body() miProDto: ProductoMiProDto,
    ) {
        return this.productosService.crearMiPro(id, miProDto);
    }

    @Delete(':id/mipro/:miProId')
    @Roles('ADMIN')
    @HttpCode(HttpStatus.NO_CONTENT)
    async eliminarMiPro(
        @Param('id', ParseIntPipe) id: number,
        @Param('miProId', ParseIntPipe) miProId: number,
    ) {
        await this.productosService.eliminarMiPro(id, miProId);
    }

    @Delete(':id')
    @Roles('ADMIN')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.productosService.remove(id);
    }

    @Patch(':id/restore')
    @Roles('ADMIN')
    async restore(@Param('id', ParseIntPipe) id: number) {
        return this.productosService.restore(id);
    }
}