import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Query,
    UseGuards,
} from '@nestjs/common';
import { FincasVerificationService } from '../services/fincas-verification.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { AllowPending } from '../../../auth/decorators/allow-pending.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Fincas - Verificación')
@Controller('fincas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FincasVerificationController {
    constructor(private readonly fincasVerificationService: FincasVerificationService) { }

    @Get(':id/verificar-documentos')
    @Roles('ADMIN', 'FINCA')
    @AllowPending()
    verificarDocumentos(@Param('id', ParseIntPipe) id: number) {
        return this.fincasVerificationService.verificarDocumentos(id);
    }

    @Get(':id/validar-registro')
    @Roles('ADMIN', 'FINCA')
    @AllowPending()
    validateRegistrationCompletion(@Param('id', ParseIntPipe) id: number) {
        return this.fincasVerificationService.validateRegistrationCompletion(id);
    }

    @Get('pendientes')
    @Roles('ADMIN')
    getPendingFarms() {
        return this.fincasVerificationService.getPendingFarms();
    }

    // En src/master-data/fincas/controllers/fincas-verification.controller.ts
    @Get('en-verificacion')
    @Roles('ADMIN')
    getFincasEnVerificacion(
        @Query('con_documentos') conDocumentos: boolean,
        @Query('estado_documentos') estadoDocumentos: string
    ) {
        return this.fincasVerificationService.getFincasEnVerificacion({
            conDocumentos,
            estadoDocumentos
        });
    }
}