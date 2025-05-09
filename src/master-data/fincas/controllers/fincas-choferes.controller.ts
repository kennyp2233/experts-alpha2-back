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
import { FincasChoferesService } from '../services/fincas-choferes.service';
import { AssignChoferDto } from '../dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Fincas - Choferes')
@Controller('fincas/:fincaId/choferes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FincasChoferesController {
    constructor(private readonly fincasChoferesService: FincasChoferesService) { }

    @Get()
    @Roles('ADMIN', 'FINCA')
    getChoferes(@Param('fincaId', ParseIntPipe) fincaId: number) {
        return this.fincasChoferesService.getChoferes(fincaId);
    }

    @Post()
    @Roles('ADMIN', 'FINCA')
    asignarChofer(
        @Param('fincaId', ParseIntPipe) fincaId: number,
        @Body() assignChoferDto: AssignChoferDto,
    ) {
        return this.fincasChoferesService.asignarChofer(fincaId, assignChoferDto.id_chofer);
    }

    @Delete(':idChofer')
    @Roles('ADMIN', 'FINCA')
    eliminarChofer(
        @Param('fincaId', ParseIntPipe) fincaId: number,
        @Param('idChofer', ParseIntPipe) idChofer: number,
    ) {
        return this.fincasChoferesService.eliminarChofer(fincaId, idChofer);
    }
}