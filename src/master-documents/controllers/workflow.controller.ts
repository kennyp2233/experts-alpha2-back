// src/master-documents/controllers/workflow.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Request,
    ParseIntPipe,
    ParseEnumPipe
} from '@nestjs/common';
import { WorkflowService } from '../services/workflow.service';
import { TipoEntidad } from '../documents.constants';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

class CambiarEstadoDto {
    nuevoEstadoId: number;
    comentario?: string;
}

@Controller('workflow')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkflowController {
    constructor(private readonly workflowService: WorkflowService) { }

    @Get('estados/:tipoEntidad')
    @Roles('ADMIN', 'OPERADOR', 'CLIENTE', 'FINCA')
    getEstadosByTipoEntidad(
        @Param('tipoEntidad', new ParseEnumPipe(TipoEntidad)) tipoEntidad: TipoEntidad
    ) {
        return this.workflowService.getEstadosByTipoEntidad(tipoEntidad);
    }

    @Get('transiciones/:tipoEntidad')
    @Roles('ADMIN', 'OPERADOR')
    getTransicionesByTipoEntidad(
        @Param('tipoEntidad', new ParseEnumPipe(TipoEntidad)) tipoEntidad: TipoEntidad
    ) {
        return this.workflowService.getTransicionesByTipoEntidad(tipoEntidad);
    }

    @Get('transiciones/:tipoEntidad/:estadoId')
    @Roles('ADMIN', 'OPERADOR')
    getTransicionesFromEstado(
        @Param('tipoEntidad', new ParseEnumPipe(TipoEntidad)) tipoEntidad: TipoEntidad,
        @Param('estadoId', ParseIntPipe) estadoId: number,
        @Request() req
    ) {
        // Obtener roles del usuario autenticado
        const roleIds = req.user.roles.map(r => r.id);
        return this.workflowService.getTransicionesFromEstado(tipoEntidad, estadoId, roleIds);
    }

    @Get('historial/:tipoEntidad/:entidadId')
    @Roles('ADMIN', 'OPERADOR', 'CLIENTE', 'FINCA')
    getHistorialEstados(
        @Param('tipoEntidad', new ParseEnumPipe(TipoEntidad)) tipoEntidad: TipoEntidad,
        @Param('entidadId', ParseIntPipe) entidadId: number
    ) {
        return this.workflowService.getHistorialEstados(tipoEntidad, entidadId);
    }

    @Post('cambiar-estado/:tipoEntidad/:entidadId')
    @Roles('ADMIN', 'OPERADOR')
    cambiarEstado(
        @Param('tipoEntidad', new ParseEnumPipe(TipoEntidad)) tipoEntidad: TipoEntidad,
        @Param('entidadId', ParseIntPipe) entidadId: number,
        @Body() cambiarEstadoDto: CambiarEstadoDto,
        @Request() req
    ) {
        // Obtener roles del usuario autenticado
        const roleIds = req.user.roles.map(r => r.id);

        return this.workflowService.cambiarEstado(
            tipoEntidad,
            entidadId,
            cambiarEstadoDto.nuevoEstadoId,
            req.user.id,
            roleIds,
            cambiarEstadoDto.comentario
        );
    }
}