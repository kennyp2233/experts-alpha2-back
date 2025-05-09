import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    Body,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { FincasProductosService } from '../services/fincas-productos.service';
import { AssignProductoDto } from '../dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Fincas - Productos')
@Controller('fincas/:fincaId/productos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FincasProductosController {
    constructor(private readonly fincasProductosService: FincasProductosService) { }

    @Get()
    @Roles('ADMIN', 'FINCA')
    getProductos(@Param('fincaId', ParseIntPipe) fincaId: number) {
        return this.fincasProductosService.getProductos(fincaId);
    }

    @Post()
    @Roles('ADMIN', 'FINCA')
    asignarProducto(
        @Param('fincaId', ParseIntPipe) fincaId: number,
        @Body() assignProductoDto: AssignProductoDto,
    ) {
        return this.fincasProductosService.asignarProducto(fincaId, assignProductoDto.id_producto);
    }

    @Delete(':idProducto')
    @Roles('ADMIN', 'FINCA')
    eliminarProducto(
        @Param('fincaId', ParseIntPipe) fincaId: number,
        @Param('idProducto', ParseIntPipe) idProducto: number,
    ) {
        return this.fincasProductosService.eliminarProducto(fincaId, idProducto);
    }
}