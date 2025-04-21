// src/master-documents/master-documents.module.ts
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from '../prisma/prisma.module';
import { GuiasMadreService } from './services/guias-madre.service';
import { DocumentoCoordinacionService } from './services/documento-coordinacion.service';
import { GuiasHijasService } from './services/guias-hijas.service';
import { WorkflowService } from './services/workflow.service';
import { GuiasMadreController } from './controllers/guias-madre.controller';
import { DocumentoCoordinacionController } from './controllers/documento-coordinacion.controller';
import { GuiasHijasController } from './controllers/guias-hijas.controller';
import { WorkflowController } from './controllers/workflow.controller';

@Module({
    imports: [
        PrismaModule,
        EventEmitterModule.forRoot({
            // Configuración global de event emitter
            wildcard: false,
            delimiter: '.',
            newListener: false,
            removeListener: false,
            maxListeners: 10,
            verboseMemoryLeak: false,
            ignoreErrors: false,
        }),
    ],
    controllers: [
        GuiasMadreController,
        DocumentoCoordinacionController,
        GuiasHijasController,
        WorkflowController,
    ],
    providers: [
        GuiasMadreService,
        DocumentoCoordinacionService,
        GuiasHijasService,
        WorkflowService,
    ],
    exports: [
        GuiasMadreService,
        DocumentoCoordinacionService,
        GuiasHijasService,
        WorkflowService,
    ],
})
export class MasterDocumentsModule { }