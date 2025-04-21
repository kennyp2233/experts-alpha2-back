import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from '../prisma/prisma.module';

// Controladores
import { GuiasMadreController } from './controllers/guias-madre.controller';
import { DocumentoCoordinacionController } from './controllers/documento-coordinacion.controller';
import { GuiasHijasController } from './controllers/guias-hijas.controller';
import { WorkflowController } from './controllers/workflow.controller';

// Repositorios
import { GuiaMadreRepository } from './repositories/guia-madre.repository';
import { DocumentoCoordinacionRepository } from './repositories/documento-coordinacion.repository';
import { GuiaHijaRepository } from './repositories/guia-hija.repository';

// Servicios principales (fachadas)
import { GuiasMadreService } from './services/guia-madre/guias-madre.service';
import { DocumentoCoordinacionService } from './services/documento-coordinacion/documento-coordinacion.service';
import { GuiasHijasService } from './services/guia-hija/guias-hijas.service';
import { WorkflowService } from './services/workflow.service';

// Servicios especializados - GuiaMadre
import { GuiaMadreCrudService } from './services/guia-madre/guia-madre-crud.service';
import { GuiaMadreEstadoService } from './services/guia-madre/guia-madre-estado.service';
import { GuiaMadreSecuencialService } from './services/guia-madre/guia-madre-secuencial.service';

// Servicios especializados - DocumentoCoordinacion
import { DocumentoCoordinacionCrudService } from './services/documento-coordinacion/documento-coordinacion-crud.service';
import { DocumentoCoordinacionEstadoService } from './services/documento-coordinacion/documento-coordinacion-estado.service';

// Servicios especializados - GuiaHija
import { GuiaHijaCrudService } from './services/guia-hija/guia-hija-crud.service';
import { GuiaHijaEstadoService } from './services/guia-hija/guia-hija-estado.service';

// Servicios de dominio
import { TransicionEstadoService } from './domain/workflow/transicion-estado.service';

// Listeners
import { WorkflowEventsListener } from './listeners/workflow-events.listener';

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
        // Repositorios
        GuiaMadreRepository,
        DocumentoCoordinacionRepository,
        GuiaHijaRepository,

        // Servicios principales (fachadas)
        GuiasMadreService,
        DocumentoCoordinacionService,
        GuiasHijasService,
        WorkflowService,

        // Servicios especializados - GuiaMadre
        GuiaMadreCrudService,
        GuiaMadreEstadoService,
        GuiaMadreSecuencialService,

        // Servicios especializados - DocumentoCoordinacion
        DocumentoCoordinacionCrudService,
        DocumentoCoordinacionEstadoService,

        // Servicios especializados - GuiaHija
        GuiaHijaCrudService,
        GuiaHijaEstadoService,

        // Servicios de dominio
        TransicionEstadoService,

        // Listeners de eventos
        WorkflowEventsListener,
    ],
    exports: [
        // Exportar solo los servicios principales (fachadas)
        GuiasMadreService,
        DocumentoCoordinacionService,
        GuiasHijasService,
        WorkflowService,
    ],
})
export class MasterDocumentsModule { }