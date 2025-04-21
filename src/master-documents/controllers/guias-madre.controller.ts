// src/master-documents/controllers/guias-madre.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Query,
    UseGuards,
    Request,
    ParseIntPipe
} from '@nestjs/common';
import { GuiasMadreService } from '../services/guia-madre/guias-madre.service';
import { CreateGuiaMadreDto } from '../dto/guia-madre/create-guia-madre.dto';
import { UpdateGuiaMadreDto } from '../dto/guia-madre/update-guia-madre.dto';
import { CambioEstadoDto } from '../dto/guia-madre/cambio-estado.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('guias-madre')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GuiasMadreController {
    constructor(private readonly guiasMadreService: GuiasMadreService) { }

    @Post()
    @Roles('ADMIN', 'OPERADOR')
    create(@Body() createGuiaMadreDto: CreateGuiaMadreDto, @Request() req) {
        return this.guiasMadreService.createLote(createGuiaMadreDto, req.user.id);
    }

    @Get('preview-secuenciales')
    @Roles('ADMIN', 'OPERADOR')
    previewSecuenciales(
        @Query('inicial', ParseIntPipe) inicial: number,
        @Query('cantidad', ParseIntPipe) cantidad: number
    ) {
        return {
            secuenciales: this.guiasMadreService.previsualizarSecuenciales(inicial, cantidad),
            cantidad
        };
    }

    @Get()
    @Roles('ADMIN', 'OPERADOR')
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('estado') estado?: string,
        @Query('aerolinea') aerolinea?: string,
        @Query('disponibles') disponibles?: string
    ) {
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 10;
        const aerolineaNum = aerolinea ? parseInt(aerolinea, 10) : undefined;
        const disponiblesFlag = disponibles === 'true';

        return this.guiasMadreService.findAll(
            pageNum,
            limitNum,
            estado,
            aerolineaNum,
            disponibles ? disponiblesFlag : undefined
        );
    }

    @Get('disponibles')
    @Roles('ADMIN', 'OPERADOR')
    getDisponibles(@Query('aerolinea') aerolinea?: string) {
        const aerolineaNum = aerolinea ? parseInt(aerolinea, 10) : undefined;
        return this.guiasMadreService.getDisponibles(aerolineaNum);
    }

    @Get(':id')
    @Roles('ADMIN', 'OPERADOR')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.guiasMadreService.findOne(id);
    }

    @Patch(':id')
    @Roles('ADMIN', 'OPERADOR')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateGuiaMadreDto: UpdateGuiaMadreDto,
        @Request() req
    ) {
        return this.guiasMadreService.update(id, updateGuiaMadreDto, req.user.id);
    }

    @Post(':id/estado')
    @Roles('ADMIN', 'OPERADOR')
    cambiarEstado(
        @Param('id', ParseIntPipe) id: number,
        @Body() cambioEstadoDto: CambioEstadoDto,
        @Request() req
    ) {
        // Esta función puede implementarse para cambiar el estado (por ejemplo, a PRESTADA o DEVUELTA)
        // Lógica específica según tus necesidades
        return { message: 'No implementado directamente, usa actualizar para préstamo/devolución' };
    }
}