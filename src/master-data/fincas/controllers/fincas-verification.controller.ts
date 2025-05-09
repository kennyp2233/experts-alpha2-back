import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { FincasVerificationService } from '../services/fincas-verification.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Fincas - Verificación')
@Controller('fincas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FincasVerificationController {
    constructor(private readonly fincasVerificationService: FincasVerificationService) { }

    @Get(':id/verificar-documentos')
    @Roles('ADMIN', 'FINCA')
    verificarDocumentos(@Param('id', ParseIntPipe) id: number) {
        return this.fincasVerificationService.verificarDocumentos(id);
    }

    @Get(':id/validar-registro')
    @Roles('ADMIN', 'FINCA')
    validateRegistrationCompletion(@Param('id', ParseIntPipe) id: number) {
        return this.fincasVerificationService.validateRegistrationCompletion(id);
    }

    @Get('pendientes')
    @Roles('ADMIN', 'FINCA')
    getPendingFarms() {
        return this.fincasVerificationService.getPendingFarms();
    }
}