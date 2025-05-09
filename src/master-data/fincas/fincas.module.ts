import { Module } from '@nestjs/common';
import { FincasController } from './controllers/fincas.controller';
import { FincasChoferesController } from './controllers/fincas-choferes.controller';
import { FincasProductosController } from './controllers/fincas-productos.controller';
import { FincasVerificationController } from './controllers/fincas-verification.controller';

import { FincasService } from './services/fincas.service';
import { FincasChoferesService } from './services/fincas-choferes.service';
import { FincasProductosService } from './services/fincas-productos.service';
import { FincasVerificationService } from './services/fincas-verification.service';

import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [
        FincasController,
        FincasChoferesController,
        FincasProductosController,
        FincasVerificationController
    ],
    providers: [
        FincasService,
        FincasChoferesService,
        FincasProductosService,
        FincasVerificationService,
    ],
    exports: [
        FincasService,
        FincasChoferesService,
        FincasProductosService,
        FincasVerificationService
    ],
})
export class FincasModule { }